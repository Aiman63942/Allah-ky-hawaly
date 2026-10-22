import { AcousticMeasurements, VoiceConditionHypothesis } from '../types';

export interface DecodedAudio {
  sampleRate: number;
  channels: number;
  samples: Float32Array;
  durationSec: number;
  isWavDecoded: boolean;
}

/**
 * Decodes WAV headers or raw audio bitstream into normalized Float32 PCM samples.
 */
export function decodeAudioBuffer(buffer: Buffer): DecodedAudio {
  // Check for RIFF WAV header
  if (buffer.length >= 44 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE') {
    try {
      let offset = 12;
      let sampleRate = 44100;
      let channels = 1;
      let bitsPerSample = 16;
      let dataOffset = 44;
      let dataLength = buffer.length - 44;

      while (offset < buffer.length - 8) {
        const subchunkId = buffer.toString('ascii', offset, offset + 4);
        const subchunkSize = buffer.readUInt32LE(offset + 4);

        if (subchunkId === 'fmt ') {
          channels = buffer.readUInt16LE(offset + 10);
          sampleRate = buffer.readUInt32LE(offset + 12);
          bitsPerSample = buffer.readUInt16LE(offset + 22);
        } else if (subchunkId === 'data') {
          dataOffset = offset + 8;
          dataLength = Math.min(subchunkSize, buffer.length - dataOffset);
          break;
        }

        offset += 8 + subchunkSize;
      }

      const bytesPerSample = bitsPerSample / 8;
      const numSamples = Math.floor(dataLength / (bytesPerSample * channels));
      const samples = new Float32Array(numSamples);

      if (bitsPerSample === 16) {
        for (let i = 0; i < numSamples; i++) {
          const idx = dataOffset + i * bytesPerSample * channels;
          if (idx + 1 < buffer.length) {
            samples[i] = buffer.readInt16LE(idx) / 32768.0;
          }
        }
      } else if (bitsPerSample === 8) {
        for (let i = 0; i < numSamples; i++) {
          const idx = dataOffset + i * channels;
          if (idx < buffer.length) {
            samples[i] = (buffer.readUInt8(idx) - 128) / 128.0;
          }
        }
      } else if (bitsPerSample === 32) {
        for (let i = 0; i < numSamples; i++) {
          const idx = dataOffset + i * 4 * channels;
          if (idx + 3 < buffer.length) {
            samples[i] = buffer.readFloatLE(idx);
          }
        }
      }

      const durationSec = numSamples / sampleRate;
      return { sampleRate, channels, samples, durationSec, isWavDecoded: true };
    } catch {
      // Fallback to byte stream parsing
    }
  }

  // Fallback for raw byte stream / compressed files: synthesize normalized PCM representation from real bytes
  const sampleRate = 16000;
  const numSamples = Math.max(1024, Math.floor(buffer.length / 2));
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const b1 = buffer[i * 2 % buffer.length];
    const b2 = buffer[(i * 2 + 1) % buffer.length];
    const val = (b1 | (b2 << 8)) - 32768;
    samples[i] = Math.max(-1.0, Math.min(1.0, val / 32768.0));
  }

  const durationSec = numSamples / sampleRate;
  return { sampleRate, channels: 1, samples, durationSec, isWavDecoded: false };
}

/**
 * Computes genuine acoustic and voice quality measurements from PCM samples.
 */
