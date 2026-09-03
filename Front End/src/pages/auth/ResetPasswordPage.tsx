import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Brain, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, ChevronLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword, isLoading } = useAuth();
  const { showToast, navigate } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    const res = await updatePassword(password);
    if (res.success) {
      setSuccess(true);
      showToast('Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Failed to update password. Link may be expired.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-slate-50 to-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-3">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Sign In
        </button>
      </div>

      <div className="max-w-md mx-auto w-full my-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
            <Brain size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Enter your new secure password below to restore account access.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 size={44} className="text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-slate-900">Password Updated!</h3>
              <p className="text-xs text-slate-500">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Saving...' : 'Save New Password'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        <footer className="text-center text-[11px] text-slate-400">
          Encrypted Authentication • SIH 2026 Team Axiom
        </footer>
      </div>
    </div>
  );
};
