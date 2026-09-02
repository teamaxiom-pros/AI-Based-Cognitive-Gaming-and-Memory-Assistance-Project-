import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { Brain, Sparkles, Heart, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const AssessmentIntro: React.FC = () => {
  const { t, navigate, speakText } = useApp();

  const introText = "Welcome to your gentle brain check-in. We will play five friendly activities together so Axiom can personalize your daily games and memory support. There is no time pressure, and every effort is celebrated.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-[#F8FAFC] to-white flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full space-y-8 my-auto">
        {/* Header Badge & Icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} className="text-teal-700" />
            Personalized Cognitive Baseline
          </div>

          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-600/20">
            <Brain size={48} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('assessment.title')}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            {t('assessment.subtitle')}
          </p>

          <SpeechSpeaker textToSpeak={introText} label="Listen to Instructions" size="lg" />
        </div>

        {/* Reassuring Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center p-5 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto text-2xl">
              🧘
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Stress</h3>
            <p className="text-xs text-slate-500 font-medium">Take all the time you need. There are no right or wrong judgments.</p>
          </Card>

          <Card className="text-center p-5 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl">
              🌸
            </div>
            <h3 className="font-bold text-slate-900 text-base">NER Cultural</h3>
            <p className="text-xs text-slate-500 font-medium">Familiar symbols from Assam and North Eastern heritage.</p>
          </Card>

          <Card className="text-center p-5 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl">
              🎯
            </div>
            <h3 className="font-bold text-slate-900 text-base">5 Short Tasks</h3>
            <p className="text-xs text-slate-500 font-medium">Takes only 3 to 4 minutes to create your tailored daily plan.</p>
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
            Start Gentle Brain Activities
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center font-medium">
            <ShieldCheck size={16} className="text-teal-600" />
            {t('common.medicalDisclaimer')}
          </div>
        </div>
      </div>
    </div>
  );
};
