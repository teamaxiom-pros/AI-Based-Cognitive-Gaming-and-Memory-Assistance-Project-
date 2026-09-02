import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  User,
  HeartHandshake,
  Globe,
  Sliders,
  RotateCcw,
  Wifi,
  WifiOff,
  ChevronDown,
  Brain,
  Layers,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { AccessibilityDrawer } from '../common/AccessibilityDrawer';

export const DemoToolbar: React.FC = () => {
  const {
    userMode,
    setUserMode,
    currentRoute,
    navigate,
    language,
    setLanguage,
    isOffline,
    setIsOffline,
    resetDemoData,
    simulatePatientActions,
    patient,
  } = useApp();

  const [showA11y, setShowA11y] = useState(false);
  const [showFlowMenu, setShowFlowMenu] = useState(false);

  const demoSteps = [
    { label: '1. Welcome & Lang', route: '/welcome', mode: 'patient' as const },
    { label: '2. Onboarding (6 Steps)', route: '/onboarding/profile', mode: 'patient' as const },
    { label: '3. Cognitive Assessment', route: '/assessment/intro', mode: 'patient' as const },
    { label: '4. AI Profile & Plan', route: '/assessment/result', mode: 'patient' as const },
    { label: '5. Patient Home', route: '/home', mode: 'patient' as const },
    { label: '6. Play Memory Match', route: '/activities/memory-match', mode: 'patient' as const },
    { label: '7. Play Object Recall', route: '/activities/object-recall', mode: 'patient' as const },
    { label: '8. Memory Book', route: '/memory', mode: 'patient' as const },
    { label: '9. Talk to Axiom AI', route: '/assistant', mode: 'patient' as const },
    { label: '10. Medicines & Routine', route: '/medicines', mode: 'patient' as const },
    { label: '11. Caregiver Dashboard', route: '/caregiver/dashboard', mode: 'caregiver' as const },
    { label: '12. Cognitive Analytics', route: '/caregiver/cognition', mode: 'caregiver' as const },
    { label: '13. Meds Adherence', route: '/caregiver/medicines', mode: 'caregiver' as const },
    { label: '14. Alerts Center', route: '/caregiver/alerts', mode: 'caregiver' as const },
    { label: '15. Clinical Report', route: '/caregiver/reports', mode: 'caregiver' as const },
  ];

  const currentStepIndex = demoSteps.findIndex(s => s.route === currentRoute);

  const handlePrevStep = () => {
    const nextIdx = currentStepIndex > 0 ? currentStepIndex - 1 : demoSteps.length - 1;
    const target = demoSteps[nextIdx];
    if (target.mode !== userMode) setUserMode(target.mode);
    navigate(target.route);
  };

  const handleNextStep = () => {
    const nextIdx = currentStepIndex >= 0 && currentStepIndex < demoSteps.length - 1 ? currentStepIndex + 1 : 0;
    const target = demoSteps[nextIdx];
    if (target.mode !== userMode) setUserMode(target.mode);
    navigate(target.route);
  };

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand & Demo Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide bg-teal-600/90 text-white px-2.5 py-1 rounded-lg">
              <Brain size={16} /> AXIOM
            </div>
            <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30 hidden md:inline">
              SIH 2026 NER
            </span>
          </div>

          {/* User Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setUserMode('patient')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                userMode === 'patient'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User size={14} /> Patient ({patient.name.split(' ')[0]})
            </button>
            <button
              onClick={() => setUserMode('caregiver')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                userMode === 'caregiver'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HeartHandshake size={14} /> Caregiver Portal
            </button>
          </div>

          {/* Judge Guided Step Navigator: Prev / Jump / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevStep}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowFlowMenu(!showFlowMenu)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-1 rounded-lg border border-slate-700 font-medium cursor-pointer"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Step:</span>
                <span className="font-bold text-white truncate max-w-[110px] md:max-w-[150px]">
                  {demoSteps.find(s => s.route === currentRoute)?.label || currentRoute}
                </span>
                <ChevronDown size={14} />
              </button>

              {showFlowMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Pitch Journey (3-5 Min)
                  </div>
                  {demoSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (step.mode !== userMode) setUserMode(step.mode);
                        navigate(step.route);
                        setShowFlowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer ${
                        currentRoute === step.route ? 'text-teal-400 font-bold bg-slate-800/80' : 'text-slate-300'
                      }`}
                    >
                      <span>{step.label}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{step.mode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold border border-teal-500 transition-colors cursor-pointer"
              title="Next Demo Step"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Simulation & Tools */}
          <div className="flex items-center gap-1.5">
            {/* 1-Click Patient Activity Simulator for Caregiver View */}
            <button
              onClick={simulatePatientActions}
              title="Simulate patient completing games & taking medicines"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 font-bold transition-colors cursor-pointer"
            >
              <Zap size={14} className="text-amber-400" />
              <span className="hidden xl:inline">Simulate Patient Sync</span>
            </button>

            {/* Language Quick Selector */}
            <div className="hidden lg:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {[
                { id: 'en', label: 'EN' },
                { id: 'as', label: 'অসমীয়া' },
                { id: 'bn', label: 'বাংলা' },
                { id: 'hi', label: 'हिन्दी' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id as any)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    language === l.id
                      ? 'bg-teal-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Offline Simulator */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? 'Go Online' : 'Simulate Offline in NER'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
            </button>

            {/* Accessibility Button */}
            <button
              onClick={() => setShowA11y(true)}
              title="Elderly Accessibility Settings"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Sliders size={15} />
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={resetDemoData}
              title="Reset Demo Data"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      <AccessibilityDrawer isOpen={showA11y} onClose={() => setShowA11y(false)} />
    </>
  );
};