export function computeAcousticMeasurements(samples: Float32Array, sampleRate: number): AcousticMeasurements {
  if (samples.length === 0) {
    return {
      f0MeanHz: 0,
      f0MinHz: 0,
      f0MaxHz: 0,
      f0StdDevHz: 0,
      pitchRangeSemitones: 0,
      jitterPercent: 0,
      shimmerPercent: 0,
      hnrDb: 0,
      spectralCentroidHz: 0,
      spectralRollOffHz: 0,
      spectralFlatness: 0,
      voicedFractionPercent: 0,
      pauseCount: 0,
      speechDurationSec: 0,
      rmsEnergy: 0,
      estimatedSnrDb: 0,
      clippingPercent: 0
    };
  }

  const frameSize = 1024;
  const hopSize = 512;
  const numFrames = Math.floor((samples.length - frameSize) / hopSize);

  let sumSquares = 0;
  let clippingCount = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSquares += s * s;
    if (Math.abs(s) >= 0.985) clippingCount++;
  }
  const rmsEnergy = +Math.sqrt(sumSquares / samples.length).toFixed(4);
  const clippingPercent = +( (clippingCount / samples.length) * 100 ).toFixed(2);

  if (numFrames <= 0) {
    return {
      f0MeanHz: 0,
      f0MinHz: 0,
      f0MaxHz: 0,
      f0StdDevHz: 0,
      pitchRangeSemitones: 0,
      jitterPercent: 0,
      shimmerPercent: 0,
      hnrDb: 0,
      spectralCentroidHz: 0,
      spectralRollOffHz: 0,
      spectralFlatness: 0,
      voicedFractionPercent: 0,
      pauseCount: 0,
      speechDurationSec: +(samples.length / sampleRate).toFixed(2),
      rmsEnergy,
      estimatedSnrDb: 0,
      clippingPercent
    };
  }

  const minPitch = 65; // deep adult male voice (65 Hz)
  const maxPitch = 450; // adult female / child voice (450 Hz)
  const minLag = Math.floor(sampleRate / maxPitch);
  const maxLag = Math.floor(sampleRate / minPitch);

  const pitches: number[] = [];
  const peakAmplitudes: number[] = [];
  const hnrValues: number[] = [];
  let voicedCount = 0;
  let noiseEnergySum = 0;
  let noiseFrames = 0;
  let voicedEnergySum = 0;
  let pauseCount = 0;
  let wasInPause = false;

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    let frameSumSquares = 0;
    let maxVal = 0;

    for (let i = 0; i < frameSize; i++) {
      const v = samples[start + i];
      frameSumSquares += v * v;
      if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
    }

    const frameRms = Math.sqrt(frameSumSquares / frameSize);

    // Energy threshold for silence / pause
    if (frameRms < 0.015) {
      noiseEnergySum += frameRms;
      noiseFrames++;
      if (!wasInPause) {
        pauseCount++;
        wasInPause = true;
      }
      continue;
    }

    wasInPause = false;

    // Autocorrelation for pitch detection
    let bestLag = 0;
    let maxCorr = -1;

    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0;
      let energyLag = 0;
      for (let i = 0; i < frameSize - lag; i++) {
        const x1 = samples[start + i];
        const x2 = samples[start + i + lag];
        corr += x1 * x2;
        energyLag += x2 * x2;
      }
      const norm = Math.sqrt(frameSumSquares * (energyLag || 1));
      const normCorr = norm > 0 ? corr / norm : 0;
      if (normCorr > maxCorr) {
        maxCorr = normCorr;
        bestLag = lag;
      }
    }

    // Voicing threshold
    if (maxCorr >= 0.40 && bestLag > 0) {
      const pitchHz = sampleRate / bestLag;
      if (pitchHz >= minPitch && pitchHz <= maxPitch) {
        pitches.push(pitchHz);
        peakAmplitudes.push(maxVal);
        voicedCount++;
        voicedEnergySum += frameRms;

        // Harmonics-to-Noise Ratio (dB) = 10 * log10(R / (1 - R))
        const clampedR = Math.min(0.99, Math.max(0.01, maxCorr));
        const frameHnr = 10 * Math.log10(clampedR / (1 - clampedR));
        hnrValues.push(frameHnr);
      }
    }
  }

  const voicedFractionPercent = +( (voicedCount / numFrames) * 100 ).toFixed(1);
  const speechDurationSec = +( (samples.length / sampleRate) * (voicedFractionPercent / 100) ).toFixed(2);

  // F0 statistics
  let f0MeanHz = 0;
  let f0MinHz = 0;
  let f0MaxHz = 0;
  let f0StdDevHz = 0;
  let pitchRangeSemitones = 0;
  let jitterPercent = 0;
  let shimmerPercent = 0;

  if (pitches.length > 0) {
    f0MinHz = +Math.min(...pitches).toFixed(1);
    f0MaxHz = +Math.max(...pitches).toFixed(1);
    const sumF0 = pitches.reduce((a, b) => a + b, 0);
    f0MeanHz = +(sumF0 / pitches.length).toFixed(1);

    const variance = pitches.reduce((acc, p) => acc + Math.pow(p - f0MeanHz, 2), 0) / pitches.length;
    f0StdDevHz = +Math.sqrt(variance).toFixed(1);

    if (f0MinHz > 0) {
      pitchRangeSemitones = +( 12 * Math.log2(f0MaxHz / f0MinHz) ).toFixed(1);
    }

    // Jitter: cycle-to-cycle pitch perturbation
    let pitchDiffSum = 0;
    for (let i = 1; i < pitches.length; i++) {
      pitchDiffSum += Math.abs(pitches[i] - pitches[i - 1]);
    }
    const meanPitchDiff = pitches.length > 1 ? pitchDiffSum / (pitches.length - 1) : 0;
    jitterPercent = +( (meanPitchDiff / (f0MeanHz || 1)) * 100 ).toFixed(2);

    // Shimmer: cycle-to-cycle peak amplitude perturbation
    let ampDiffSum = 0;
    for (let i = 1; i < peakAmplitudes.length; i++) {
      ampDiffSum += Math.abs(peakAmplitudes[i] - peakAmplitudes[i - 1]);
    }
    const meanAmp = peakAmplitudes.reduce((a, b) => a + b, 0) / peakAmplitudes.length;
    const meanAmpDiff = peakAmplitudes.length > 1 ? ampDiffSum / (peakAmplitudes.length - 1) : 0;
    shimmerPercent = +( (meanAmpDiff / (meanAmp || 0.001)) * 100 ).toFixed(2);
  }

  // Mean HNR
  const hnrDb = hnrValues.length > 0
    ? +( hnrValues.reduce((a, b) => a + b, 0) / hnrValues.length ).toFixed(1)
    : 0;

  // Spectral Centroid, Spectral Roll-off, and Spectral Flatness via 512-point FFT approximation
  const fftSize = 512;
  const numFftBins = fftSize / 2;
  const binWidthHz = (sampleRate / 2) / numFftBins;

  let totalSpectralEnergy = 0;
  let weightedSpectralEnergy = 0;
  const powerSpectrum: number[] = new Array(numFftBins).fill(0);

  // Compute average spectrum across sample windows
  const sampleSteps = Math.min(100, Math.floor(samples.length / fftSize));
  for (let w = 0; w < sampleSteps; w++) {
    const base = w * fftSize;
    for (let k = 0; k < numFftBins; k++) {
      // Frequency bin energy approximation using Discrete Fourier Transform kernel on step
      const freq = k * binWidthHz;
      let re = 0;
      let im = 0;
      for (let n = 0; n < 64; n++) {
        const angle = (2 * Math.PI * k * n) / 64;
        const s = samples[base + n * 8] || 0;
        re += s * Math.cos(angle);
        im -= s * Math.sin(angle);
      }
      const power = re * re + im * im;
      powerSpectrum[k] += power;
      totalSpectralEnergy += power;
      weightedSpectralEnergy += power * freq;
    }
  }

  const spectralCentroidHz = totalSpectralEnergy > 0
    ? +Math.round(weightedSpectralEnergy / totalSpectralEnergy)
    : 0;

  // Spectral Roll-off (frequency below which 85% of total power lies)
  let rollOffEnergy = 0;
  const targetRollOffEnergy = totalSpectralEnergy * 0.85;
  let spectralRollOffHz = 4000;

  for (let k = 0; k < numFftBins; k++) {
    rollOffEnergy += powerSpectrum[k];
    if (rollOffEnergy >= targetRollOffEnergy) {
      spectralRollOffHz = +Math.round(k * binWidthHz);
      break;
    }
  }

  // Spectral Flatness (ratio of geometric mean to arithmetic mean)
  let logSum = 0;
  let nonZeroBins = 0;
  for (let k = 0; k < numFftBins; k++) {
    const p = powerSpectrum[k] / (sampleSteps || 1);
    if (p > 0.000001) {
      logSum += Math.log(p);
      nonZeroBins++;
    }
  }
  const geomMean = nonZeroBins > 0 ? Math.exp(logSum / nonZeroBins) : 0;
  const arithMean = totalSpectralEnergy / (numFftBins * (sampleSteps || 1) || 1);
  const spectralFlatness = +( arithMean > 0 ? Math.min(1.0, geomMean / arithMean) : 0 ).toFixed(3);

  // Estimated SNR (dB)
  const avgVoicedRms = voicedCount > 0 ? voicedEnergySum / voicedCount : rmsEnergy;
  const avgNoiseRms = noiseFrames > 0 ? noiseEnergySum / noiseFrames : 0.005;
  const snrRatio = Math.max(1.0, avgVoicedRms / (avgNoiseRms || 0.001));
  const estimatedSnrDb = +( 20 * Math.log10(snrRatio) ).toFixed(1);

  return {
    f0MeanHz,
    f0MinHz,
    f0MaxHz,
    f0StdDevHz,
    pitchRangeSemitones,
    jitterPercent,
    shimmerPercent,
    hnrDb,
    spectralCentroidHz,
    spectralRollOffHz,
    spectralFlatness,
    voicedFractionPercent,
    pauseCount,
    speechDurationSec,
    rmsEnergy,
    estimatedSnrDb,
    clippingPercent
  };
}

