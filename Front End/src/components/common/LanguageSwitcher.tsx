import React from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { Check } from 'lucide-react';

const languageOptions: { id: Language; name: string; nativeName: string; region: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English', region: 'Global' },
  { id: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam & NER' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Barak & Tripura' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National' },
];

export const LanguageSwitcher: React.FC<{ variant?: 'cards' | 'pills' | 'dropdown' }> = ({
  variant = 'cards',
}) => {
  const { language, setLanguage } = useApp();

  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2">
        {languageOptions.map(opt => {
          const isSelected = language === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setLanguage(opt.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {opt.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {languageOptions.map(opt => {
        const isSelected = language === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setLanguage(opt.id)}
            type="button"
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer ${
              isSelected
                ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-300'
                : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="text-xl font-bold text-slate-900">{opt.nativeName}</div>
              <div className="text-sm text-slate-600">
                {opt.name} • <span className="text-teal-700 font-medium">{opt.region}</span>
              </div>
            </div>
            {isSelected && (
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Check size={18} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
