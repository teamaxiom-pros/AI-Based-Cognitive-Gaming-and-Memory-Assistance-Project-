import React from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Button } from '../../components/common/Button';
import { Sparkles, HeartHandshake, Shield, Volume2, ArrowRight } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { t, navigate, setUserMode, speakText, patient } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 via-slate-50 to-white flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full space-y-8 my-auto">
        {/* Top Logo & Regional Pill */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs uppercase tracking-wider border border-teal-200 shadow-xs">
            <Sparkles size={14} className="text-teal-700" />
            {t('common.nerRegion')}
          </div>

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-400 text-white font-black text-4xl flex items-center justify-center mx-auto shadow-xl shadow-teal-700/20">
            A
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('common.appName')}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            {t('welcome.subgreeting')}
          </p>
        </div>

        {/* Language Selection Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t('welcome.chooseLanguage')}
            </h2>
            <button
              onClick={() => speakText(t('welcome.chooseLanguage'))}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors"
              title="Read prompt"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <LanguageSwitcher variant="cards" />
        </div>

        {/* Primary Call to Action */}
        <div className="space-y-4">
          <Button
            size="xl"
            fullWidth
            onClick={() => navigate('/onboarding/flow')}
            className="shadow-xl"
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            {t('welcome.startButton')}
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                setUserMode('caregiver');
                navigate('/caregiver/dashboard');
              }}
              className="text-sm sm:text-base font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer inline-flex items-center gap-1.5"
            >
              <HeartHandshake size={18} />
              {t('welcome.caregiverLoginLink')}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Medical Disclaimer */}
      <footer className="max-w-xl mx-auto text-center text-xs text-slate-400 py-4">
        {t('common.medicalDisclaimer')}
      </footer>
    </div>
  );
};
