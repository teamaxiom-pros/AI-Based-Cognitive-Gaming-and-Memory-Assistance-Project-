import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, HeartHandshake, Sparkles } from 'lucide-react';

export const CaregiverLoginPage: React.FC = () => {
  const { navigate, setUserMode, showToast } = useApp();
  const { signIn, signUp, quickDemoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('priya.sharma@axiomcare.in');
  const [password, setPassword] = useState('AxiomCare2026!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await signIn(email, password);
    if (res.success) {
      setUserMode('caregiver');
      showToast('Logged in as Priya Sharma (Primary Caregiver)');
      navigate('/caregiver/dashboard');
    } else {
      setErrorMsg(res.error || 'Caregiver authentication failed.');
    }
  };

  const handleInstantDemo = async () => {
    setErrorMsg(null);
    await quickDemoLogin('caregiver');
    setUserMode('caregiver');
    showToast('Logged in as Priya Sharma (Primary Caregiver)');
    navigate('/caregiver/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 md:p-10 text-white animate-fadeIn">
      <div className="max-w-md mx-auto w-full my-auto space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            A
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            AXIOM CLINICAL
          </h1>
          <p className="text-sm text-indigo-300 font-medium">
            Caregiver & Healthcare Professional Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/60">
              <UserCheck size={14} /> Supabase Auth Active
            </div>
            <button
              type="button"
              onClick={handleInstantDemo}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer inline-flex items-center gap-1"
            >
              <Sparkles size={13} /> 1-Click Demo
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Caregiver Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm font-semibold text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm font-semibold text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-base transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Sign in to Dashboard</span> <ArrowRight size={18} />
              </button>
            </div>
          </form>

          {/* Switch to Patient View link */}
          <div className="text-center pt-2 border-t border-slate-700">
            <button
              onClick={() => {
                setUserMode('patient');
                navigate('/welcome');
              }}
              className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              ← Back to Patient Experience
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-500 max-w-sm mx-auto">
        Encrypted HIPAA/DISHA compliance simulation for Smart India Hackathon 2026.
      </footer>
    </div>
  );
};
