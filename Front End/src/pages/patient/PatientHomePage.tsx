import React from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { Card } from '../../components/common/Card';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
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
} from 'lucide-react';

export const PatientHomePage: React.FC = () => {
  const { patient, medicines, routineItems, activities, navigate, t, speakText } = useApp();

  const currentHour = new Date().getHours();
  const greetingKey =
    currentHour < 12
      ? 'home.greetingMorning'
      : currentHour < 17
      ? 'home.greetingAfternoon'
      : 'home.greetingEvening';

  const greetingText = t(greetingKey, { name: patient.name.split(' ')[0] });
  const completedMeds = medicines.filter(m => m.isTakenToday).length;
  const completedRoutine = routineItems.filter(r => r.isCompleted).length;

  const briefingText = `${greetingText}. You have completed your morning tea, walk, and medicines. You have 2 fun brain activities waiting for you today.`;

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Top Warm Greeting Card */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white rounded-4xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-teal-100 uppercase tracking-wider">
                <Sun size={14} className="text-amber-300" />
                Dispur, Guwahati
              </div>
              <button
                onClick={() => speakText(briefingText)}
                className="px-3.5 py-1.5 rounded-full bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Volume2 size={16} />
                <span>{t('home.audioBriefing')}</span>
              </button>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {greetingText}
              </h1>
              <p className="text-teal-100 text-base sm:text-lg font-medium mt-1">
                How are you feeling this peaceful day in Assam?
              </p>
            </div>

            {/* Daily Status Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-black text-white">2 / 3</div>
                <div className="text-[11px] text-teal-100 font-bold">Activities</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-black text-white">{completedMeds} / {medicines.length}</div>
                <div className="text-[11px] text-teal-100 font-bold">Medicines</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-black text-white">{completedRoutine} / {routineItems.length}</div>
                <div className="text-[11px] text-teal-100 font-bold">Routine Steps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Up Highlight Card */}
        <div
          onClick={() => navigate('/medicines')}
          className="bg-amber-50/90 border-2 border-amber-300/80 rounded-3xl p-5 shadow-soft flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/80 transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
              💊
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                Up Next Today
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                Vitamin D3 & Calcium Tablet
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Scheduled at 01:30 PM with lunch
              </p>
            </div>
          </div>
          <ArrowRight className="text-amber-800 flex-shrink-0" size={24} />
        </div>

        {/* 4 Core Elderly-Friendly Action Tiles */}
        <div className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-teal-600" size={20} />
            {t('home.exploreCategories')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tile 1: Play Brain Games */}
            <div
              onClick={() => navigate('/activities')}
              className="bg-white hover:bg-teal-50/50 p-6 rounded-3xl border-2 border-slate-200 hover:border-teal-500 shadow-soft transition-all duration-200 cursor-pointer flex items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                🧠
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {t('home.playGamesTile')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('home.playGamesDesc')}
                </p>
              </div>
            </div>

            {/* Tile 2: Memory Book */}
            <div
              onClick={() => navigate('/memory')}
              className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 shadow-soft transition-all duration-200 cursor-pointer flex items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                📖
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {t('home.memoryTile')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('home.memoryDesc')}
                </p>
              </div>
            </div>

            {/* Tile 3: Talk to Axiom */}
            <div
              onClick={() => navigate('/assistant')}
              className="bg-white hover:bg-teal-50/50 p-6 rounded-3xl border-2 border-slate-200 hover:border-teal-500 shadow-soft transition-all duration-200 cursor-pointer flex items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {t('home.assistantTile')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('home.assistantDesc')}
                </p>
              </div>
            </div>

            {/* Tile 4: Daily Schedule */}
            <div
              onClick={() => navigate('/routine')}
              className="bg-white hover:bg-amber-50/50 p-6 rounded-3xl border-2 border-slate-200 hover:border-amber-500 shadow-soft transition-all duration-200 cursor-pointer flex items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                📅
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors">
                  {t('home.timelineTile')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('home.timelineDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};
