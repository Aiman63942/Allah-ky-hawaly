// Web Audio API & Speech Synthesis sound engine for hearable audio evidence & OTP notifications

let audioCtx: AudioContext | null = null;
let activeAudioElement: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a realistic security notification chime when an OTP or alert arrives
 */
export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone (higher pitch)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (chime response)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.12); // E6
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Plays a success verification chime when OTP or PIN is verified
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (err) {
    console.warn('Success sound playback error:', err);
  }
}

/**
 * Plays keypress click sound when entering PIN or OTP
 */
export function playKeyClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  } catch (err) {
    console.warn('Key click sound error:', err);
  }
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeToneOscs: OscillatorNode[] = [];

/**
 * Plays real voice audio recording file or synthesized voice speech sample with acoustic vocal formants
 */
export function speakAudioEvidence(
  text: string,
  options?: { isSynthetic?: boolean; pitch?: number; rate?: number; audioUrl?: string; onEnd?: () => void }
) {
  stopAudioEvidence();

  // Play real audio only when authentic audio file URL or Blob is provided
  if (options?.audioUrl) {
    try {
      const audio = new Audio(options.audioUrl);
      activeAudioElement = audio;
      audio.onended = () => {
        activeAudioElement = null;
        if (options.onEnd) options.onEnd();
      };
      audio.onerror = () => {
        activeAudioElement = null;
        console.warn('Evidence audio playback error: audio stream unplayable or inaccessible.');
        if (options.onEnd) options.onEnd();
      };
      audio.play().catch((err) => {
        activeAudioElement = null;
        console.warn('Playback auto-play or stream failure:', err);
        if (options.onEnd) options.onEnd();
      });
      return;
    } catch (err) {
      console.warn('Failed to initialize audio playback element:', err);
      if (options.onEnd) options.onEnd();
      return;
    }
  }

  // Under Rule 4.1 & Rule 7.2: Never fabricate oscillator tone or synthetic speech as evidence audio
  console.info('No playable original audio stream available for this evidence exhibit.');
  if (options?.onEnd) {
    options.onEnd();
  }
}

/**
 * Stops active audio speech or synthesis playback
 */
export function stopAudioEvidence() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudioElement = null;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;

  activeToneOscs.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore
    }
  });
  activeToneOscs = [];
}
