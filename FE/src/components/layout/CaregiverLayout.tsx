import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Brain,
  History,
  Pill,
  Clock,
  Bell,
  Calendar,
  FileText,
  Settings,
  Phone,
  Menu,
  X,
  LogOut,
  User,
  Globe,
} from 'lucide-react';
import { OfflineBanner } from '../common/OfflineBanner';
import { Language } from '../../types';

interface CaregiverLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export const CaregiverLayout: React.FC<CaregiverLayoutProps> = ({
  children,
}) => {
  const { currentRoute, navigate, patient, alerts, medicines, routineItems, showToast, setUserMode, t, language, setLanguage } = useApp();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { id: Language; label: string; name: string }[] = [
    { id: 'en', label: 'EN', name: 'English' },
    { id: 'as', label: 'AS', name: 'অসমীয়া' },
    { id: 'bn', label: 'BN', name: 'বাংলা' },
    { id: 'hi', label: 'HI', name: 'हिन्दी' },
  ];

  const menuItems = [
    { id: 'dashboard', label: t('caregiver.navDashboard') || 'Overview', route: '/caregiver/dashboard', icon: LayoutDashboard },
    { id: 'cognition', label: t('caregiver.navCognition') || 'Cognitive Analytics', route: '/caregiver/cognition', icon: Brain },
    { id: 'activities', label: t('caregiver.navActivities') || 'Activity Logs', route: '/caregiver/activities', icon: History },
    { id: 'medicines', label: t('caregiver.navMedicines') || 'Medication Tracker', route: '/caregiver/medicines', icon: Pill },
    { id: 'routine', label: t('caregiver.navRoutine') || 'Routine Schedule', route: '/caregiver/routine', icon: Clock },
    {
      id: 'alerts',
      label: t('caregiver.navAlerts') || 'Alerts Center',
      route: '/caregiver/alerts',
      icon: Bell,
      badge: alerts.filter(a => !a.isAcknowledged).length,
    },
    { id: 'appointments', label: t('caregiver.navAppointments') || 'Appointments', route: '/caregiver/appointments', icon: Calendar },
    { id: 'reports', label: t('caregiver.navReports') || 'Clinical Reports', route: '/caregiver/reports', icon: FileText },
    { id: 'settings', label: t('caregiver.navSettings') || 'Care Settings', route: '/caregiver/settings', icon: Settings },
  ];

  const takenMedsCount = medicines.filter(m => m.isTakenToday).length;
  const completedRoutineCount = routineItems.filter(r => r.isCompleted).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800">
      <OfflineBanner />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="font-bold text-base tracking-tight">SMRITI Caregiver</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector Mobile */}
            <button
              onClick={() => {
                const nextLang: Record<Language, Language> = { en: 'as', as: 'bn', bn: 'hi', hi: 'en' };
                setLanguage(nextLang[language]);
              }}
              className="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-md font-bold uppercase border border-slate-700"
            >
              {language}
            </button>
            <span className="text-xs bg-indigo-900 text-indigo-200 px-2 py-1 rounded-md font-semibold">
              {patient?.name ? patient.name.split(' ')[0] : 'Patient'}
            </span>
          </div>
        </div>

        {/* Mobile Sidebar Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Portal Info */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md bg-white flex-shrink-0">
              <img src="/smriti_logo.jpg" alt="SMRITI" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight">SMRITI CARE</div>
              <div className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider">
                Team Axiom • SIH 2026
              </div>
            </div>
          </div>

          {/* Active Patient Card in Sidebar */}
          <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
            {patient?.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={patient?.name || 'Patient'}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {(patient?.name || 'P')[0]}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{patient?.name || 'Patient User'}</div>
              <div className="text-xs text-slate-400">Age {patient?.age || 65} • {patient?.location ? patient.location.split(',')[0] : 'Assam'}</div>
              <div className="text-[10px] text-teal-400 font-semibold mt-0.5">● Active Monitoring</div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {menuItems.map(item => {
              const isActive = currentRoute === item.route;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.route);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Actions */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                showToast(`Calling ${patient?.name || 'Patient'}...`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone size={13} /> Call {patient?.name ? patient.name.split(' ')[0] : 'Patient'}
            </button>
            <button
              onClick={() => {
                setUserMode('patient');
                navigate('/home');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <User size={13} /> Switch to Patient View
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut size={13} /> {t('common.signOut')}
            </button>
          </div>
        </aside>

        {/* Main Caregiver Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Quick Stats Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 hidden md:flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500 font-medium">{t('caregiver.patientSummary')}:</span>{' '}
                <span className="font-bold text-slate-900">{patient?.name || 'Patient'} ({patient?.age || 65})</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-medium">{t('caregiver.medAdherence')}:</span>{' '}
                <span className="font-bold text-teal-700">{takenMedsCount}/{medicines.length} Taken</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-medium">{t('caregiver.routineCompletion')}:</span>{' '}
                <span className="font-bold text-indigo-700">{completedRoutineCount}/{routineItems.length} Done</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Caregiver Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                >
                  <Globe size={13} />
                  <span className="uppercase">{language}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                    {languages.map(l => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setLanguage(l.id);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-indigo-50 transition-colors cursor-pointer ${
                          language === l.id ? 'text-indigo-700 font-bold bg-indigo-50/60' : 'text-slate-700'
                        }`}
                      >
                        <span>{l.name}</span>
                        <span className="text-[10px] uppercase text-slate-400">{l.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/caregiver/reports')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText size={14} /> {t('caregiver.exportPdf') || 'Export Report'}
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <LogOut size={13} /> {t('common.signOut')}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

