import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Pill, Plus, CheckCircle2, Clock, AlertCircle, Check } from 'lucide-react';

export const CaregiverMedicationsPage: React.FC = () => {
  const { medicines, addMedicine, patient, showToast } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new medicine
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [time, setTime] = useState('08:30 AM');
  const [purpose, setPurpose] = useState('');

  const daysOfWeek = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed (Today)'];

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;

    addMedicine({
      name,
      dosage,
      instructions: instructions || `Take 1 tablet ${timeSlot.toLowerCase()}`,
      timeSlot,
      time,
      purpose: purpose || 'Health Maintenance',
      pillColor: 'bg-teal-100 border-teal-300 text-teal-800',
      pillShape: 'Round Tablet',
    });

    setShowAddModal(false);
    setName('');
    setDosage('');
    setInstructions('');
    setPurpose('');
  };

  return (
    <CaregiverLayout activeTab="medicines">
      <div className="space-y-6">
        {/* Header & Add Button */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Medication Tracking & Adherence
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Prescription schedules and 7-day confirmation records for {patient.name}
            </p>
          </div>

          <Button
            size="md"
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={18} />}
          >
            Add Prescription
          </Button>
        </div>

        {/* 7-Day Adherence Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center text-3xl font-black">
              96%
            </div>
            <div>
              <h2 className="text-xl font-black text-white">High Medication Adherence</h2>
              <p className="text-xs text-teal-100 mt-0.5 font-medium">
                27 of 28 scheduled doses taken on time across the last 7 days.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-400 text-slate-950 px-3 py-1 rounded-full">
            ● Optimal Compliance
          </span>
        </div>

        {/* Medication Cards with 7-Day Matrix */}
        <div className="space-y-4">
          {medicines.map(med => (
            <Card key={med.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl shadow-xs">
                    💊
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {med.name} <span className="text-base text-slate-500 font-bold">({med.dosage})</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      {med.purpose} • {med.timeSlot} ({med.time})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      med.isTakenToday
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {med.isTakenToday ? `Taken at ${med.takenAt}` : 'Due Today'}
                  </span>
                </div>
              </div>

              {/* 7-Day History Row */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  7-Day Adherence Log
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, idx) => {
                    const isTaken = med.history7Days[idx] !== false;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isTaken
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-500">{day}</div>
                        <div className="text-sm font-black mt-0.5">
                          {isTaken ? '✓' : '✗'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ADD PRESCRIPTION MODAL */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Medication"
        >
          <form onSubmit={handleCreateMed} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Donepezil"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="5 mg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Cognitive Support"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="08:00 PM"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Take with dinner"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="pt-3">
              <Button size="lg" fullWidth type="submit">
                Save Medication
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </CaregiverLayout>
  );
};
