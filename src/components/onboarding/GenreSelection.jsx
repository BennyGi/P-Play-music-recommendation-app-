import React, { useState } from 'react';
import { Check, ArrowRight, SkipForward } from 'lucide-react';

const GenreSelection = ({ onContinue, onSkip }) => {
   const [selectedGenres, setSelectedGenres] = useState([]);

   const genres = [
      { id: 1, name: 'Pop', image: '/assets/pop.jpg', color: 'from-pink-500 to-rose-500' },
      { id: 2, name: 'Rock', image: '/assets/rock.jpg', color: 'from-red-500 to-orange-500' },
      { id: 3, name: 'Hip Hop', image: '/assets/hiphop.jpg', color: 'from-purple-500 to-indigo-500' },
      { id: 4, name: 'Rap', image: '/assets/rap.jpg', color: 'from-gray-800 to-gray-900' },
      { id: 5, name: 'Electronic', image: '/assets/electronic.jpg', color: 'from-cyan-500 to-blue-500' },
      { id: 6, name: 'Jazz', image: '/assets/jazz.jpg', color: 'from-yellow-500 to-amber-500' },
      { id: 7, name: 'Classical', image: '/assets/classic.jpg', color: 'from-indigo-500 to-purple-500' },
      { id: 8, name: 'R&B', image: '/assets/R&B.jpg', color: 'from-pink-500 to-purple-500' },
      { id: 9, name: 'Country', image: '/assets/country.jpg', color: 'from-orange-500 to-yellow-500' },
      { id: 10, name: 'Latin', image: '/assets/latin.jpg', color: 'from-red-500 to-pink-500' },
      { id: 11, name: 'Metal', image: '/assets/metal.jpg', color: 'from-gray-700 to-gray-900' },
      { id: 12, name: 'Indie', image: '/assets/indie.jpg', color: 'from-teal-500 to-cyan-500' },
      { id: 13, name: 'Dance', image: '/assets/dance(EDM).jpg', color: 'from-blue-500 to-purple-500' },
      { id: 14, name: 'Reggae', image: '/assets/Reggae.jpg', color: 'from-green-500 to-emerald-500' },
      { id: 15, name: 'Blues', image: '/assets/blues.jpg', color: 'from-blue-600 to-indigo-600' },
      { id: 16, name: 'Folk', image: '/assets/folk.jpg', color: 'from-amber-600 to-orange-600' },
      { id: 17, name: 'Soul', image: '/assets/soul.jpg', color: 'from-purple-600 to-pink-600' },
      { id: 18, name: 'Punk', image: '/assets/punk.jpg', color: 'from-red-600 to-pink-600' },
      { id: 19, name: 'Funk', image: '/assets/funk.jpg', color: 'from-yellow-600 to-orange-600' },
      { id: 20, name: 'House', image: '/assets/house.jpg', color: 'from-blue-500 to-cyan-500' },
      { id: 21, name: 'K-Pop', image: '/assets/kpop.jpg', color: 'from-pink-400 to-purple-400' },
      { id: 22, name: 'Lo-Fi', image: '/assets/lo-fi.jpg', color: 'from-purple-400 to-indigo-400' },
      { id: 23, name: 'Ambient', image: '/assets/Ambient.jpg', color: 'from-indigo-400 to-blue-400' },
      { id: 24, name: 'Afrobeats', image: '/assets/afrobeats.jpg', color: 'from-orange-500 to-red-500' },
   ];

   const toggleGenre = (genreId) => {
      setSelectedGenres(prev =>
         prev.includes(genreId)
            ? prev.filter(id => id !== genreId)
            : [...prev, genreId]
      );
   };

   const canContinue = selectedGenres.length >= 2;

   return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-6">
         <div className="max-w-6xl mx-auto py-12">
            {/* Progress Indicator */}
            <div className="mb-8">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                     1
                  </div>
                  <div className="w-12 h-1 bg-white/20"></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
                     2
                  </div>
                  <div className="w-12 h-1 bg-white/10"></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
                     3
                  </div>
                  <div className="w-12 h-1 bg-white/10"></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/50 font-bold">
                     4
                  </div>
               </div>
               <p className="text-center text-white/60 text-sm">Step 1 of 4</p>
            </div>

            {/* Header */}
            <div className="text-center mb-12 space-y-4">
               <h2 className="text-5xl font-bold text-white">
                  What music genres do you love?
               </h2>
               <p className="text-xl text-white/80">
                  Select at least 2-3 favorite genres
               </p>
               <div className="flex items-center justify-center gap-4">
                  <p className="text-white/60">Selected: {selectedGenres.length}</p>
                  {selectedGenres.length >= 2 && selectedGenres.length < 3 && (
                     <p className="text-yellow-300 text-sm">Select 1 more for better recommendations</p>
                  )}
                  {selectedGenres.length >= 3 && (
                     <p className="text-green-300 text-sm">✓ Great selection!</p>
                  )}
               </div>
            </div>

            {/* Genre Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
               {genres.map(genre => (
                  <button
                     key={genre.id}
                     onClick={() => toggleGenre(genre.id)}
                     className={`relative group overflow-hidden rounded-2xl transition-all duration-300 aspect-square ${selectedGenres.includes(genre.id)
                           ? 'scale-105 shadow-2xl ring-4 ring-white/50'
                           : 'hover:scale-105 shadow-lg'
                        }`}
                  >
                     {/* Background Image */}
                     <div className="absolute inset-0">
                        <img
                           src={genre.image}
                           alt={genre.name}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = `linear-gradient(to bottom right, ${genre.color})`;
                           }}
                        />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${selectedGenres.includes(genre.id)
                              ? 'from-black/80 via-black/40 to-transparent'
                              : 'from-black/70 via-black/30 to-transparent group-hover:from-black/80'
                           } transition-all duration-300`}></div>
                     </div>

                     {/* Genre Name */}
                     <div className="absolute inset-0 flex items-end justify-center p-4">
                        <h3 className="text-white font-bold text-xl text-center drop-shadow-lg">
                           {genre.name}
                        </h3>
                     </div>

                     {/* Selected Checkmark */}
                     {selectedGenres.includes(genre.id) && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-lg animate-fadeIn">
                           <Check className="w-5 h-5 text-purple-600" strokeWidth={3} />
                        </div>
                     )}

                     {/* Hover Border Effect */}
                     <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${selectedGenres.includes(genre.id)
                           ? 'ring-4 ring-white/50'
                           : 'ring-0 group-hover:ring-2 group-hover:ring-white/30'
                        }`}></div>
                  </button>
               ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 max-w-2xl mx-auto">
               <button
                  onClick={() => onSkip(selectedGenres)}
                  className="flex-1 bg-white/10 backdrop-blur-lg text-white py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
               >
                  <SkipForward className="w-5 h-5" />
                  <span>Save & Skip</span>
               </button>
               <button
                  onClick={() => onContinue(selectedGenres)}
                  disabled={!canContinue}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${canContinue
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                     }`}
               >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
               </button>
            </div>

            {/* Requirement Message */}
            {!canContinue && selectedGenres.length > 0 && (
               <p className="text-center text-white/60 text-sm mt-4">
                  Select at least {2 - selectedGenres.length} more genre{2 - selectedGenres.length !== 1 ? 's' : ''} to continue
               </p>
            )}
         </div>
      </div>
   );
};

export default GenreSelection;