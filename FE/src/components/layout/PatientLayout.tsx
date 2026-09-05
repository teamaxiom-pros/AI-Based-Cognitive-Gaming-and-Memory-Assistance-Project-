import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Brain,
  BookOpen,
  Mic,
  CalendarCheck,
  Volume2,
  ChevronLeft,
  Globe,
  LogOut,
  HeartHandshake,
  Settings,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { OfflineBanner } from '../common/OfflineBanner';
import { AccessibilityDrawer } from '../common/AccessibilityDrawer';
import { Language } from '../../types';

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
  const { currentRoute, navigate, patient, t, speakText, language, setLanguage, setUserMode, isSimpleElderlyMode, toggleSimpleElderlyMode } = useApp();
  const { signOut } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  const navItems = [
    { id: 'home', label: t('common.home') || 'Home', route: '/home', icon: Home },
    { id: 'activities', label: t('common.activities') || 'Activities', route: '/activities', icon: Brain },
    { id: 'memory', label: t('common.memory') || 'Memory Book', route: '/memory', icon: BookOpen },
    { id: 'assistant', label: t('common.assistant') || 'Ask Axiom', route: '/assistant', icon: Mic, highlight: true },
    { id: 'medicines', label: t('common.medicines') || 'Meds & Routine', route: '/medicines', icon: CalendarCheck },
  ];

  const languages: { id: Language; label: string; name: string }[] = [
    { id: 'en', label: 'EN', name: 'English' },
    { id: 'as', label: 'AS', name: 'অসমীয়া (Assamese)' },
    { id: 'bn', label: 'BN', name: 'বাংলা (Bengali)' },
    { id: 'hi', label: 'HI', name: 'हिन्दी (Hindi)' },
  ];

  const currentTime = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : language === 'as' ? 'as-IN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleVoiceBriefing = () => {
    const greeting = `${t('home.welcomeBack')}, ${patient?.name || ''}.`;
    const dateText = `${currentTime}.`;
    const details = `${t('home.dailyPlan')}: ${t('home.startTodayActivity')}.`;
    speakText(`${greeting} ${dateText} ${details}`);
  };

  return (
    <div className={`min-h-screen flex flex-col pb-24 md:pb-12 selection:bg-teal-100 font-sans text-slate-800 ${
      isSimpleElderlyMode ? 'bg-amber-50/40 text-lg' : 'bg-[#F8F6EF]'
    }`}>
      <OfflineBanner />

      {/* Accessibility Drawer Modal */}
      <AccessibilityDrawer isOpen={showAccessibility} onClose={() => setShowAccessibility(false)} />

      {/* Top Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-40 shadow-xs px-4 sm:px-6 py-3 ${
        isSimpleElderlyMode ? 'bg-white border-amber-200' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand & Page Back */}
          <div className="flex items-center gap-4">
            {showBack ? (
              <button
                onClick={() => navigate(backRoute || '/home')}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-sm cursor-pointer ${
                  isSimpleElderlyMode
                    ? 'bg-amber-100 hover:bg-amber-200 text-slate-900 ring-1 ring-amber-300'
                    : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700'
                }`}
                aria-label={t('common.back')}
              >
                <ChevronLeft size={22} />
                <span className="hidden sm:inline font-bold">{t('common.back')}</span>
              </button>
            ) : (
              <div
                onClick={() => navigate('/home')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md transition-transform group-hover:scale-105 border border-slate-200 flex-shrink-0 bg-white">
                  <img src="/smriti_logo.jpg" alt="SMRITI" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                    SMRITI
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      isSimpleElderlyMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {isSimpleElderlyMode ? 'Simple' : 'Care'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {patient?.location || 'Assam (NER)'} • Team Axiom
                  </div>
                </div>
              </div>
            )}

            {pageTitle && (
              <div className="border-l border-slate-200 pl-3.5 hidden md:block">
                <h2 className="text-sm font-bold text-slate-700">{pageTitle}</h2>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          {!isSimpleElderlyMode && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
              {navItems.map(item => {
                const isActive = currentRoute === item.route || currentRoute.startsWith(`${item.route}/`);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            {/* Simple Mode indicator toggle */}
            <button
              onClick={toggleSimpleElderlyMode}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isSimpleElderlyMode
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
              title={t('accessibility.simpleMode')}
            >
              <Smartphone size={18} />
            </button>

            {/* Accessibility Drawer Trigger */}
            <button
              onClick={() => setShowAccessibility(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              title={t('accessibility.title')}
            >
              <Sparkles size={18} />
            </button>

            {/* Voice Briefing Button */}
            <button
              onClick={handleVoiceBriefing}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                isSimpleElderlyMode
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
              }`}
              title="Voice Briefing"
            >
              <Volume2 size={18} />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                title="Change Language"
              >
                <Globe size={14} />
                <span className="uppercase">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn">
                  {languages.map(l => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLanguage(l.id);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                        language === l.id ? 'text-teal-800 font-bold bg-teal-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.name}</span>
                      <span className="text-[10px] uppercase text-slate-400">{l.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile & Menu */}
            <div className="relative">
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 p-1.5 pr-3 rounded-full border border-slate-200 transition-colors cursor-pointer select-none"
              >
                {patient?.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient?.name || 'Patient'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-teal-500"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {(patient?.name || 'P')[0]}
                  </div>
                )}
                <span className="font-bold text-xs text-slate-800 hidden sm:inline">
                  {patient?.name ? patient.name.split(' ')[0] : 'Patient'}
                </span>
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{patient?.name || 'Patient User'}</p>
                    <p className="text-[11px] text-teal-700 font-medium">{patient?.location || 'Assam, India'}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>{t('accessibility.title')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMode('caregiver');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <HeartHandshake size={14} className="text-indigo-600" />
                    <span>{t('landing.caregiverPortal')}</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>{t('common.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Large Bottom Navigation for Mobile & Tablet (Or Simple Elderly Mode Navigation) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t shadow-xl py-1.5 px-2 pb-safe ${
        isSimpleElderlyMode 
          ? 'bg-amber-50/95 border-amber-300' 
          : 'lg:hidden bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
          {navItems.map(item => {
            const isActive = currentRoute === item.route || currentRoute.startsWith(`${item.route}/`);
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className="flex flex-col items-center justify-center -mt-4 group cursor-pointer focus:outline-none flex-1 max-w-[80px]"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                        : isSimpleElderlyMode
                        ? 'bg-amber-600 text-white shadow-amber-600/30'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-0.5 font-bold truncate max-w-full text-center ${
                      isActive ? 'text-teal-900 font-extrabold' : 'text-slate-700'
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
                className={`flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex-1 max-w-[76px] ${
                  isActive
                    ? isSimpleElderlyMode
                      ? 'text-amber-950 font-black bg-amber-200/70 shadow-xs'
                      : 'text-teal-800 font-bold bg-teal-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                <span className={`text-[10px] sm:text-xs mt-0.5 text-center truncate max-w-full ${isActive ? 'font-black' : 'font-semibold'}`}>
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


