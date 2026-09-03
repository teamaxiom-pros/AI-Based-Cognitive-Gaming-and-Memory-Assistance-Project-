import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Settings, Bell, Shield, User, Users, Mail, Phone, Check, Database, RefreshCw, Cloud, Activity, Copy } from 'lucide-react';
import { SUPABASE_URL, getSupabaseHost } from '../../services/supabaseClient';
import { DatabaseStatusModal } from '../../components/common/DatabaseStatusModal';

export const CaregiverSettingsPage: React.FC = () => {
  const { caregivers, patient, showToast } = useApp();
  const primaryCaregiver = caregivers[0];

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [missedMedAlert, setMissedMedAlert] = useState(true);
  const [cognitiveShiftAlert, setCognitiveShiftAlert] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showDbModal, setShowDbModal] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    showToast(`Care team invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <CaregiverLayout activeTab="settings">
      <div className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
          <h1 className="text-2xl font-black text-slate-900">
            Caregiver Portal Settings
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage your caregiver profile, alert delivery preferences, and clinical collaboration.
          </p>
        </div>

        {/* Profile Details */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            Caregiver Account Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase">Name</span>
              <strong className="text-slate-900 text-sm">{primaryCaregiver.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase">Relationship</span>
              <strong className="text-slate-900 text-sm">{primaryCaregiver.relationship}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase">Phone Number</span>
              <strong className="text-slate-900 text-sm">{primaryCaregiver.phone}</strong>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell className="text-amber-500" size={20} />
            Alert Delivery & Thresholds
          </h3>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Missed Medication SMS Alert</div>
                <div className="text-xs text-slate-500">Send instant SMS if a scheduled dose is delayed by 30+ minutes</div>
              </div>
              <input
                type="checkbox"
                checked={missedMedAlert}
                onChange={e => setMissedMedAlert(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Cognitive Baseline Shift Notification</div>
                <div className="text-xs text-slate-500">Weekly email recap of memory and attention score movements</div>
              </div>
              <input
                type="checkbox"
                checked={cognitiveShiftAlert}
                onChange={e => setCognitiveShiftAlert(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* Invite Clinical Collaborator */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="text-teal-600" size={20} />
            Collaborative Care Team
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <strong className="text-slate-900 text-sm block">Dr. N. Barua, MD</strong>
                <span className="text-slate-500">Consultant Neurologist (GMCH) • dr.barua@gmch.gov.in</span>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full">
                Clinical Access
              </span>
            </div>

            <form onSubmit={handleInvite} className="flex gap-2 pt-2">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="clinician@hospital.gov.in"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              />
              <Button size="sm" type="submit">
                Invite Clinician
              </Button>
            </form>
          </div>
        </Card>

        {/* Supabase Cloud Database & Storage */}
        <Card className="p-6 space-y-4 border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="text-teal-600" size={20} />
              Supabase Cloud Database & Storage
            </h3>
            <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Live Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Cloud Host</span>
              <strong className="text-slate-900 text-sm break-all font-mono">{getSupabaseHost()}</strong>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                <Activity size={12} /> Real-time Postgres channel ready
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Active Tables</span>
              <strong className="text-slate-900 text-sm">8 Synchronized Models</strong>
              <p className="text-[11px] text-slate-500">Patients, Assessments, Games, Meds, Routines, Alerts</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDbModal(true)}
              className="flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Database size={15} className="text-teal-600" />
              Manage Cloud Sync & SQL Schema
            </Button>
          </div>
        </Card>
      </div>

      <DatabaseStatusModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </CaregiverLayout>
  );
};
