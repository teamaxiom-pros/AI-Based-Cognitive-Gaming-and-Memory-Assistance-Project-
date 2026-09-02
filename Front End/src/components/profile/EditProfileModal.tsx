import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  avatarLibrary,
  genderOptionsList,
  getDefaultAvatarForGender,
  GenderOption,
} from '../../data/avatarsData';
import { Language } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { X, Check, Upload, User, Image, Sparkles } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { patient, updatePatient, showToast, setLanguage } = useApp();

  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState<GenderOption>(patient.gender || 'Prefer not to say');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(patient.photoUrl);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [location, setLocation] = useState(patient.location);
  const [selectedLang, setSelectedLang] = useState<Language>(patient.language);

  if (!isOpen) return null;

  const handleGenderChange = (newGender: GenderOption) => {
    soundEffects.playSoftClick();
    setGender(newGender);
    // If not using a custom photo, suggest the appropriate avatar set
    if (!showCustomInput && !patient.customPhotoUploaded) {
      setSelectedAvatarUrl(getDefaultAvatarForGender(newGender));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSoftClick();

    const finalPhotoUrl = showCustomInput && customUrl.trim() ? customUrl.trim() : selectedAvatarUrl;

    updatePatient({
      name: name.trim() || patient.name,
      age: Number(age) || patient.age,
      gender,
      photoUrl: finalPhotoUrl,
      location: location.trim() || patient.location,
      language: selectedLang,
      customPhotoUploaded: showCustomInput && !!customUrl.trim(),
    });

    setLanguage(selectedLang);
    showToast('Profile & avatar updated everywhere.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Personalize Patient Profile</h2>
              <p className="text-xs text-teal-200 font-medium">
                Single source of truth • Updates across all patient & caregiver views
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Avatar Preview */}
          <div className="flex items-center gap-4 p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
            <img
              src={showCustomInput && customUrl ? customUrl : selectedAvatarUrl}
              alt="Selected Avatar"
              className="w-18 h-18 rounded-2xl object-cover ring-4 ring-teal-500/40 shadow-sm flex-shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src = avatarLibrary[0].url;
              }}
            />
            <div className="space-y-1">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Current Active Avatar
              </div>
              <div className="text-base font-black text-slate-900">
                {name || 'Asha Sharma'}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Gender: {gender} • Age {age}
              </div>
            </div>
          </div>

          {/* Name & Age Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm font-bold text-slate-900"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                min={40}
                max={110}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Gender Selection (CRITICAL: Explicit selection, never inferred from name) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gender (Optional & Self-Selected)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Never inferred from name
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {genderOptionsList.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleGenderChange(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer text-center ${
                    gender === opt.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Selector Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Choose Profile Avatar / Photo
              </label>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer underline"
              >
                {showCustomInput ? 'Select from Avatars' : '+ Custom Photo URL'}
              </button>
            </div>

            {showCustomInput ? (
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700">
                  Custom Profile Photo Image URL
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Real photos will always be used regardless of gender selection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                {avatarLibrary.map(av => {
                  const isSelected = selectedAvatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setSelectedAvatarUrl(av.url);
                        setShowCustomInput(false);
                      }}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group aspect-square ${
                        isSelected
                          ? 'border-teal-600 ring-4 ring-teal-100 shadow-md scale-102'
                          : 'border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Location & NER Region
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Guwahati, Assam"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm font-bold text-slate-900"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Preferred Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'as', label: 'অসমীয়া (Assamese)' },
                { id: 'bn', label: 'বাংলা (Bengali)' },
                { id: 'hi', label: 'हिन्दी (Hindi)' },
              ].map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLang(l.id as Language)}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === l.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Save CTA */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-sm transition-colors cursor-pointer shadow-lg shadow-teal-600/20 active:scale-98"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
