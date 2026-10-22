import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Cpu,
  Sparkles,
  Activity,
  FileCheck2,
  Fingerprint,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Search,
  ExternalLink,
  Zap,
  Radio
} from 'lucide-react';
import { ScreenId } from '../../types';

interface LandingScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
}

interface AudioSample {
  id: string;
  name: string;
  category: 'synthetic' | 'authentic';
  modelUsed: string;
  confidence: number;
  f0Jitter: string;
  phaseCoherence: string;
  description: string;
}

const DEMO_SAMPLES: AudioSample[] = [
  {
    id: 'sample-1',
    name: 'Exhibit A-1: Wiretap Intercept (Target Alpha)',
    category: 'synthetic',
    modelUsed: 'ElevenLabs v2 / Tacotron2 Neural Vocoder',
    confidence: 98.4,
    f0Jitter: '0.12% (Unnatural Flatline)',
    phaseCoherence: 'Broken Phase Discontinuity (-18.4 dB)',
    description: 'High-frequency spectral cutoffs above 16kHz with periodic phase resets characteristic of neural auto-regressive vocoders.'
  },
  {
    id: 'sample-2',
    name: 'Exhibit B-4: Known Exemplar (Verified Authentic)',
    category: 'authentic',
    modelUsed: 'Human Biological Vocal Tract (Natural)',
    confidence: 1.8,
    f0Jitter: '1.42% (Normal Micro-Tremor)',
    phaseCoherence: 'Continuous Biometric Phase (0.94 r)',
    description: 'Natural glottal pulse dispersion with physiological sub-band jitter and micro-tremors consistent with human vocal folds.'
  },
  {
    id: 'sample-3',
    name: 'Exhibit C-9: CEO Wire Transfer Authorization',
    category: 'synthetic',
    modelUsed: 'Diff-SVC / DDSP Diffusion Synthesizer',
    confidence: 96.9,
    f0Jitter: '0.24% (Diffusion Smoothing)',
    phaseCoherence: 'Phase Randomization at High Mel-Bands',
    description: 'Acoustic diffusion artifacts detected in formants F2 and F3 with synthetic noise injection in silent frames.'
  }
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ setCurrentScreen }) => {
  const [selectedSample, setSelectedSample] = useState<AudioSample>(DEMO_SAMPLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Illustrative playback progress animation (non-deceptive, no synthetic oscillator tone)
  useEffect(() => {
    let animFrame: number;
    if (isPlaying) {
      const startTime = Date.now();
      const duration = 6000; // 6s loop

      const updateProgress = () => {
        const elapsed = (Date.now() - startTime) % duration;
        setPlaybackProgress(elapsed / duration);
        animFrame = requestAnimationFrame(updateProgress);
      };
      animFrame = requestAnimationFrame(updateProgress);
    } else {
      setPlaybackProgress(0);
    }

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div id="landing-screen" className="min-h-full bg-[#F4F8F6] text-slate-900 pb-20 selection:bg-emerald-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/10 bg-gradient-to-b from-white via-[#F4F8F6] to-[#F4F8F6]">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-emerald-100/40 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Header Tagline / Legal Standards bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Federal Rules of Evidence 902(13) & 902(14) Certified</span>
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">·</span>
            <span className="text-xs text-slate-600 font-medium">
              ISO/IEC 27037 Digital Evidence Admissibility
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">·</span>
            <span className="text-xs text-slate-600 font-medium">
              Daubert / Frye Standard Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Court-Admissible <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600">
                  Deepfake Audio Forensics
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Uncompromising scientific verification of synthetic speech, voice cloning, and neural audio tampering. Engineered with multi-model ensembles, Grad-CAM spectral explainability, cryptographic hash chains, and biometric expert witness attestation.
              </p>

              {/* Primary Call to Action buttons - Four distinct destinations */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="landing-signin-btn"
                  onClick={() => setCurrentScreen('signin')}
                  className="px-6 py-3.5 bg-[#0A3D24] hover:bg-[#062817] text-white font-bold text-sm rounded-xl shadow-lg flex items-center space-x-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#C88A2C]" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="landing-request-access-btn"
                  onClick={() => setCurrentScreen('request-access')}
                  className="px-5 py-3.5 bg-white border border-[#E1EBE4] hover:border-[#0A3D24] hover:bg-[#F0FDF4] text-[#112217] font-bold text-sm rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#0A3D24]" />
                  <span>Request Access</span>
                </button>

                <button
                  id="landing-workflow-btn"
                  onClick={() => setCurrentScreen('workflow')}
                  className="px-4 py-3.5 text-[#54665C] hover:text-[#0A3D24] hover:bg-[#E1EBE4]/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Layers className="w-4 h-4 text-[#0A3D24]" />
                  <span>View Workflow</span>
                </button>

                <button
                  id="landing-verify-btn"
                  onClick={() => setCurrentScreen('public-verify')}
                  className="px-4 py-3.5 text-[#C88A2C] hover:text-[#B2751E] hover:bg-[#FEF3C7] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify a Report</span>
                </button>
              </div>

              {/* Trust Indicators / Standards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E1EBE4]">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0A3D24] font-mono">Multi-Model</p>
                  <p className="text-xs text-[#54665C] font-medium mt-0.5">Ensemble Fusion</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#112217] font-mono">SHA-256</p>
                  <p className="text-xs text-[#54665C] font-medium mt-0.5">Bitstream Ingest Digest</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0A3D24] font-mono">ISO 27037</p>
                  <p className="text-xs text-[#54665C] font-medium mt-0.5">Custody Framework</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C88A2C] font-mono">FRE 702</p>
                  <p className="text-xs text-[#54665C] font-medium mt-0.5">Scientific Evaluation</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Audio Forensics Sandbox */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#0A3D24]/15 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
                
                {/* Header bar of sandbox with explicit disclaimer */}
                <div className="flex items-center justify-between border-b border-[#E1EBE4] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
                    <span className="text-xs font-bold tracking-tight text-[#112217]">
                      Illustrative Spectrogram Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] font-bold border border-[#D97706]/30">
                    Illustrative demo — not real evidence analysis
                  </span>
                </div>

                {/* Sample Selector Tabs */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#54665C] uppercase tracking-wider block">
                    Synthetic vs Exemplar Demonstrations:
                  </label>
                  <div className="space-y-1.5">
                    {DEMO_SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => {
                          setSelectedSample(sample);
                          setIsPlaying(false);
                          setPlaybackProgress(0);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border flex items-center justify-between ${
                          selectedSample.id === sample.id
                            ? sample.category === 'synthetic'
                              ? 'bg-[#FEF2F2] border-[#B91C1C]/40 text-[#B91C1C] shadow-2xs'
                              : 'bg-[#F0FDF4] border-[#15803D]/40 text-[#0A3D24] shadow-2xs'
                            : 'bg-white border-[#E1EBE4] text-[#112217] hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold truncate">{sample.name}</p>
                          <p className="text-[10px] text-[#54665C] truncate mt-0.5">
                            {sample.modelUsed}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                            sample.category === 'synthetic'
                              ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]/30'
                              : 'bg-[#F0FDF4] text-[#15803D] border border-[#15803D]/30'
                          }`}
                        >
                          {sample.category === 'synthetic' ? 'Deepfake Pattern' : 'Natural Exemplar'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Waveform & Spectrogram Box */}
                <div className="bg-[#062817] border border-[#0A3D24]/30 rounded-2xl p-4 text-emerald-300 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-medium">Spectro-Temporal Modulation</span>
                    <span className="text-[10px] text-[#C88A2C]">Demo Waveform Only</span>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div className="h-16 flex items-center justify-between gap-1 px-1 bg-black/40 rounded-xl border border-emerald-900/40 relative overflow-hidden">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const isCenter = i > 10 && i < 26;
                      const baseHeight = selectedSample.category === 'synthetic'
                        ? isCenter ? 75 : 20
                        : (Math.sin(i * 0.4) * 35 + 45);
                      const height = isPlaying ? Math.max(15, Math.min(95, baseHeight + (Math.random() * 20 - 10))) : baseHeight;
                      
                      return (
                        <div
                          key={i}
                          className={`w-full rounded-sm transition-all duration-150 ${
                            selectedSample.category === 'synthetic'
                              ? 'bg-gradient-to-t from-[#B91C1C] via-[#D97706] to-[#15803D]'
                              : 'bg-gradient-to-t from-[#0A3D24] via-[#135A37] to-emerald-300'
                          }`}
                          style={{
                            height: `${height}%`,
                            opacity: isPlaying ? 1 : 0.7
                          }}
                        />
                      );
                    })}

                    {/* Playhead Marker */}
                    {isPlaying && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md shadow-white pointer-events-none transition-all"
                        style={{ left: `${playbackProgress * 100}%` }}
                      />
                    )}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={togglePlayback}
                        className="p-2 bg-[#0A3D24] hover:bg-[#135A37] text-white rounded-lg transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                        title={isPlaying ? 'Pause Demo Animation' : 'Play Demo Animation'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {isPlaying ? `${Math.round(playbackProgress * 6)}s / 6s (Demo)` : '00:00 / 00:06 (Demo)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 block font-mono">DEMO PATTERN</span>
                      <span
                        className={`font-mono font-extrabold text-xs ${
                          selectedSample.category === 'synthetic' ? 'text-rose-400' : 'text-emerald-300'
                        }`}
                      >
                        {selectedSample.category === 'synthetic' ? 'SYNTHETIC SIGNATURE' : 'NATURAL EXEMPLAR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acoustic Anomaly Diagnostics */}
                <div className="p-3 bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#54665C]">
                    <span className="font-medium">F0 Pitch Jitter:</span>
                    <span className="font-mono font-bold text-[#112217]">{selectedSample.f0Jitter}</span>
                  </div>
                  <div className="flex justify-between text-[#54665C]">
                    <span className="font-medium">Phase Coherence:</span>
                    <span className="font-mono font-bold text-[#112217]">{selectedSample.phaseCoherence}</span>
                  </div>
                  <p className="text-[11px] text-[#54665C] pt-1 border-t border-[#E1EBE4] italic leading-snug">
                    "{selectedSample.description}"
                  </p>
                </div>

                {/* Action button inside card */}
                <button
                  onClick={() => setCurrentScreen('signin')}
                  className="w-full py-3 bg-[#0A3D24] hover:bg-[#062817] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Authenticate & Inspect Real Evidence Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Pillar Forensic Architecture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            Forensic Defense Framework
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Scientific Rigor Beyond Doubt
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Unlike consumer detection tools that deliver black-box probabilities, our architecture provides complete evidentiary traceability from raw ingest to judicial cross-examination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-all">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
              Neural Ensemble Fusion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Parallel execution of RawNet3 time-domain analysis, ResNet Mel-spectrogram processing, and Wav2Vec2 self-supervised speech representations with weighted confidence calibration.
            </p>
            <div className="pt-2 text-[11px] font-mono font-bold text-emerald-700 flex items-center space-x-1">
              <span>98.7% AUROC Benchmark</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-all">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-800 transition-colors">
              Explainable AI (Grad-CAM)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides visual 2D spectrogram heatmaps identifying exactly which millisecond phonemes and frequency bands triggered the synthetic classification for jury presentation.
            </p>
            <div className="pt-2 text-[11px] font-mono font-bold text-teal-700 flex items-center space-x-1">
              <span>SHAP Feature Attribution</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#E1EBE4] rounded-2xl p-6 shadow-2xs hover:border-[#0A3D24] hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#15803D]/20 flex items-center justify-center text-[#0A3D24] group-hover:bg-[#0A3D24] group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#112217] text-base group-hover:text-[#0A3D24] transition-colors">
              Expert Review & Digital Attestation
            </h3>
            <p className="text-xs text-[#54665C] leading-relaxed">
              Requires certified expert examiners to review acoustic anomalies, verify SWGDE compliance checklists, and sign findings with cryptographic signatures or FIDO2 hardware enclaves.
            </p>
            <div className="pt-2 text-[11px] font-mono font-bold text-[#0A3D24] flex items-center space-x-1">
              <span>Cryptographic Attestation</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#E1EBE4] rounded-2xl p-6 shadow-2xs hover:border-[#0A3D24] hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-[#F8FAF9] border border-[#E1EBE4] flex items-center justify-center text-[#112217] group-hover:bg-[#0A3D24] group-hover:text-white transition-all">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#112217] text-base group-hover:text-[#0A3D24] transition-colors">
              Self-Authenticating PDF & Verification
            </h3>
            <p className="text-xs text-[#54665C] leading-relaxed">
              Generates self-authenticating legal reports with embedded QR codes, SHA-256 evidence digests, and public token endpoints for cross-party verification.
            </p>
            <div className="pt-2 text-[11px] font-mono font-bold text-[#C88A2C] flex items-center space-x-1">
              <span>FRE 902(14) Admissible Framework</span>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Pipeline Stage Flow */}
      <section className="py-14 bg-white border-y border-[#E1EBE4] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#0A3D24] uppercase tracking-wider block">
                Workflow Automation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112217] font-serif-title">
                End-to-End Chain of Custody
              </h2>
            </div>
            <button
              onClick={() => setCurrentScreen('workflow')}
              className="px-4 py-2 bg-[#F0FDF4] hover:bg-[#E1EBE4]/50 text-[#0A3D24] border border-[#15803D]/20 rounded-xl text-xs font-bold flex items-center space-x-2 self-start sm:self-auto transition-colors cursor-pointer"
            >
              <span>Explore Detailed Specs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Evidence Ingestion',
                subtitle: 'SHA-256 Bitstream Seal',
                desc: 'Bit-level hash calculation from file bytes prior to staging in encrypted sandbox enclave.'
              },
              {
                step: '02',
                title: 'DSP Feature Extraction',
                subtitle: 'Spectral & Pitch Analysis',
                desc: 'Computes 128 Mel-filterbanks, F0 pitch contours, LFCCs, and phase coherence.'
              },
              {
                step: '03',
                title: 'Ensemble Inference',
                subtitle: 'Multi-Model Arbitration',
                desc: 'Cross-evaluates temporal and spectral features across CNN, BiLSTM, and Transformer backbones.'
              },
              {
                step: '04',
                title: 'Expert Validation',
                subtitle: 'Cryptographic Attestation',
                desc: 'Examiner reviews acoustic anomalies and certifies findings with secure hardware-backed cryptographic signing.'
              },
              {
                step: '05',
                title: 'Judicial Admissibility',
                subtitle: 'Court-Ready Docket',
                desc: 'Issues self-authenticating report ready for direct submission in trial proceedings.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAF9] border border-emerald-900/10 rounded-2xl p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-800/25 font-mono">
                    {item.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] font-semibold text-emerald-700">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct CTA Footer Banner */}
      <section className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#03241A] via-[#053A2A] to-[#04241B] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-emerald-700/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-300 font-bold">
                OPERATIONAL SECURITY ENCLAVE
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to verify disputed audio evidence?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Access the live terminal with simulated law enforcement and defense credentials or verify existing forensic tokens publicly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setCurrentScreen('signin')}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-950" />
              <span>Sign In to Terminal</span>
            </button>
            <button
              onClick={() => setCurrentScreen('request-access')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Accreditation Enrollment</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
