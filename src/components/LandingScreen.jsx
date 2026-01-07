import React from 'react';
import { Music, LogIn, UserPlus } from 'lucide-react';

const LandingScreen = ({ onLoginClick, onSignupClick }) => {
   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
         <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 text-center shadow-2xl">

            {/* Logo Animation */}
            <div className="inline-block p-6 bg-white/20 rounded-full mb-8 animate-bounce">
               <Music className="w-16 h-16 text-white" />
            </div>

            {/* Title & Description */}
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
               P-Play
            </h1>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
               The perfect app for discovering new playlists that match your taste.
            </p>

            {/* Buttons */}
            <div className="space-y-4">
               <button
                  onClick={onLoginClick}
                  className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
               >
                  <LogIn className="w-5 h-5" />
                  Login to Existing User
               </button>

               <button
                  onClick={onSignupClick}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
               >
                  <UserPlus className="w-5 h-5" />
                  Create a New Account
               </button>
            </div>

            <p className="mt-8 text-white/40 text-sm">
               Version 1.0.3 • Music Discovery
            </p>
         </div>
      </div>
   );
};

export default LandingScreen;