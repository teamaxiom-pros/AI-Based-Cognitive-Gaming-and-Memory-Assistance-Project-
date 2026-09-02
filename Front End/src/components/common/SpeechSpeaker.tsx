import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';

interface SpeechSpeakerProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SpeechSpeaker: React.FC<SpeechSpeakerProps> = ({
  textToSpeak,
  label = 'Read aloud',
  className = '',
  size = 'md',
}) => {
  const { language, accessibility } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speechService.speak(textToSpeak, language, accessibility.voiceSpeed, () => {
        setIsPlaying(false);
      });
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2.5 text-sm',
    lg: 'px-3.5 py-2 text-base',
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 ${
        isPlaying
          ? 'bg-teal-600 text-white shadow-md animate-pulse'
          : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
      {label && <span className="font-semibold">{isPlaying ? 'Stop' : label}</span>}
    </button>
  );
};
