import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Brain,
  BookOpen,
  Mic,
  CalendarCheck,
  Volume2,
  Sliders,
  ChevronLeft,
} from 'lucide-react';
import { OfflineBanner } from '../common/OfflineBanner';

interface PatientLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backRoute?: string;
  pageTitle?: string;
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({
  children,
  showBack = false,
  backRoute,
  pageTitle,
}) => {
  const { currentRoute, navigate, patient, t, speakText, userMode } = useApp();

  const navItems = [
    { id: 'home', label: t('common.home'), route: '/home', icon: Home },
    { id: 'activities', label: t('common.activities'), route: '/activities', icon: Brain },
    { id: 'memory', label: t('common.memory'), route: '/memory', icon: BookOpen },
    { id: 'assistant', label: t('common.assistant'), route: '/assistant', icon: Mic, highlight: true },
    { id: 'medicines', label: t('common.medicines'), route: '/medicines', icon: CalendarCheck },
  ];

  const currentTime = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24 md:pb-28 selection:bg-teal-100">
      <OfflineBanner />

      {/* Top Patient Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                onClick={() => navigate(backRoute || '/home')}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors flex items-center gap-1 font-bold text-base cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft size={24} />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </button>
            ) : (
              <div
                onClick={() => navigate('/home')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                  A
                </div>
                <div>
                  <div className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
                    AXIOM
                  </div>
                  <div className="text-xs text-teal-800 font-semibold flex items-center gap-1">
                    <span>{patient.location}</span>
                  </div>
                </div>
              </div>
            )}

            {pageTitle && (
              <div className="border-l border-slate-200 pl-3 ml-1 hidden sm:block">
                <h2 className="text-lg font-bold text-slate-800">{pageTitle}</h2>
              </div>
            )}
          </div>

          {/* Right Header: Greeting & Patient Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => speakText(`Hello ${patient.name}, today is ${currentTime}. You are doing wonderfully!`)}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors cursor-pointer border border-teal-200"
              title="Voice Briefing"
            >
              <Volume2 size={22} />
            </button>

            <div
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 rounded-full border border-slate-200 transition-colors cursor-pointer"
            >
              <img
                src={patient.photoUrl}
                alt={patient.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500"
              />
              <span className="font-bold text-sm text-slate-800 hidden md:inline">
                {patient.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Large Bottom Navigation for Elderly-Friendly Tablet & Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-3">
        <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
          {navItems.map(item => {
            const isActive = currentRoute === item.route || currentRoute.startsWith(`${item.route}/`);
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="flex flex-col items-center justify-center -mt-6 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-15 h-15 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95 ${
                      isActive
                        ? 'bg-teal-600 text-white ring-4 ring-teal-200'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/30'
                    }`}
                  >
                    <Icon size={28} />
                  </div>
                  <span
                    className={`text-xs mt-1 font-bold ${
                      isActive ? 'text-teal-800' : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[64px] ${
                  isActive
                    ? 'text-teal-800 font-bold bg-teal-50/80 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon size={24} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                <span className={`text-[11px] mt-1 ${isActive ? 'font-black' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