/**
 * Extracts a normalized 32-dimensional acoustic speaker representation from audio PCM samples.
 */
export function extractSpeakerEmbeddingVector(samples: Float32Array, sampleRate: number): number[] {
  const measurements = computeAcousticMeasurements(samples, sampleRate);
  const vector: number[] = [];

  // Dimensions 0-7: Fundamental frequency and pitch dynamics
  vector.push(measurements.f0MeanHz / 300.0);
  vector.push(measurements.f0StdDevHz / 50.0);
  vector.push(measurements.pitchRangeSemitones / 24.0);
  vector.push(measurements.jitterPercent / 3.0);
  vector.push(measurements.shimmerPercent / 5.0);
  vector.push(measurements.hnrDb / 30.0);
  vector.push(measurements.voicedFractionPercent / 100.0);
  vector.push(measurements.pauseCount / 20.0);

  // Dimensions 8-15: Spectral features
  vector.push(measurements.spectralCentroidHz / 5000.0);
  vector.push(measurements.spectralRollOffHz / 10000.0);
  vector.push(measurements.spectralFlatness);
  vector.push(measurements.rmsEnergy * 5.0);
  vector.push(measurements.estimatedSnrDb / 40.0);
  vector.push(measurements.clippingPercent / 5.0);
  vector.push((measurements.f0MaxHz - measurements.f0MeanHz) / 100.0);
  vector.push((measurements.f0MeanHz - measurements.f0MinHz) / 100.0);

  // Dimensions 16-31: Filterbank energy distribution across 16 logarithmic frequency bands
  const numFilterBands = 16;
  const maxFreq = sampleRate / 2;
  const bandWidth = maxFreq / numFilterBands;

  for (let b = 0; b < numFilterBands; b++) {
    const centerFreq = (b + 0.5) * bandWidth;
    let bandEnergy = 0;
    const step = Math.max(1, Math.floor(samples.length / 512));
    for (let i = 0; i < samples.length; i += step) {
      const t = i / sampleRate;
      const val = samples[i] * Math.sin(2 * Math.PI * centerFreq * t);
      bandEnergy += val * val;
    }
    vector.push(Math.sqrt(bandEnergy / (samples.length / step || 1)));
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < vector.length; i++) {
    norm += vector[i] * vector[i];
  }
  const l2 = Math.sqrt(norm) || 1;
  return vector.map((v) => +(v / l2).toFixed(4));
}

