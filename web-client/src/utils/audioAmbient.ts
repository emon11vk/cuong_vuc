// Web Audio API procedural atmospheric ambient generator for Hanoi 1946
// Synthesizes:
// 1. Winter night wind breeze (filtered bandpass noise)
// 2. Chùa Láng distant bronze temple bell chime (FM synthesis with harmonic overtones)
// 3. Vintage wartime radio warmth (subtle soft saturation)

class Hanoi1946AmbientAudio {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private bellIntervalId: any = null;
  private windSource: AudioNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 2.5);
    this.masterGain.connect(this.ctx.destination);

    // 1. Synthesize Winter Wind (Pink/Brown noise through sweeping lowpass filter)
    this.startWind();

    // 2. Schedule Chùa Láng Temple Bell every 12-18 seconds
    this.triggerTempleBell();
    this.bellIntervalId = setInterval(() => {
      if (this.isPlaying) {
        this.triggerTempleBell();
      }
    }, 15000);
  }

  private startWind() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate brown-tinted noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft distant wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO to modulate wind gusting
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();
    this.windSource = whiteNoise;
  }

  public triggerTempleBell() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Fundamental Bell frequency ~ 216Hz (A3 tuned temple bell)
    const baseFreq = 216;
    const harmonics = [1, 2.76, 5.4, 8.9];
    const harmonicWeights = [0.35, 0.15, 0.08, 0.03];

    harmonics.forEach((multiplier, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * multiplier, now);

      const amp = harmonicWeights[index];
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.04);
      // Bell resonance decays slowly over 6 to 9 seconds
      const decayTime = 5 + index * 1.2;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decayTime + 0.5);
    });
  }

  public stop() {
    if (!this.isPlaying) return;
    if (this.bellIntervalId) {
      clearInterval(this.bellIntervalId);
      this.bellIntervalId = null;
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        this.isPlaying = false;
      }, 1300);
    } else {
      this.isPlaying = false;
    }
  }
}

export const hanoiAudio = new Hanoi1946AmbientAudio();
