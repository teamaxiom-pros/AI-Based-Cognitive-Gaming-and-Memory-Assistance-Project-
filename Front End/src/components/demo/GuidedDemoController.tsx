import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Zap,
  Minimize2,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Brain,
  ShieldCheck,
} from 'lucide-react';

export interface DemoStepItem {
  number: number;
  title: string;
  category: string;
  route: string;
  mode: 'patient' | 'caregiver';
  judgeTalkingPoint: string;
  keyFeature: string;
}

export const demoStepsList: DemoStepItem[] = [
  {
    number: 1,
    title: 'Elderly-Friendly Onboarding',
    category: 'Onboarding & Profile',
    route: '/onboarding/profile',
    mode: 'patient',
    judgeTalkingPoint: 'Asha Sharma (68, Guwahati, Assam) is set up with mild cognitive support and daughter Priya Sharma as primary caregiver.',
    keyFeature: '6-Step accessible wizard with voice prompts',
  },
  {
    number: 2,
    title: 'Accessibility & NER Settings',
    category: 'Accessibility',
    route: '/settings',
    mode: 'patient',
    judgeTalkingPoint: 'Elderly accessibility: 18px+ text scaling, high-contrast borders, voice guidance, and native Assamese (অসমীয়া) localization.',
    keyFeature: 'WCAG AAA elderly-first accessibility',
  },
  {
    number: 3,
    title: 'Initial Cognitive Assessment',
    category: 'Screening',
    route: '/assessment/intro',
    mode: 'patient',
    judgeTalkingPoint: '5 gentle screening tasks: Day orientation, Assam cultural items (Tea, Japi), visual flower search, pattern rhythm, and delayed recall.',
    keyFeature: 'Non-diagnostic engagement evaluation',
  },
  {
    number: 4,
    title: 'Assessment Result & Score',
    category: 'Cognitive Evaluation',
    route: '/assessment/result',
    mode: 'patient',
    judgeTalkingPoint: 'Comprehensive scoring (91% overall) evaluating Orientation (100%), Attention (100%), Memory (85%), and Sequencing (80%).',
    keyFeature: 'Domain-specific score breakdowns',
  },
  {
    number: 5,
    title: 'AI Cognitive Profile',
    category: 'AI Synthesis',
    route: '/assessment/result',
    mode: 'patient',
    judgeTalkingPoint: 'AI Clinical synthesis identifies high visual attention with mild sequence latency, avoiding stressful medical labels.',
    keyFeature: 'Supportive AI observational profile',
  },
  {
    number: 6,
    title: 'Personalized Daily Plan',
    category: 'Personalization',
    route: '/home',
    mode: 'patient',
    judgeTalkingPoint: 'Generates daily wellbeing rings and custom-tailored activity recommendations for Asha on her Patient Home.',
    keyFeature: 'Daily vitality status & audio briefing',
  },
  {
    number: 7,
    title: 'Assam Heritage Cognitive Game',
    category: 'Cognitive Gaming',
    route: '/activities/memory-match',
    mode: 'patient',
    judgeTalkingPoint: 'Fully playable Assam Heritage Memory Match with 3D card flips, Web Audio feedback chimes, and victory confetti.',
    keyFeature: 'Culturally familiar NER stimuli (Kaziranga, Japi)',
  },
  {
    number: 8,
    title: 'Memory Assistance & Voice Notes',
    category: 'Reminiscence Support',
    route: '/memory',
    mode: 'patient',
    judgeTalkingPoint: 'Family cards for daughter Priya Sharma & grandson Rohan with spoken audio narration and familiar Assam places.',
    keyFeature: 'Spoken memory notes & reminiscence quiz',
  },
  {
    number: 9,
    title: 'Medicine Reminder & Adherence',
    category: 'Health Management',
    route: '/medicines',
    mode: 'patient',
    judgeTalkingPoint: 'Interactive prescriptions (Donepezil, Amlodipine) with 1-click "Mark as Taken" updating caregiver logs in real time.',
    keyFeature: 'Visual pill guides & live adherence sync',
  },
  {
    number: 10,
    title: 'Daily Structured Routine',
    category: 'Daily Independence',
    route: '/routine',
    mode: 'patient',
    judgeTalkingPoint: 'Morning, afternoon, and evening routine checklist maintaining temporal orientation and structure.',
    keyFeature: 'Temporal timeline with checkoffs',
  },
  {
    number: 11,
    title: 'Axiom AI Voice Assistant',
    category: 'AI Assistant',
    route: '/assistant',
    mode: 'patient',
    judgeTalkingPoint: 'Context-aware AI voice assistant with animated soundwaves answering questions on Priya, medicines, and weather in Guwahati.',
    keyFeature: 'Multimodal voice & text with prompt chips',
  },
  {
    number: 12,
    title: 'Caregiver Command Center',
    category: 'Caregiver Portal',
    route: '/caregiver/dashboard',
    mode: 'caregiver',
    judgeTalkingPoint: 'Primary caregiver Priya Sharma monitors 4 vitality tiles, 7-day activity chart, and real-time medication alerts.',
    keyFeature: 'Live clinical monitoring & alerts center',
  },
  {
    number: 13,
    title: 'Updated AI Clinical Insight',
    category: 'Clinical Intelligence',
    route: '/caregiver/dashboard',
    mode: 'caregiver',
    judgeTalkingPoint: 'Dynamic observation: "Recognition performance improved compared with previous session" & printable report generator.',
    keyFeature: 'Interconnected AI observation & PDF reports',
  },
];

