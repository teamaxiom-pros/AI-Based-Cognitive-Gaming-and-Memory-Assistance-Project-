import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

interface VoiceButtonProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onToggle?: () => void;
  label?: string;
  size?: 'md' | 'lg' | 'hero';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening = false,
  isSpeaking = false,
  onToggle,
  label,
  size = 'lg',
}) => {
  const sizeClasses = {
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    hero: 'w-28 h-28',
  };

  const iconSizes = {
    md: 24,
    lg: 32,
    hero: 44,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        type="button"
        aria-label={label || 'Voice assistant activation'}
        className={clsx(
          'relative rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-300',
          sizeClasses[size],
          isListening
            ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
            : isSpeaking
            ? 'bg-teal-500 text-white shadow-teal-500/40'
            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 active:scale-95'
        )}
      >
        {/* Animated concentric ripples when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-rose-400 opacity-75 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-pulse" />
          </>
        )}

        {/* Pulsing glow when speaking */}
        {isSpeaking && (
          <span className="absolute -inset-2 rounded-full border-2 border-teal-300 animate-spin" />
        )}

        {isListening ? (
          <Mic className="relative z-10 animate-bounce" size={iconSizes[size]} />
        ) : isSpeaking ? (
          <Volume2 className="relative z-10" size={iconSizes[size]} />
        ) : (
          <Mic className="relative z-10" size={iconSizes[size]} />
        )}
      </button>

      {label && (
        <span
          className={clsx(
            'font-semibold text-center select-none transition-colors',
            size === 'hero' ? 'text-xl' : 'text-base',
            isListening ? 'text-rose-600 animate-pulse' : 'text-slate-700'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};
