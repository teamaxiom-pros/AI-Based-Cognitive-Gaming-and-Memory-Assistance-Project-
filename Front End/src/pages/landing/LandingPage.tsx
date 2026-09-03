import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Smile,
  CheckCircle2,
  Users,
  MessageSquare,
  Lock,
  Play,
  Volume2,
  Pill,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate, setUserMode } = useApp();
  const { quickDemoLogin } = useAuth();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleQuickDemo = async (role: 'patient' | 'caregiver') => {
    await quickDemoLogin(role);
    setUserMode(role);
    navigate(role === 'caregiver' ? '/caregiver/dashboard' : '/home');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Clean Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Brain size={24} />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                AXIOM
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Cognitive Care & Memory Support
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
              How It Works
            </a>
            <a href="#for-caregivers" className="hover:text-teal-600 transition-colors">
              For Caregivers
            </a>
            <a href="#privacy" className="hover:text-teal-600 transition-colors">
              Privacy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 md:py-20 bg-gradient-to-b from-teal-50/70 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-teal-600" />
                Gentle Cognitive Wellness Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Helping Every Mind <br />
                <span className="text-teal-600">Stay Connected.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                A simple, reassuring platform combining daily brain activities, memory assistance, and caregiver support to help elderly individuals maintain cognitive vitality.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  className="px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/20 hover:scale-[1.01] transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <span>Start Free</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleLogin}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-base border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  Existing User Login
                </button>
              </div>

              {/* 1-Click Evaluation Buttons for Testing */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => handleQuickDemo('patient')}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Smile size={14} className="text-teal-600" />
                  <span>Demo Patient View</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('caregiver')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HeartHandshake size={14} className="text-indigo-600" />
                  <span>Demo Caregiver View</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2 pt-1">
                <ShieldCheck size={16} className="text-teal-600" />
                <span>Designed to support everyday cognitive engagement and wellbeing.</span>
              </div>
            </div>

            {/* Right Clean Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                      AD
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Asha Devi</h4>
                      <p className="text-[11px] text-teal-600 font-semibold">Active Care Profile</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    Connected
                  </span>
                </div>

                {/* Today's Brain Game Card */}
                <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-800 font-bold flex items-center gap-1.5">
                      <Brain size={15} className="text-teal-600" /> Today's Brain Activity
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-teal-700 font-bold border border-teal-200">
                      Level 2
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Assam Heritage Memory Match</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A calm visual matching game designed to stimulate daily memory recall.
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Domain: Visual Memory</span>
                    <button
                      onClick={() => handleQuickDemo('patient')}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Play size={12} /> Play
                    </button>
                  </div>
                </div>

                {/* Simple Routine Item */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Today's Schedule</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Pill size={16} className="text-teal-600" />
                      <div>
                        <p className="font-bold text-slate-900">Morning Medication</p>
                        <p className="text-[10px] text-slate-500">08:00 AM • Daily Dose</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  </div>
                </div>

                {/* Assistant Prompt */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                  <Volume2 size={16} className="text-teal-600 flex-shrink-0" />
                  <p>
                    <strong className="text-slate-900">Ask Axiom:</strong> "What is on my schedule today?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="py-16 md:py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs uppercase font-bold text-teal-600 tracking-wider">
              Designed For Real Life
            </h2>
            <h3 className="text-3xl font-black text-slate-900">
              Everything You Need in One Place
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Simple, accessible features created to reduce stress and support everyday independence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Brain size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Daily Brain Games</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enjoyable memory, attention, and sequencing games tailored to your comfortable pace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BookOpen size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Personal Memory Book</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Preserve photos and stories of family, cherished places, and meaningful memories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Daily Routine & Meds</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                High-contrast reminders for morning and evening medicines, walks, and doctor visits.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <HeartHandshake size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Caregiver Connection</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect loved ones using a secure code so they can support your daily wellbeing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs uppercase font-bold text-teal-600 tracking-wider">
              Simple Journey
            </h2>
            <h3 className="text-3xl font-black text-slate-900">
              How Axiom Works
            </h3>
            <p className="text-slate-600 text-sm">
              Getting started takes less than two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Create Your Profile</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sign up as a patient or caregiver and select your preferred language.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Gentle Baseline Check</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Complete a brief, stress-free activity set to help customize your game levels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Enjoy Daily Support</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Access personalized games, daily medication schedules, and speech assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. For Patients & For Caregivers Section */}
      <section id="for-caregivers" className="py-16 md:py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Patients */}
            <div className="p-8 rounded-3xl bg-teal-50/70 border border-teal-200 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <Smile size={26} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">For Patients</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Designed specifically with high contrast, large buttons, gentle sound guidance, and no complex menus.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  <span>Large, readable text with high-contrast displays</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  <span>Speech-enabled "Ask Axiom" voice companion</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  <span>Culturally familiar brain games and stories</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sign Up as Patient
              </button>
            </div>

            {/* For Caregivers */}
            <div className="p-8 rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <HeartHandshake size={26} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">For Caregivers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay updated on daily medication completion, cognitive engagement trends, and appointment reminders.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Secure patient connection via invite codes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Daily routine and medication adherence logs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Exportable summary notes for clinical visits</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  navigate('/signup');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sign Up as Caregiver
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust & Privacy */}
      <section id="privacy" className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Private, Protected, and Encrypted
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            All records are encrypted and strictly protected by Supabase Row-Level Security (RLS). Information is shared only between the patient and their explicitly authorized caregivers.
          </p>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-16 bg-teal-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Begin with Axiom?
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-lg mx-auto">
            Join families navigating everyday cognitive care with clarity and confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-7 py-3.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleLogin}
              className="px-6 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm border border-teal-600 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 8. Simple Footer */}
      <footer className="bg-slate-900 py-8 text-xs text-slate-400 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Brain size={16} className="text-teal-400" />
            <span>AXIOM</span>
            <span className="text-slate-600">•</span>
            <span>SIH 2026 Team Axiom</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <button onClick={handleLogin} className="hover:text-white transition-colors cursor-pointer">
              Login
            </button>
          </div>

          <p>© 2026 Team Axiom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
