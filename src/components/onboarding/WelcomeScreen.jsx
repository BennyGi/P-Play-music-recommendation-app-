import React from 'react';
import { Music, Sparkles, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const WelcomeScreen = ({ userData, onCustomPlaylist, onDefaultPlaylist }) => {
   console.log('WelcomeScreen userData:', userData);

   const firstName = userData?.name?.split(' ')[0] || userData?.name || 'there';
   const fullCountry = userData?.country || 'your country';
   const countryName = fullCountry.includes('🇮🇱') ? fullCountry.split(' ').slice(1).join(' ') : fullCountry;

   console.log('firstName:', firstName);
   console.log('country:', countryName);

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
         <div className="max-w-4xl w-full">
            <div className="text-center mb-12 space-y-6">
               <div className="inline-block p-6 bg-white/20 rounded-full mb-4 animate-bounce">
                  <Music className="w-16 h-16 text-white" />
               </div>

               <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-white/90">
                     Welcome
                  </h1>
                  <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                     {firstName}
                  </h2>
               </div>

               <p className="text-xl md:text-2xl text-white/80 mt-6">
                  First time here? Let's get you started! 🎵
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <button
                  onClick={onCustomPlaylist}
                  className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 hover:border-pink-400 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50 text-left"
               >
                  <div className="absolute top-4 right-4">
                     <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMENDED
                     </div>
                  </div>

                  <div className="mb-6">
                     <div className="inline-block p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                     </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3">
                     Create Custom Playlist
                  </h3>

                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                     Answer a few quick questions about your music taste, and we'll create the perfect personalized playlist just for you!
                  </p>

                  <div className="flex items-center gap-2 text-white/60 mb-6">
                     <Clock className="w-5 h-5" />
                     <span className="text-sm">Takes about 1-2 minutes</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                     <span className="text-pink-400 font-bold group-hover:text-pink-300 transition-colors">
                        Let's personalize →
                     </span>
                     <ArrowRight className="w-6 h-6 text-pink-400 group-hover:translate-x-2 transition-transform" />
                  </div>
               </button>

               <button
                  onClick={onDefaultPlaylist}
                  className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 hover:border-cyan-400 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 text-left"
               >
                  <div className="mb-6">
                     <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                     </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3">
                     Popular in {countryName}
                  </h3>

                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                     Skip the questions and jump straight into the most popular tracks currently trending in {countryName}!
                  </p>

                  <div className="flex items-center gap-2 text-white/60 mb-6">
                     <Clock className="w-5 h-5" />
                     <span className="text-sm">Instant playlist</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                     <span className="text-cyan-400 font-bold group-hover:text-cyan-300 transition-colors">
                        Start listening now →
                     </span>
                     <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                  </div>
               </button>
            </div>

            <div className="text-center">
               <p className="text-white/60 text-sm">
                  Don't worry, you can always change your preferences later!
               </p>
            </div>
         </div>
      </div>
   );
};

export default WelcomeScreen;