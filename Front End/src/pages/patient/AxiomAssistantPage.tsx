import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { VoiceButton } from '../../components/common/VoiceButton';
import { processAssistantQuery, AssistantResponse } from '../../services/assistantService';
import { apiService } from '../../services/apiService';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import {
  Sparkles,
  Mic,
  Volume2,
  Phone,
  ArrowRight,
  Brain,
  HelpCircle,
} from 'lucide-react';

import { loadAllGamesProgress, loadGameResultsLog } from '../../services/gameProgressionService';
import { getPersonalizedRecommendations } from '../../services/gameRecommendationService';

export const AxiomAssistantPage: React.FC = () => {
  const { patient, navigate, speakText, stopSpeech, t, medicines, assessmentResult } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const gameProgress = loadAllGamesProgress();
  const resultsLog = loadGameResultsLog();
  const recommendations = getPersonalizedRecommendations(assessmentResult);

  const suggestedPrompts = [
    { label: '📊 How am I doing?', query: 'how am i doing' },
    { label: '🎯 What should I practice?', query: 'what should i practice' },
    { label: t('assistant.prompt1'), query: 'medicine' },
    { label: t('assistant.prompt2'), query: 'schedule' },
    { label: t('assistant.prompt3'), query: 'priya' },
    { label: t('assistant.prompt4'), query: 'family photos' },
    { label: t('assistant.prompt5'), query: 'brain game' },
    { label: t('assistant.prompt6'), query: 'call vikram' },
    { label: t('assistant.prompt7'), query: 'where do I live' },
  ];

  const handleQuery = async (queryText: string) => {
    stopSpeech();
    setCurrentQuery(queryText);
    setIsProcessing(true);
    setIsListening(false);

    try {
      const backendRes = await apiService.queryAssistant(queryText, patient.id || 'P001');
      if (backendRes && backendRes.success && backendRes.response) {
        const resObj: AssistantResponse = {
          answer: backendRes.response,
          actionType: (backendRes.actionType as any) || 'speak',
          actionTarget: backendRes.actionTarget,
          suggestedFollowUp: ['What should I practice?', 'Play a brain game', 'Show my schedule'],
        };
        setResponse(resObj);
        setIsProcessing(false);
        speakText(resObj.answer);
        return;
      }
    } catch (e) {
      console.warn('[AxiomAssistant] Backend query fallback:', e);
    }

    // Client-side deterministic evaluation fallback
    const takenCount = medicines.filter(m => m.isTakenToday).length;
    const res = processAssistantQuery(
      queryText,
      patient.name.split(' ')[0],
      takenCount,
      medicines.length,
      assessmentResult,
      resultsLog,
      gameProgress,
      recommendations
    );
    setResponse(res);
    setIsProcessing(false);
    speakText(res.answer);
  };

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      speakText('I am listening. How can I help you today?');
      // Simulate speech recognition after 3 seconds of listening
      setTimeout(() => {
        setIsListening(false);
        handleQuery('What is on my schedule today?');
      }, 3500);
    }
  };

  return (
    <PatientLayout pageTitle="Talk to Axiom">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Assistant Header & Visualizer */}
        <div className="bg-gradient-to-b from-teal-50 via-white to-slate-50 rounded-4xl p-6 sm:p-8 border-2 border-teal-200/80 shadow-soft text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">
              {t('assistant.title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {t('assistant.subtitle')}
            </p>
          </div>

          {/* Pulsing Assistant Avatar with Soundwaves */}
          <div className="py-4 flex flex-col items-center justify-center gap-4">
            <VoiceButton
              size="hero"
              isListening={isListening}
              isSpeaking={isProcessing}
              onToggle={handleToggleVoice}
              label={
                isListening
                  ? t('assistant.listeningStatus')
                  : isProcessing
                  ? t('common.processing')
                  : t('common.tapToSpeak')
              }
            />

            {/* Visual Waveform Animation */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 h-10">
                <span className="w-1.5 bg-rose-500 rounded-full animate-wave-1" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-wave-2" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-wave-3" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-wave-4" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-wave-5" />
              </div>
            )}
          </div>

          {/* AI Answer Bubble */}
          {response && (
            <div className="bg-teal-900 text-white rounded-3xl p-6 text-left shadow-xl space-y-4 animate-scale-up border border-teal-700">
              <div className="flex items-center justify-between border-b border-teal-700 pb-2">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} /> Axiom Response
                </span>
                <SpeechSpeaker textToSpeak={response.answer} label="Replay" size="sm" />
              </div>

              <p className="text-base sm:text-lg text-teal-50 font-medium leading-relaxed">
                "{response.answer}"
              </p>

              {/* Action Buttons inside Bubble */}
              {response.actionType && response.actionType !== 'none' && (
                <div className="pt-2">
                  {response.actionType === 'navigate' && response.actionTarget && (
                    <button
                      onClick={() => navigate(response.actionTarget!)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Open Page</span> <ArrowRight size={16} />
                    </button>
                  )}
                  {response.actionType === 'call' && (
                    <a
                      href={`tel:${response.actionTarget}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-sm"
                    >
                      <Phone size={16} /> Place Call
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Manual Type Input Option */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (currentQuery.trim()) {
                handleQuery(currentQuery);
              }
            }}
            className="flex items-center gap-2 pt-2 max-w-md mx-auto"
          >
            <input
              type="text"
              value={currentQuery}
              onChange={e => setCurrentQuery(e.target.value)}
              placeholder="Or type a question for Axiom..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
            >
              Ask
            </button>
          </form>
        </div>

        {/* Suggested Helpful Questions Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={18} className="text-teal-600" />
            {t('assistant.suggestedHeading')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuery(item.query)}
                className="p-4 rounded-2xl bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-500 text-left font-bold text-sm text-slate-800 transition-all cursor-pointer shadow-xs flex items-center justify-between group"
              >
                <span>{item.label}</span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-700 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};
