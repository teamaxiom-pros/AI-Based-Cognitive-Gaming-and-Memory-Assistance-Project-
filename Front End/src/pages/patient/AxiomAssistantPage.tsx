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
  PlusCircle,
  Trash2,
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

export const AxiomAssistantPage: React.FC = () => {
  const { patient, navigate, t } = useApp();
  const { user } = useAuth();

  const patientId = user?.id || patient.id || '00000000-0000-0000-0000-000000000001';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

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
    setLastFailedQuery(null);

    try {
      const res = await apiService.queryAssistant(text, patientId);
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
      setLastFailedQuery(text);
      const errMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: 'I had trouble connecting to the service. Please check your connection and tap retry.',
        intent: 'ERROR',
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartNewConversation = async () => {
    try {
      await apiService.startNewAssistantThread(patientId);
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          content: `New conversation started! How can I help you, ${patient.name.split(' ')[0] || 'there'}?`,
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
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      await apiService.clearAssistantHistory(patientId);
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          content: `Chat history cleared. What would you like to ask today?`,
          intent: 'GENERAL',
          createdAt: new Date().toISOString(),
        },
      ]);
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
      <div className="max-w-4xl mx-auto space-y-4 font-sans">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Bot size={26} />
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
              onClick={handleStartNewConversation}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Start a new conversation thread"
            >
              <PlusCircle size={14} />
              <span>New Chat</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all cursor-pointer"
              title="Clear all chat history"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={stopAllTts}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isTtsEnabled
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
              }`}
              title={isTtsEnabled ? 'Voice output enabled. Click to mute.' : 'Voice output muted. Click to enable.'}
            >
              {isTtsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{isTtsEnabled ? 'Voice: On' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Voice Recognition Status Banner */}
        {isListening && (
          <div className="p-3 bg-teal-50 border border-teal-300 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
              <span>Listening to your voice... Speak clearly into your microphone.</span>
            </div>
            <button
              onClick={handleToggleMic}
              className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Done / Stop
            </button>
          </div>
        )}

        {/* Live Speech Transcript Preview */}
        {voiceTranscript && (
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-2xl text-xs text-slate-700 italic">
            <strong className="not-italic text-slate-900">Recognized:</strong> "{voiceTranscript}"
          </div>
        )}

        {/* Voice Error Notice */}
        {voiceError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{voiceError}</span>
          </div>
        )}

        {/* Speech API Unsupported Notice */}
        {!isSpeechSupported && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>Voice input is not supported in this browser. You can type your questions below.</span>
          </div>
        )}

        {/* Suggested Quick Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Questions
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={isProcessing}
                onClick={() => handleSendMessage(p.query)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-semibold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Stream Container */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm min-h-[380px] max-h-[480px] overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 space-y-2 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="font-medium whitespace-pre-wrap">{msg.content}</p>

                  {/* Context-aware Action Buttons in Chat */}
                  {msg.actionTarget && !isUser && (
                    <div className="pt-2">
                      <button
                        onClick={() => navigate(msg.actionTarget!)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {msg.intent === 'START_ACTIVITY' && <Play size={14} />}
                        {msg.intent === 'MEDICINE_QUERY' && <Pill size={14} />}
                        {msg.intent === 'TODAY_SCHEDULE' && <Calendar size={14} />}
                        <span>Open {msg.intent === 'START_ACTIVITY' ? 'Activity' : 'Schedule'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* Retry Button for Failed Queries */}
                  {msg.isError && lastFailedQuery && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleSendMessage(lastFailedQuery)}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] ${
                      isUser ? 'text-teal-100 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 font-bold text-xs">
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Processing / Typing Indicator */}
          {isProcessing && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 font-medium flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 font-bold text-teal-800">Axiom is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="bg-white rounded-3xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Ask about medicines, brain games, or schedule...'
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white shadow-md shadow-teal-600/20 transition-all flex items-center justify-center cursor-pointer"
            title="Send query"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </PatientLayout>
  );
};