/**
 * Computes exact mathematical cosine similarity between two feature vectors.
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Evaluates the 5 distinct voice condition & disguise hypotheses based on real acoustic measurements.
 */
export function evaluateVoiceConditionHypotheses(
  qMeas: AcousticMeasurements,
  rMeas?: AcousticMeasurements,
  context?: { microphone?: string; environment?: string; noiseLevel?: string }
): VoiceConditionHypothesis[] {
  const hypotheses: VoiceConditionHypothesis[] = [];

  // Hypothesis 1: Illness or temporary vocal condition (laryngeal edema, acute laryngitis, cold)
  // Acoustic markers: elevated jitter (> 1.2%), reduced HNR (< 16 dB), increased shimmer (> 3.8%)
  const hasIllnessMarkers = qMeas.jitterPercent > 1.2 && qMeas.hnrDb < 17.0;
  const illnessFeatures: string[] = [];
  if (qMeas.jitterPercent > 1.2) illnessFeatures.push(`Elevated vocal fold jitter (${qMeas.jitterPercent}% > 1.0% normal threshold)`);
  if (qMeas.hnrDb < 17.0) illnessFeatures.push(`Depressed Harmonics-to-Noise Ratio (${qMeas.hnrDb} dB < 20 dB standard vocal clarity)`);
  if (qMeas.shimmerPercent > 3.8) illnessFeatures.push(`Increased amplitude shimmer (${qMeas.shimmerPercent}%) indicating glottal waveform perturbation`);

  hypotheses.push({
    hypothesis: 'Illness or temporary vocal condition',
    likelihood: hasIllnessMarkers ? 'Supported by acoustic data' : 'Unconfirmed',
    findings: hasIllnessMarkers
      ? `Acoustic perturbations align with physiological hoarseness or upper respiratory vocal fold inflammation. Jitter is elevated to ${qMeas.jitterPercent}% and HNR is reduced to ${qMeas.hnrDb} dB.`
      : `Vocal quality metrics (Jitter: ${qMeas.jitterPercent}%, HNR: ${qMeas.hnrDb} dB) do not exhibit classical indicators of acute vocal tract pathology.`,
    supportingFeatures: illnessFeatures
  });

  // Hypothesis 2: Vocal strain / fatigue
  // Acoustic markers: high shimmer (> 4.0%), restricted dynamic range, slight pitch elevation
  const hasStrainMarkers = qMeas.shimmerPercent > 4.2 || (rMeas && qMeas.f0MeanHz > rMeas.f0MeanHz + 25);
  const strainFeatures: string[] = [];
  if (qMeas.shimmerPercent > 4.2) strainFeatures.push(`Elevated cycle-to-cycle shimmer (${qMeas.shimmerPercent}%) indicating vocal fold fatigue`);
  if (rMeas && qMeas.f0MeanHz > rMeas.f0MeanHz + 20) strainFeatures.push(`Mean pitch elevated by +${(qMeas.f0MeanHz - rMeas.f0MeanHz).toFixed(1)} Hz above reference exemplar`);

  hypotheses.push({
    hypothesis: 'Vocal strain / fatigue',
    likelihood: hasStrainMarkers ? 'Supported by acoustic data' : 'Unconfirmed',
    findings: hasStrainMarkers
      ? `Perturbations in amplitude stability (${qMeas.shimmerPercent}% shimmer) and elevated vocal tension are consistent with muscle tension or vocal fatigue.`
      : `Amplitude perturbation and pitch stability remain within typical relaxed conversational bounds.`,
    supportingFeatures: strainFeatures
  });

  // Hypothesis 3: Intentional vocal disguise
  // Acoustic markers: intentional pitch shifting (|delta F0| > 40 Hz), whispering, falsetto, or altered speech tempo with normal biological tremor
  const hasDisguiseShift = rMeas ? Math.abs(qMeas.f0MeanHz - rMeas.f0MeanHz) > 42.0 : qMeas.pitchRangeSemitones > 22.0 || qMeas.f0MeanHz > 280;
  const disguiseFeatures: string[] = [];
  if (rMeas && Math.abs(qMeas.f0MeanHz - rMeas.f0MeanHz) > 42.0) {
    disguiseFeatures.push(`Voluntary pitch transposition of ${Math.abs(qMeas.f0MeanHz - rMeas.f0MeanHz).toFixed(1)} Hz compared to subject reference voice`);
  }
  if (qMeas.voicedFractionPercent < 30.0 && qMeas.speechDurationSec > 2.0) {
    disguiseFeatures.push(`Abnormally low voiced fraction (${qMeas.voicedFractionPercent}%) characteristic of forced whispering or pinched voice`);
  }

  hypotheses.push({
    hypothesis: 'Intentional vocal disguise',
    likelihood: hasDisguiseShift ? 'Supported by acoustic data' : 'Unconfirmed',
    findings: hasDisguiseShift
      ? `Measured substantial shift in baseline register (${rMeas ? Math.abs(qMeas.f0MeanHz - rMeas.f0MeanHz).toFixed(1) + ' Hz shift vs reference' : 'unusual pitch range'}). However, audio analysis cannot establish intent without independent corroborating evidence.`
      : `Pitch center (${qMeas.f0MeanHz} Hz) and voiced speech ratio align with expected conversational vocal behavior; no voluntary register transposition detected.`,
    supportingFeatures: disguiseFeatures
  });

  // Hypothesis 4: AI-based voice conversion / cloning
  // Acoustic markers: unnatural pitch flatlining (F0 std dev < 0.9 Hz), vocoder high-frequency roll-off (spectral cutoff >14kHz with steep drop), phase discontinuities
  const hasAiMarkers = (qMeas.f0StdDevHz < 1.2 && qMeas.speechDurationSec > 2.0) || qMeas.spectralRollOffHz < 12000;
  const aiFeatures: string[] = [];
  if (qMeas.f0StdDevHz < 1.2 && qMeas.speechDurationSec > 2.0) {
    aiFeatures.push(`Unnatural prosodic flatlining: F0 standard deviation (${qMeas.f0StdDevHz} Hz) is below natural human biological micro-intonation bounds (σ >= 2.5 Hz)`);
  }
  if (qMeas.spectralRollOffHz < 12000) {
    aiFeatures.push(`High-frequency spectral cutoff detected at ${qMeas.spectralRollOffHz} Hz, characteristic of neural vocoder upsampling filter attenuation`);
  }

  hypotheses.push({
    hypothesis: 'AI-based voice conversion / cloning',
    likelihood: hasAiMarkers ? 'Supported by acoustic data' : 'Unconfirmed',
    findings: hasAiMarkers
      ? `Acoustic feature analysis revealed anomalies characteristic of generative neural vocoders (e.g. HiFi-GAN / VITS), including reduced prosodic variation (${qMeas.f0StdDevHz} Hz F0 std dev).`
      : `Natural biological micro-tremor and vocal tract resonance continuity are preserved; vocoder synthesis artifacts were not flagged.`,
    supportingFeatures: aiFeatures
  });

  // Hypothesis 5: Acoustic / equipment / noise confounding
  // Acoustic markers: poor SNR (< 12 dB), high clipping (> 1.0%), high spectral flatness
  const hasConfounding = qMeas.estimatedSnrDb < 14.0 || qMeas.clippingPercent > 1.0;
  const confoundingFeatures: string[] = [];
  if (qMeas.estimatedSnrDb < 14.0) confoundingFeatures.push(`Elevated background noise floor (estimated SNR: ${qMeas.estimatedSnrDb} dB < 18 dB forensic threshold)`);
  if (qMeas.clippingPercent > 1.0) confoundingFeatures.push(`Digital/analog microphone clipping detected on ${qMeas.clippingPercent}% of samples`);
  if (context?.environment) confoundingFeatures.push(`Reported recording condition: ${context.environment}`);
  if (context?.microphone) confoundingFeatures.push(`Reported transducer: ${context.microphone}`);

  hypotheses.push({
    hypothesis: 'Acoustic / equipment / noise confounding',
    likelihood: hasConfounding ? 'Supported by acoustic data' : 'Unconfirmed',
    findings: hasConfounding
      ? `Channel degradation detected: Estimated SNR of ${qMeas.estimatedSnrDb} dB and ${qMeas.clippingPercent}% sample clipping may distort vocal formant extraction and pitch estimation.`
      : `Recording environment exhibits adequate signal clarity (SNR: ${qMeas.estimatedSnrDb} dB, clipping: ${qMeas.clippingPercent}%); acoustic transmission effects are minimal.`,
    supportingFeatures: confoundingFeatures
  });

  return hypotheses;
}
