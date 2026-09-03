import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { apiService, BackendRecommendationResult } from '../../services/apiService';
import {
  Brain,
  BookOpen,
  Mic,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Pill,
  Sun,
  Volume2,
  ShieldCheck,
  Award,
  Play,
  Flame,
  ChevronRight,
} from 'lucide-react';

export const PatientHomePage: React.FC = () => {
  const { patient, medicines, routineItems, activities, navigate, t, speakText, toggleMedicineTaken } = useApp();
  const [aiRec, setAiRec] = useState<BackendRecommendationResult | null>(null);

  useEffect(() => {
    apiService.getRecommendation(patient.id || 'P001').then(res => {
      if (res) {
        setAiRec(res);
      }
    });
  }, [patient.id]);

  const currentHour = new Date().getHours();
  const greetingKey =
    currentHour < 12
      ? 'home.greetingMorning'
      : currentHour < 17
      ? 'home.greetingAfternoon'
      : 'home.greetingEvening';

  const firstName = patient?.name ? patient.name.split(' ')[0] : 'Friend';
  const greetingText = t(greetingKey, { name: firstName }) || `Hello, ${firstName}`;
  const completedMeds = medicines.filter(m => m.isTakenToday).length;
  const completedRoutine = routineItems.filter(r => r.isCompleted).length;

  const nextMed = medicines.find(m => !m.isTakenToday) || medicines[0];

  const briefingText = `${greetingText}. You have completed ${completedMeds} of ${medicines.length} medications today. You have enjoyable brain activities waiting for you.`;

  return (
    <PatientLayout>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* 1. Hero Greeting Banner */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-teal-50">
                  <Sun size={14} className="text-amber-300" />
                  {patient.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/40 text-xs font-bold text-teal-100">
                  <Flame size={14} className="text-amber-400" />
                  4-Day Mind Streak
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {greetingText}!
              </h1>
              <p className="text-teal-100 text-sm sm:text-base leading-relaxed font-normal">
                Welcome to your daily cognitive space. A peaceful routine is ready for you.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-md">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                  <div className="text-lg sm:text-xl font-black text-white">2 / 3</div>
                  <div className="text-[10px] sm:text-xs text-teal-100 font-medium">Activities</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                  <div className="text-lg sm:text-xl font-black text-white">{completedMeds} / {medicines.length}</div>
                  <div className="text-[10px] sm:text-xs text-teal-100 font-medium">Medicines</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                  <div className="text-lg sm:text-xl font-black text-white">{completedRoutine} / {routineItems.length}</div>
                  <div className="text-[10px] sm:text-xs text-teal-100 font-medium">Daily Steps</div>
                </div>
              </div>
            </div>

            {/* Audio Summary Action */}
            <div className="flex md:flex-col items-center gap-3">
              <button
                onClick={() => speakText(briefingText)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Volume2 size={18} className="text-teal-700" />
                <span>Audio Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Axiom AI Authoritative Recommendation Card */}
        {aiRec ? (
          <div
            onClick={() => navigate(aiRec.gameMapping?.route || '/activities')}
            className="bg-white rounded-3xl p-6 border-2 border-teal-500/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 sm:w-15 sm:sm-15 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Brain size={28} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                      Today's AI Focus
                    </span>
                    <span className="text-xs text-slate-500 font-semibold capitalize">
                      {(aiRec.focusDomain || 'memory').replace(/_/g, ' ')} • Level {aiRec.gameMapping?.suggestedLevel || 1}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                    {aiRec.gameMapping?.gameTitle || 'Assam Heritage Memory Match'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                    {aiRec.performance?.message || 'Personalized cognitive exercise tailored to your baseline.'}
                  </p>
                </div>
              </div>

              <button className="px-5 py-3 rounded-2xl bg-teal-600 group-hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 flex-shrink-0 cursor-pointer transition-all">
                <Play size={16} />
                <span>Start Daily Game</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/activities')}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Explore Brain Activities</h3>
                <p className="text-xs text-slate-500">Play memory, attention, and sequencing games.</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-teal-600" />
          </div>
        )}

        {/* 3. Responsive Two-Column Card Grid (Next Med + Assistant Quick Prompt) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Next Medication Card */}
          {nextMed && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <Pill size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Scheduled Medication
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {nextMed.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {nextMed.dosage} • {nextMed.time} ({nextMed.instructions})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleMedicineTaken(nextMed.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    nextMed.isTakenToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{nextMed.isTakenToday ? 'Taken' : 'Mark Done'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">All Daily Medications ({completedMeds}/{medicines.length})</span>
                <button
                  onClick={() => navigate('/medicines')}
                  className="font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Ask Axiom Voice Companion Card */}
          <div
            onClick={() => navigate('/assistant')}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Mic size={22} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Voice Assistant
                </span>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Ask Axiom Companion
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  "What is on my schedule today?" or "Tell me a memory story."
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Speech-Enabled Support</span>
              <span className="font-bold text-teal-700 group-hover:underline flex items-center gap-1">
                <span>Talk Now</span>
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* 4. Four Core Category Navigation Cards */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-teal-600" size={18} />
              <span>Explore Your Hub</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Play Brain Games */}
            <div
              onClick={() => navigate('/activities')}
              className="bg-white hover:bg-teal-50/40 p-5 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Brain Games
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Memory Match, Object Recall, and gentle puzzle games.
                </p>
              </div>
              <div className="text-xs font-bold text-teal-700 flex items-center gap-1">
                <span>Play Games</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Tile 2: Memory Book */}
            <div
              onClick={() => navigate('/memory')}
              className="bg-white hover:bg-emerald-50/40 p-5 rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Memory Book
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cherished family photos, home memories, and voice stories.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Open Album</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Tile 3: Routine & Schedule */}
            <div
              onClick={() => navigate('/routine')}
              className="bg-white hover:bg-amber-50/40 p-5 rounded-3xl border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <CalendarCheck size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Daily Routine
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Morning tea, walks, doctor visits, and daily hydration.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <span>View Steps</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Tile 4: Caregiver Connection */}
            <div
              onClick={() => navigate('/settings')}
              className="bg-white hover:bg-indigo-50/40 p-5 rounded-3xl border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                  Care Network
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Priya Sharma linked • Caregiver support active.
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                <span>Care Settings</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};
