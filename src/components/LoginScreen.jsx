import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft, KeyRound, CheckCircle, AlertCircle, Send, ExternalLink } from 'lucide-react';
import { StorageService } from '../utils/storage';
import { sendPasswordResetEmail, getEmailServiceStatus } from '../services/emailService';

const LoginScreen = ({ onLoginSuccess, onBack }) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   // Forgot Password State
   const [showForgotPassword, setShowForgotPassword] = useState(false);
   const [resetEmail, setResetEmail] = useState('');
   const [resetStatus, setResetStatus] = useState(null); // 'sending', 'sent', 'error'
   const [resetError, setResetError] = useState('');
   const [resetResult, setResetResult] = useState(null);

   const handleLogin = () => {
      if (!email || !password) {
         setError('Please fill in all fields');
         return;
      }

      const user = StorageService.loginUser(email, password);

      if (user) {
         onLoginSuccess(user);
      } else {
         setError('Invalid email or password. Please try again.');
      }
   };

   const handleForgotPassword = async () => {
      if (!resetEmail) {
         setResetError('Please enter your email address');
         return;
      }

      if (!/\S+@\S+\.\S+/.test(resetEmail)) {
         setResetError('Please enter a valid email address');
         return;
      }

      // Check if user exists
      const users = StorageService.getAllUsers();
      const user = users.find(u => u.email === resetEmail);

      if (!user) {
         setResetError('No account found with this email address');
         return;
      }

      setResetStatus('sending');
      setResetError('');

      try {
         // Get user's name for personalized email
         const userName = user.firstName || 'User';

         // Send real password reset email
         const result = await sendPasswordResetEmail(resetEmail, userName);

         console.log('Email send result:', result);

         setResetResult(result);
         setResetStatus('sent');

      } catch (err) {
         console.error('Error sending reset email:', err);
         setResetStatus('error');
         setResetError('Failed to send reset email. Please try again.');
      }
   };

   const handleBackToLogin = () => {
      setShowForgotPassword(false);
      setResetEmail('');
      setResetStatus(null);
      setResetError('');
      setResetResult(null);
   };

   // Check email service configuration
   const emailStatus = getEmailServiceStatus();

   // Forgot Password Screen
   if (showForgotPassword) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">

               <button
                  onClick={handleBackToLogin}
                  className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors"
               >
                  <ArrowLeft className="w-6 h-6" />
               </button>

               <div className="text-center mb-8 mt-4">
                  <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
                     <KeyRound className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                  <p className="text-white/70 mt-2">
                     {resetStatus === 'sent'
                        ? 'Check your email for reset instructions'
                        : 'Enter your email to receive a reset link'}
                  </p>
               </div>

               {resetStatus === 'sent' ? (
                  // Success state
                  <div className="space-y-6">
                     <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                           {resetResult?.demoMode ? 'Reset Link Generated!' : 'Email Sent!'}
                        </h3>
                        <p className="text-white/80 text-sm">
                           {resetResult?.demoMode
                              ? 'Since email service is in demo mode, use the link below:'
                              : 'We\'ve sent password reset instructions to:'}
                        </p>
                        <p className="text-green-300 font-medium mt-2">{resetEmail}</p>

                        {!resetResult?.demoMode && (
                           <p className="text-white/60 text-xs mt-4">
                              If you don't see the email, check your spam folder.
                           </p>
                        )}
                     </div>

                     {/* Demo Mode Info */}
                     {resetResult?.demoMode && (
                        <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 space-y-3">
                           <div className="flex items-center gap-2 text-amber-300">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">Demo Mode Active</span>
                           </div>
                           <p className="text-white/70 text-sm">
                              To enable real email sending, configure EmailJS in your environment variables.
                           </p>

                           {resetResult?.resetLink && (
                              <div className="bg-black/30 rounded-lg p-3 mt-3">
                                 <p className="text-white/60 text-xs mb-2">Your reset link:</p>
                                 <div className="flex items-center gap-2">
                                    <code className="text-green-300 text-xs break-all flex-1">
                                       {resetResult.resetLink}
                                    </code>
                                    <button
                                       onClick={() => {
                                          navigator.clipboard.writeText(resetResult.resetLink);
                                          alert('Link copied!');
                                       }}
                                       className="text-white/60 hover:text-white p-1"
                                       title="Copy link"
                                    >
                                       <ExternalLink className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Setup Instructions */}
                     {resetResult?.demoMode && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                           <p className="text-white/80 text-sm font-medium mb-2">
                              📧 To enable real emails, add to your .env file:
                           </p>
                           <div className="bg-black/30 rounded-lg p-3 space-y-1">
                              <code className="text-cyan-300 text-xs block">VITE_EMAILJS_SERVICE_ID=your_service_id</code>
                              <code className="text-cyan-300 text-xs block">VITE_EMAILJS_TEMPLATE_ID=your_template_id</code>
                              <code className="text-cyan-300 text-xs block">VITE_EMAILJS_PUBLIC_KEY=your_public_key</code>
                           </div>
                           <a
                              href="https://www.emailjs.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-xs mt-2"
                           >
                              Get free EmailJS account <ExternalLink className="w-3 h-3" />
                           </a>
                        </div>
                     )}

                     <button
                        onClick={handleBackToLogin}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                     >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Login</span>
                     </button>
                  </div>
               ) : (
                  // Input state
                  <div className="space-y-6">
                     <div>
                        <label className="block text-white/90 font-medium mb-2 pl-1">Email Address</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                           <input
                              type="email"
                              value={resetEmail}
                              onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 text-white placeholder-white/30 border border-white/10 focus:border-amber-500 focus:outline-none focus:bg-black/30 transition-all"
                              placeholder="Enter your registered email"
                              disabled={resetStatus === 'sending'}
                              onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                           />
                        </div>
                     </div>

                     {/* Email Service Status Indicator */}
                     <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${emailStatus.emailjsConfigured ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <span className="text-white/50">
                           {emailStatus.emailjsConfigured
                              ? 'Email service configured'
                              : 'Demo mode (emails logged to console)'}
                        </span>
                     </div>

                     {resetError && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 flex-shrink-0" />
                           {resetError}
                        </div>
                     )}

                     <button
                        onClick={handleForgotPassword}
                        disabled={resetStatus === 'sending'}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                     >
                        {resetStatus === 'sending' ? (
                           <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Sending...</span>
                           </>
                        ) : (
                           <>
                              <Send className="w-5 h-5" />
                              <span>Send Reset Link</span>
                           </>
                        )}
                     </button>

                     <div className="text-center">
                        <button
                           onClick={handleBackToLogin}
                           className="text-white/60 hover:text-white text-sm transition-colors"
                        >
                           Remember your password? <span className="text-pink-400 font-medium">Login</span>
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      );
   }

   // Regular Login Screen
   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
         <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">

            <button
               onClick={onBack}
               className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors"
            >
               <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="text-center mb-8 mt-4">
               <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
               <p className="text-white/70 mt-2">Please login to continue</p>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-white/90 font-medium mb-2 pl-1">Email</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                     <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 text-white placeholder-white/30 border border-white/10 focus:border-pink-500 focus:outline-none focus:bg-black/30 transition-all"
                        placeholder="Enter your email"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-white/90 font-medium mb-2 pl-1">Password</label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                     <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/20 text-white placeholder-white/30 border border-white/10 focus:border-pink-500 focus:outline-none focus:bg-black/30 transition-all"
                        placeholder="Enter your password"
                     />
                  </div>
               </div>

               {/* Forgot Password Link */}
               <div className="text-right">
                  <button
                     onClick={() => setShowForgotPassword(true)}
                     className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
                  >
                     Forgot Password?
                  </button>
               </div>

               {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
                     {error}
                  </div>
               )}

               <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 mt-4"
               >
                  <span>Login</span>
                  <LogIn className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
   );
};

export default LoginScreen;