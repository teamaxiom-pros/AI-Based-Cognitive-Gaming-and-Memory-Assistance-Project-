import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { loadAllGamesProgress, calculateDomainProgress } from '../../services/gameProgressionService';
import { calculateDifficulty } from '../../services/levelGenerator';
import { gamesLibrary } from '../../data/gamesLibraryData';
import {
  Brain,
  Pill,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  Link,
  Plus,
  UserCheck,
} from 'lucide-react';

export const CaregiverDashboardPage: React.FC = () => {
  const {
    patient,
    medicines,
    routineItems,
    alerts,
    activityHistory,
    navigate,
    showToast,
    linkedPatients,
    linkPatientWithCode,
    t,
  } = useApp();

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const takenMeds = medicines.filter(m => m.isTakenToday).length;
  const completedRoutine = routineItems.filter(r => r.isCompleted).length;
  const activeAlerts = alerts.filter(a => !a.isAcknowledged);
  const todayGamesCount = activityHistory.filter(h => h.date.startsWith('Today')).length;

  const handleLinkPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setIsLinking(true);
    await linkPatientWithCode(inviteCodeInput.trim());
    setIsLinking(false);
    setInviteCodeInput('');
    setShowLinkModal(false);
  };

  // 7-day activity completion data for chart
  const weeklyActivityData = [
    { day: 'Thu', count: 3, max: 4, height: '75%' },
    { day: 'Fri', count: 4, max: 4, height: '100%' },
    { day: 'Sat', count: 3, max: 4, height: '75%' },
    { day: 'Sun', count: 4, max: 4, height: '100%' },
    { day: 'Mon', count: 2, max: 4, height: '50%' },
    { day: 'Tue', count: 4, max: 4, height: '100%' },
    {
      day: 'Wed (Today)',
      count: todayGamesCount,
      max: 4,
      height: `${Math.min(100, Math.round((todayGamesCount / 4) * 100))}%`,
    },
  ];

  return (
    <CaregiverLayout activeTab="dashboard">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {patient.name}
                </h1>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  ● {t('common.activeMonitoring')}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Age {patient.age} • {patient.location} • Invite Code:{' '}
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {patient.inviteCode || 'AX-ASH-4821'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="md"
              variant="outline"
              onClick={() => setShowLinkModal(true)}
              icon={<Link size={16} />}
            >
              {t('caregiver.linkPatientCode')}
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => showToast(`${t('common.callPatient')} ${patient.name}...`)}
              icon={<Phone size={16} />}
            >
              {t('common.callPatient')}
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/caregiver/reports')}
              icon={<TrendingUp size={16} />}
            >
              {t('caregiver.generateReport')}
            </Button>
          </div>
        </div>

        {/* Link Patient Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-lg">
                  <UserCheck size={22} />
                  <span>Link Patient via Invite Code</span>
                </div>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Enter the unique patient invite code displayed on their Axiom settings or onboarding screen to securely link their clinical monitoring profile.
              </p>

              <form onSubmit={handleLinkPatient} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Invite Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AX-ASH-4821"
                    value={inviteCodeInput}
                    onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-wider uppercase focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLinking}
                  >
                    {isLinking ? 'Linking...' : 'Connect Patient'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4 Core Vitality Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cognitive Activity */}
          <Card className="p-5 space-y-2 border-l-4 border-l-teal-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Cognitive Games
              </span>
              <Brain className="text-teal-600" size={20} />
            </div>
            <div className="text-3xl font-black text-slate-900">{todayGamesCount} / 4</div>
            <div className="text-xs text-teal-700 font-bold flex items-center gap-1">
              <TrendingUp size={14} /> +8% vs last week average
            </div>
          </Card>

          {/* Medication Adherence */}
          <Card className="p-5 space-y-2 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Medication Adherence
              </span>
              <Pill className="text-emerald-600" size={20} />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {Math.round((takenMeds / (medicines.length || 1)) * 100)}%
            </div>
            <div className="text-xs text-emerald-700 font-bold">
              {takenMeds} of {medicines.length} doses confirmed
            </div>
          </Card>

          {/* Routine Completion */}
          <Card className="p-5 space-y-2 border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Daily Routine
              </span>
              <Clock className="text-indigo-600" size={20} />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {completedRoutine} / {routineItems.length}
            </div>
            <div className="text-xs text-indigo-700 font-bold">
              Morning & afternoon on track
            </div>
          </Card>

          {/* Pending Alerts */}
          <Card className="p-5 space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Alerts
              </span>
              <AlertTriangle className="text-amber-500" size={20} />
            </div>
            <div className="text-3xl font-black text-slate-900">{activeAlerts.length}</div>
            <div className="text-xs text-amber-700 font-bold">
              {activeAlerts.length === 0 ? 'All parameters normal' : `${activeAlerts.length} require review`}
            </div>
          </Card>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Weekly Engagement Chart & Priority Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Activity Bar Graph */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Weekly Cognitive Engagement
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Daily game sessions completed (Target: 4/day)
                  </p>
                </div>
                <button
                  onClick={() => navigate('/caregiver/activities')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Activity Logs</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
                {weeklyActivityData.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-xs font-extrabold text-slate-700">
                      {d.count}
                    </div>
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-32">
                      <div
                        className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-xl transition-all duration-500"
                        style={{ height: d.height }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 truncate text-center w-full">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Live Alert Feed */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={20} />
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Real-time Patient Alerts
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/caregiver/alerts')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  View All ({alerts.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {alerts.slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      a.isAcknowledged
                        ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{a.title}</span>
                        <span className="text-[10px] text-slate-400">• {a.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{a.message}</p>
                    </div>

                    {!a.isAcknowledged && (
                      <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full whitespace-nowrap">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Medications, Routines & Assistant Shortcut */}
          <div className="space-y-6">
            {/* Medications Status */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="text-emerald-600" size={18} />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Today's Medicines
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/caregiver/medicines')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Manage →
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {m.dosage} • {m.time} ({m.schedule})
                      </p>
                    </div>
                    {m.isTakenToday ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Taken
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Routine Summary */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-600" size={18} />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Routine Progress
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/caregiver/routine')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Edit →
                </button>
              </div>

              <div className="space-y-2.5">
                {routineItems.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50"
                  >
                    <span
                      className={`font-semibold ${
                        r.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {r.title}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      {r.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Adaptive Game Levels & Domain Practice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adaptive Progression Ladder */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Adaptive Game Level Progression
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Dynamic difficulty unlocked per cognitive exercise
                </p>
              </div>
              <button
                onClick={() => navigate('/caregiver/activities')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Detailed Logs →
              </button>
            </div>

            <div className="space-y-3.5">
              {Object.values(loadAllGamesProgress()).slice(0, 5).map(g => {
                const gameDef = gamesLibrary.find(item => item.id === g.gameId);
                const lvlCfg = calculateDifficulty(g.gameId, g.unlockedLevel);
                return (
                  <div key={g.gameId} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">{gameDef?.title || g.gameId}</strong>
                        <span className="text-slate-500 ml-1.5 font-medium">
                          • {lvlCfg.difficultyLabel} (Load {lvlCfg.cognitiveLoad}/10)
                        </span>
                      </div>
                      <span className="font-extrabold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        Level {g.unlockedLevel} / 100 • {g.overallAccuracy}% Acc
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${g.unlockedLevel}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Domain Practice Progress */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Cognitive Domain Performance
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Longitudinal practice trends across clinical cognitive domains
                </p>
              </div>
              <button
                onClick={() => navigate('/caregiver/cognition')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Analytics →
              </button>
            </div>

            <div className="space-y-4">
              {Object.values(calculateDomainProgress()).slice(0, 4).map(d => (
                <div key={d.domain} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{d.domainName}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5 font-medium">
                        ({d.completedLevelsTotal} Lvls • Load {d.averageCognitiveLoad}/10)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{d.accuracyScore}%</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {d.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${d.accuracyScore}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-center gap-2 mt-2">
                <Sparkles size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Practice scores reflect engagement and task consistency. Non-diagnostic.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CaregiverLayout>
  );
};
