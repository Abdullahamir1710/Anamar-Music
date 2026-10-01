import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Sparkles, ExternalLink } from 'lucide-react';
import { Logo } from '../common/Logo';

export const APK_DOWNLOAD_URL = 'https://www.anamarapk.app/2026/09/anamar-music.html?m=1';

interface ApkDownloadModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  // State for automatic session/open appearance
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    // Show smoothly 700ms after page mount on every website open / reload
    // Note: Per requirement 71, we deliberately do NOT store a permanent localStorage flag
    // so that it is eligible to appear every time the website is opened.
    const timer = setTimeout(() => {
      setInternalOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  // Keyboard ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apk-modal-title"
    >
      {/* Modal Container - Fits within visible screen */}
      <div
        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar p-5 sm:p-8 rounded-3xl bg-gradient-to-b from-[#111726]/95 via-[#0D121F]/95 to-[#07090E]/95 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,210,255,0.22)] backdrop-blur-2xl text-center transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (×) */}
        <button
          onClick={handleClose}
          aria-label="Close download popup"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Badge */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,210,255,0.2)] mb-3">
            <Logo size={56} showText={false} />
            <div className="absolute -bottom-1 -right-1 p-1 bg-cyan-400 text-black rounded-full shadow">
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Official Android Application
          </span>
        </div>

        {/* Title */}
        <h2 id="apk-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Get Anamar Music for Android
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-sm mx-auto">
          Take your music with you. Get the Anamar Music Android app for a dedicated mobile listening experience.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:via-indigo-400 hover:to-purple-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:shadow-[0_0_35px_rgba(0,210,255,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
          >
            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
            <span>Download APK</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </a>

          <button
            onClick={handleClose}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">✓ Ad-Free</span>
          <span className="flex items-center gap-1">✓ Offline Audio</span>
          <span className="flex items-center gap-1">✓ 150% Audio Boost</span>
        </div>
      </div>
    </div>
  );
};
