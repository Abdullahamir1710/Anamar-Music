import React, { useState } from 'react';
import { Track } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, Heart, Download, MoreVertical, Ban, ListPlus, Radio, Share2, Check } from 'lucide-react';
import { downloadManager } from '../../services/downloadManager';
import { recommendationService } from '../../services/recommendationService';
import { cleanSongTitle } from '../../services/musicCatalog';

interface SongFeedCardProps {
  track: Track;
  onNotInterested?: (track: Track) => void;
  onSelectArtist?: (artistName: string) => void;
  onSelectAlbum?: (albumName: string) => void;
}

export const SongFeedCard: React.FC<SongFeedCardProps> = ({
  track,
  onNotInterested,
  onSelectArtist,
  onSelectAlbum,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike, addToQueue } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadManager.startDownload(track);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    recommendationService.recordNotInterested(track);
    if (onNotInterested) {
      onNotInterested(track);
    }
  };

  return (
    <div
      onClick={() => {
        if (isCurrent) {
          togglePlay();
        } else {
          playTrack(track);
        }
      }}
      className={`relative flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer group ${
        isCurrent
          ? 'bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-transparent border border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
          : 'hover:bg-white/[0.04] border border-transparent hover:border-white/5'
      }`}
    >
      {/* Left: Thumbnail & Title/Artist/Album */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Artwork with Play Overlay */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 shadow-md">
          <img
            src={track.thumbnail}
            alt={track.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlayingCurrent ? (
              <Pause className="w-5 h-5 text-cyan-400 fill-current animate-pulse" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Text Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                isCurrent ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'
              }`}
            >
              {cleanSongTitle(track.title)}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            <span
              onClick={(e) => {
                if (onSelectArtist) {
                  e.stopPropagation();
                  onSelectArtist(track.artist);
                }
              }}
              className="hover:text-white transition-colors"
            >
              {track.artist}
            </span>
            {track.album && (
              <span
                onClick={(e) => {
                  if (onSelectAlbum) {
                    e.stopPropagation();
                    onSelectAlbum(track.album || '');
                  }
                }}
                className="hidden sm:inline hover:text-white transition-colors"
              >
                {' '}
                • {track.album}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right Action Controls: Play, Like, Download, More (Requirement 19 & 109) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-2 rounded-xl transition cursor-pointer ${
            liked ? 'text-pink-400' : 'text-slate-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 sm:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Download Button */}
        {track.canDownload && (
          <button
            onClick={handleDownload}
            aria-label="Download offline"
            title="Download offline audio"
            className="p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition cursor-pointer opacity-0 group-hover:opacity-100 sm:opacity-100"
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4 text-green-400 stroke-[2.5]" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        )}

        {/* More Menu (Requirement 109: Not interested) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label="Song options"
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-48 py-1.5 bg-[#0D121F] border border-cyan-500/30 rounded-2xl shadow-2xl z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 text-xs text-slate-200"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:text-white text-left transition cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add to Queue</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:text-white text-left transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download Offline</span>
                </button>

                <div className="my-1 border-t border-white/5" />

                {/* Not Interested Option (Requirement 109) */}
                <button
                  onClick={handleNotInterested}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-left transition cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Not interested</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
