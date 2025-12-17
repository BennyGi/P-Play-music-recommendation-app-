import React, { useState, useEffect } from 'react';
import { CheckCircle, Rocket, Coffee, Code, Zap, Trophy, PartyPopper } from 'lucide-react';

const Sprint1Complete = () => {
   const [showConfetti, setShowConfetti] = useState(false);

   useEffect(() => {
      setShowConfetti(true);
   }, []);

   const funnyMessages = [
      "Our developers are currently taking a coffee break ☕",
      "Sprint 2 is being coded by highly trained monkeys 🐵",
      "We're adding more cowbell to Sprint 2 🔔",
      "Sprint 2: Now with 50% more features (probably) 📊",
      "Our AI is learning how to code... slowly 🤖",
      "Sprint 2 coming soon™ (very soon, we promise!) ⏰"
   ];

   const [currentMessage, setCurrentMessage] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentMessage((prev) => (prev + 1) % funnyMessages.length);
      }, 3000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-6 relative overflow-hidden">
         {/* Confetti Animation */}
         {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
               {[...Array(50)].map((_, i) => (
                  <div
                     key={i}
                     className="absolute animate-bounce"
                     style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                     }}
                  >
                     {['🎉', '🎊', '🎈', '⭐', '✨', '🎵', '🎸', '🎤'][Math.floor(Math.random() * 8)]}
                  </div>
               ))}
            </div>
         )}

         <div className="max-w-4xl w-full">
            {/* Main Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl text-center space-y-8">
               {/* Trophy Icon */}
               <div className="flex justify-center">
                  <div className="relative">
                     <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                     <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-full animate-bounce">
                        <Trophy className="w-20 h-20 text-white" />
                     </div>
                  </div>
               </div>

               {/* Success Message */}
               <div className="space-y-4">
                  <h1 className="text-6xl md:text-7xl font-black text-white mb-4">
                     🎉 SPRINT 1
                  </h1>
                  <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                     COMPLETE!
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-green-400 text-2xl font-bold">
                     <CheckCircle className="w-8 h-8" />
                     <span>Achievement Unlocked!</span>
                  </div>
               </div>

               {/* Stats Section */}
               <div className="grid md:grid-cols-3 gap-4 my-8">
                  <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                     <div className="text-4xl mb-2">✅</div>
                     <div className="text-white/60 text-sm">Tasks Completed</div>
                     <div className="text-3xl font-bold text-white">100%</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                     <div className="text-4xl mb-2">☕</div>
                     <div className="text-white/60 text-sm">Coffee Consumed</div>
                     <div className="text-3xl font-bold text-white">∞</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                     <div className="text-4xl mb-2">🐛</div>
                     <div className="text-white/60 text-sm">Bugs Fixed</div>
                     <div className="text-3xl font-bold text-white">Many</div>
                  </div>
               </div>

               {/* Funny Message Carousel */}
               <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
                  <div className="flex items-center justify-center gap-3 mb-3">
                     <Coffee className="w-6 h-6 text-purple-300 animate-pulse" />
                     <p className="text-xl text-purple-200 font-medium">
                        {funnyMessages[currentMessage]}
                     </p>
                  </div>
               </div>

               {/* Sprint 2 Teaser */}
               <div className="space-y-6 pt-8 border-t border-white/20">
                  <div className="flex items-center justify-center gap-3">
                     <Rocket className="w-8 h-8 text-yellow-300 animate-bounce" />
                     <h3 className="text-3xl font-bold text-white">Coming in Sprint 2:</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-left">
                     <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-cyan-400/30">
                        <div className="flex items-center gap-2 text-cyan-300 mb-2">
                           <Zap className="w-5 h-5" />
                           <span className="font-bold">Real Spotify Integration</span>
                        </div>
                        <p className="text-white/70 text-sm">Actual music streaming (not fake data!)</p>
                     </div>

                     <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-pink-400/30">
                        <div className="flex items-center gap-2 text-pink-300 mb-2">
                           <Code className="w-5 h-5" />
                           <span className="font-bold">Smart Recommendations</span>
                        </div>
                        <p className="text-white/70 text-sm">AI-powered song suggestions</p>
                     </div>

                     <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                        <div className="flex items-center gap-2 text-green-300 mb-2">
                           <PartyPopper className="w-5 h-5" />
                           <span className="font-bold">Social Features</span>
                        </div>
                        <p className="text-white/70 text-sm">Share playlists with friends</p>
                     </div>

                     <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
                        <div className="flex items-center gap-2 text-orange-300 mb-2">
                           <Trophy className="w-5 h-5" />
                           <span className="font-bold">Premium Features</span>
                        </div>
                        <p className="text-white/70 text-sm">Because we need to eat too 🍕</p>
                     </div>
                  </div>
               </div>

               {/* Developer Note */}
               <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                  <p className="text-white/80 text-lg mb-3">
                     <span className="font-bold text-yellow-300">Pro Tip:</span> This would be a great time to grab some popcorn 🍿
                  </p>
                  <p className="text-white/60 text-sm">
                     Sprint 2 development starts right after the team finishes this energy drink
                  </p>
               </div>

               {/* Fun Footer */}
               <div className="pt-6 space-y-3">
                  <p className="text-white/40 text-xs">
                     * No developers were harmed in the making of this sprint
                  </p>
                  <p className="text-white/40 text-xs">
                     ** Okay maybe some sleep was sacrificed
                  </p>
                  <p className="text-white/40 text-xs">
                     *** And a lot of coffee. So much coffee. Send help.
                  </p>
               </div>

               {/* Loading Bar (Fake) */}
               <div className="space-y-2">
                  <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                     <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-green-400 text-sm font-mono">
                     Sprint_1_Progress: 100% ✓
                  </p>
               </div>

               {/* Refresh Button */}
               <button
                  onClick={() => window.location.reload()}
                  className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
               >
                  🔄 Start Over (For Testing Purposes Only)
               </button>
            </div>
         </div>
      </div>
   );
};

export default Sprint1Complete;