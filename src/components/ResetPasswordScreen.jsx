// FILE: src/components/ResetPasswordScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, KeyRound, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword, validateResetToken } from '../services/emailService';

const getTokenFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  } catch (e) {
    return '';
  }
};

const ResetPasswordScreen = ({ onBackToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = useMemo(() => getTokenFromUrl(), []);
  const resetRecord = useMemo(() => (token ? validateResetToken(token) : null), [token]);

  useEffect(() => {
    if (!token) {
      setError('Missing reset token');
      return;
    }
    if (!resetRecord) {
      setError('Invalid or expired reset link');
    }
  }, [token, resetRecord]);

  const handleSubmit = () => {
    if (!token) return;
    if (!resetRecord) {
      setError('Invalid or expired reset link');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = resetPassword(token, newPassword);
    if (!result?.success) {
      setError(result?.error || 'Failed to reset password');
      return;
    }

    setError('');
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">
          <div className="text-center mb-8 mt-4">
            <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Password Updated</h2>
            <p className="text-white/70 mt-2">You can now login with your new password.</p>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">
        <button
          onClick={onBackToLogin}
          className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Set New Password</h2>
          <p className="text-white/70 mt-2">Choose a new password for your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white/90 font-medium mb-2 pl-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 text-white placeholder-white/30 border border-white/10 focus:border-amber-500 focus:outline-none focus:bg-black/30 transition-all"
                placeholder="Enter new password"
                disabled={!resetRecord}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 font-medium mb-2 pl-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 text-white placeholder-white/30 border border-white/10 focus:border-amber-500 focus:outline-none focus:bg-black/30 transition-all"
                placeholder="Confirm new password"
                disabled={!resetRecord}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!resetRecord}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
