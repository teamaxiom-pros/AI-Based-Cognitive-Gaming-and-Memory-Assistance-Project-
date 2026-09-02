import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { AccessibilityDrawer } from '../../components/common/AccessibilityDrawer';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { Button } from '../../components/common/Button';
import {
  User,
  HeartHandshake,
  Globe,
  Sliders,
  RotateCcw,
  Shield,
  ChevronRight,
  Brain,
} from 'lucide-react';

export const PatientSettingsPage: React.FC = () => {
  const { patient, caregivers, setUserMode, navigate, t } = useApp();
  const [showA11y, setShowA11y] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const primaryCaregiver = caregivers[0];

  return (
    <PatientLayout pageTitle="Settings & Preferences">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Profile Card with Edit Button */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-teal-500/40 shadow-sm flex-shrink-0"
            />
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-slate-900">{patient.name}</h2>
              <p className="text-sm text-slate-500 font-medium">
                Age {patient.age} • {patient.gender || 'Senior'} • {patient.location}
              </p>
              <span className="inline-block mt-1 text-xs font-bold text-teal-800 bg-teal-100 px-3 py-0.5 rounded-full">
                {patient.cognitiveBaseline}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEditProfile(true)}
            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <User size={15} />
            <span>Edit Profile & Avatar</span>
          </button>
        </div>

        {/* Large Accessible Setting Tiles */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft divide-y divide-slate-100 overflow-hidden">
          {/* Primary Caregiver */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <HeartHandshake size={24} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base">Primary Caregiver</div>
                <div className="text-xs text-slate-500">
                  {primaryCaregiver.name} ({primaryCaregiver.relationship}) • {primaryCaregiver.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div
            onClick={() => setShowLang(!showLang)}
            className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base">Language / ভাষা / भाषा</div>
                <div className="text-xs text-slate-500">Change app language</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </div>

          {showLang && (
            <div className="p-5 bg-slate-50">
              <LanguageSwitcher variant="pills" />
            </div>
          )}

          {/* Accessibility Settings */}
          <div
            onClick={() => setShowA11y(true)}
            className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sliders size={24} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base">Text Size & Contrast</div>
                <div className="text-xs text-slate-500">Adjust screen and voice assistance</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </div>

          {/* Retake Assessment */}
          <div
            onClick={() => navigate('/assessment/intro')}
            className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Brain size={24} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base">Cognitive Screening</div>
                <div className="text-xs text-slate-500">Retake the 5-step brain check-in</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </div>
        </div>

        {/* Switch to Caregiver Portal CTA */}
        <Button
          size="xl"
          fullWidth
          variant="outline"
          onClick={() => {
            setUserMode('caregiver');
            navigate('/caregiver/dashboard');
          }}
          icon={<HeartHandshake size={22} />}
        >
          Switch to Caregiver & Clinical Portal
        </Button>
      </div>

      <AccessibilityDrawer isOpen={showA11y} onClose={() => setShowA11y(false)} />
      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </PatientLayout>
  );
};
