import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Type, Eye, Volume2, Gauge, Shield, Sparkles } from 'lucide-react';
import { TextSize, ContrastMode, VoiceSpeed } from '../../types';

interface AccessibilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityDrawer: React.FC<AccessibilityDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { accessibility, updateAccessibility, t, speakText } = useApp();

  // Apply classes to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
    root.classList.add(`text-scale-${accessibility.textSize}`);

    if (accessibility.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibility.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [accessibility]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('accessibility.title')} maxWidth="lg">
      <div className="space-y-6 text-slate-800">
        <p className="text-sm text-slate-600 font-medium">
          {t('accessibility.subtitle')}
        </p>

        {/* Text Size */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 font-bold text-base text-slate-900">
            <Type className="text-teal-600" size={20} />
            {t('accessibility.textSize')}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'normal', label: t('accessibility.textSizeNormal'), sample: 'Aa' },
              { id: 'large', label: t('accessibility.textSizeLarge'), sample: 'Aa' },
              { id: 'xlarge', label: t('accessibility.textSizeXLarge'), sample: 'Aa' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  updateAccessibility({ textSize: item.id as TextSize });
                  speakText(`Text size set to ${item.label}`);
                }}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  accessibility.textSize === item.id
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`font-black ${
                    item.id === 'normal'
                      ? 'text-lg'
                      : item.id === 'large'
                      ? 'text-2xl'
                      : 'text-3xl'
                  }`}
                >
                  {item.sample}
                </div>
                <div className="text-xs mt-1">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contrast Mode */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 font-bold text-base text-slate-900">
            <Eye className="text-teal-600" size={20} />
            {t('accessibility.contrast')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'normal', label: t('accessibility.contrastNormal'), desc: 'Gentle on eyes' },
              { id: 'high', label: t('accessibility.contrastHigh'), desc: 'Bold outlines & high clarity' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  updateAccessibility({ contrast: item.id as ContrastMode });
                  speakText(`Contrast set to ${item.label}`);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  accessibility.contrast === item.id
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-base font-bold">{item.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Assistance */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Volume2 size={22} />
              </div>
              <div>
                <div className="font-bold text-slate-900">{t('accessibility.voiceGuidance')}</div>
                <div className="text-xs text-slate-500">{t('accessibility.voiceGuidanceDesc')}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={accessibility.voiceGuidance}
              onChange={e => {
                updateAccessibility({ voiceGuidance: e.target.checked });
                if (e.target.checked) speakText('Voice assistance enabled.');
              }}
              className="w-6 h-6 rounded-md text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
            />
          </div>
        </div>

        {/* Voice Speed */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 font-bold text-base text-slate-900">
            <Gauge className="text-teal-600" size={20} />
            {t('accessibility.voiceSpeed')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'slow', label: t('accessibility.speedSlow') },
              { id: 'normal', label: t('accessibility.speedNormal') },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => updateAccessibility({ voiceSpeed: item.id as VoiceSpeed })}
                className={`py-3 px-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  accessibility.voiceSpeed === item.id
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white">
          <span className="font-semibold text-sm text-slate-800">{t('accessibility.reduceMotion')}</span>
          <input
            type="checkbox"
            checked={accessibility.reduceMotion}
            onChange={e => updateAccessibility({ reduceMotion: e.target.checked })}
            className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-colors cursor-pointer shadow-md"
        >
          {t('common.done')}
        </button>
      </div>
    </Modal>
  );
};
