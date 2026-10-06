// Singleton Audio Manager for Background Music
// Ensures only ONE audio element exists across desktop and mobile navigation headers.

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  isUserPaused: boolean;
  usingWebAudioFallback: boolean;
}

type AudioListener = (state: AudioState) => void;

const AUDIO_SOURCES = [
  '/audio/fondo-esperanza.mp3'
];

class BackgroundAudioManager {
  private static instance: BackgroundAudioManager | null = null;

  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private synthInterval: number | null = null;
  private audioSourceIndex: number = 0;

  private state: AudioState = {
    isPlaying: false,
    volume: 0.35,
    isUserPaused: false,
    usingWebAudioFallback: false,
  };

  private listeners: Set<AudioListener> = new Set();
  private gestureListenersAttached: boolean = false;
  private gestureAbortController: AbortController | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
      this.setupFirstGestureListeners();
    }
  }

  public static getInstance(): BackgroundAudioManager {
    if (!BackgroundAudioManager.instance) {
      BackgroundAudioManager.instance = new BackgroundAudioManager();
    }
    return BackgroundAudioManager.instance;
  }

  public getState(): AudioState {
    return { ...this.state };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error notifying audio listener:', err);
      }
    });
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.src = AUDIO_SOURCES[this.audioSourceIndex];
    audio.loop = true;
    try {
      audio.volume = this.state.volume;
    } catch {
      // iOS volume is handled by physical hardware buttons
    }
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.setAttribute('x-webkit-airplay', 'allow');

    audio.addEventListener('error', () => {
      console.warn('Error loading audio track, falling back to WebAudio synth.');
      if (this.audioSourceIndex < AUDIO_SOURCES.length - 1) {
        this.audioSourceIndex += 1;
        if (this.audioElement) {
          this.audioElement.src = AUDIO_SOURCES[this.audioSourceIndex];
          if (this.state.isPlaying && !this.state.isUserPaused) {
            this.audioElement.play().catch(() => this.startWebAudioSynth());
          }
        }
      } else {
        this.state.usingWebAudioFallback = true;
        if (this.state.isPlaying && !this.state.isUserPaused) {
          this.startWebAudioSynth();
        }
        this.notify();
      }
    });

    audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notify();
    });

    audio.addEventListener('pause', () => {
      if (!this.state.usingWebAudioFallback) {
        this.state.isPlaying = false;
        this.notify();
      }
    });

    this.audioElement = audio;

    // Try autoplay immediately (browsers might allow it or require interaction)
    audio.play().then(() => {
      this.state.isPlaying = true;
      this.removeGestureListeners();
      this.notify();
    }).catch(() => {
      // Autoplay blocked by mobile policy, will start on user interaction or tap
    });
  }

  private setupFirstGestureListeners() {
    if (this.gestureListenersAttached || typeof window === 'undefined') return;
    this.gestureListenersAttached = true;
    this.gestureAbortController = new AbortController();
    const { signal } = this.gestureAbortController;

    const onFirstGesture = () => {
      if (this.state.isUserPaused) {
        this.removeGestureListeners();
        return;
      }

      // Pre-warm Web Audio context if supported on iOS/Android
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx && !this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      } catch {
        // ignore
      }

      this.play()
        .then(() => {
          this.removeGestureListeners();
        })
        .catch(() => {
          this.startWebAudioSynth();
          this.removeGestureListeners();
        });
    };

    const options: AddEventListenerOptions = { once: true, passive: true, signal };
    window.addEventListener('pointerdown', onFirstGesture, options);
    window.addEventListener('click', onFirstGesture, options);
    window.addEventListener('touchstart', onFirstGesture, options);
    window.addEventListener('touchend', onFirstGesture, options);
    window.addEventListener('keydown', onFirstGesture, options);
    window.addEventListener('scroll', onFirstGesture, options);
  }

  private removeGestureListeners() {
    if (this.gestureAbortController) {
      try {
        this.gestureAbortController.abort();
      } catch {
        // ignore
      }
      this.gestureAbortController = null;
    }
    this.gestureListenersAttached = false;
  }

  public async play(): Promise<void> {
    this.state.isUserPaused = false;

    if (this.state.usingWebAudioFallback) {
      this.startWebAudioSynth();
      this.state.isPlaying = true;
      this.notify();
      return;
    }

    if (this.audioElement) {
      try {
        await this.audioElement.play();
        this.state.isPlaying = true;
        this.notify();
      } catch (err) {
        console.warn('Audio play failed, activating WebAudio fallback:', err);
        this.state.usingWebAudioFallback = true;
        this.startWebAudioSynth();
        this.state.isPlaying = true;
        this.notify();
      }
    }
  }

  public pause(): void {
    // User explicitly requested pause/silence:
    // Mark as user paused so gesture listeners NEVER resume it
    this.state.isUserPaused = true;
    this.removeGestureListeners();

    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch (e) {
        console.warn('Audio pause error:', e);
      }
    }

    this.stopWebAudioSynth();
    this.state.isPlaying = false;
    this.notify();
  }

  public togglePlay(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(newVolume: number): void {
    const clamped = Math.max(0, Math.min(1, newVolume));
    this.state.volume = clamped;

    if (this.audioElement) {
      try {
        this.audioElement.volume = clamped;
      } catch {
        // iOS locks volume to physical hardware buttons
      }
    }

    this.notify();
  }

  private startWebAudioSynth() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const chordFrequencies = [
        [293.66, 369.99, 440.00], // D major
        [392.00, 493.88, 587.33], // G major
        [440.00, 554.37, 659.25], // A major
        [246.94, 293.66, 369.99], // B minor
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!ctx || ctx.state === 'closed' || this.state.isUserPaused || !this.state.isPlaying) return;
        const now = ctx.currentTime;
        const freqs = chordFrequencies[chordIndex];
        chordIndex = (chordIndex + 1) % chordFrequencies.length;

        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);

          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const noteGain = (this.state.volume * 0.12) / freqs.length;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, noteGain), now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 5.0);
        });
      };

      if (!this.synthInterval) {
        playChord();
        this.synthInterval = window.setInterval(playChord, 5200);
      }
    } catch (e) {
      console.warn('Error in WebAudio Synth:', e);
    }
  }

  private stopWebAudioSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioContext && this.audioContext.state === 'running') {
      try {
        this.audioContext.suspend();
      } catch (e) {
        console.warn('Error suspending AudioContext:', e);
      }
    }
  }
}

export const audioManager = BackgroundAudioManager.getInstance();
