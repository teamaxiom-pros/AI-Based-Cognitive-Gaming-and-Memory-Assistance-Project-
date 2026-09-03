import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { Brain, Sparkles, Heart, Clock, ArrowRight, ShieldCheck, Activity, Smile } from 'lucide-react';

export const AssessmentIntro: React.FC = () => {
  const { t, navigate, speakText } = useApp();

  const introText = "Welcome to your gentle cognitive check-in. We will play a few simple activities together so Axiom can understand your current performance and calibrate your daily games. There is no time pressure, and every effort helps personalize your experience.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-[#F8FAFC] to-white flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-8 my-auto">
        {/* Header Badge & Icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} className="text-teal-700" />
            Personalized Cognitive Calibration
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-600/20">
            <Brain size={44} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Initial Cognitive Assessment
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            A short sequence of interactive mini-activities to help Axiom tailor your daily memory and attention games.
          </p>

          <SpeechSpeaker textToSpeak={introText} label="Listen to Instructions" size="lg" />
        </div>

        {/* 3 Reassuring Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center p-5 space-y-2 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto text-2xl">
              🧘
            </div>
            <h3 className="font-bold text-slate-900 text-base">Comfortable Pace</h3>
            <p className="text-xs text-slate-500 font-medium">Take all the time you need. There is no rush or pass/fail judgment.</p>
          </Card>

          <Card className="text-center p-5 space-y-2 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto text-2xl">
              🌸
            </div>
            <h3 className="font-bold text-slate-900 text-base">Familiar Stimuli</h3>
            <p className="text-xs text-slate-500 font-medium">Clear, recognizable everyday symbols and cultural items.</p>
          </Card>

          <Card className="text-center p-5 space-y-2 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-2xl">
              🎯
            </div>
            <h3 className="font-bold text-slate-900 text-base">Interactive Activities</h3>
            <p className="text-xs text-slate-500 font-medium">Takes about 5 to 7 minutes to establish your baseline profile.</p>
          </Card>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <Button
            size="xl"
            fullWidth
            onClick={() => navigate('/assessment/runner')}
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            Start Cognitive Activities
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center font-medium pt-1">
            <ShieldCheck size={16} className="text-teal-600 flex-shrink-0" />
            <span>This assessment is designed to personalize Axiom activities and does not provide a medical diagnosis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
