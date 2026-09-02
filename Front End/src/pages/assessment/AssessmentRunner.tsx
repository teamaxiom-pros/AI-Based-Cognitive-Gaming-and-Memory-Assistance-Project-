import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { assessmentTasks } from '../../data/assessmentQuestions';
import { AssessmentTaskResponse } from '../../types';
import { scoreAssessmentResponses } from '../../services/assessmentEngine';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { soundEffects } from '../../services/soundEffects';
import { Check, ArrowRight, ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssessmentRunner: React.FC = () => {
  const { t, navigate, speakText, setAssessmentResult, patient } = useApp();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Session timing
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());
  const taskStartTimeRef = useRef<number>(Date.now());

  // Accumulated raw responses
  const [responsesMap, setResponsesMap] = useState<Record<string, AssessmentTaskResponse>>({});

  // Active task interactive states
  const [currentChoice, setCurrentChoice] = useState<string>('');
  const [currentMultiSelect, setCurrentMultiSelect] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [showHintText, setShowHintText] = useState<boolean>(false);

  const currentTask = assessmentTasks[currentTaskIndex];
  const totalTasks = assessmentTasks.length;

  useEffect(() => {
    taskStartTimeRef.current = Date.now();
    setCurrentChoice('');
    setCurrentMultiSelect([]);
    setFeedbackMessage(null);
    setShowHintText(false);
    setHintsUsedCount(0);

    if (currentTask) {
      speakText(currentTask.audioPromptText);
    }
  }, [currentTaskIndex]);

  const recordCurrentTaskResponse = (): AssessmentTaskResponse => {
    const responseTimeMs = Date.now() - taskStartTimeRef.current;
    let isCorrect = false;
    let score = 0;
    let patientAnswer: any = null;
    const expectedAnswer = currentTask.expectedOptionId || currentTask.correctAnswers || '';

    if (currentTask.type === 'multiple-choice' || currentTask.type === 'sequence-choice') {
      patientAnswer = currentChoice;
      isCorrect = currentChoice === currentTask.expectedOptionId;
      score = isCorrect ? Math.max(50, 100 - hintsUsedCount * 15) : 0;
    } else if (currentTask.type === 'find-object') {
      patientAnswer = currentChoice;
      isCorrect = currentChoice === currentTask.expectedOptionId;
      score = isCorrect ? Math.max(50, 100 - hintsUsedCount * 15) : 0;
    } else if (currentTask.type === 'memorize') {
      patientAnswer = true;
      isCorrect = true;
      score = 100;
    } else if (currentTask.type === 'multi-select') {
      patientAnswer = currentMultiSelect;
      const expected = currentTask.correctAnswers || [];
      const correctHits = currentMultiSelect.filter(id => expected.includes(id)).length;
      const incorrectHits = currentMultiSelect.filter(id => !expected.includes(id)).length;

      const rawAccuracy = expected.length > 0 ? (correctHits / expected.length) - (incorrectHits * 0.25) : 0;
      score = Math.max(0, Math.round(rawAccuracy * 100));
      isCorrect = correctHits === expected.length && incorrectHits === 0;
    }

    const response: AssessmentTaskResponse = {
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
      skipped: !currentChoice && currentMultiSelect.length === 0 && currentTask.type !== 'memorize',
      timestamp: new Date().toISOString(),
    };

    return response;
  };

  const handleNext = () => {
    soundEffects.playSoftClick();
    const taskResponse = recordCurrentTaskResponse();
    const nextMap = { ...responsesMap, [currentTask.id]: taskResponse };
    setResponsesMap(nextMap);

    if (currentTaskIndex < totalTasks - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finish Assessment & Score through the mathematical engine
      const allResponses = Object.values(nextMap);
      const endTime = new Date().toISOString();

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      const session = scoreAssessmentResponses(
        patient.id || 'patient-asha-001',
        allResponses,
        sessionStartTimeRef.current,
        endTime
      );

      setAssessmentResult({
        sessionId: session.sessionId,
        completedAt: new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        overallScore: session.overallScore,
        domainScores: session.domainScores,
        aiSummary: session.aiSummary,
        recommendedActivities: session.recommendedActivities,
        clinicalNotes: session.clinicalNotes,
        taskResponses: session.taskResponses,
      });

      navigate('/assessment/result');
    }
  };

  const handleBack = () => {
    if (currentTaskIndex === 0) {
      navigate('/assessment/intro');
    } else {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const toggleMultiChoice = (id: string) => {
    soundEffects.playSoftClick();
    setCurrentMultiSelect(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUseHint = () => {
    if (!showHintText) {
      setShowHintText(true);
      setHintsUsedCount(c => c + 1);
      soundEffects.playSoftClick();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6">
        {/* Top Progress & Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm cursor-pointer py-1 px-2 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              <span>{t('common.back')}</span>
            </button>
            <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 shadow-xs">
              Activity {currentTaskIndex + 1} of {totalTasks}
            </span>
          </div>

          <ProgressBar
            current={currentTaskIndex + 1}
            total={totalTasks}
            label={currentTask.taskTitle}
          />
        </div>

        {/* Task Card Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 my-auto">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {currentTask.domain}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Weight: {currentTask.difficultyWeight === 1 ? 'Easy' : currentTask.difficultyWeight === 2 ? 'Medium' : 'Hard'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {currentTask.instruction}
              </h2>
            </div>
            <SpeechSpeaker textToSpeak={currentTask.audioPromptText} />
          </div>

          {/* TASK TYPE 1: MULTIPLE CHOICE (Orientation / Recognition) */}
          {currentTask.type === 'multiple-choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTask.options?.map(opt => {
                const isSelected = currentChoice === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEffects.playSoftClick();
                      setCurrentChoice(opt.id);
                      setFeedbackMessage('Selected: ' + opt.label);
                    }}
                    type="button"
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-md ring-2 ring-teal-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-800'
                    }`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-lg font-bold flex-1">{opt.label}</span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TASK TYPE 2: MEMORIZE (Encoding) */}
          {currentTask.type === 'memorize' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {currentTask.memorizeItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gradient-to-b from-teal-50/70 to-emerald-50/50 border-2 border-teal-200 text-center space-y-2 shadow-xs"
                  >
                    <div className="text-4xl">{item.icon}</div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      {item.name}
                    </div>
                    <div className="text-xs text-teal-800 font-medium">{item.description}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium flex items-center gap-2">
                <Sparkles size={18} className="text-teal-600 flex-shrink-0" />
                <span>
                  Repeat softly: <strong>Assam Tea Cup, Japi, Red Lotus, Gamosa Cloth</strong>.
                </span>
              </div>
            </div>
          )}

          {/* TASK TYPE 3: FIND OBJECT (Attention) */}
          {currentTask.type === 'find-object' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3.5">
                {currentTask.distractors?.map(item => {
                  const isSelected = currentChoice === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setCurrentChoice(item.id);
                        if (item.isTarget) {
                          setFeedbackMessage('Wonderful! You found the Red Hibiscus blossom.');
                        } else {
                          setFeedbackMessage('Look for the bright red flower.');
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-2 ring-teal-300'
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

          {/* TASK TYPE 4: SEQUENCE CHOICE (Sequencing) */}
          {currentTask.type === 'sequence-choice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {currentTask.sequenceItems?.map((seq, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center text-3xl sm:text-4xl border-2 shadow-xs ${
                      seq.name === '?'
                        ? 'border-dashed border-teal-500 bg-teal-50 text-teal-800 font-bold animate-pulse'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {seq.icon}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentTask.options?.map(opt => {
                  const isSelected = currentChoice === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setCurrentChoice(opt.id);
                        setFeedbackMessage('Selected: ' + opt.label);
                      }}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-2 ring-teal-300 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="font-bold text-sm text-slate-800">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TASK TYPE 5: MULTI-SELECT (Delayed Recall) */}
          {currentTask.type === 'multi-select' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500">
                Selected: {currentMultiSelect.length} / 4 items
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {currentTask.options?.map(opt => {
                  const isSelected = currentMultiSelect.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleMultiChoice(opt.id)}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-950 ring-2 ring-teal-200 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-800'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-sm font-bold flex-1">{opt.label}</span>
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

          {/* Hint Accordion */}
          {currentTask.hint && (
            <div className="pt-2">
              {!showHintText ? (
                <button
                  type="button"
                  onClick={handleUseHint}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-teal-50 border border-teal-200"
                >
                  <HelpCircle size={14} /> Need a gentle hint?
                </button>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <span>💡 Hint: {currentTask.hint}</span>
                </div>
              )}
            </div>
          )}

          {/* Supportive Real-time Feedback */}
          {feedbackMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm font-bold flex items-center gap-2 animate-fade-in">
              <Sparkles size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Bottom Continue Action */}
        <div className="pt-2">
          <Button
            size="xl"
            fullWidth
            onClick={handleNext}
            icon={<ArrowRight size={24} />}
            iconPosition="right"
          >
            {currentTaskIndex === totalTasks - 1
              ? 'Complete & Calculate My Real Profile'
              : t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
