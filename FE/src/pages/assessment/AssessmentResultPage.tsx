import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gamesLibrary } from '../../data/gamesLibraryData';
import { Button } from '../../components/common/Button';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import {
  Sparkles,
  Award,
  Brain,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Terminal,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Activity,
  Layers,
  Target,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssessmentResultPage: React.FC = () => {
  const { t, navigate, assessmentResult, speakText } = useApp();
  const [showDiagnosticDrawer, setShowDiagnosticDrawer] = useState(false);

  useEffect(() => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}

    if (assessmentResult?.aiSummary) {
      speakText(`${t('assessment.resultsTitle')}. ${assessmentResult.aiSummary}`);
    }
  }, []);

  const domains = assessmentResult?.domainScores
    ? Object.values(assessmentResult.domainScores)
    : [];

  const focusDomain = assessmentResult?.focusDomain || 'memory';
  const recommendedGameId = assessmentResult?.recommendedActivity || 'memory-match';
  const recommendedDifficulty = assessmentResult?.recommendedDifficulty || 1;

  const primaryGame = gamesLibrary.find(
    g => g.id === recommendedGameId || `game-${g.id}` === recommendedGameId || g.id === 'memory-match'
  ) || gamesLibrary[0];

  const domainLabels: Record<string, { label: string; icon: any }> = {
    memory: { label: t('assessment.tasks.task1.title') || 'Memory & Retention', icon: Brain },
    attention: { label: t('assessment.tasks.task4.title') || 'Visual Attention', icon: Target },
    processing_speed: { label: t('assessment.tasks.task7.title') || 'Processing Speed', icon: Zap },
    executive_function: { label: t('assessment.tasks.task10.title') || 'Executive Function', icon: Layers },
    recognition: { label: t('assessment.tasks.task5.title') || 'Object Recognition', icon: Award },
    orientation: { label: 'Context & Orientation', icon: Clock },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-[#F8FAFC] to-white flex flex-col p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
            <Award size={36} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-black text-teal-800">
              <Activity size={14} /> {t('assessment.calibrated') || 'Cognitive Baseline Established'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('assessment.resultsTitle') || 'Your Axiom Cognitive Baseline'}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
            {assessmentResult?.aiSummary ||
              'Your initial performance baseline has been calculated from your real interactive responses.'}
          </p>

          <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs text-teal-900 font-semibold flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-teal-700 flex-shrink-0" />
            <span>{t('assessment.disclaimer')}</span>
          </div>

          <SpeechSpeaker
            textToSpeak={assessmentResult?.aiSummary || 'Your Axiom Cognitive Baseline is ready!'}
            label={t('accessibility.voiceGuidance')}
          />
        </div>

        {/* PRIMARY RECOMMENDATION HERO CARD */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-amber-200 uppercase tracking-wider">
                <Sparkles size={14} />
                Focus: {focusDomain.replace('_', ' ').toUpperCase()}
              </div>
              <span className="text-xs font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-full">
                {t('games.level')} {recommendedDifficulty}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 flex-shrink-0">
                {primaryGame.icon || '🎮'}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{primaryGame.title}</h3>
                <p className="text-xs sm:text-sm text-teal-100 leading-snug">
                  Calibrated for gentle practice in {focusDomain.replace('_', ' ')} at Level {recommendedDifficulty}.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                fullWidth
                variant="primary"
                onClick={() => navigate(`/activities/${primaryGame.id}?level=${recommendedDifficulty}`)}
                icon={<Play size={18} />}
                className="bg-white hover:bg-slate-100 text-teal-900 font-black shadow-lg"
              >
                {t('home.startTodayActivity')} ({t('games.level')} {recommendedDifficulty})
              </Button>
            </div>
          </div>
        </div>

        {/* Cognitive Domain Performance Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Brain className="text-teal-600" size={22} />
              {t('caregiver.cognitiveScore') || 'Cognitive Domain Performance'}
            </h2>
            <span className="text-xs font-black bg-teal-50 text-teal-800 px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
              Overall: {assessmentResult?.overallScore || 80}%
            </span>
          </div>

          <div className="space-y-4">
            {domains.map((item, idx) => {
              const meta = domainLabels[item.domain] || { label: item.domain, icon: Activity };
              const Icon = meta.icon;
              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="capitalize text-slate-900 flex items-center gap-2">
                      <Icon size={16} className="text-teal-600" />
                      <span>{meta.label}</span>
                      {item.taskCount > 0 && (
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({item.correctCount}/{item.taskCount})
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                          item.status === 'Strong'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Good'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-slate-800 font-black">{item.score}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.score >= 80
                          ? 'bg-teal-600'
                          : item.score >= 65
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{item.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            size="xl"
            fullWidth
            onClick={() => navigate('/home')}
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            {t('common.home')}
          </Button>

          <button
            onClick={() => navigate('/assessment/intro')}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-all"
          >
            <RotateCcw size={16} /> {t('assessment.reassessNow') || 'Retest Assessment'}
          </button>
        </div>

        {/* DEVELOPER DIAGNOSTIC MATRIX */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowDiagnosticDrawer(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 px-3 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-teal-700" />
              <span>Axiom Diagnostic Matrix • Task Trace</span>
            </div>
            {showDiagnosticDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDiagnosticDrawer && (
            <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono space-y-3 border border-slate-800 shadow-inner overflow-x-auto">
              <div>
                <span className="text-teal-400 font-bold">Session ID:</span> {assessmentResult?.sessionId}
              </div>
              <div>
                <span className="text-teal-400 font-bold">Focus Domain:</span> {assessmentResult?.focusDomain}
              </div>
              <div>
                <span className="text-teal-400 font-bold">Raw Tasks Logged:</span> {assessmentResult?.taskResponses?.length || 0}
              </div>
              <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl overflow-x-auto">
                {JSON.stringify(assessmentResult?.taskResponses, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

