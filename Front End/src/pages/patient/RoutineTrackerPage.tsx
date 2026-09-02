import React from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { Check, Clock, CheckCircle2 } from 'lucide-react';

export const RoutineTrackerPage: React.FC = () => {
  const { routineItems, toggleRoutineItem, t, speakText } = useApp();

  const completedCount = routineItems.filter(r => r.isCompleted).length;

  return (
    <PatientLayout pageTitle="Daily Routine">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Today's Daily Timeline
              </h1>
              <SpeechSpeaker textToSpeak={`You have completed ${completedCount} of ${routineItems.length} routine steps today.`} />
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Check off tasks as you complete them throughout your peaceful day.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 px-5 py-2.5 rounded-2xl text-center">
            <div className="text-xs text-indigo-800 font-bold uppercase">Progress</div>
            <div className="text-2xl font-black text-indigo-950">
              {completedCount} / {routineItems.length} Done
            </div>
          </div>
        </div>

        {/* Timeline Items List */}
        <div className="relative border-l-3 border-teal-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {routineItems.map(item => (
            <div
              key={item.id}
              onClick={() => toggleRoutineItem(item.id)}
              className={`p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none relative ${
                item.isCompleted
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-soft hover:border-teal-400'
              }`}
            >
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] w-6 h-6 rounded-full border-3 border-white flex items-center justify-center shadow-xs ${
                  item.isCompleted ? 'bg-emerald-600 text-white' : 'bg-teal-300'
                }`}
              >
                {item.isCompleted && <Check size={12} strokeWidth={4} />}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded">
                      {item.time}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {item.timeBlock}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                <Check size={20} strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
};
