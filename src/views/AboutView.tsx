import React from 'react';
import { Logo } from '../components/common/Logo';
import { ShieldCheck, Heart, ExternalLink, Code, Download, Smartphone, Mail } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../components/apk/ApkDownloadModal';

export const AboutView: React.FC = () => {
  const credits = [
    {
      name: 'Open Audio Jam & SoundSync',
      url: 'https://github.com',
      description: 'Collaborative listening architecture and synchronization protocol reference',
    },
    {
      name: 'Metrolist & Vivi Music',
      url: 'https://github.com/MetrolistGroup/Metrolist',
      description: 'Foundational inspiration and architecture reference',
    },
    {
      name: 'ArchiveTune',
      url: 'https://github.com/koiverse/ArchiveTune',
      description: 'Material & responsive UI inspiration',
    },
    {
      name: 'Better Lyrics',
      url: 'https://better-lyrics.boidu.dev/',
      description: 'Lyrics enhancement and synchronization',
    },
    {
      name: 'SimpMusic',
      url: 'https://github.com/maxrave-dev/SimpMusic',
      description: 'Lyrics implementation reference',
    },
    {
      name: 'Music Recognizer',
      url: 'https://github.com/aleksey-saenko/MusicRecognizer',
      description: 'Audio recognition architecture',
    },
    {
      name: 'BravePipe',
      url: 'https://github.com/bravepipeproject/BravePipe',
      description: 'Decryption handling and backup engine concepts',
    },
    {
      name: 'InnerTubeX',
      url: 'https://github.com/MetrolistGroup/innertubex',
      description: 'Stream resolution and playback resilience reference',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* Brand Header */}
      <div className="text-center py-8 border-b border-white/5 space-y-3">
        <div className="flex justify-center mb-2">
          <Logo size={64} showText={false} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider anamar-gradient-text">
          Anamar Music
        </h1>
        <p className="text-xs sm:text-sm text-cyan-400 font-semibold tracking-widest uppercase">
          Version 3.0 • Production Web Edition
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          A high-fidelity, ad-free music web application with background playback, 150% enhanced volume, real-time synchronized lyrics, offline downloads, and acoustic intelligence.
        </p>
      </div>

      {/* Official Android App APK Section */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/30 via-indigo-950/30 to-purple-950/30 border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Smartphone className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Official Anamar Music Android App
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Enjoy a dedicated mobile experience with background playback, 150% volume boost, and offline downloads directly on your Android phone.
            </p>
          </div>
        </div>

        <a
          href={APK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.3)] transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download APK</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </section>

      {/* Open Source License Preservation */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Code className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">License & Legal Disclaimers</h2>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            Anamar Music is released under the <strong>GNU General Public License v3.0 (GPL-3.0)</strong>, respecting the original open-source foundations.
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-[11px] text-slate-400">
            GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. Everyone is permitted to copy and distribute verbatim copies of this license document.
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li><strong>100% Free & Open-Source:</strong> Strictly non-commercial and ad-free.</li>
            <li><strong>No Hosting of Copyrighted Material:</strong> Audio playback streams directly from public content sources and authorized CDNs. We do not host media files on proprietary servers.</li>
            <li><strong>Third-Party Disclaimer:</strong> Anamar Music is an independent open-source project and is not affiliated with Spotify, Google, YouTube, or Discord.</li>
          </ul>
        </div>
      </section>

      {/* Special Thanks & Attribution Table */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-pink-400">
          <Heart className="w-5 h-5 fill-current" />
          <h2 className="text-base font-bold text-white">Special Thanks & Acknowledgements</h2>
        </div>
        <p className="text-xs text-slate-400">
          Anamar Music proudly stands on the shoulders of the open-source audio and music community:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {credits.map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    {c.name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{c.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Official Support & Help (Requirement 115) */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Support & Inquiries</h3>
          <p className="text-xs text-slate-400 mt-0.5">Need assistance or have questions about Anamar Music?</p>
        </div>
        <a
          href="mailto:music@anamarapk.app"
          className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition hover:underline"
        >
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>music@anamarapk.app</span>
        </a>
      </section>

      <footer className="text-center text-xs text-slate-500 pt-4 space-y-2">
        <p>Designed with high-fidelity sound in mind • Anamar Music © 2026</p>
        <p className="text-slate-400 text-[11px]">
          Created with ♥️ by{' '}
          <a
            href="https://www.anamarapk.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-cyan-400 hover:underline"
          >
            AnamarAPK
          </a>
        </p>
      </footer>
    </div>
  );
};
