import { Track } from '../types/music';

export type AudioStateListener = (state: AudioPlayerState) => void;

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  bufferedTime: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  playbackRate: number;
  error: string | null;
}

class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isSourceConnected = false;
  private listeners: Set<AudioStateListener> = new Set();

  private state: AudioPlayerState = {
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    bufferedTime: 0,
    volume: 1, // 0 to 1.5 (0% to 150% Enhanced Volume)
    isMuted: false,
    playbackRate: 1,
    error: null,
  };

  private playPromise: Promise<void> | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    // Load saved volume (supports 0 to 1.5)
    const savedVolume = localStorage.getItem('anamar_volume');
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume);
      if (!isNaN(v)) {
        const clamped = Math.max(0, Math.min(1.5, v));
        this.state.volume = clamped;
        this.audio.volume = Math.min(1, clamped);
      }
    }

    this.setupEventListeners();
    this.setupBackgroundKeepAlive();
  }

  private setupBackgroundKeepAlive() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.state.isPlaying) {
          // If page becomes hidden or returns to visible, resume AudioContext to prevent cutoff
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
          if (this.audio.paused && !this.state.isBuffering) {
            this.play().catch(() => {});
          }
        }
      });
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private setupEventListeners() {
    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.state.isBuffering = false;
      this.state.error = null;
      this.notifyListeners();
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notifyListeners();
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('waiting', () => {
      this.state.isBuffering = true;
      this.notifyListeners();
    });

    this.audio.addEventListener('playing', () => {
      this.state.isBuffering = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime;
      this.updateBuffered();
      this.notifyListeners();
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('durationchange', () => {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.state.duration = this.audio.duration;
        this.notifyListeners();
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        if (!this.state.duration || this.audio.duration > this.state.duration) {
          this.state.duration = this.audio.duration;
        }
      }
      this.state.isBuffering = false;
      this.notifyListeners();
      this.initAudioContext();
    });

    this.audio.addEventListener('ended', () => {
      // If audio file ended before full track duration (e.g. preview ended), resolve full stream
      if (
        this.state.currentTrack &&
        this.state.duration > 45 &&
        this.audio.currentTime < this.state.duration - 10
      ) {
        console.log('[AudioEngine] Premature stream cut detected, transitioning to full song audio...');
        const fullStreamUrl = `/api/music/stream?q=${encodeURIComponent(`${this.state.currentTrack.artist} ${this.state.currentTrack.title}`)}`;
        if (!this.audio.src.includes('/api/music/stream')) {
          this.audio.src = fullStreamUrl;
          this.audio.load();
          this.play().catch(() => {});
          return;
        }
      }

      this.state.isPlaying = false;
      this.notifyListeners();
      // Notify custom ended event
      window.dispatchEvent(new CustomEvent('anamar:track-ended'));
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('AudioEngine playback error:', e);
      this.handlePlaybackError();
    });
  }

  private initAudioContext() {
    try {
      if (!this.audioContext && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          this.gainNode = this.audioContext.createGain();
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.8;

          if (!this.isSourceConnected) {
            try {
              this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
              this.sourceNode.connect(this.gainNode);
              this.gainNode.connect(this.analyser);
              this.analyser.connect(this.audioContext.destination);
              this.isSourceConnected = true;
            } catch {
              // Media element already connected or cross-origin restrictions
            }
          }

          this.applyVolumeToNodes(this.state.volume);
        }
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    } catch {
      // AudioContext optional fallback
    }
  }

  private applyVolumeToNodes(vol: number) {
    const clamped = Math.max(0, Math.min(1.5, vol));
    try {
      if (clamped <= 1.0) {
        this.audio.volume = clamped;
        if (this.gainNode && this.audioContext) {
          this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
        }
      } else {
        // Enhanced Volume (> 100% up to 150%)
        this.audio.volume = 1.0;
        if (this.gainNode && this.audioContext) {
          this.gainNode.gain.setValueAtTime(clamped, this.audioContext.currentTime);
        }
      }
    } catch (e) {
      console.warn('Volume application error:', e);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initAudioContext();
    return this.analyser;
  }

  private updateBuffered() {
    if (this.audio.buffered && this.audio.buffered.length > 0) {
      try {
        const cur = this.audio.currentTime;
        for (let i = 0; i < this.audio.buffered.length; i++) {
          if (this.audio.buffered.start(i) <= cur && cur <= this.audio.buffered.end(i)) {
            this.state.bufferedTime = this.audio.buffered.end(i);
            break;
          }
        }
      } catch {
        // Ignored
      }
    }
  }

  private handlePlaybackError() {
    this.state.isBuffering = false;
    this.state.isPlaying = false;

    if (this.retryCount < this.maxRetries && this.state.currentTrack) {
      this.retryCount++;
      const currentTrack = this.state.currentTrack;
      console.log(`Retrying playback attempt ${this.retryCount} for track:`, currentTrack.title);

      setTimeout(() => {
        if (!this.state.currentTrack) return;
        
        // Remove crossOrigin restriction on retry
        this.audio.removeAttribute('crossorigin');

        if (this.retryCount === 1) {
          // Attempt 1: If streamUrl contains a proxied url parameter, try the direct raw source URL (ideal for Cloudflare Pages static hosting)
          if (currentTrack.streamUrl.includes('url=')) {
            try {
              const directUrl = decodeURIComponent(currentTrack.streamUrl.split('url=')[1].split('&')[0]);
              this.audio.src = directUrl;
            } catch {
              this.audio.src = currentTrack.streamUrl;
            }
          } else {
            const proxyUrl = currentTrack.streamUrl.startsWith('/api/')
              ? currentTrack.streamUrl
              : `/api/audio-proxy?url=${encodeURIComponent(currentTrack.streamUrl)}`;
            this.audio.src = proxyUrl;
          }
        } else if (this.retryCount === 2) {
          // Attempt 2: Try audio proxy endpoint
          const proxyUrl = currentTrack.streamUrl.startsWith('/api/')
            ? currentTrack.streamUrl
            : `/api/audio-proxy?url=${encodeURIComponent(currentTrack.streamUrl)}`;
          this.audio.src = proxyUrl;
        } else {
          // Attempt 3: Resolve authentic song stream via title & artist
          const songStreamUrl = `/api/music/stream?q=${encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`)}`;
          this.audio.src = songStreamUrl;
        }

        this.audio.load();
        this.play().catch(() => {});
      }, 800 * this.retryCount);
    } else {
      this.state.error = 'Playback issue encountered. Click Play to retry.';
      this.notifyListeners();
    }
  }

  public async setTrack(track: Track, autoPlay = true, startPosition = 0): Promise<void> {
    this.retryCount = 0;
    this.state.currentTrack = track;
    this.state.error = null;
    this.state.duration = track.duration || 0;
    this.state.currentTime = startPosition;

    // Determine best streaming URL
    let streamUrl = track.streamUrl;
    if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
      if (streamUrl.includes('pixabay.com') || streamUrl.includes('apple.com') || streamUrl.includes('dzcdn.net')) {
        streamUrl = `/api/audio-proxy?url=${encodeURIComponent(streamUrl)}`;
      }
    }

    // Stop current
    this.audio.pause();
    this.audio.src = streamUrl;
    this.audio.currentTime = startPosition;
    this.audio.load();

    this.updateMediaSessionMetadata(track);
    this.notifyListeners();

    if (autoPlay) {
      await this.play();
    }
  }

  public async play(): Promise<void> {
    this.initAudioContext();
    if (!this.audio.src) return;

    // WakeLock for background screen & audio continuity if supported
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock) {
      try {
        (navigator as any).wakeLock.request('screen').catch(() => {});
      } catch {}
    }

    try {
      this.playPromise = this.audio.play();
      await this.playPromise;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Audio play request failed:', err);
        this.state.isPlaying = false;
        this.notifyListeners();
      }
    }
  }

  public pause(): void {
    if (this.playPromise) {
      this.playPromise.then(() => {
        this.audio.pause();
      }).catch(() => {
        this.audio.pause();
      });
    } else {
      this.audio.pause();
    }
  }

  public togglePlay(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number): void {
    const target = Math.max(0, Math.min(this.state.duration || Infinity, seconds));
    this.audio.currentTime = target;
    this.state.currentTime = target;
    this.notifyListeners();
  }

  public setVolume(vol: number): void {
    // Allows 0% to 150% (0 to 1.5)
    const clamped = Math.max(0, Math.min(1.5, vol));
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    this.applyVolumeToNodes(clamped);
    localStorage.setItem('anamar_volume', clamped.toString());
    this.notifyListeners();
  }

  public toggleMute(): void {
    if (this.state.isMuted) {
      this.state.isMuted = false;
      const restoreVol = this.state.volume > 0 ? this.state.volume : 1.0;
      this.setVolume(restoreVol);
    } else {
      this.state.isMuted = true;
      this.applyVolumeToNodes(0);
    }
    this.notifyListeners();
  }

  public setPlaybackRate(rate: number): void {
    this.audio.playbackRate = rate;
    this.state.playbackRate = rate;
    this.notifyListeners();
  }

  public getState(): AudioPlayerState {
    return { ...this.state };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const s = this.getState();
    this.listeners.forEach((listener) => listener(s));
  }

  // Media Session API
  private updateMediaSessionMetadata(track: Track): void {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'Anamar Music',
          artwork: [
            { src: track.thumbnail, sizes: '96x96', type: 'image/jpeg' },
            { src: track.thumbnail, sizes: '192x192', type: 'image/jpeg' },
            { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        // Set action handlers
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) this.seek(details.seekTime);
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          this.seek(this.state.currentTime - (details.seekOffset || 10));
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          this.seek(this.state.currentTime + (details.seekOffset || 10));
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          window.dispatchEvent(new CustomEvent('anamar:prev-track'));
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          window.dispatchEvent(new CustomEvent('anamar:next-track'));
        });
      } catch {
        // MediaSession optional
      }
    }
  }

  private updateMediaSessionState(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
    }
  }

  private updateMediaSessionPosition(): void {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      if (this.state.duration && !isNaN(this.state.duration) && this.state.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: this.state.duration,
            playbackRate: this.state.playbackRate,
            position: Math.min(this.state.currentTime, this.state.duration),
          });
        } catch {
          // Ignored
        }
      }
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
