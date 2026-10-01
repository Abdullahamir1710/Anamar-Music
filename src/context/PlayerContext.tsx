import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Track } from '../types/music';
import { audioEngine, AudioPlayerState } from '../services/audioEngine';
import { storageService } from '../services/storage';
import { recommendationService } from '../services/recommendationService';
import { INITIAL_TRACKS } from '../services/musicCatalog';

export type AudioStreamingQuality = 'lossless' | 'high' | 'standard';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  error: string | null;

  queue: Track[];
  currentIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';

  likedTrackIds: string[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => void;

  playTrack: (track: Track, customQueue?: Track[], index?: number) => Promise<void>;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Audio Quality
  audioQuality: AudioStreamingQuality;
  setAudioQuality: (quality: AudioStreamingQuality) => void;

  // Modals & Panels
  isFullPlayerOpen: boolean;
  setFullPlayerOpen: (open: boolean) => void;
  isAmbientOpen: boolean;
  setAmbientOpen: (open: boolean) => void;
  isLyricsOpen: boolean;
  setLyricsOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
  isFindOpen: boolean;
  setFindOpen: (open: boolean) => void;
  isBrainOpen: boolean;
  setBrainOpen: (open: boolean) => void;
  isSpotifyOpen: boolean;
  setSpotifyOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioEngine.getState());
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('all');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(storageService.getLikedSongIds());

  // Audio Quality state (lossless 320kbps, high 256kbps, standard 128kbps)
  const [audioQuality, setAudioQualityState] = useState<AudioStreamingQuality>(() => {
    return (localStorage.getItem('anamar_audio_quality') as AudioStreamingQuality) || 'lossless';
  });

  const setAudioQuality = (q: AudioStreamingQuality) => {
    setAudioQualityState(q);
    localStorage.setItem('anamar_audio_quality', q);
  };

  // UI Drawer / Modal states
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isAmbientOpen, setAmbientOpen] = useState(false);
  const [isLyricsOpen, setLyricsOpen] = useState(false);
  const [isQueueOpen, setQueueOpen] = useState(false);
  const [isFindOpen, setFindOpen] = useState(false);
  const [isBrainOpen, setBrainOpen] = useState(false);
  const [isSpotifyOpen, setSpotifyOpen] = useState(false);

  // Track play session timing for skip penalty / completed reward
  const playStartTimeRef = useRef<number>(0);
  const trackPlayDurationRef = useRef<number>(0);

  // Subscribe to audio engine updates
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlay();
      } else if (e.code === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        audioEngine.seek(audioEngine.getState().currentTime + 5);
      } else if (e.code === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        audioEngine.seek(audioEngine.getState().currentTime - 5);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        audioEngine.toggleMute();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        setLyricsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle external prev/next events (e.g. Media Session API)
  useEffect(() => {
    const onPrev = () => prev();
    const onNext = () => next();
    const onEnded = () => handleTrackEnded();

    window.addEventListener('anamar:prev-track', onPrev);
    window.addEventListener('anamar:next-track', onNext);
    window.addEventListener('anamar:track-ended', onEnded);

    return () => {
      window.removeEventListener('anamar:prev-track', onPrev);
      window.removeEventListener('anamar:next-track', onNext);
      window.removeEventListener('anamar:track-ended', onEnded);
    };
  }, [currentIndex, queue, repeat, shuffle]);

  const handleTrackEnded = useCallback(() => {
    if (audioState.currentTrack) {
      recommendationService.recordCompleted(audioState.currentTrack);
    }

    if (repeat === 'one' && audioState.currentTrack) {
      audioEngine.seek(0);
      audioEngine.play();
    } else {
      next();
    }
  }, [audioState.currentTrack, repeat]);

  const playTrack = useCallback(
    async (track: Track, customQueue?: Track[], index?: number) => {
      // Record signal for previously playing track if skipped early
      if (audioState.currentTrack && audioState.currentTrack.id !== track.id) {
        const timePlayed = (Date.now() - playStartTimeRef.current) / 1000;
        recommendationService.recordSkip(audioState.currentTrack, timePlayed);
      }

      playStartTimeRef.current = Date.now();
      trackPlayDurationRef.current = 0;

      let newQueue = queue;
      let newIdx = 0;

      if (customQueue) {
        newQueue = customQueue;
        setQueue(customQueue);
        newIdx = index !== undefined ? index : customQueue.findIndex((t) => t.id === track.id);
        if (newIdx < 0) newIdx = 0;
        setCurrentIndex(newIdx);
      } else {
        const found = queue.findIndex((t) => t.id === track.id);
        if (found >= 0) {
          newIdx = found;
          setCurrentIndex(found);
        } else {
          newQueue = [track, ...queue];
          setQueue(newQueue);
          setCurrentIndex(0);
          newIdx = 0;
        }
      }

      await audioEngine.setTrack(track, true);
      recommendationService.recordPlay(track);
    },
    [audioState.currentTrack, queue]
  );

  const togglePlay = useCallback(() => {
    audioEngine.togglePlay();
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        return; // stopped at end
      }
    }

    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setCurrentIndex(nextIdx);
      playTrack(nextTrack, queue, nextIdx);
    }
  }, [currentIndex, queue, repeat, shuffle, playTrack]);

  const prev = useCallback(() => {
    if (audioEngine.getState().currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setCurrentIndex(prevIdx);
      playTrack(prevTrack, queue, prevIdx);
    }
  }, [currentIndex, queue, playTrack]);

  const seek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    audioEngine.setVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    audioEngine.toggleMute();
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const isLiked = useCallback(
    (trackId: string) => {
      return likedTrackIds.includes(trackId);
    },
    [likedTrackIds]
  );

  const toggleLike = useCallback((track: Track) => {
    const isNowLiked = storageService.toggleLikeSong(track.id);
    setLikedTrackIds(storageService.getLikedSongIds());
    recommendationService.recordLike(track, isNowLiked);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < currentIndex) {
        setCurrentIndex((c) => c - 1);
      }
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    if (audioState.currentTrack) {
      setQueue([audioState.currentTrack]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(0);
    }
  }, [audioState.currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack: audioState.currentTrack,
        isPlaying: audioState.isPlaying,
        isBuffering: audioState.isBuffering,
        currentTime: audioState.currentTime,
        duration: audioState.duration,
        bufferedTime: audioState.bufferedTime,
        volume: audioState.volume,
        isMuted: audioState.isMuted,
        playbackRate: audioState.playbackRate,
        error: audioState.error,

        queue,
        currentIndex,
        shuffle,
        repeat,

        likedTrackIds,
        isLiked,
        toggleLike,

        playTrack,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,

        addToQueue,
        removeFromQueue,
        clearQueue,

        audioQuality,
        setAudioQuality,

        isFullPlayerOpen,
        setFullPlayerOpen,
        isAmbientOpen,
        setAmbientOpen,
        isLyricsOpen,
        setLyricsOpen,
        isQueueOpen,
        setQueueOpen,
        isFindOpen,
        setFindOpen,
        isBrainOpen,
        setBrainOpen,
        isSpotifyOpen,
        setSpotifyOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
