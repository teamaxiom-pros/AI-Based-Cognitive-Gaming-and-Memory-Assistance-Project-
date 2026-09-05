import React from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { Button } from '../../components/common/Button';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { Pill, CheckCircle2, Clock, Check } from 'lucide-react';

export const MedicineTrackerPage: React.FC = () => {
  const { medicines, toggleMedicineTaken, patient, t, speakText } = useApp();

  const takenCount = medicines.filter(m => m.isTakenToday).length;

  return (
    <PatientLayout pageTitle={t('medicines.title')}>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Header Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('medicines.title')}
              </h1>
              <SpeechSpeaker textToSpeak={`${t('medicines.title')}: ${takenCount} of ${medicines.length} ${t('medicines.taken')}.`} />
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1">
              {t('medicines.subtitle')}
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 px-5 py-2.5 rounded-2xl text-center">
            <div className="text-xs text-teal-800 font-bold uppercase">{t('caregiver.patientSummary')}</div>
            <div className="text-2xl font-black text-teal-900">
              {takenCount} / {medicines.length} {t('medicines.taken')}
            </div>
          </div>
        </div>

        {/* Medicines List */}
        <div className="space-y-4">
          {medicines.map(med => {
            return (
              <div
                key={med.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                  med.isTakenToday
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 shadow-soft hover:border-teal-400'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xs flex-shrink-0 ${
                      med.isTakenToday
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    💊
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-teal-900 bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                        {med.timeSlot} • {med.time}
                      </span>
                      {med.isTakenToday && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Check size={12} strokeWidth={3} /> {t('medicines.taken')} {med.takenAt ? `(${med.takenAt})` : ''}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900">
                      {med.name} <span className="text-lg text-slate-600 font-bold">({med.dosage})</span>
                    </h3>

                    <p className="text-sm text-slate-600 font-medium">
                      {med.instructions} • <span className="text-teal-700 font-bold">{med.purpose}</span>
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0">
                  <Button
                    size="lg"
                    variant={med.isTakenToday ? 'secondary' : 'primary'}
                    onClick={() => toggleMedicineTaken(med.id)}
                    icon={med.isTakenToday ? <CheckCircle2 size={20} /> : <Check size={20} />}
                    fullWidth
                  >
                    {med.isTakenToday ? t('medicines.taken') : t('medicines.markTaken')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PatientLayout>
  );
};


