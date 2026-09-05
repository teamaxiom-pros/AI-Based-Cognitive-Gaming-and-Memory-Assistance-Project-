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
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  MapPin,
  Globe,
  Copy,
  ChevronLeft,
  ShieldCheck,
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
  const {
    signIn,
    signUpPatient,
    signUpCaregiver,
    resetPassword,
    quickDemoLogin,
    isLoading,
  } = useAuth();
  const { showToast, navigate, setUserMode, t, language, setLanguage } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [signupStep, setSignupStep] = useState<number>(1); // 1: Role, 2: Credentials, 3: Profile/Details, 4: Caregiver Link/Code
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
  const [location, setLocation] = useState<string>('Guwahati, Assam');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const [generatedInviteCode] = useState<string>('AXM-ASH-4821');

  // Caregiver Registration fields
  const [relationship, setRelationship] = useState<string>('Daughter / Family Caregiver');
  const [caregiverInviteCodeInput, setCaregiverInviteCodeInput] = useState<string>('');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = await signIn(email, password);
    if (res.success) {
      setUserMode(selectedRole);
      showToast(`Welcome back to Axiom!`);
      if (onSuccess) onSuccess();
      else navigate(selectedRole === 'caregiver' ? '/caregiver/dashboard' : '/home');
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  // 2. Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    const res = await resetPassword(email);
    if (res.success) {
      setSuccessMsg(res.message || 'Password reset instructions have been sent to your email.');
    } else {
      setErrorMsg(res.error || 'Failed to send password reset email.');
    }
  };

  // 3. Handle Patient Signup Wizard Step Progression
  const handlePatientSignupSubmit = async () => {
    setErrorMsg(null);
    const res = await signUpPatient({
      fullName: fullName || 'Asha Devi',
      email,
      password,
      age: Number(age),
      gender,
      location,
      language: preferredLanguage,
    });

    if (res.success) {
      setUserMode('patient');
      showToast(`Account created! Let's establish your cognitive baseline.`);
      if (onSuccess) onSuccess();
      else navigate('/assessment/intro');
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  // 4. Handle Caregiver Signup Wizard
  const handleCaregiverSignupSubmit = async () => {
    setErrorMsg(null);
    const res = await signUpCaregiver({
      fullName: fullName || 'Priya Sharma',
      email,
      password,
      relationship,
      language: preferredLanguage,
    });

    if (res.success) {
      setUserMode('caregiver');
      showToast(`Caregiver portal created for ${fullName}!`);
      if (onSuccess) onSuccess();
      else navigate('/caregiver/dashboard');
    } else {
      setErrorMsg(res.error || 'Caregiver registration failed.');
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setErrorMsg(null);
    await quickDemoLogin(role);
    setUserMode(role);
    showToast(`Signed in as Demo ${role === 'caregiver' ? 'Caregiver (Priya)' : 'Patient (Asha)'}`);
    if (onSuccess) onSuccess();
    else navigate(role === 'caregiver' ? '/caregiver/dashboard' : '/home');
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedInviteCode);
    showToast('Invite code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-slate-50 to-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      {/* Top Back to Landing Button */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} /> {t('common.back')}
        </button>
        <span className="text-[11px] text-teal-700 font-bold uppercase tracking-wider">
          {t('common.appName')}
        </span>
      </div>

      <div className="max-w-md mx-auto w-full my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
            <Brain size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'login'
              ? t('auth.welcomeBack')
              : mode === 'signup'
              ? selectedRole === 'patient'
                ? t('auth.createPatientAccount')
                : t('auth.createCaregiverAccount')
              : t('auth.resetPasswordTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {mode === 'forgot-password'
              ? t('auth.forgotPasswordSubtitle')
              : mode === 'login'
              ? t('auth.loginSubtitle')
              : selectedRole === 'patient'
              ? t('auth.signupPatientSubtitle')
              : t('auth.signupCaregiverSubtitle')}
          </p>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: LOGIN                                                               */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
            {/* Role Tab */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('patient');
                  setEmail('asha.devi@axiomcare.in');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User size={15} /> {t('common.patientAccount')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('caregiver');
                  setEmail('priya.sharma@axiomcare.in');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedRole === 'caregiver'
                    ? 'bg-white text-indigo-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <HeartHandshake size={15} /> {t('common.caregiverAccount')}
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@axiomcare.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('auth.passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    {t('auth.forgotPasswordLink')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  selectedRole === 'caregiver'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                }`}
              >
                <span>{isLoading ? t('auth.signingIn') : t('auth.signInBtn')}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-center pt-1 text-xs text-slate-500">
              {t('auth.newToAxiom')}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupStep(1);
                  setErrorMsg(null);
                }}
                className="text-teal-600 font-bold hover:underline cursor-pointer"
              >
                {t('auth.createAccountLink')}
              </button>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">
                {t('auth.instantDemoTitle')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('patient')}
                  className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <User size={13} /> {t('auth.demoPatient')}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('caregiver')}
                  className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HeartHandshake size={13} /> {t('auth.demoCaregiver')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: FORGOT PASSWORD                                                     */}
        {/* ========================================================================= */}
        {mode === 'forgot-password' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@axiomcare.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? t('auth.sending') : t('auth.sendRecoveryEmail')}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-teal-600 font-bold hover:underline cursor-pointer"
              >
                {t('auth.backToSignIn')}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: SIGNUP WIZARD                                                       */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
              <span>Step {signupStep} of {selectedRole === 'patient' ? 4 : 3}</span>
              <span className="text-teal-600 capitalize">{selectedRole} Registration</span>
            </div>

            {/* STEP 1: How will you use Axiom? */}
            {signupStep === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    How will you use Axiom?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select the option that best describes your needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedRole('patient')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-2 ${
                      selectedRole === 'patient'
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">I am a Patient</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Play daily brain games, track memories, and get personalized support.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedRole('caregiver')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-2 ${
                      selectedRole === 'caregiver'
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <HeartHandshake size={18} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">I am a Caregiver</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Family member, nurse, or doctor managing routine and wellbeing.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSignupStep(2)}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: Account Credentials */}
            {signupStep === 2 && (
              <div className="space-y-3.5">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Account Details</h3>
                  <p className="text-xs text-slate-500">Create your secure login credentials.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={selectedRole === 'caregiver' ? 'Priya Sharma' : 'Asha Devi'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@axiomcare.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName.trim() || !email.trim() || !password) {
                        setErrorMsg('Please fill in all required fields.');
                        return;
                      }
                      if (password !== confirmPassword) {
                        setErrorMsg('Passwords do not match.');
                        return;
                      }
                      if (password.length < 6) {
                        setErrorMsg('Password must be at least 6 characters.');
                        return;
                      }
                      setErrorMsg(null);
                      setSignupStep(3);
                    }}
                    className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next: Profile Info</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 (Patient): Demographic & Language Details */}
            {signupStep === 3 && selectedRole === 'patient' && (
              <div className="space-y-3.5">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Patient Profile</h3>
                  <p className="text-xs text-slate-500">Helps tailor comfortable activity settings.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="40"
                      max="110"
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary / Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Guwahati, Assam"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                    <select
                      value={preferredLanguage}
                      onChange={e => setPreferredLanguage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="as">অসমীয়া (Assamese)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupStep(4)}
                    className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next: Caregiver</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 (Patient): Caregiver Invite Code */}
            {signupStep === 4 && selectedRole === 'patient' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Connect a Caregiver</h3>
                  <p className="text-xs text-slate-500">
                    A family caregiver or nurse can support your daily routine.
                  </p>
                </div>

                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2.5">
                  <span className="text-xs font-bold text-teal-900 block">
                    Your Caregiver Invite Code
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2.5 bg-white rounded-xl border border-teal-300 text-center font-mono font-bold text-base tracking-wider text-teal-800">
                      {generatedInviteCode}
                    </div>
                    <button
                      type="button"
                      onClick={copyCodeToClipboard}
                      className="p-2.5 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-teal-200 cursor-pointer shadow-2xs"
                      title="Copy code"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Share this code with your caregiver so they can link with your profile.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handlePatientSignupSubmit}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  <span>{isLoading ? 'Creating Account...' : 'Begin Initial Assessment'}</span>
                  <ArrowRight size={16} />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePatientSignupSubmit}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    I'll set up my caregiver later
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 (Caregiver): Relationship & Invite Code */}
            {signupStep === 3 && selectedRole === 'caregiver' && (
              <div className="space-y-3.5">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Connect to Patient</h3>
                  <p className="text-xs text-slate-500">Enter your relationship and optional invite code.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship to Patient
                  </label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    placeholder="e.g. Daughter / Nurse"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Invite Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={caregiverInviteCodeInput}
                    onChange={e => setCaregiverInviteCodeInput(e.target.value)}
                    placeholder="e.g. AXM-ASH-4821"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-mono font-bold tracking-wider uppercase focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    If your patient shared an invite code, enter it now to link automatically.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleCaregiverSignupSubmit}
                    className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Creating...' : 'Open Caregiver Portal'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Toggle to Sign In */}
            <div className="text-center text-xs text-slate-500 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="text-teal-600 font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </div>
          </div>
        )}

        <footer className="text-center text-[11px] text-slate-400">
          Encrypted Authentication • SIH 2026 Team Axiom
        </footer>
      </div>
    </div>
  );
};
