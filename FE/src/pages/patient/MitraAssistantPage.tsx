import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { apiService } from '../../services/apiService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Play,
  Calendar,
  Pill,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Trash2,
  User,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  intent?: string;
  actionTarget?: string;
  createdAt: string;
  isError?: boolean;
}

export const MitraAssistantPage: React.FC = () => {
  const { patient, navigate, t, speakText, language } = useApp();
  const { user } = useAuth();

  const patientId = user?.id || patient.id || '00000000-0000-0000-0000-000000000001';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showTypingInput, setShowTypingInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick Action Prompts for Elderly Convenience
  const quickActions = [
    { label: t('assistant.promptSchedule') || '🗓️ What do I have today?', query: 'What is on my schedule today?' },
    { label: t('assistant.promptMedicine') || '💊 When is my medicine?', query: 'When is my next medicine due?' },
    { label: t('assistant.promptGame') || '🧠 Start my activity', query: 'What brain activity should I play today?' },
    { label: '⏰ Remind me later', query: 'Please remind me about my routine later.' },
    { label: '📞 Call my caregiver', query: 'Can you help me contact my caregiver?' },
  ];

  // 1. Load persistent chat history on mount
  const loadChatHistory = async () => {
    try {
      const res = await apiService.getAssistantHistory(patientId);
      if (res && res.success && Array.isArray(res.messages) && res.messages.length > 0) {
        const formatted: ChatMessage[] = res.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender as 'user' | 'assistant',
          content: m.content,
          intent: m.intent,
          actionTarget: m.action_target,
          createdAt: m.created_at || new Date().toISOString(),
        }));
        setMessages(formatted);
      } else {
        const firstName = patient.name ? patient.name.split(' ')[0] : 'there';
        setMessages([
          {
            id: 'init-1',
            sender: 'assistant',
            content: `Hello ${firstName}! How can I help you today?`,
            intent: 'GENERAL',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn('[MitraAssistant] Could not load chat history:', err);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, [patientId]);

  // 2. Initialize Web Speech API Speech-to-Text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const bcpMap: Record<string, string> = {
        en: 'en-IN',
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
      };
      recognition.lang = bcpMap[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setVoiceTranscript(currentText);

        if (finalTranscript.trim()) {
          recognition.stop();
          handleSendMessage(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition] Error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission needed. Please allow microphone access.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice check (${event.error}). You can tap below or type your question.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language]);

  // 3. Auto-scroll on new message
  useEffect(() => {
    if (showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing, showHistory]);

  // 4. Text-to-Speech Output
  const speakAssistantText = (text: string) => {
    if (!isTtsEnabled) return;
    setIsSpeaking(true);
    speakText(text);
    const words = text.split(' ').length;
    const duration = Math.max(2500, (words / 2.3) * 1000);
    setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  };

  // 5. Send message
  const handleSendMessage = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setVoiceTranscript('');
    setIsProcessing(true);
    setLastFailedQuery(null);

    try {
      const res = await apiService.queryAssistant(text, patientId);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: res?.response || 'I am right here with you. Please let me know how I can help.',
        intent: res?.intent,
        actionTarget: res?.actionTarget,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMsg]);
      speakAssistantText(botMsg.content);
    } catch {
      setLastFailedQuery(text);
      const errMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: 'I had a little trouble hearing you. Please tap the microphone and try again.',
        intent: 'ERROR',
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const latestAssistantMessage = [...messages].reverse().find(m => m.sender === 'assistant');

  const handleRepeatVoice = () => {
    if (latestAssistantMessage?.content) {
      speakAssistantText(latestAssistantMessage.content);
    } else {
      speakAssistantText(`Hello! How can I help you today?`);
    }
  };

  const handleToggleMic = () => {
    if (!isSpeechSupported) {
      setVoiceError("Voice input is not supported in this browser. Please type below.");
      setShowTypingInput(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        setVoiceError(null);
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('[SpeechRecognition] Start error:', err);
      }
    }
  };

  const handleStartNewConversation = async () => {
    try {
      await apiService.startNewAssistantThread(patientId);
      const firstName = patient.name ? patient.name.split(' ')[0] : 'there';
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          content: `Hello ${firstName}! How can I help you today?`,
          intent: 'GENERAL',
          createdAt: new Date().toISOString(),
        },
      ]);
      setLastFailedQuery(null);
    } catch {
      loadChatHistory();
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Would you like to clear the conversation?')) {
      await apiService.clearAssistantHistory(patientId);
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          content: `Hello! What would you like to ask today?`,
          intent: 'GENERAL',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  // Determine current active status text for elderly display
  const getStatusText = () => {
    if (isListening) return "I’m listening…";
    if (isProcessing) return "Just a moment…";
    if (isSpeaking) return "Speaking…";
    if (latestAssistantMessage?.content) return latestAssistantMessage.content;
    return "Hello! How can I help you today?";
  };

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto space-y-5 font-sans">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-teal-200 bg-teal-50">
              <img src="/mitra_avatar.png" alt="MITRA" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base text-slate-900 leading-tight">Mitra</div>
              <div className="text-[11px] text-teal-700 font-semibold">{t('assistant.companionBadge') || 'SMRITI Companion'}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleStartNewConversation}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Start fresh conversation"
            >
              <PlusCircle size={17} />
            </button>
            <button
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                isTtsEnabled ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'
              }`}
              title={isTtsEnabled ? 'Voice output on' : 'Voice output muted'}
            >
              {isTtsEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
          </div>
        </div>

        {/* MAIN VOICE-FIRST STAGE (ELDERLY-FRIENDLY & FOCUSED) */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border-2 border-teal-100 shadow-md text-center space-y-6">
          {/* Friendly Icon */}
          <div className="flex justify-center">
            <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg border-3 border-teal-600 transition-transform ${
              isListening ? 'scale-105 ring-8 ring-teal-200 animate-pulse' : isSpeaking ? 'scale-105 ring-4 ring-emerald-200' : ''
            }`}>
              <img src="/mitra_avatar.png" alt="MITRA Companion" className="w-full h-full object-cover" />
              {isListening && (
                <div className="absolute inset-0 bg-teal-900/30 backdrop-blur-xs flex items-center justify-center text-white">
                  <Mic size={36} className="animate-bounce" />
                </div>
              )}
            </div>
          </div>

          {/* Current Message / State Display */}
          <div className="min-h-[90px] flex items-center justify-center px-2">
            <p className={`text-xl sm:text-2xl font-black leading-snug max-w-lg transition-all ${
              isListening ? 'text-teal-700 animate-pulse' : isProcessing ? 'text-amber-700' : 'text-slate-900'
            }`}>
              “{getStatusText()}”
            </p>
          </div>

          {/* Live Transcript Preview when listening */}
          {voiceTranscript && isListening && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs sm:text-sm text-teal-900 font-semibold italic">
              Hearing: "{voiceTranscript}"
            </div>
          )}

          {/* Voice Error notice */}
          {voiceError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-semibold">
              {voiceError}
            </div>
          )}

          {/* Direct Action button if latest message suggested one */}
          {latestAssistantMessage?.actionTarget && !isProcessing && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => navigate(latestAssistantMessage.actionTarget!)}
                className="px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-102"
              >
                {latestAssistantMessage.intent === 'START_ACTIVITY' && <Play size={18} />}
                {latestAssistantMessage.intent === 'MEDICINE_QUERY' && <Pill size={18} />}
                {latestAssistantMessage.intent === 'TODAY_SCHEDULE' && <Calendar size={18} />}
                <span>
                  {latestAssistantMessage.intent === 'START_ACTIVITY'
                    ? t('assistant.openActivityBtn') || 'Start Activity'
                    : t('assistant.openScheduleBtn') || 'Open Schedule'}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* GIANT ACCESSIBLE MICROPHONE BUTTON */}
          <div className="flex flex-col items-center justify-center pt-2 space-y-3">
            <button
              onClick={handleToggleMic}
              disabled={isProcessing}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer select-none focus:outline-none ${
                isListening
                  ? 'bg-rose-500 ring-8 ring-rose-200 scale-110'
                  : 'bg-teal-700 hover:bg-teal-800 ring-6 ring-teal-100 hover:scale-105 active:scale-95'
              }`}
              aria-label={isListening ? "Stop listening" : "Tap to speak"}
            >
              {isListening ? <MicOff size={38} /> : <Mic size={38} />}
            </button>
            <span className="text-sm font-black text-slate-800 tracking-wide uppercase">
              {isListening ? "Listening... (Tap when done)" : isProcessing ? "Thinking..." : "Tap to Speak"}
            </span>
          </div>

          {/* Primary Controls Row: [ 🔊 Repeat ] and [ ↩ Back ] */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleRepeatVoice}
              disabled={isListening || isProcessing}
              className="px-5 py-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm border border-teal-200 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 size={18} />
              <span>🔊 Repeat Voice</span>
            </button>

            <button
              onClick={() => navigate('/home')}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft size={18} />
              <span>↩ Back to Home</span>
            </button>

            <button
              onClick={() => setShowTypingInput(!showTypingInput)}
              className="px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200 cursor-pointer"
            >
              {showTypingInput ? 'Hide Keyboard' : 'Type Message ⌨️'}
            </button>
          </div>
        </div>

        {/* Optional Typing Form (Accessible fallback for seniors/caregivers) */}
        {showTypingInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex items-center gap-2 animate-scale-up"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
              placeholder="Type your question for Mitra..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold text-sm shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        )}

        {/* QUICK SUGGESTIONS (ELDERLY ONE-TAP ACTIONS) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="text-xs uppercase font-black tracking-wider text-slate-400">
            Quick Questions to Ask Mitra
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                disabled={isProcessing}
                onClick={() => handleSendMessage(qa.query)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200/90 hover:border-teal-300 text-slate-800 hover:text-teal-900 font-bold text-xs sm:text-sm text-left transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between"
              >
                <span>{qa.label}</span>
                <ArrowRight size={14} className="text-teal-600 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* RECENT CONVERSATION STREAM TOGGLE */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4.5 flex items-center justify-between text-left font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>Previous Conversation ({messages.length})</span>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showHistory && (
            <div className="p-4 sm:p-5 border-t border-slate-100 max-h-80 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-teal-50 border border-teal-200 flex-shrink-0">
                        <img src="/mitra_avatar.png" alt="Mitra" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-teal-700 text-white rounded-tr-xs'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                      }`}
                    >
                      <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
};

export const AxiomAssistantPage = MitraAssistantPage;
export default MitraAssistantPage;
