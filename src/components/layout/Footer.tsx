import React from 'react';
import { Logo } from '../common/Logo';
import { Mail, Download, ExternalLink, Heart, Shield } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../apk/ApkDownloadModal';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 pt-10 pb-12 border-t border-cyan-500/15 bg-gradient-to-b from-transparent via-[#06080E] to-[#04060A] text-slate-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Tier: Brand, Tagline, Download APK & Support */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size={40} showText={true} />
            <p className="text-sm font-semibold text-cyan-300 tracking-wide">
              Listen. Discover. Connect.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              High-fidelity music streaming, real-time synchronized lyrics, and acoustic discovery.
            </p>
          </div>

          {/* Quick Actions & Official Support Contact (Requirement 115) */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col items-center sm:items-end text-xs">
              <span className="font-bold text-slate-300">Need help?</span>
              <a
                href="mailto:music@anamarapk.app"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors mt-0.5 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>music@anamarapk.app</span>
              </a>
            </div>

            {/* Download Anamar Music APK */}
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.3)] transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download APK</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Middle Tier: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs font-semibold text-slate-300 pt-2 border-t border-white/5">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('/home')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('/explore')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Explore
              </button>
              <button
                onClick={() => onNavigate('/search')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Search
              </button>
              <button
                onClick={() => onNavigate('/library')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Library
              </button>
              <button
                onClick={() => onNavigate('/settings')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Settings
              </button>
              <button
                onClick={() => onNavigate('/about')}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                About & Credits
              </button>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500/10" />

        {/* Bottom Tier: Exact Required Footer Credit (Requirement 116) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <p>© 2026 ANAMAR MUSIC • All rights reserved</p>

          <p className="font-medium text-slate-300">
            Created with ♥️ by{' '}
            <a
              href="https://www.anamarapk.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-400 transition-colors"
            >
              AnamarAPK
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
