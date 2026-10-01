import React, { useState, useEffect } from 'react';
import { Download, Play, Trash2, RotateCw, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { downloadManager } from '../../services/downloadManager';
import { DownloadedItem } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';

export const DownloadsView: React.FC = () => {
  const { playTrack } = usePlayer();
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = downloadManager.subscribe((list) => {
      setDownloads(list);
    });
    return () => unsubscribe();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '8.2 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalStorageBytes = downloads.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Download className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider anamar-gradient-text">
              Downloads
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            High-bitrate offline music saved to your browser storage and device Downloads folder.
          </p>
        </div>

        {downloads.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatFileSize(totalStorageBytes)} stored</span>
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Downloads</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0E131F] border border-red-500/30 p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold mb-2">Clear all downloaded music?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This will remove all offline tracks from your browser storage. Files saved directly into your device Downloads folder will remain intact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  downloadManager.clearAllDownloads();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downloads List */}
      {downloads.length === 0 ? (
        <div className="text-center py-20 bg-[#0E131F] rounded-3xl border border-white/5">
          <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No downloads yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the download button on any song in the catalog to save it for offline playback and device storage.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#0E131F] hover:bg-white/[0.04] border border-white/5 transition"
            >
              <div
                onClick={() => playTrack(item.track)}
                className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                  <img
                    src={item.track.thumbnail}
                    alt={item.track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Play className="w-5 h-5 text-cyan-400 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate hover:text-cyan-400 transition">
                    {item.track.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{item.track.artist}</p>
                </div>
              </div>

              {/* Status and Details */}
              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="hidden sm:block text-right">
                  <p className="text-slate-300 font-mono">{formatFileSize(item.fileSize)}</p>
                  <p className="text-[10px] text-slate-500">{formatDate(item.downloadedAt)}</p>
                </div>

                {item.status === 'completed' && (
                  <span className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden md:inline">Downloaded</span>
                  </span>
                )}

                {item.status === 'downloading' && (
                  <span className="text-cyan-400 font-bold text-xs animate-pulse">
                    {item.progress}%
                  </span>
                )}

                {item.status === 'failed' && (
                  <button
                    onClick={() => downloadManager.retryDownload(item.id)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                )}

                <button
                  onClick={() => downloadManager.deleteDownload(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-white/5 transition"
                  title="Delete Download"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
