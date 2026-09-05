import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { assessmentTasks } from '../../data/assessmentQuestions';
import { AssessmentTaskResponse, AssessmentResult } from '../../types';
import { scoreAssessmentResponses } from '../../services/assessmentEngine';
import { apiService } from '../../services/apiService';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { soundEffects } from '../../services/soundEffects';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
  Eye,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssessmentRunner: React.FC = () => {
  const { t, navigate, speakText, setAssessmentResult, patient, saveAssessmentSession } = useApp();
  const { user } = useAuth();
  const patientId = user?.id || patient.id || '00000000-0000-0000-0000-000000000001';

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Session & Task Timing
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());
  const taskStartTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Accumulated raw responses by taskId
  const [responsesMap, setResponsesMap] = useState<Record<string, AssessmentTaskResponse>>({});

  // Active task interactive states
  const [currentChoice, setCurrentChoice] = useState<string>('');
  const [currentMultiSelect, setCurrentMultiSelect] = useState<string[]>([]);
  const [currentStepOrder, setCurrentStepOrder] = useState<string[]>([]);
  const [currentWorkingMemoryInput, setCurrentWorkingMemoryInput] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [showHintText, setShowHintText] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const currentTask = assessmentTasks[currentTaskIndex];
  const totalTasks = assessmentTasks.length;

  // Track task timer
  useEffect(() => {
    taskStartTimeRef.current = Date.now();
    setElapsedSeconds(0);
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - taskStartTimeRef.current) / 1000));
    }, 500);

    // Restore previously entered answer if navigating back
    const previous = responsesMap[currentTask?.id];
    if (previous) {
      if (Array.isArray(previous.patientAnswer)) {
        if (currentTask.type === 'step-order') {
          setCurrentStepOrder(previous.patientAnswer);
        } else if (currentTask.type === 'multi-select') {
          setCurrentMultiSelect(previous.patientAnswer);
        } else {
          setCurrentWorkingMemoryInput(previous.patientAnswer);
        }
      } else if (typeof previous.patientAnswer === 'string') {
        setCurrentChoice(previous.patientAnswer);
      }
      setHintsUsedCount(previous.hintsUsed || 0);
    } else {
      setCurrentChoice('');
      setCurrentMultiSelect([]);
      setCurrentStepOrder([]);
      setCurrentWorkingMemoryInput([]);
      setHintsUsedCount(0);
    }

    setFeedbackMessage(null);
    setShowHintText(false);

    if (currentTask) {
      speakText(currentTask.audioPromptText);
    }

    return () => clearInterval(timer);
  }, [currentTaskIndex]);

  // Record current task interaction into structured response
  const recordCurrentTaskResponse = (): AssessmentTaskResponse => {
    const responseTimeMs = Math.max(500, Date.now() - taskStartTimeRef.current);
    let isCorrect = false;
    let score = 0;
    let patientAnswer: any = null;
    let skipped = false;
    const metadata: Record<string, any> = {};

    const expectedAnswer = currentTask.expectedOptionId || currentTask.correctAnswers || '';

    switch (currentTask.type) {
      case 'multiple-choice':
      case 'timed-match':
        patientAnswer = currentChoice;
        if (!currentChoice) {
          skipped = true;
          isCorrect = false;
          score = 0;
        } else {
          isCorrect = currentChoice === currentTask.expectedOptionId;
          const speedBonus = responseTimeMs < 5000 ? 15 : responseTimeMs < 10000 ? 5 : 0;
          score = isCorrect ? Math.max(40, 85 - hintsUsedCount * 15 + speedBonus) : 0;
        }
        break;

      case 'memorize':
        patientAnswer = 'observed';
        isCorrect = true;
        score = 85;
        metadata.exposureDurationSeconds = Math.round(responseTimeMs / 1000);
        metadata.itemsShown = currentTask.memorizeItems?.map(i => i.name);
        break;

      case 'find-object':
        patientAnswer = currentChoice;
        if (!currentChoice) {
          skipped = true;
          isCorrect = false;
          score = 0;
        } else {
          isCorrect = currentChoice === currentTask.expectedOptionId;
          score = isCorrect ? Math.max(50, 100 - hintsUsedCount * 15) : 0;
        }
        metadata.target = currentTask.targetItem;
        metadata.distractorCount = currentTask.distractors?.length;
        break;

      case 'step-order':
        patientAnswer = currentStepOrder;
        if (currentStepOrder.length === 0) {
          skipped = true;
          isCorrect = false;
          score = 0;
        } else {
          const expectedSteps = currentTask.sequenceItems?.map(s => s.name) || [];
          let correctPositions = 0;
          currentStepOrder.forEach((step, idx) => {
            if (step === expectedSteps[idx]) correctPositions++;
          });
          const ratio = expectedSteps.length > 0 ? correctPositions / expectedSteps.length : 0;
          score = Math.round(ratio * 100);
          isCorrect = correctPositions === expectedSteps.length;
          metadata.submittedSequence = currentStepOrder;
          metadata.expectedSequence = expectedSteps;
        }
        break;

      case 'sequence-choice':
        patientAnswer = currentWorkingMemoryInput.length > 0 ? currentWorkingMemoryInput : currentChoice;
        if (!patientAnswer || (Array.isArray(patientAnswer) && patientAnswer.length === 0)) {
          skipped = true;
          isCorrect = false;
          score = 0;
        } else {
          if (Array.isArray(patientAnswer)) {
            const expectedSeq = currentTask.sequenceItems?.map(s => s.name) || [];
            const isMatch = patientAnswer.join(',') === expectedSeq.join(',');
            isCorrect = isMatch;
            score = isMatch ? 100 : Math.max(0, 50 - (expectedSeq.length - patientAnswer.length) * 20);
          } else {
            isCorrect = currentChoice === currentTask.expectedOptionId;
            score = isCorrect ? 100 : 0;
          }
        }
        break;

      case 'multi-select':
        patientAnswer = currentMultiSelect;
        if (currentMultiSelect.length === 0) {
          skipped = true;
          isCorrect = false;
          score = 0;
        } else {
          const expected = currentTask.correctAnswers || [];
          const correctHits = currentMultiSelect.filter(id => expected.includes(id)).length;
          const falseSelections = currentMultiSelect.filter(id => !expected.includes(id)).length;
          const missedItems = expected.length - correctHits;

          const rawAccuracy = expected.length > 0 ? (correctHits / expected.length) - (falseSelections * 0.25) : 0;
          score = Math.max(0, Math.min(100, Math.round(rawAccuracy * 100)));
          isCorrect = correctHits === expected.length && falseSelections === 0;

          metadata.recalledItems = currentMultiSelect;
          metadata.correctHits = correctHits;
          metadata.falseSelections = falseSelections;
          metadata.missedItems = missedItems;
        }
        break;

      default:
        patientAnswer = currentChoice;
        isCorrect = currentChoice === currentTask.expectedOptionId;
        score = isCorrect ? 100 : 0;
        break;
    }

    return {
      taskId: currentTask.id,
      domain: currentTask.domain,
      taskTitle: currentTask.taskTitle,
      taskType: currentTask.type,
      question: currentTask.instruction,
      difficultyWeight: currentTask.difficultyWeight || 1,
      expectedAnswer,
      patientAnswer: patientAnswer ?? 'skipped',
      isCorrect,
      score,
      responseTimeMs,
      hintsUsed: hintsUsedCount,
      skipped,
      metadata,
      timestamp: new Date().toISOString(),
    };
  };

  const handleNext = async () => {
    soundEffects.playSoftClick();
    const taskResponse = recordCurrentTaskResponse();
    const nextMap = { ...responsesMap, [currentTask.id]: taskResponse };
    setResponsesMap(nextMap);

    if (currentTaskIndex < totalTasks - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final submission to Axiom AI
      const allResponses = assessmentTasks.map(t => nextMap[t.id] || {
        taskId: t.id,
        domain: t.domain,
        taskTitle: t.taskTitle,
        isCorrect: false,
        score: 0,
        responseTimeMs: 3000,
        hintsUsed: 0,
        skipped: true,
      });

      setIsEvaluating(true);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      try {
        // Send raw responses to Backend -> Axiom AI
        const aiResult = await apiService.submitInitialAssessment(
          patientId,
          allResponses
        );

        setAssessmentResult(aiResult);
        localStorage.setItem('axiom_assessment_result_v2', JSON.stringify(aiResult));
        localStorage.setItem('axiom_assessment_result', JSON.stringify(aiResult));

        if (saveAssessmentSession && aiResult) {
          await saveAssessmentSession(aiResult);
        }
      } catch (err) {
        console.warn('[AssessmentRunner] Fallback scoring used:', err);
        const session = scoreAssessmentResponses(
          patientId,
          allResponses,
          sessionStartTimeRef.current,
          new Date().toISOString()
        );

        const resultObj: AssessmentResult = {
          sessionId: session.sessionId,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          overallScore: session.overallScore,
          domainScores: session.domainScores,
          aiSummary: session.aiSummary || '',
          recommendedActivities: session.recommendedActivities || [],
          clinicalNotes: session.clinicalNotes || '',
          taskResponses: session.taskResponses,
          focusDomain: session.focusDomain || 'memory',
          recommendedActivity: session.recommendedActivities?.[0] || 'memory-match',
          recommendedDifficulty: 1,
        };

        setAssessmentResult(resultObj);
        if (saveAssessmentSession) {
          await saveAssessmentSession(resultObj);
        }
      } finally {
        setIsEvaluating(false);
        navigate('/assessment/result');
      }

    }
  };

  const handleBack = () => {
    if (currentTaskIndex === 0) {
      navigate('/assessment/intro');
    } else {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleToggleMultiChoice = (id: string) => {
    soundEffects.playSoftClick();
    setCurrentMultiSelect(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleStepOrder = (stepName: string) => {
    soundEffects.playSoftClick();
    setCurrentStepOrder(prev => {
      if (prev.includes(stepName)) {
        return prev.filter(s => s !== stepName);
      }
      return [...prev, stepName];
    });
  };

  const handleAddWorkingMemorySymbol = (name: string) => {
    soundEffects.playSoftClick();
    setCurrentWorkingMemoryInput(prev => [...prev, name]);
  };

  const handleClearWorkingMemory = () => {
    soundEffects.playSoftClick();
    setCurrentWorkingMemoryInput([]);
  };

  const handleUseHint = () => {
    if (!showHintText) {
      setShowHintText(true);
      setHintsUsedCount(c => c + 1);
      soundEffects.playSoftClick();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6">
        {/* Top Progress & Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm cursor-pointer py-1 px-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>{t('common.back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Clock size={13} /> {elapsedSeconds}s
              </span>
              <span className="text-xs font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {currentTaskIndex + 1} / {totalTasks}
              </span>
            </div>
          </div>

          <ProgressBar
            current={currentTaskIndex + 1}
            total={totalTasks}
            label={t(`assessment.tasks.${currentTask.id}.title`) || currentTask.taskTitle}
          />
        </div>

        {/* Task Card Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 my-auto">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {currentTask.domain.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  Level {currentTask.difficultyWeight || 1}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {t(`assessment.tasks.${currentTask.id}.instruction`) || currentTask.instruction}
              </h2>
            </div>
            <SpeechSpeaker textToSpeak={t(`assessment.tasks.${currentTask.id}.prompt`) || currentTask.audioPromptText} />
          </div>


          {/* 1. MULTIPLE CHOICE / TIMED MATCH */}
          {(currentTask.type === 'multiple-choice' || currentTask.type === 'timed-match') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentTask.options?.map(opt => {
                const isSelected = currentChoice === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEffects.playSoftClick();
                      setCurrentChoice(opt.id);
                      setFeedbackMessage(`Selected: ${opt.label}`);
                    }}
                    type="button"
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-md ring-2 ring-teal-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-800'
                    }`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-base sm:text-lg font-bold flex-1">{opt.label}</span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. MEMORIZE / ENCODING PHASE */}
          {currentTask.type === 'memorize' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentTask.memorizeItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gradient-to-b from-teal-50/70 to-emerald-50/50 border-2 border-teal-200 text-center space-y-2 shadow-2xs"
                  >
                    <div className="text-4xl">{item.icon}</div>
                    <div className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-teal-800 font-medium">{item.description}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                <Eye size={18} className="text-teal-700 flex-shrink-0" />
                <span>
                  Observation timer running. Once you feel comfortable remembering these 4 items, click Continue below.
                </span>
              </div>
            </div>
          )}

          {/* 3. FIND OBJECT (VISUAL ATTENTION) */}
          {currentTask.type === 'find-object' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentTask.distractors?.map(item => {
                  const isSelected = currentChoice === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setCurrentChoice(item.id);
                        if (item.isTarget) {
                          setFeedbackMessage('Wonderful! You found the target flower.');
                        } else {
                          setFeedbackMessage('Keep looking for the bright red petals.');
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-2 ring-teal-200 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-4xl">{item.icon}</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 text-center">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. STEP ORDER (EXECUTIVE FUNCTION) */}
          {currentTask.type === 'step-order' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
                Tap each step in order from first to last (1 to 4):
              </div>

              <div className="space-y-2.5">
                {currentTask.sequenceItems?.map((step, idx) => {
                  const orderIdx = currentStepOrder.indexOf(step.name);
                  const isSelected = orderIdx !== -1;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleStepOrder(step.name)}
                      className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{step.icon}</span>
                        <span className="text-sm font-bold">{step.name}</span>
                      </div>
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                          {orderIdx + 1}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">Tap to order</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. SEQUENCE CHOICE / WORKING MEMORY REPRODUCTION */}
          {currentTask.type === 'sequence-choice' && (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 mr-2">Pattern:</span>
                {currentTask.sequenceItems?.map((seq, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl shadow-2xs"
                  >
                    {seq.icon}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Your Input: {currentWorkingMemoryInput.join(' → ') || '(Tap symbols below in order)'}</span>
                  {currentWorkingMemoryInput.length > 0 && (
                    <button
                      onClick={handleClearWorkingMemory}
                      className="text-teal-700 hover:text-teal-900 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {currentTask.options?.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleAddWorkingMemorySymbol(opt.label)}
                      className="p-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-[11px] font-bold text-slate-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. MULTI-SELECT (DELAYED RECALL) */}
          {currentTask.type === 'multi-select' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Selected: {currentMultiSelect.length} of 4 items</span>
                <span className="text-teal-700">Select all 4 items from earlier</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentTask.options?.map(opt => {
                  const isSelected = currentMultiSelect.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleToggleMultiChoice(opt.id)}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-950 ring-2 ring-teal-200 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hint Accordion */}
          {currentTask.hint && (
            <div className="pt-2">
              {!showHintText ? (
                <button
                  type="button"
                  onClick={handleUseHint}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-teal-50 border border-teal-200"
                >
                  <HelpCircle size={14} /> {t('common.help') || 'Need a gentle hint?'}
                </button>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <span>💡 {t(`assessment.tasks.${currentTask.id}.hint`) || currentTask.hint}</span>
                </div>
              )}
            </div>
          )}

          {/* Supportive Real-time Feedback */}
          {feedbackMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
              <Sparkles size={16} className="text-teal-600 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Bottom Continue Action */}
        <div className="pt-2 space-y-2">
          <Button
            size="xl"
            fullWidth
            disabled={isEvaluating}
            onClick={handleNext}
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            {isEvaluating
              ? t('common.loading')
              : currentTaskIndex === totalTasks - 1
              ? (t('assessment.start') || 'Complete & Build Baseline')
              : (t('common.next') || 'Continue to Next Activity')}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>{t('assessment.disclaimer')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

