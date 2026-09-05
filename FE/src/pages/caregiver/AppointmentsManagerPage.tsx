import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Calendar, Plus, MapPin, Clock, Bell, User, CheckCircle2 } from 'lucide-react';

export const AppointmentsManagerPage: React.FC = () => {
  const { appointments, addAppointment, patient, showToast } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('Guwahati Medical College & Hospital (GMCH)');
  const [dateTime, setDateTime] = useState('');
  const [time, setTime] = useState('10:30 AM');
  const [location, setLocation] = useState('Dispur, Guwahati');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName) return;

    addAppointment({
      id: `apt-${Date.now()}`,
      doctorName,
      specialty: specialty || 'Specialist Consultation',
      clinic,
      dateTime: dateTime || 'Upcoming Consultation',
      time,
      location,
      notes: notes || 'Quarterly review',
      reminderEnabled: true,
    });

    setShowAddModal(false);
    setDoctorName('');
    setSpecialty('');
    setNotes('');
  };

  return (
    <CaregiverLayout activeTab="appointments">
      <div className="space-y-6">
        {/* Header & Add Button */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Doctor Appointments & Clinical Visits
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Scheduled clinical check-ups and cognitive consultations for {patient.name}
            </p>
          </div>

          <Button
            size="md"
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={18} />}
          >
            Add Appointment
          </Button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map(apt => (
            <Card key={apt.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-2xl shadow-xs">
                    🩺
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {apt.doctorName}
                    </h3>
                    <p className="text-sm text-indigo-700 font-bold">{apt.specialty}</p>
                    <p className="text-xs text-slate-500 font-medium">{apt.clinic}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Calendar size={16} className="text-indigo-600" /> {apt.dateTime}
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                    <Clock size={14} /> {apt.time}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1 text-slate-700">
                  <MapPin size={16} className="text-teal-600 flex-shrink-0" />
                  <span>{apt.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Bell size={12} /> SMS & Audio Reminder Active
                  </span>
                </div>
              </div>

              {apt.notes && (
                <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-600 border border-slate-200/70">
                  <strong>Clinical Note:</strong> {apt.notes}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* ADD APPOINTMENT MODAL */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Schedule Doctor Appointment"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. N. Barua"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  placeholder="Neurology"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  value={clinic}
                  onChange={e => setClinic(e.target.value)}
                  placeholder="GMCH Guwahati"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  placeholder="Next Tuesday, Aug 18"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="10:30 AM"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Purpose & Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Follow-up on memory exercises and Donepezil evaluation"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 h-20"
              />
            </div>

            <div className="pt-3">
              <Button size="lg" fullWidth type="submit">
                Confirm Appointment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </CaregiverLayout>
  );
};
