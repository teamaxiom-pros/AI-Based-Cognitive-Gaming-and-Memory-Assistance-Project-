import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import {
  Type,
  User,
  Heart,
  Pill,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { TextSize, ContrastMode, GenderOption } from '../../types';
import {
  avatarLibrary,
  genderOptionsList,
  getDefaultAvatarForGender,
} from '../../data/avatarsData';

export const OnboardingFlow: React.FC = () => {
  const {
    t,
    navigate,
    patient,
    updatePatient,
    accessibility,
    updateAccessibility,
    medicines,
    toggleMedicineTaken,
    routineItems,
    speakText,
  } = useApp();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Local form state
  const [profileName, setProfileName] = useState(patient.name);
  const [profileAge, setProfileAge] = useState(patient.age);
  const [profileGender, setProfileGender] = useState<GenderOption>(patient.gender || 'Female');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(patient.photoUrl);
  const [profileLocation, setProfileLocation] = useState(patient.location);
  const [caregiverName, setCaregiverName] = useState('Priya Sharma');
  const [caregiverRelation, setCaregiverRelation] = useState('Daughter');
  const [caregiverPhone, setCaregiverPhone] = useState('+91 98765 43211');
  const [hasMeds, setHasMeds] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(patient.interests);

  const interestOptions = [
    { id: 'Gardening', label: 'Backyard Gardening 🌿', icon: '🌿' },
    { id: 'Assam Tea Tasting', label: 'Assam Tea Tasting ☕', icon: '☕' },
    { id: 'Traditional Weaving', label: 'Silk & Handloom Weaving 🧵', icon: '🧵' },
    { id: 'Spiritual Music', label: 'Temple Chants & Devotional Songs 🎵', icon: '🎵' },
    { id: 'Bihu Folklore', label: 'Bihu Folklore & Stories 📖', icon: '📖' },
    { id: 'Walking by Brahmaputra', label: 'Riverfront Evening Walks 🌅', icon: '🌅' },
  ];

  const handleNext = () => {
    if (step === 2) {
      updatePatient({
        name: profileName,
        age: Number(profileAge),
        gender: profileGender,
        photoUrl: profileAvatarUrl,
        location: profileLocation,
      });
    } else if (step === 6) {
      updatePatient({
        interests: selectedInterests,
      });
      // Move to initial cognitive assessment intro
      navigate('/assessment/intro');
      return;
    }
    setStep(s => Math.min(totalSteps, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/welcome');
    } else {
      setStep(s => Math.max(1, s - 1));
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6">
        {/* Top Progress & Back */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-base cursor-pointer py-1 px-2 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
              <span>{t('common.back')}</span>
            </button>
            <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Step {step} of {totalSteps}
            </span>
          </div>

          <ProgressBar current={step} total={totalSteps} showPercentage={false} />
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 my-auto py-4">
          {/* STEP 1: ACCESSIBILITY PREFERENCES */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('accessibility.title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('accessibility.subtitle')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('accessibility.title')}. ${t('accessibility.subtitle')}`} />
              </div>

              {/* Text Size */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3">
                <label className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Type className="text-teal-600" size={22} />
                  {t('accessibility.textSize')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: t('accessibility.textSizeNormal'), sample: 'Aa' },
                    { id: 'large', label: t('accessibility.textSizeLarge'), sample: 'Aa' },
                    { id: 'xlarge', label: t('accessibility.textSizeXLarge'), sample: 'Aa' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        updateAccessibility({ textSize: opt.id as TextSize });
                        speakText(`Text size set to ${opt.label}`);
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        accessibility.textSize === opt.id
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 ring-2 ring-teal-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`font-black ${opt.id === 'normal' ? 'text-xl' : opt.id === 'large' ? 'text-2xl' : 'text-3xl'}`}>
                        {opt.sample}
                      </div>
                      <div className="text-xs mt-1 font-semibold">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3">
                <label className="font-bold text-lg text-slate-900">
                  {t('accessibility.contrast')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'normal', label: t('accessibility.contrastNormal'), desc: 'Soft & Gentle' },
                    { id: 'high', label: t('accessibility.contrastHigh'), desc: 'Bold & High Contrast' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateAccessibility({ contrast: opt.id as ContrastMode })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        accessibility.contrast === opt.id
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 ring-2 ring-teal-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-base">{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ABOUT YOU */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('onboarding.step3Title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('onboarding.profilePrompt')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('onboarding.step3Title')}. ${t('onboarding.profilePrompt')}`} />
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('onboarding.nameLabel')}
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                    placeholder="e.g. Asha Sharma"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('onboarding.ageLabel')}
                    </label>
                    <input
                      type="number"
                      value={profileAge}
                      onChange={e => setProfileAge(Number(e.target.value))}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                      placeholder="68"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('onboarding.locationLabel')}
                    </label>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={e => setProfileLocation(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                      placeholder="Guwahati, Assam"
                    />
                  </div>
                </div>

                {/* Explicit Gender Selection (Never inferred from name) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-slate-700">
                      Gender (Optional)
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      Never inferred from name
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {genderOptionsList.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setProfileGender(opt.id);
                          setProfileAvatarUrl(getDefaultAvatarForGender(opt.id));
                        }}
                        className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer text-center ${
                          profileGender === opt.id
                            ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-100'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Select Profile Avatar
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-36 overflow-y-auto p-1">
                    {avatarLibrary.map(av => {
                      const isSelected = profileAvatarUrl === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setProfileAvatarUrl(av.url)}
                          className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-teal-600 ring-4 ring-teal-100 scale-102 shadow-sm'
                              : 'border-slate-200 hover:border-teal-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAREGIVER CONNECTION */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('onboarding.step4Title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('onboarding.caregiverPrompt')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('onboarding.step4Title')}. ${t('onboarding.caregiverPrompt')}`} />
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('onboarding.caregiverName')}
                  </label>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={e => setCaregiverName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                    placeholder="e.g. Vikram Sharma"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('onboarding.caregiverRelation')}
                    </label>
                    <input
                      type="text"
                      value={caregiverRelation}
                      onChange={e => setCaregiverRelation(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                      placeholder="Son"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('onboarding.caregiverPhone')}
                    </label>
                    <input
                      type="text"
                      value={caregiverPhone}
                      onChange={e => setCaregiverPhone(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 text-lg font-bold text-slate-900"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MEDICINES */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('onboarding.step5Title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('onboarding.medicinesPrompt')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('onboarding.step5Title')}. ${t('onboarding.medicinesPrompt')}`} />
              </div>

              {/* Yes / No Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setHasMeds(true)}
                  className={`p-4 rounded-2xl border-2 font-bold text-lg text-center transition-all cursor-pointer ${
                    hasMeds
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {t('onboarding.medicinesYes')}
                </button>
                <button
                  type="button"
                  onClick={() => setHasMeds(false)}
                  className={`p-4 rounded-2xl border-2 font-bold text-lg text-center transition-all cursor-pointer ${
                    !hasMeds
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {t('onboarding.medicinesNo')}
                </button>
              </div>

              {hasMeds && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-700">Preloaded Prescriptions:</div>
                  {medicines.map(med => (
                    <div
                      key={med.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                          💊
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{med.name} ({med.dosage})</div>
                          <div className="text-xs text-slate-500">{med.timeSlot} • {med.instructions}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                        {med.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: ROUTINE */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('onboarding.step6Title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('onboarding.routinePrompt')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('onboarding.step6Title')}. ${t('onboarding.routinePrompt')}`} />
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-3 max-h-[50vh] overflow-y-auto">
                {routineItems.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/70"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.time} • {item.description}</div>
                    </div>
                    <Check className="text-teal-600 flex-shrink-0" size={18} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: INTERESTS & PREFERENCES */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {t('onboarding.step7Title')}
                  </h2>
                  <p className="text-slate-600 font-medium mt-1">
                    {t('onboarding.interestsPrompt')}
                  </p>
                </div>
                <SpeechSpeaker textToSpeak={`${t('onboarding.step7Title')}. ${t('onboarding.interestsPrompt')}`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {interestOptions.map(opt => {
                  const isSelected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleInterest(opt.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-950 shadow-sm ring-2 ring-teal-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{opt.label}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Button */}
        <div className="pt-4 border-t border-slate-200/80">
          <Button
            size="xl"
            fullWidth
            onClick={handleNext}
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            {step === totalSteps ? 'Complete & Start Cognitive Screening' : t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