export const GuidedDemoController: React.FC = () => {
  const { currentRoute, userMode, setUserMode, navigate, simulatePatientActions } = useApp();
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStepIdx = demoStepsList.findIndex(s => s.route === currentRoute);
  const currentStep = currentStepIdx >= 0 ? demoStepsList[currentStepIdx] : demoStepsList[0];
  const stepNumber = currentStepIdx >= 0 ? currentStepIdx + 1 : 1;

  const goToStep = (index: number) => {
    const target = demoStepsList[index];
    if (target.mode !== userMode) {
      setUserMode(target.mode);
    }
    navigate(target.route);
  };

  const handlePrev = () => {
    const nextIdx = currentStepIdx > 0 ? currentStepIdx - 1 : demoStepsList.length - 1;
    goToStep(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = currentStepIdx < demoStepsList.length - 1 ? currentStepIdx + 1 : 0;
    goToStep(nextIdx);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-white font-bold text-xs border border-teal-500 shadow-2xl flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md animate-scale-up"
      >
        <Sparkles size={16} className="text-amber-400" />
        <span>SIH Demo Guide: Step {stepNumber}/13</span>
        <Maximize2 size={14} className="text-slate-400" />
      </button>
    );
  }

  return (
    <aside aria-label="SIH Demonstration Controller" className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-4xl w-full">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-3.5 sm:p-4 border border-teal-500/80 shadow-2xl space-y-2.5 animate-slide-up">
        {/* Top Control Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px] border border-teal-500/40 uppercase tracking-wider">
              Step {stepNumber} of 13 • {currentStep.category}
            </span>
            <h4 className="font-extrabold text-sm text-white truncate max-w-[200px] sm:max-w-xs">
              {currentStep.title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 1-Click Live Patient Sync Simulator */}
            <button
              onClick={simulatePatientActions}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              title="Simulate Asha completing games and taking morning medicine"
            >
              <Zap size={13} className="text-amber-300" />
              <span className="hidden sm:inline">Simulate Live Sync</span>
            </button>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Minimize guide bar"
            >
              <Minimize2 size={15} />
            </button>
          </div>
        </div>

        {/* Judge Pitch & Key Value Statement */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 text-slate-300 leading-relaxed font-medium">
            <strong className="text-teal-300">Judge Talking Point:</strong> {currentStep.judgeTalkingPoint}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-teal-600/30"
            >
              <span>Next Step</span> <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
