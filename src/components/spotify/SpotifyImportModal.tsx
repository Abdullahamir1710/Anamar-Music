import React, { useState } from 'react';
import { X, Music, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { spotifyService, SpotifyImportResult } from '../../services/spotifyService';
import { Logo } from '../common/Logo';

export const SpotifyImportModal: React.FC = () => {
  const { isSpotifyOpen, setSpotifyOpen } = usePlayer();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpotifyImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isSpotifyOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await spotifyService.importPlaylistFromUrl(playlistUrl.trim());
      setResult(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to import Spotify playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0E131F] border border-green-500/30 p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
        <button
          onClick={() => setSpotifyOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center">
            <Logo size={28} showText={false} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wide">Import Spotify Playlist</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Transfer your playlists directly to Anamar Music</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 my-4 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/5">
          Paste any public Spotify playlist URL. Anamar will match tracks against our high-fidelity audio streams with zero audio loss.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4 mb-4">
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
          />

          <button
            type="submit"
            disabled={loading || !playlistUrl.trim()}
            className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Matching Tracks...</span>
              </>
            ) : (
              <>
                <span>Import Playlist</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-green-500/30 text-xs space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <Check className="w-4 h-4" />
              <span>{result.playlistTitle} Imported!</span>
            </div>

            <p className="text-slate-300">
              Matched <strong className="text-cyan-400">{result.matchedTracks.length}</strong> of{' '}
              {result.totalTracks} tracks into your Anamar Playlists.
            </p>

            <button
              onClick={() => setSpotifyOpen(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              View in Your Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
