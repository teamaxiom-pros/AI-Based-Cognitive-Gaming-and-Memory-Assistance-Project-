import React from 'react';
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
} from 'lucide-react';

export const CaregiverDashboardPage: React.FC = () => {
  const { patient, medicines, routineItems, alerts, activityHistory, navigate, showToast } = useApp();

  const takenMeds = medicines.filter(m => m.isTakenToday).length;
  const completedRoutine = routineItems.filter(r => r.isCompleted).length;
  const activeAlerts = alerts.filter(a => !a.isAcknowledged);
  const todayGamesCount = activityHistory.filter(h => h.date.startsWith('Today')).length;

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
                  ● Stable
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Age {patient.age} • {patient.location} • Monitored since {patient.joinedDate}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="md"
              variant="secondary"
              onClick={() => showToast(`Calling ${patient.name}...`)}
              icon={<Phone size={16} />}
            >
              Call Asha
            </Button>
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate('/caregiver/reports')}
              icon={<TrendingUp size={16} />}
            >
              Generate Report
            </Button>
          </div>
        </div>

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
              {Math.round((takenMeds / medicines.length) * 100)}%
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
            <div className="text-3xl font-black text-slate-900">
              {activeAlerts.length}
            </div>
            <div className="text-xs text-amber-700 font-bold">
              {activeAlerts.length === 0 ? 'No urgent alerts' : 'Requires attention'}
            </div>
          </Card>
        </div>

        {/* AI Insight Card (Stitch Screen 10 Spec) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              AI Clinical Observation • Dynamic Synthesis
            </div>
            <span className="text-xs text-slate-400">Live Synchronized</span>
          </div>

          <h3 className="text-xl font-bold text-white leading-snug">
            {activityHistory.length > 0
              ? `"Asha demonstrated strong recognition and memory recall today (${activityHistory[0].score}% accuracy on ${activityHistory[0].title}). Recognition performance improved compared with the previous session. ${
                  takenMeds >= 2
                    ? 'Morning Donepezil & Amlodipine doses confirmed on schedule.'
                    : '1 scheduled morning dose confirmed.'
                }"`
              : `"Asha performed strongly in Orientation and Attention screening. Recommended: Daily gentle Assam Heritage Memory Match and structured routine reminders."`}
          </h3>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/caregiver/cognition')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>View Cognitive Trends</span> <ArrowRight size={14} />
            </button>
            <button
              onClick={() => showToast('Assigned 2 gentle pattern games to Asha.')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Assign Pattern Activity
            </button>
          </div>
        </div>

        {/* 2-Column Section: 7-Day Completion Chart + Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  7-Day Activity Completion
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Daily cognitive games completed out of scheduled targets
                </p>
              </div>
              <Activity className="text-teal-600" size={20} />
            </div>

            {/* Visual Bar Chart */}
            <div className="flex items-end justify-between gap-3 h-44 pt-6 px-2">
              {weeklyActivityData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[11px] font-bold text-slate-700">{item.count}</div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        item.count >= 4
                          ? 'bg-teal-600'
                          : item.count >= 3
                          ? 'bg-indigo-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ height: item.height }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Alerts Feed */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Recent Alerts & Actions
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Status notifications and activity logs
                </p>
              </div>
              <button
                onClick={() => navigate('/caregiver/alerts')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold ${
                      alert.type === 'warning'
                        ? 'bg-rose-500'
                        : alert.type === 'reminder'
                        ? 'bg-amber-500'
                        : 'bg-teal-600'
                    }`}
                  >
                    {alert.type === 'warning' ? '!' : '✓'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm">{alert.title}</div>
                    <div className="text-slate-600 font-medium mt-0.5">{alert.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{alert.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 100-Level Cognitive Game Progression & Domain Mastery Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 100-Level Progression Tracking by Game */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  100-Level Game Progression
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Patient level achievements across data-driven cognitive modules
                </p>
              </div>
              <button
                onClick={() => navigate('/caregiver/activities')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
