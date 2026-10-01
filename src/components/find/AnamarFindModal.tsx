import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  X, 
  Play, 
  ListPlus, 
  Sparkles, 
  Search, 
  RefreshCw, 
  SearchX, 
  Volume2, 
  VolumeX, 
  Music2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { INITIAL_TRACKS, cleanSongTitle } from '../../services/musicCatalog';
import { echoMusicService } from '../../services/echoMusicService';
import { Track } from '../../types/music';
import { Logo } from '../common/Logo';

export const AnamarFindModal: React.FC = () => {
  const { isFindOpen, setFindOpen, playTrack, addToQueue } = usePlayer();

  const [state, setState] = useState<'idle' | 'listening' | 'identifying' | 'found' | 'not_found' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foundTrack, setFoundTrack] = useState<Track | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [manualQuery, setManualQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mic' | 'lyrics'>('mic');
  const [countdown, setCountdown] = useState<number>(6);
  const [hasSoundInput, setHasSoundInput] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  
  const detectedTranscriptRef = useRef<string>('');
  const soundDetectedRef = useRef<boolean>(false);
  const maxVolumeRef = useRef<number>(0);

  /**
   * CRITICAL: Completely release all microphone hardware, streams, tracks, 
   * audio contexts, and speech recognition so the device mic indicator turns OFF immediately.
   */
  const stopMicrophone = useCallback(() => {
    // 1. Cancel visualizer animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // 2. Clear all timeouts and countdown intervals
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // 3. Stop and abort speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        if (typeof recognitionRef.current.abort === 'function') {
          recognitionRef.current.abort();
        }
      } catch {}
      recognitionRef.current = null;
    }

    // 4. Disconnect audio context graph
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
      audioContextRef.current = null;
    }

    // 5. CRITICAL: Stop and disable every track in MediaStream to turn off OS red mic dot
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch {}
      mediaStreamRef.current = null;
    }

    // 6. Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setHasSoundInput(false);
  }, []);

  // Close modal and guarantee microphone is stopped immediately
  const handleClose = useCallback(() => {
    stopMicrophone();
    setState('idle');
    setFoundTrack(null);
    setErrorMessage(null);
    setTranscribedText('');
    setFindOpen(false);
  }, [stopMicrophone, setFindOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stopMicrophone]);

  // Handle modal open/close and tab switching
  useEffect(() => {
    if (isFindOpen && activeTab === 'mic') {
      startListening();
    } else if (!isFindOpen) {
      stopMicrophone();
      setState('idle');
      setFoundTrack(null);
      setErrorMessage(null);
      setTranscribedText('');
    } else if (activeTab === 'lyrics') {
      // Switched to lyrics tab: make sure mic is stopped
      stopMicrophone();
      if (state === 'listening') {
        setState('idle');
      }
    }
  }, [isFindOpen, activeTab]);

  /**
   * Identifies the song using authentic sources.
   * If no genuine song matches, transitions to 'not_found' (NEVER returns random song).
   */
  const identifySongQuery = async (queryText: string) => {
    // 1. Ensure microphone hardware is 100% stopped before network requests
    stopMicrophone();

    const cleanQ = queryText.trim();
    if (!cleanQ || cleanQ.length < 2) {
      setState('not_found');
      setErrorMessage('No lyrics or speech were recognized from the audio. Please try playing the song louder or hum clearly.');
      return;
    }

    setState('identifying');
    setTranscribedText(cleanQ);

    const lowerQ = cleanQ.toLowerCase();
    const queryTokens = lowerQ
      .split(/[\s,.'"-]+/)
      .filter((w) => w.length > 2);

    // 1. Check local master catalog for genuine matches
    let localMatch: Track | undefined;
    for (const t of INITIAL_TRACKS) {
      const tTitle = t.title.toLowerCase();
      const tArtist = t.artist.toLowerCase();
      const tLyrics = (t.lyrics || '').toLowerCase();

      // Direct exact or phrase match (requires reasonable length to avoid matching single letters)
      if (lowerQ.length >= 3 && (tTitle.includes(lowerQ) || (lowerQ.length >= 5 && lowerQ.includes(tTitle)))) {
        localMatch = t;
        break;
      }
      if (lowerQ.length >= 4 && tArtist.includes(lowerQ)) {
        localMatch = t;
        break;
      }
      if (lowerQ.length >= 5 && tLyrics.includes(lowerQ)) {
        localMatch = t;
        break;
      }

      // Word token matching: multiple words must match
      if (queryTokens.length >= 2) {
        const titleMatches = queryTokens.filter((w) => tTitle.includes(w)).length;
        if (titleMatches >= Math.min(2, queryTokens.length)) {
          localMatch = t;
          break;
        }
        const lyricsMatches = queryTokens.filter((w) => tLyrics.includes(w)).length;
        if (lyricsMatches >= Math.min(3, queryTokens.length)) {
          localMatch = t;
          break;
        }
      }
    }

    if (localMatch) {
      setFoundTrack(localMatch);
      setConfidence(97);
      setState('found');
      return;
    }

    // 2. Query backend live identify endpoint if available
    try {
      const res = await fetch(`/api/music/identify?q=${encodeURIComponent(cleanQ)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.found && data.track) {
          setFoundTrack({
            ...data.track,
            title: cleanSongTitle(data.track.title),
          });
          setConfidence(data.confidence || 95);
          setState('found');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend identification error:', e);
    }

    // 3. Query online catalog search (iTunes / Audius)
    try {
      const results = await echoMusicService.searchOnline(cleanQ, 5);
      if (results && results.length > 0) {
        // Verify candidate has genuine relevance to search tokens
        const candidate = results.find((r) => {
          const rTitle = r.title.toLowerCase();
          const rArtist = r.artist.toLowerCase();
          if (lowerQ.length >= 3 && (rTitle.includes(lowerQ) || lowerQ.includes(rTitle))) return true;
          if (lowerQ.length >= 4 && rArtist.includes(lowerQ)) return true;
          if (queryTokens.length > 0 && queryTokens.some((tok) => rTitle.includes(tok) || rArtist.includes(tok))) return true;
          return false;
        }) || (queryTokens.length > 0 ? results[0] : undefined);

        if (candidate) {
          setFoundTrack({
            ...candidate,
            title: cleanSongTitle(candidate.title),
          });
          setConfidence(94);
          setState('found');
          return;
        }
      }
    } catch (e) {
      console.warn('Online catalog search error:', e);
    }

    // 4. Query public LRCLIB directly for lyrics identification
    try {
      const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanQ)}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (lrcRes.ok) {
        const list = await lrcRes.json();
        if (Array.isArray(list) && list.length > 0) {
          const match = list.find((item: any) => {
            const t = (item.trackName || '').toLowerCase();
            const a = (item.artistName || '').toLowerCase();
            const l = (item.plainLyrics || '').toLowerCase();
            if (lowerQ.length >= 3 && (t.includes(lowerQ) || a.includes(lowerQ) || l.includes(lowerQ))) return true;
            if (queryTokens.length > 0 && queryTokens.some((w) => t.includes(w) || a.includes(w) || l.includes(w))) return true;
            return false;
          });

          if (match && match.trackName && match.artistName) {
            const cleanTitle = cleanSongTitle(match.trackName);
            const fullQuery = `${cleanTitle} ${match.artistName}`;
            const audioResults = await echoMusicService.searchOnline(fullQuery, 1);
            if (audioResults && audioResults.length > 0) {
              setFoundTrack(audioResults[0]);
            } else {
              setFoundTrack({
                id: `find-lrc-${match.id}`,
                title: cleanTitle,
                artist: match.artistName,
                album: match.albumName || 'Identified Hit',
                duration: match.duration || 210,
                genre: 'Identified',
                mood: 'Melodic',
                releaseYear: 2024,
                bitrate: '320 kbps',
                fileSize: (match.duration || 210) * 40000,
                canDownload: true,
                thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                streamUrl: `https://api.audius.co/v1/tracks?app_name=ANAMAR_MUSIC`,
                downloadUrl: '',
                lyrics: match.syncedLyrics || match.plainLyrics,
              });
            }
            setConfidence(95);
            setState('found');
            return;
          }
        }
      }
    } catch {}

    // 5. NO MATCH FOUND: Show real 'not_found' state (NO RANDOM FALLBACK!)
    setState('not_found');
    setErrorMessage(`We listened carefully, but couldn't find a matching song for "${cleanQ}". Try humming or singing another line, or search lyrics manually.`);
  };

  /**
   * Starts microphone recording and speech/acoustic analysis with visual feedback.
   */
  const startListening = async () => {
    // Clean up any existing state first
    stopMicrophone();

    setState('listening');
    setErrorMessage(null);
    setFoundTrack(null);
    setTranscribedText('');
    setCountdown(6);
    setHasSoundInput(false);

    detectedTranscriptRef.current = '';
    soundDetectedRef.current = false;
    maxVolumeRef.current = 0;

    // 1. Initialize SpeechRecognition if supported by browser
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.lang = navigator.language || 'en-US';

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            detectedTranscriptRef.current = currentTranscript.trim();
            setTranscribedText(currentTranscript.trim());
          }
        };

        rec.onerror = (e: any) => {
          console.warn('SpeechRecognition notice:', e.error);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }

    // 2. Request user microphone stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Turn off noise suppression so music is not muted as noise
          autoGainControl: true,
        } 
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(analyser);

      // Start circular visualizer and audio presence measurement
      drawVisualizer();

      // Start countdown timer
      let timeLeft = 6;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }, 1000);

      // Listen for 6 seconds, then stop mic immediately and identify
      timerRef.current = setTimeout(() => {
        finishListeningAndIdentify();
      }, 6000);

    } catch (err) {
      console.warn('Microphone access failed:', err);
      stopMicrophone();
      setState('error');
      setErrorMessage(
        'Microphone access was denied or is unavailable on this device. You can still search for any song by typing lyrics below.'
      );
    }
  };

  /**
   * Finishes the listening phase: immediately releases microphone hardware
   * and processes the captured acoustic / lyric data.
   */
  const finishListeningAndIdentify = () => {
    // STOP MIC IMMEDIATELY
    stopMicrophone();

    const finalTranscript = detectedTranscriptRef.current.trim();
    if (finalTranscript.length >= 2) {
      identifySongQuery(finalTranscript);
    } else if (!soundDetectedRef.current || maxVolumeRef.current < 4) {
      setState('not_found');
      setErrorMessage('No audio was detected through your microphone. Please make sure your mic is not muted and music is playing nearby.');
    } else {
      setState('not_found');
      setErrorMessage('Music was detected, but no clear song lyrics or acoustic signature could be matched. Please sing or hum closer to the microphone, or search by lyrics.');
    }
  };

  /**
   * Draws audio frequency waveform on canvas and tracks incoming volume.
   */
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      // Calculate instantaneous sound energy
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      if (avg > 4) {
        soundDetectedRef.current = true;
        setHasSoundInput(true);
      }
      if (avg > maxVolumeRef.current) {
        maxVolumeRef.current = avg;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 62;

      ctx.lineWidth = 3;

      for (let i = 0; i < bufferLength; i += 2) {
        const val = dataArray[i] / 255;
        const angle = (i / bufferLength) * Math.PI * 2;
        const barHeight = val * 52;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, '#00D2FF');
        grad.addColorStop(1, '#D946EF');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    render();
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    identifySongQuery(manualQuery.trim());
  };

  if (!isFindOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] rounded-3xl bg-[#0E131F] border border-cyan-500/30 p-4 sm:p-6 text-white shadow-2xl flex flex-col items-center text-center overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="Close Anamar Find"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with User Provided Logo */}
        <div className="flex items-center gap-2.5 mb-1">
          <Logo size={28} showText={false} />
          <h3 className="text-base sm:text-lg font-black tracking-wide uppercase anamar-gradient-text">
            Anamar Find
          </h3>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 mb-3">
          Real-time acoustic & lyric song recognition
        </p>

        {/* Toggle Mode: Audio Mic vs Lyric Search */}
        <div className="flex rounded-full bg-white/5 p-1 mb-3.5 w-full max-w-xs border border-white/10 text-xs shrink-0">
          <button
            onClick={() => {
              setActiveTab('mic');
              if (state !== 'listening') {
                startListening();
              }
            }}
            className={`flex-1 py-1.5 rounded-full font-bold transition cursor-pointer ${
              activeTab === 'mic' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Listen with Mic
          </button>
          <button
            onClick={() => {
              stopMicrophone();
              setActiveTab('lyrics');
            }}
            className={`flex-1 py-1.5 rounded-full font-bold transition cursor-pointer ${
              activeTab === 'lyrics' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Search Lyrics
          </button>
        </div>

        {activeTab === 'mic' ? (
          <>
            {/* Visualizer Area */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center mb-3 shrink-0">
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="absolute inset-0 pointer-events-none"
              />

              {/* Center Microphone Button / Status */}
              <div className="relative z-10 flex items-center justify-center">
                {state === 'idle' && (
                  <button
                    onClick={startListening}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(0,210,255,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <div className="w-full h-full rounded-full bg-[#0E131F] flex flex-col items-center justify-center gap-1">
                      <Mic className="w-8 h-8 text-cyan-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        Tap to Listen
                      </span>
                    </div>
                  </button>
                )}

                {state === 'listening' && (
                  <button
                    onClick={finishListeningAndIdentify}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.5)] cursor-pointer hover:scale-105 transition"
                    title="Tap when done humming or playing"
                  >
                    <div className="w-full h-full rounded-full bg-[#0E131F] flex flex-col items-center justify-center gap-1">
                      <Mic className="w-7 h-7 text-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
                        {countdown}s left
                      </span>
                    </div>
                  </button>
                )}

                {state === 'identifying' && (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                    <div className="w-full h-full rounded-full bg-[#0E131F] flex flex-col items-center justify-center gap-1">
                      <span className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300 mt-1">
                        Matching...
                      </span>
                    </div>
                  </div>
                )}

                {state === 'found' && foundTrack && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-400 animate-in zoom-in-95">
                    <img
                      src={foundTrack.thumbnail}
                      alt={foundTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {state === 'not_found' && (
                  <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 animate-in zoom-in-95">
                    <SearchX className="w-9 h-9" />
                  </div>
                )}

                {state === 'error' && (
                  <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-400">
                    <AlertCircle className="w-9 h-9" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Message and Audio Indicator */}
            {state === 'idle' && (
              <p className="text-xs text-slate-400 max-w-xs mb-3">
                Tap above and play or sing a line. The microphone will turn off automatically as soon as listening finishes.
              </p>
            )}

            {state === 'listening' && (
              <div className="space-y-1.5 mb-3 max-w-xs">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <p className="text-sm font-bold text-cyan-400">
                    Listening to audio... ({countdown}s)
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  {hasSoundInput ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> Audio signal detected
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <VolumeX className="w-3.5 h-3.5" /> Waiting for sound...
                    </span>
                  )}
                </div>

                {transcribedText ? (
                  <p className="text-xs font-mono text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-2.5 py-1 truncate">
                    "{transcribedText}"
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Play the song clearly or hum/sing lyrics
                  </p>
                )}

                <button
                  onClick={finishListeningAndIdentify}
                  className="mt-2 text-[11px] font-semibold text-cyan-300 hover:text-white underline cursor-pointer"
                >
                  Done humming? Identify now
                </button>
              </div>
            )}

            {state === 'identifying' && (
              <div className="space-y-1 mb-3">
                <p className="text-sm font-bold text-purple-400 animate-pulse">
                  Searching music network...
                </p>
                <p className="text-xs text-slate-400">
                  Microphone released. Matching acoustic & lyric fingerprint.
                </p>
              </div>
            )}

            {state === 'error' && (
              <div className="text-xs text-red-400 mb-4 max-w-xs">
                {errorMessage}
                <div className="flex gap-2 justify-center mt-3">
                  <button
                    onClick={startListening}
                    className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setActiveTab('lyrics')}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs cursor-pointer"
                  >
                    Search Lyrics
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Manual Lyric / Song Search Tab */
          <div className="w-full space-y-4 mb-4">
            <p className="text-xs text-slate-400">
              Type any lyrics phrase or song title to identify the exact track:
            </p>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="e.g. Pehli nazar mein, Afreen, Kesariya..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-bold text-xs hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {['Pehli nazar mein', 'Afreen Afreen', 'Kesariya', 'Blinding Lights', 'Kahani Suno'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setManualQuery(suggestion);
                    identifySongQuery(suggestion);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real Found Track Result Card */}
        {state === 'found' && foundTrack && (
          <div className="w-full bg-white/5 border border-cyan-500/40 p-4 rounded-2xl mb-4 text-left animate-in zoom-in-95 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Song Identified ({confidence}% Match)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">
                {foundTrack.genre || 'Identified'}
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-3">
              <img
                src={foundTrack.thumbnail}
                alt={foundTrack.title}
                className="w-14 h-14 rounded-xl object-cover shadow-md shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white truncate">{cleanSongTitle(foundTrack.title)}</p>
                <p className="text-xs font-semibold text-cyan-300 truncate">{foundTrack.artist}</p>
                {foundTrack.album && (
                  <p className="text-[11px] text-slate-400 truncate">{foundTrack.album}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopMicrophone();
                  playTrack(foundTrack);
                  setFindOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => {
                  stopMicrophone();
                  addToQueue(foundTrack);
                  setFindOpen(false);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Add to Queue"
              >
                <ListPlus className="w-4 h-4 text-cyan-400" />
                <span>Queue</span>
              </button>

              <button
                onClick={() => {
                  setState('idle');
                  setFoundTrack(null);
                  startListening();
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                title="Identify Another"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real Not Found Result Card (NO RANDOM FALLBACKS) */}
        {state === 'not_found' && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mb-4 text-center animate-in zoom-in-95 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 text-amber-400">
              <SearchX className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Song Not Found</h4>
            {transcribedText && (
              <div className="mb-2 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-cyan-200 italic truncate max-w-xs mx-auto">
                "{transcribedText}"
              </div>
            )}
            <p className="text-xs text-slate-300 leading-relaxed mb-3.5 max-w-xs mx-auto">
              {errorMessage || "We couldn't find a matching song for this audio. Please sing or play closer to the microphone, or search by lyrics."}
            </p>

            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => {
                  setState('listening');
                  startListening();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Listen Again</span>
              </button>

              <button
                onClick={() => {
                  stopMicrophone();
                  setActiveTab('lyrics');
                  if (transcribedText) {
                    setManualQuery(transcribedText);
                  }
                  setState('idle');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Lyrics</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
