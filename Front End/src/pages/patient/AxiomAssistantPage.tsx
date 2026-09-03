import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { apiService } from '../../services/apiService';
import {
  Brain,
  Sparkles,
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
  Bot,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  intent?: string;
  actionTarget?: string;
  createdAt: string;
}

export const AxiomAssistantPage: React.FC = () => {
  const { patient, navigate, t, medicines, assessmentResult } = useApp();
  const { token } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedPrompts = [
    { label: '💊 What medicine do I take?', query: 'What medicine do I take today?' },
    { label: '🗓️ What is my schedule today?', query: 'What is on my schedule today?' },
    { label: '🧠 What brain game should I play?', query: 'What activity should I play?' },
    { label: '👨‍⚕️ Do I have a doctor appointment?', query: 'Do I have any doctor appointments scheduled?' },
    { label: '📊 How is my memory score?', query: 'How am I doing in my cognitive activities?' },
  ];

  // 1. Load persistent chat history from Supabase on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const patientId = patient.id || 'P001';
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
          // Default initial greeting
          setMessages([
            {
              id: 'init-1',
              sender: 'assistant',
              content: `Hello ${patient.name.split(' ')[0] || 'there'}! I am your Axiom Cognitive Companion. How can I help you today? You can ask about your medicines, today's routine, or recommended brain games.`,
              intent: 'GENERAL',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn('[AxiomAssistant] Could not load chat history:', err);
      }
    };

    loadHistory();
  }, [patient.id]);

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
      recognition.lang = 'en-US';

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
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice recognition error (${event.error}). Please type your message.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // 3. Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // 4. Text-to-Speech Output
  const speakAssistantText = (text: string) => {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // slightly slower for elderly clarity
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] Synthesis error:', err);
    }
  };

  // 5. Send message handler
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

    try {
      const res = await apiService.queryAssistant(text, patient.id || 'P001');
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: res?.response || 'I am here with you. Please let me know how I can assist you.',
        intent: res?.intent,
        actionTarget: res?.actionTarget,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMsg]);
      speakAssistantText(botMsg.content);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: 'I had trouble connecting to the service. Please try asking again.',
        intent: 'ERROR',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleMic = () => {
    if (!isSpeechSupported) {
      setVoiceError("Voice input is not supported in this browser. Please type your message.");
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

  const stopAllTts = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTtsEnabled(!isTtsEnabled);
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                Ask Axiom
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  AI Companion
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Personalized support for medicines, routine, appointments, and memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={stopAllTts}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isTtsEnabled
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
              }`}
              title={isTtsEnabled ? 'Voice output enabled. Click to mute.' : 'Voice output muted. Click to enable.'}
            >
              {isTtsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{isTtsEnabled ? 'Voice: On' : 'Voice: Muted'}</span>
            </button>
          </div>
        </div>

        {/* Voice Recognition Status Banner */}
        {isListening && (
          <div className="p-3 bg-teal-50 border border-teal-300 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5 text-xs text-teal-800 font-bold">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>Listening to you... Speak now.</span>
              {voiceTranscript && <span className="text-teal-600 font-normal italic">"{voiceTranscript}"</span>}
            </div>
            <button
              onClick={handleToggleMic}
              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        {/* Voice Error Alert */}
        {voiceError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              onClick={() => setVoiceError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Conversation Thread Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[420px] max-h-[520px] overflow-y-auto flex flex-col space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content}
                </p>

                {/* Interactive Action Button from AI Response */}
                {msg.actionTarget && (
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(msg.actionTarget!)}
                      className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Open Recommended Section</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                <div
                  className={`text-[10px] font-semibold ${
                    msg.sender === 'user' ? 'text-teal-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 font-bold ml-1">Axiom is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Suggested Inquiries
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Voice Controls Bar */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm flex items-center gap-2 sm:gap-3">
          {/* Microphone Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to speak query'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputText);
              }
            }}
            placeholder="Type your question for Axiom or tap the microphone..."
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="button"
            disabled={!inputText.trim() || isProcessing}
            onClick={() => handleSendMessage(inputText)}
            className="p-3 sm:p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </PatientLayout>
  );
};
