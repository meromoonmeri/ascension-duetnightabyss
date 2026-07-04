/**
 * AudioEngine — Web Audio API synthesizer for immersive UI sounds
 *
 * All sounds are generated procedurally (no external files needed).
 * Inspired by Opera GX / Genshin Impact UI sound design:
 *   - Subtle, ethereal, never intrusive
 *   - Fantasy-appropriate tones and textures
 *   - Volume capped to stay behind content
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxVolume = 0.25;
let muted = false;

/* ── Lazy-init AudioContext (must happen inside a user gesture) ── */
function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = sfxVolume;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

/* ── Helpers ── */

function createNoise(duration: number): AudioBufferSourceNode {
  const c = getCtx();
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  return src;
}

function createOsc(type: OscillatorType, freq: number): OscillatorNode {
  const c = getCtx();
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  return osc;
}

/* ── Sound Presets ── */

/**
 * Page navigate FORWARD — ethereal whoosh rising
 * Bandpass-filtered noise sweep 300→1200Hz + harmonic shimmer
 */
export function playNavigateForward() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  // Noise whoosh
  const noise = createNoise(0.25);
  const bandpass = c.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 1.5;
  bandpass.frequency.setValueAtTime(300, t);
  bandpass.frequency.exponentialRampToValueAtTime(1200, t + 0.18);
  bandpass.frequency.exponentialRampToValueAtTime(600, t + 0.25);

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.15, t + 0.03);
  noiseGain.gain.linearRampToValueAtTime(0.12, t + 0.15);
  noiseGain.gain.linearRampToValueAtTime(0, t + 0.25);

  noise.connect(bandpass).connect(noiseGain).connect(master);
  noise.start(t);
  noise.stop(t + 0.3);

  // Shimmer harmonic
  const osc = createOsc("sine", 520);
  osc.frequency.exponentialRampToValueAtTime(780, t + 0.15);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0, t);
  oscGain.gain.linearRampToValueAtTime(0.04, t + 0.02);
  oscGain.gain.linearRampToValueAtTime(0, t + 0.3);

  const reverb = c.createBiquadFilter();
  reverb.type = "lowpass";
  reverb.frequency.value = 2000;

  osc.connect(reverb).connect(oscGain).connect(master);
  osc.start(t);
  osc.stop(t + 0.35);
}

/**
 * Page navigate BACK — reverse whoosh, descending
 */
export function playNavigateBack() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  const noise = createNoise(0.22);
  const bandpass = c.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 1.2;
  bandpass.frequency.setValueAtTime(1000, t);
  bandpass.frequency.exponentialRampToValueAtTime(250, t + 0.18);

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.02);
  noiseGain.gain.linearRampToValueAtTime(0, t + 0.22);

  noise.connect(bandpass).connect(noiseGain).connect(master);
  noise.start(t);
  noise.stop(t + 0.25);

  // Descending tone
  const osc = createOsc("sine", 660);
  osc.frequency.exponentialRampToValueAtTime(330, t + 0.18);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0, t);
  oscGain.gain.linearRampToValueAtTime(0.03, t + 0.01);
  oscGain.gain.linearRampToValueAtTime(0, t + 0.2);

  osc.connect(oscGain).connect(master);
  osc.start(t);
  osc.stop(t + 0.25);
}

/**
 * Scroll tick — extremely subtle, throttled externally
 */
export function playScrollTick() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  const noise = createNoise(0.015);
  const hpf = c.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 3000;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.025, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.015);

  noise.connect(hpf).connect(gain).connect(master);
  noise.start(t);
  noise.stop(t + 0.02);
}

/**
 * UI click — short, crisp pop
 */
export function playClick() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  const osc = createOsc("sine", 880);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + 0.05);
}

/**
 * Panel / overlay OPEN — rising ethereal chime
 */
export function playOpen() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  // Main tone
  const osc1 = createOsc("sine", 440);
  osc1.frequency.exponentialRampToValueAtTime(880, t + 0.12);

  const g1 = c.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.05, t + 0.015);
  g1.gain.linearRampToValueAtTime(0.035, t + 0.1);
  g1.gain.linearRampToValueAtTime(0, t + 0.2);

  osc1.connect(g1).connect(master);
  osc1.start(t);
  osc1.stop(t + 0.25);

  // Octave harmonic for "sparkle"
  const osc2 = createOsc("sine", 880);
  osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.1);

  const g2 = c.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.02, t + 0.01);
  g2.gain.linearRampToValueAtTime(0, t + 0.18);

  osc2.connect(g2).connect(master);
  osc2.start(t);
  osc2.stop(t + 0.2);
}

/**
 * Panel / overlay CLOSE — soft descending tone
 */
export function playClose() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  const osc = createOsc("sine", 660);
  osc.frequency.exponentialRampToValueAtTime(330, t + 0.15);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.18);

  const lpf = c.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 1500;

  osc.connect(lpf).connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + 0.2);
}

/**
 * Theme toggle — celestial shift
 */
export function playThemeToggle() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  // Ascending arpeggio
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = createOsc("sine", freq);
    const gain = c.createGain();
    const start = t + i * 0.06;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.03, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, start + 0.2);

    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + 0.25);
  });
}

/**
 * Hover — very subtle presence sound
 */
export function playHover() {
  if (muted) return;
  const c = getCtx();
  const master = getMaster();
  const t = c.currentTime;

  const osc = createOsc("sine", 1200);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.012, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  const lpf = c.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 2500;

  osc.connect(lpf).connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + 0.07);
}

/* ── Volume Control ── */

export function setSfxVolume(vol: number) {
  sfxVolume = Math.max(0, Math.min(1, vol));
  if (masterGain) {
    masterGain.gain.value = sfxVolume;
  }
}

export function setSfxMuted(m: boolean) {
  muted = m;
  if (masterGain) {
    masterGain.gain.value = m ? 0 : sfxVolume;
  }
}

/**
 * Initialize the audio context (call from a user gesture)
 */
export function initAudio() {
  getCtx();
}

/**
 * Check if audio is available / has been initialized
 */
export function isAudioInitialized(): boolean {
  return ctx !== null;
}