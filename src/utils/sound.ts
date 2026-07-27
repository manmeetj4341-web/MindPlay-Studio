// Web Audio API Synthesizer for MindPlay Studio
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy init audio context on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a pitch based on array value (for sorting visualizer)
  public playTone(frequency: number, duration: number = 0.08, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio context errors
    }
  }

  // Button click sound
  public playClick() {
    this.playTone(600, 0.05, 'triangle', 0.08);
  }

  // Success / Swap chime
  public playSuccess() {
    if (this.isMuted) return;
    this.playTone(523.25, 0.1, 'sine', 0.15); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.15), 80); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.15), 160); // G5
  }

  // Level up fanfare
  public playLevelUp() {
    if (this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'triangle', 0.2), i * 90);
    });
  }

  // Collision thud for physics
  public playCollision(intensity: number = 1) {
    if (this.isMuted) return;
    const freq = Math.max(80, Math.min(300, 250 - intensity * 20));
    this.playTone(freq, 0.08, 'sawtooth', Math.min(0.2, 0.05 + intensity * 0.02));
  }

  // Chemical Bond Reaction Sound
  public playBondZap() {
    if (this.isMuted) return;
    this.playTone(800, 0.06, 'sawtooth', 0.12);
    setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.15), 60);
  }

  // Error sound
  public playError() {
    if (this.isMuted) return;
    this.playTone(180, 0.15, 'sawtooth', 0.15);
  }
}

export const sound = new SoundEngine();
