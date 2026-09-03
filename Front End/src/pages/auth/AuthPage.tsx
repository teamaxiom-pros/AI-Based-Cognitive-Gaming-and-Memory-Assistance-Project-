import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  User,
  HeartHandshake,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  MapPin,
  Globe,
  HelpCircle,
  KeyRound,
} from 'lucide-react';

interface AuthPageProps {
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup' | 'forgot-password';
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'patient',
  initialMode = 'login',
  onSuccess,
}) => {
  const { signIn, signUpPatient, signUpCaregiver, resetPassword, quickDemoLogin, isLoading } = useAuth();
  const { showToast, navigate, setUserMode } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Common Form state
  const [email, setEmail] = useState('asha.devi@axiomcare.in');
  const [password, setPassword] = useState('AxiomCare2026!');
  const [confirmPassword, setConfirmPassword] = useState('AxiomCare2026!');
  const [fullName, setFullName] = useState('Asha Devi');

  // Patient Registration fields
  const [age, setAge] = useState<number>(68);
  const [gender, setGender] = useState<string>('Female');
  const [location, setLocation] = useState<string>('Guwahati, Assam (NER)');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');

  // Caregiver Registration fields
  const [relationship, setRelationship] = useState<string>('Daughter / Primary Family Caregiver');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Forgot Password Flow
    if (mode === 'forgot-password') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset email sent! Check your inbox.');
      } else {
        setErrorMsg(res.error || 'Could not send reset email.');
      }
      return;
    }

    // 2. Login Flow
    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.success) {
        setUserMode(selectedRole);
        showToast(`Signed in successfully as ${fullName || 'User'}!`);
        if (onSuccess) onSuccess();
        else navigate(selectedRole === 'caregiver' ? '/caregiver/dashboard' : '/home');
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      }
      return;
    }

    // 3. Signup Flow
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      if (selectedRole === 'patient') {
        const res = await signUpPatient({
          fullName,
          email,
          password,
          age: Number(age),
          gender,
          location,
          language: preferredLanguage,
        });
        if (res.success) {
          setUserMode('patient');
          showToast(`Welcome to Axiom, ${fullName}!`);
          if (onSuccess) onSuccess();
          else navigate('/onboarding/flow');
        } else {
          setErrorMsg(res.error || 'Patient registration failed.');
        }
      } else {
        const res = await signUpCaregiver({
          fullName,
          email,
          password,
          relationship,
          language: preferredLanguage,
        });
        if (res.success) {
          setUserMode('caregiver');
          showToast(`Caregiver account created for ${fullName}!`);
          if (onSuccess) onSuccess();
          else navigate('/caregiver/dashboard');
        } else {
          setErrorMsg(res.error || 'Caregiver registration failed.');
        }
      }
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    await quickDemoLogin(role);
    setUserMode(role);
    showToast(`Signed in as Demo ${role === 'caregiver' ? 'Caregiver (Priya)' : 'Patient (Asha)'}`);
    if (onSuccess) onSuccess();
    else navigate(role === 'caregiver' ? '/caregiver/dashboard' : '/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 md:p-10 text-white animate-fadeIn">
      <div className="max-w-md mx-auto w-full my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-teal-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-2xl shadow-teal-600/30">
            <Brain size={32} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} /> SIH 2026 NER Cognitive Care
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'login'
              ? 'Sign in to Axiom'
              : mode === 'signup'
              ? 'Register for Axiom'
              : 'Reset Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'forgot-password'
              ? 'Enter your email to receive password recovery instructions'
              : selectedRole === 'patient'
              ? 'Personalized cognitive companion & memory assistance'
              : 'Clinical analytics & patient caregiver monitoring'}
          </p>
        </div>

        {/* Role Switcher (Visible in Login & Signup modes) */}
        {mode !== 'forgot-password' && (
          <div className="grid grid-cols-2 bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('patient');
                setEmail('asha.devi@axiomcare.in');
                setFullName('Asha Devi');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={15} /> Patient Account
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('caregiver');
                setEmail('priya.sharma@axiomcare.in');
                setFullName('Priya Sharma');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedRole === 'caregiver'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake size={15} /> Caregiver Portal
            </button>
          </div>
        )}

        {/* Auth Form Card */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name (for Registration) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm font-semibold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@axiomcare.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm font-semibold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Patient Specific Registration Details */}
            {mode === 'signup' && selectedRole === 'patient' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="110"
                    required
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary / Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Guwahati, Assam"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white"
                  />
                </div>
              </div>
            )}

            {/* Caregiver Specific Registration Details */}
            {mode === 'signup' && selectedRole === 'caregiver' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Relationship to Patient
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter / Professional Nurse"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white"
                />
              </div>
            )}

            {/* Password (for Login and Signup) */}
            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm font-semibold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (for Registration) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm font-semibold text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedRole === 'caregiver'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30'
              }`}
            >
              <span>
                {mode === 'login'
                  ? 'Sign In to Account'
                  : mode === 'signup'
                  ? 'Create New Account'
                  : 'Send Reset Email'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle between Login, Signup, and Forgot Password */}
          <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
            {mode === 'login' ? (
              <div>
                New to Axiom?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            ) : (
              <div>
                Remembered your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            )}
          </div>

          {/* Fast 1-Click SIH Evaluation Button Bar */}
          <div className="pt-3 border-t border-slate-700/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">
              ⚡ Instant SIH 1-Click Evaluation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                className="py-2 px-3 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-600/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User size={13} /> Demo Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('caregiver')}
                className="py-2 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-600/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HeartHandshake size={13} /> Demo Caregiver
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-[11px] text-slate-500">
          Supabase Auth Encrypted • SIH 2026 Team Axiom
        </footer>
      </div>
    </div>
  );
};
