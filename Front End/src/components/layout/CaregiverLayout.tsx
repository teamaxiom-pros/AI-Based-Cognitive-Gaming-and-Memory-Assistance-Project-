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
  MessageSquare,
  Menu,
  X,
  LogOut,
  User,
  HeartHandshake,
} from 'lucide-react';
import { OfflineBanner } from '../common/OfflineBanner';

interface CaregiverLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export const CaregiverLayout: React.FC<CaregiverLayoutProps> = ({
  children,
  activeTab,
}) => {
  const { currentRoute, navigate, patient, alerts, medicines, routineItems, showToast, setUserMode } = useApp();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', route: '/caregiver/dashboard', icon: LayoutDashboard },
    { id: 'cognition', label: 'Cognitive Analytics', route: '/caregiver/cognition', icon: Brain },
    { id: 'activities', label: 'Activity Logs', route: '/caregiver/activities', icon: History },
    { id: 'medicines', label: 'Medication Tracker', route: '/caregiver/medicines', icon: Pill },
    { id: 'routine', label: 'Routine Schedule', route: '/caregiver/routine', icon: Clock },
    {
      id: 'alerts',
      label: 'Alerts Center',
      route: '/caregiver/alerts',
      icon: Bell,
      badge: alerts.filter(a => !a.isAcknowledged).length,
    },
    { id: 'appointments', label: 'Appointments', route: '/caregiver/appointments', icon: Calendar },
    { id: 'reports', label: 'Clinical Reports', route: '/caregiver/reports', icon: FileText },
    { id: 'settings', label: 'Care Settings', route: '/caregiver/settings', icon: Settings },
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
            <span className="font-bold text-base tracking-tight">AXIOM Caregiver</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-900 text-indigo-200 px-2 py-1 rounded-md font-semibold">
              {patient.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Portal Info */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              <Brain size={22} />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight">AXIOM CLINICAL</div>
              <div className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                Caregiver Command
              </div>
            </div>
          </div>

          {/* Active Patient Card in Sidebar */}
          <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500"
            />
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{patient.name}</div>
              <div className="text-xs text-slate-400">Age {patient.age} • {patient.location.split(',')[0]}</div>
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
                showToast(`Calling ${patient.name}...`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone size={13} /> Call {patient.name.split(' ')[0]}
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
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Caregiver Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Quick Stats Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 hidden md:flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500 font-medium">Active Patient:</span>{' '}
                <span className="font-bold text-slate-900">{patient.name} ({patient.age})</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-medium">Today's Meds:</span>{' '}
                <span className="font-bold text-teal-700">{takenMedsCount}/{medicines.length} Taken</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-medium">Routine:</span>{' '}
                <span className="font-bold text-indigo-700">{completedRoutineCount}/{routineItems.length} Done</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/caregiver/reports')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText size={14} /> Export Report
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <LogOut size={13} /> Sign Out
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
