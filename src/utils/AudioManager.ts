import * as Tone from 'tone';

class AudioManager {
  private synth: Tone.Synth;
  private noise: Tone.Noise;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private volume: Tone.Volume;
  private isPlaying: boolean = false;

  constructor() {
    // Initialize audio components
    this.synth = new Tone.Synth({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.4,
        release: 4,
      },
    }).toDestination();

    this.noise = new Tone.Noise({
      type: 'pink',
      volume: -20,
    });

    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 800,
      Q: 1,
    });

    this.reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.5,
    });

    this.volume = new Tone.Volume(-20);

    // Connect components
    this.noise.connect(this.filter);
    this.filter.connect(this.reverb);
    this.reverb.connect(this.volume);
    this.volume.toDestination();
  }

  public async startAmbient() {
    if (this.isPlaying) return;

    await Tone.start();
    this.noise.start();
    this.isPlaying = true;

    // Schedule random ambient tones
    this.scheduleAmbientTones();
  }

  public stopAmbient() {
    this.noise.stop();
    this.isPlaying = false;
  }

  public setChaosLevel(level: number) {
    // Adjust audio parameters based on chaos level
    const normalizedLevel = Math.min(Math.max(level, 0), 1);
    
    this.filter.frequency.rampTo(800 - normalizedLevel * 400, 1);
    this.reverb.wet.rampTo(0.5 + normalizedLevel * 0.3, 1);
    this.volume.volume.rampTo(-20 + normalizedLevel * 10, 1);
  }

  private scheduleAmbientTones() {
    if (!this.isPlaying) return;

    const note = this.getRandomNote();
    const duration = Math.random() * 2 + 1;
    const waitTime = Math.random() * 8 + 4;

    this.synth.triggerAttackRelease(note, duration);

    setTimeout(() => {
      this.scheduleAmbientTones();
    }, waitTime * 1000);
  }

  private getRandomNote(): string {
    const notes = ['C2', 'G2', 'C3', 'Eb3', 'G3', 'Bb3'];
    return notes[Math.floor(Math.random() * notes.length)];
  }
}

export const audioManager = new AudioManager(); 