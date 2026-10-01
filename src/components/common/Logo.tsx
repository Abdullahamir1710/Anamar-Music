import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 36, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/anamar-logo.svg"
          alt="Anamar Music"
          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,210,255,0.45)]"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg md:text-xl font-black tracking-wider uppercase anamar-gradient-text">
            Anamar
          </span>
          <span className="text-[10px] tracking-[0.25em] font-semibold text-cyan-400/90 uppercase -mt-0.5">
            Music
          </span>
        </div>
      )}
    </div>
  );
};
