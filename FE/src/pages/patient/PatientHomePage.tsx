import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { apiService, BackendRecommendationResult } from '../../services/apiService';
import { gamesLibrary, getLocalizedGame } from '../../data/gamesLibraryData';
import { getLocalizedRoutineItem } from '../../data/routineData';
import { getLocalizedMedicine } from '../../data/medicineData';
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
  Award,
  Play,
  Flame,
  ChevronRight,
  Target,
  Zap,
  Layers,
  RotateCcw,
  HelpCircle,
  HeartHandshake,
} from 'lucide-react';

export const PatientHomePage: React.FC = () => {
  const {
    patient,
    medicines,
    routineItems,
    activities,
    navigate,
    t,
    language,
    speakText,
    toggleMedicineTaken,
    toggleRoutineCompleted,
    isSimpleElderlyMode,
    assessmentResult,
    assessmentSessions,
  } = useApp();

  const [aiRec, setAiRec] = useState<BackendRecommendationResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getRecommendation(patient?.id || 'P001').then(res => {
      if (isMounted && res) setAiRec(res);
    });
    return () => {
      isMounted = false;
    };
  }, [patient?.id]);

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

  const rawNextMed = medicines.find(m => !m.isTakenToday) || medicines[0];
  const nextMed = rawNextMed ? getLocalizedMedicine(rawNextMed, t) : null;

  const rawNextRoutine = routineItems.find(r => !r.isCompleted) || routineItems[0];
  const nextRoutine = rawNextRoutine ? getLocalizedRoutineItem(rawNextRoutine, t) : null;

  const topGameDef = gamesLibrary.find(g => g.id === aiRec?.gameMapping?.gameId) || gamesLibrary[0];
  const localizedTopGame = getLocalizedGame(topGameDef, t);

  const localizedLocation = patient?.location
    ? (language === 'bn'
        ? (patient.location.includes('Guwahati') ? 'গুয়াহাটি, আসাম' : 'আসাম')
        : language === 'as'
        ? (patient.location.includes('Guwahati') ? 'গুৱাহাটী, অসম' : 'অসম')
        : language === 'hi'
        ? (patient.location.includes('Guwahati') ? 'गुवाहाटी, असम' : 'असम')
        : patient.location)
    : 'Guwahati, Assam';

  // Reassessment calculation
  const lastAssessmentDate = (assessmentSessions && assessmentSessions.length > 0 && assessmentSessions[0].date)
    ? new Date(assessmentSessions[0].date)
    : (assessmentSessions && assessmentSessions.length > 0 && assessmentSessions[0].startTime)
    ? new Date(assessmentSessions[0].startTime)
    : assessmentResult?.completedAt
    ? new Date(assessmentResult.completedAt)
    : null;

  const daysSinceLastAssessment = lastAssessmentDate
    ? Math.floor((Date.now() - lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const showReassessmentNotice = daysSinceLastAssessment >= 14;

  const briefingText = `${greetingText}. Today's activity is ${localizedTopGame.title}. You have taken ${completedMeds} of ${medicines.length} medicines.`;

  // Cognitive Domain Scores
  const domainScores = assessmentResult?.domainScores || {
    memory: { score: 78, domain: 'memory', maxScore: 100 },
    attention: { score: 82, domain: 'attention', maxScore: 100 },
    processing_speed: { score: 74, domain: 'processing_speed', maxScore: 100 },
    executive_function: { score: 80, domain: 'executive_function', maxScore: 100 },
    recognition: { score: 85, domain: 'recognition', maxScore: 100 },
  };

  const domainList = [
    { id: 'memory', label: t('caregiver.domainMemory') || 'Memory', score: domainScores.memory?.score || 78, icon: Brain, color: 'text-teal-700 bg-teal-50' },
    { id: 'attention', label: t('caregiver.domainAttention') || 'Attention', score: domainScores.attention?.score || 82, icon: Target, color: 'text-teal-800 bg-teal-50' },
    { id: 'processing_speed', label: t('caregiver.domainSpeed') || 'Speed', score: domainScores.processing_speed?.score || 74, icon: Zap, color: 'text-amber-700 bg-amber-50' },
    { id: 'executive_function', label: t('caregiver.domainSequencing') || 'Sequencing', score: domainScores.executive_function?.score || 80, icon: Layers, color: 'text-teal-700 bg-teal-50' },
    { id: 'recognition', label: t('caregiver.domainRecognition') || 'Recognition', score: domainScores.recognition?.score || 85, icon: Award, color: 'text-emerald-700 bg-emerald-50' },
  ];

  /* ========================================================================= */
  /* SIMPLE ELDERLY MODE RENDERING                                             */
  /* ========================================================================= */
  if (isSimpleElderlyMode) {
    return (
      <PatientLayout>
        <div className="space-y-6 max-w-2xl mx-auto font-sans">
          {/* Simple Greeting Banner */}
          <div className="bg-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black">{greetingText}!</h1>
            <p className="text-amber-100 text-lg font-medium">{t('home.dailyPlan') || 'Your Daily Plan'}</p>
            <button
              onClick={() => speakText(briefingText)}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-base shadow hover:bg-amber-50 cursor-pointer"
            >
              <Volume2 size={22} className="text-amber-700" />
              <span>{t('accessibility.voiceGuidance')}</span>
            </button>
          </div>

          {/* 4 Big Touch-Target Buttons */}
          <div className="grid grid-cols-1 gap-4">
            {/* 1. Play Daily Activity */}
            <button
              onClick={() => navigate(aiRec?.gameMapping?.route || '/activities')}
              className="w-full bg-white hover:bg-teal-50/80 p-6 rounded-3xl border-3 border-teal-700 shadow-md flex items-center gap-5 text-left transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-3xl font-black flex-shrink-0 group-hover:scale-105 transition-transform">
                <Brain size={36} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase font-black text-teal-800 tracking-wider">Today's Activity</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {localizedTopGame.title}
                </div>
                <div className="text-sm text-slate-600 font-semibold mt-0.5">{t('games.playNow')}</div>
              </div>
              <Play size={28} className="text-teal-700 flex-shrink-0" />
            </button>

            {/* 2. Medicines & Reminders */}
            <div className="w-full bg-white p-6 rounded-3xl border-3 border-amber-600 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                    <Pill size={32} />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-black text-amber-800">Today's Reminders</div>
                    <div className="text-xl font-black text-slate-900">{nextMed?.name || 'Daily Medication'}</div>
                    <div className="text-sm text-slate-600 font-semibold">{nextMed?.time} • {nextMed?.dosage}</div>
                  </div>
                </div>
                {nextMed && (
                  <button
                    onClick={() => toggleMedicineTaken(nextMed.id)}
                    className={`px-5 py-3 rounded-2xl font-black text-base flex items-center gap-2 cursor-pointer transition-colors ${
                      nextMed.isTakenToday
                        ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                        : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                    <span>{nextMed.isTakenToday ? t('medicines.taken') : t('medicines.markTaken')}</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => navigate('/medicines')}
                className="w-full text-center text-sm font-bold text-amber-800 hover:underline pt-2 border-t border-slate-100"
              >
                {t('medicines.title')} ({completedMeds}/{medicines.length}) →
              </button>
            </div>

            {/* 3. Memory Assistance */}
            <button
              onClick={() => navigate('/memory')}
              className="w-full bg-white hover:bg-emerald-50/80 p-6 rounded-3xl border-3 border-emerald-700 shadow-md flex items-center gap-5 text-left transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-3xl font-black flex-shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen size={36} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase font-black text-emerald-800 tracking-wider">Memory Assistance</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{t('memory.albumTitle')}</div>
                <div className="text-sm text-slate-600 font-semibold mt-0.5">{t('memory.subtitle')}</div>
              </div>
              <ChevronRight size={28} className="text-emerald-700 flex-shrink-0" />
            </button>

            {/* 4. Talk to Mitra */}
            <button
              onClick={() => navigate('/assistant')}
              className="w-full bg-white hover:bg-teal-50/80 p-5 sm:p-6 rounded-3xl border-3 border-teal-700 shadow-md flex items-center gap-5 text-left transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 group-hover:scale-105 transition-transform bg-teal-50 border border-teal-200">
                <img src="/mitra_avatar.png" alt="MITRA" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase font-black text-teal-800 tracking-wider">Need Help?</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">Talk to Mitra</div>
                <div className="text-sm text-slate-600 font-semibold mt-0.5">Your personal voice companion</div>
              </div>
              <ChevronRight size={28} className="text-teal-700 flex-shrink-0" />
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  /* ========================================================================= */
  /* STANDARD PATIENT HOME VIEW (WARM, CALM & ELDERLY-FRIENDLY)                 */
  /* ========================================================================= */
  return (
    <PatientLayout>
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Reassessment Reminder Banner */}
        {showReassessmentNotice && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {t('assessment.reassessmentNotice') || 'Cognitive Calibration Recommended'}
                </h4>
                <p className="text-xs text-slate-600">
                  {daysSinceLastAssessment === 999
                    ? 'Take your gentle 5-minute check-in to calibrate your daily activities.'
                    : `It has been ${daysSinceLastAssessment} days since your last check-in.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/assessment/intro')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              {t('assessment.reassessNow') || 'Start 5-Min Check-in'}
            </button>
          </div>
        )}

        {/* 1. Warm Greeting Banner */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-teal-50">
                  <Sun size={14} className="text-amber-300" />
                  {localizedLocation}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 text-xs font-bold text-teal-100">
                  <Flame size={14} className="text-amber-400" />
                  {t('home.streak')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {greetingText} 👋
              </h1>
              <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
                {t('home.subtitle') || 'Here is your gentle daily plan for today.'}
              </p>
            </div>

            <button
              onClick={() => speakText(briefingText)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 self-start sm:self-center"
            >
              <Volume2 size={18} className="text-teal-700" />
              <span>{t('accessibility.voiceGuidance') || 'Read Aloud'}</span>
            </button>
          </div>
        </div>

        {/* 2. TODAY'S ACTIVITY (PRIMARY FOCUS CARD) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-teal-700" size={20} />
              <span>Today's Activity</span>
            </h2>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Level {aiRec?.gameMapping?.suggestedLevel || 1}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-teal-600/30 shadow-sm hover:border-teal-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center text-3xl font-black flex-shrink-0">
                <Brain size={32} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">
                  Recommended For You
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {localizedTopGame.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {localizedTopGame.shortDescription || 'Gentle brain exercise to practice memory and recall.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(aiRec?.gameMapping?.route || '/activities')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer flex-shrink-0"
            >
              <Play size={18} />
              <span>Start Activity</span>
            </button>
          </div>
        </div>

        {/* 3. TODAY'S REMINDERS (MEDICINE & SCHEDULE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="text-amber-600" size={20} />
              <span>Today's Reminders</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {completedMeds} of {medicines.length} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medicine Reminder Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <Pill size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      💊 Medicine • {nextMed?.time || 'Scheduled'}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      {nextMed?.name || 'Donepezil'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {nextMed?.dosage || '5mg'} • {nextMed?.instructions || 'Take with water'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => nextMed && toggleMedicineTaken(nextMed.id)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    nextMed?.isTakenToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{nextMed?.isTakenToday ? t('medicines.taken') : t('medicines.markTaken')}</span>
                </button>
                <button
                  onClick={() => navigate('/medicines')}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Routine & Appointment Reminder Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                      📅 Routine • {nextRoutine?.time || 'Morning'}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      {nextRoutine?.title || 'Gentle Morning Walk'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {nextRoutine?.category || 'Wellness'} • {nextRoutine?.description || 'Take 10 minutes for a gentle walk'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => nextRoutine && toggleRoutineCompleted(nextRoutine.id)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    nextRoutine?.isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{nextRoutine?.isCompleted ? t('routine.completed') : t('routine.markCompleted')}</span>
                </button>
                <button
                  onClick={() => navigate('/routine')}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MEMORY ASSISTANCE & TALK TO MITRA CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Memory Book Card */}
          <div
            onClick={() => navigate('/memory')}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen size={28} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Memory Assistance</div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                {t('memory.albumTitle') || 'Memory Book'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('memory.subtitle') || 'Relive cherished photos, voice stories & familiar faces.'}
              </p>
            </div>
            <ChevronRight size={22} className="text-emerald-700 flex-shrink-0" />
          </div>

          {/* Talk to Mitra Card */}
          <div
            onClick={() => navigate('/assistant')}
            className="bg-gradient-to-br from-teal-50 to-emerald-50/40 rounded-3xl p-6 border-2 border-teal-600/40 shadow-xs hover:border-teal-700 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-teal-300 flex-shrink-0 group-hover:scale-105 transition-transform bg-white">
              <img src="/mitra_avatar.png" alt="MITRA" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">Need Help?</div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-800 transition-colors">
                Talk to Mitra
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tap to speak or ask questions in your language.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Mic size={20} />
            </div>
          </div>
        </div>

        {/* 5. GENTLE COGNITIVE ACTIVITY PROGRESS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Brain className="text-teal-700" size={20} />
                <span>Cognitive Progress Overview</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gentle tracking to help keep your mind active and engaged.
              </p>
            </div>
            <button
              onClick={() => navigate('/assessment/intro')}
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('assessment.title')}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {domainList.map(d => {
              const Icon = d.icon;
              return (
                <div key={d.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${d.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-black text-slate-900">{d.score}%</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 truncate">{d.label}</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-teal-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};
