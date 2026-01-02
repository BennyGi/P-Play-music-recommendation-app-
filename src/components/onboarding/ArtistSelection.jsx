import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, SkipForward, Users, Loader, Sparkles, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { getArtistsForGenres } from '../../services/spotifyService';

const ArtistSelection = ({ selectedGenres, selectedLanguages, selectedYears, onContinue, onSkip, onBack }) => {
   const [selectedArtists, setSelectedArtists] = useState([]);
   const [artists, setArtists] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const genreNames = {
      1: 'Pop', 2: 'Rock', 3: 'Hip Hop', 4: 'Rap', 5: 'Electronic',
      6: 'Jazz', 7: 'Classical', 8: 'R&B', 9: 'Country', 10: 'Latin',
      11: 'Metal', 12: 'Indie', 13: 'EDM', 14: 'Reggae', 15: 'Blues',
      16: 'Folk', 17: 'Soul', 18: 'Punk', 19: 'Funk', 20: 'House',
      21: 'K-Pop', 22: 'Lo-Fi', 23: 'Ambient', 24: 'Afrobeats'
   };

   const languageNames = {
      1: 'English', 2: 'Spanish', 3: 'French', 4: 'German', 5: 'Italian',
      6: 'Portuguese', 7: 'Russian', 8: 'Mandarin', 9: 'Japanese', 10: 'Korean',
      11: 'Arabic', 12: 'Hebrew', 13: 'Turkish', 14: 'Persian', 15: 'Hindi',
      16: 'Punjabi', 17: 'Urdu', 18: 'Bengali', 19: 'Tamil', 20: 'Thai',
      21: 'Vietnamese', 22: 'Indonesian', 23: 'Filipino', 24: 'Malay',
      25: 'Dutch', 26: 'Swedish', 27: 'Norwegian', 28: 'Danish', 29: 'Finnish',
      30: 'Polish', 31: 'Czech', 32: 'Romanian', 33: 'Greek', 34: 'Hungarian',
      35: 'Ukrainian', 36: 'Swahili', 37: 'Amharic', 38: 'Zulu', 39: 'Afrikaans',
      40: 'Portuguese (BR)', 41: 'Spanish (MX)', 42: 'French (CA)', 43: 'Catalan',
      44: 'Basque', 45: 'Galician', 46: 'Serbian', 47: 'Croatian', 48: 'Bulgarian',
      49: 'Slovak', 50: 'Lithuanian'
   };

   useEffect(() => {
      fetchArtists(false);
   }, [selectedGenres, selectedLanguages, selectedYears]);

   const fetchArtists = async (isRefresh = false) => {
      setLoading(true);
      setError(null);

      try {
         const fetchedArtists = await getArtistsForGenres(
            selectedGenres,
            selectedLanguages,
            selectedYears,
            isRefresh ? Math.floor(Math.random() * 100) : 0
         );

         if (fetchedArtists.length === 0) {
            setError('No artists found. Try different selections.');
         }

         setArtists(fetchedArtists);
      } catch (err) {
         console.error('Error fetching artists:', err);
         setError('Failed to load artists. Check your internet connection.');
      } finally {
         setLoading(false);
      }
   };

   const toggleArtist = (artistId) => {
      setSelectedArtists(prev =>
         prev.includes(artistId)
            ? prev.filter(id => id !== artistId)
            : [...prev, artistId]
      );
   };

   const handleRefresh = () => {
      fetchArtists(true);
   };

   const getArtistTooltip = (artist) => {
      const criteria = [];

      if (artist.genre) {
         criteria.push(`${artist.genre} genre`);
      }

      if (artist.language) {
         criteria.push(`${artist.language} language`);
      } else if (selectedLanguages.length > 0) {
         const langs = selectedLanguages.map(id => languageNames[id]).filter(Boolean);
         if (langs.length > 0) {
            criteria.push(langs.join('/') + ' language');
         }
      }

      if (selectedYears) {
         criteria.push(`${selectedYears.from}-${selectedYears.to} era`);
      }

      return criteria.length > 0
         ? `Showing because: ${criteria.join(' • ')}`
         : 'Matched your preferences';
   };

   const canContinue = selectedArtists.length >= 1;

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
            <div className="text-center space-y-6">
               <Loader className="w-16 h-16 text-white animate-spin mx-auto" />
               <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Finding Your Perfect Artists...</h2>
                  <p className="text-white/80">Searching Spotify's database</p>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center space-y-6">
               <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
               <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Oops!</h2>
                  <p className="text-white/80">{error}</p>
               </div>
               <div className="space-y-3">
                  <button
                     onClick={() => fetchArtists(false)}
                     className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-medium"
                  >
                     Try Again
                  </button>
                  <button
                     onClick={() => onSkip([])}
                     className="w-full bg-white/10 text-white py-3 rounded-xl font-medium"
                  >
                     Skip This Step
                  </button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
         <div className="max-w-7xl mx-auto py-12">
            <div className="mb-8">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                     <Check className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-1 bg-white/20"></div>
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                     <Check className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-1 bg-white/20"></div>
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                     <Check className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-1 bg-white/20"></div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                     4
                  </div>
               </div>
               <p className="text-center text-white/60 text-sm">Step 4 of 4</p>
            </div>

            <div className="text-center mb-12 space-y-4">
               <Users className="w-16 h-16 text-white mx-auto" />
               <h2 className="text-5xl font-bold text-white">Who are your favorite artists?</h2>
               <p className="text-xl text-white/80">Select at least one artist</p>

               <div className="flex items-center justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
                     <p className="text-white/90 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span>Showing {artists.length} artists from Spotify</span>
                     </p>
                  </div>

                  <button
                     onClick={handleRefresh}
                     disabled={loading}
                     className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white p-4 rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                     title="Get different artists"
                  >
                     <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  </button>
               </div>

               <p className="text-white/60">Selected: {selectedArtists.length}</p>
            </div>

            {artists.length === 0 ? (
               <div className="text-center py-20">
                  <p className="text-white/80 text-xl">No artists found</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
                  {artists.map(artist => (
                     <button
                        key={artist.id}
                        onClick={() => toggleArtist(artist.id)}
                        className={`relative group overflow-hidden rounded-2xl transition-all duration-300 aspect-square ${selectedArtists.includes(artist.id)
                           ? 'scale-105 shadow-2xl ring-4 ring-white/50'
                           : 'hover:scale-105 shadow-lg'
                           }`}
                        title={getArtistTooltip(artist)}
                     >
                        <div className="absolute inset-0">
                           {artist.image ? (
                              <img
                                 src={artist.image}
                                 alt={artist.name}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                                 <Users className="w-16 h-16 text-white/50" />
                              </div>
                           )}
                           <div className={`absolute inset-0 bg-gradient-to-t ${selectedArtists.includes(artist.id)
                              ? 'from-black/80 via-black/40 to-transparent'
                              : 'from-black/70 via-black/30 to-transparent'
                              }`}></div>
                        </div>

                        <div className="absolute top-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                           <p className="text-white text-xs leading-tight text-center">
                              {getArtistTooltip(artist)}
                           </p>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
                           <h3 className="text-white font-bold text-lg text-center line-clamp-2">
                              {artist.name}
                           </h3>
                           <p className="text-yellow-300 text-xs">★ {artist.popularity}%</p>
                        </div>

                        {selectedArtists.includes(artist.id) && (
                           <div className="absolute top-3 right-3 bg-white rounded-full p-1.5">
                              <Check className="w-5 h-5 text-pink-600" strokeWidth={3} />
                           </div>
                        )}
                     </button>
                  ))}
               </div>
            )}

            <div className="flex gap-4 max-w-2xl mx-auto">
               {onBack && (
                  <button
                     onClick={onBack}
                     className="bg-white/10 backdrop-blur-lg text-white px-6 py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                     <ArrowLeft className="w-5 h-5" />
                     <span>Back</span>
                  </button>
               )}

               <button
                  onClick={() => onSkip(selectedArtists)}
                  className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
               >
                  <SkipForward className="w-5 h-5" />
                  Skip
               </button>
               <button
                  onClick={() => onContinue(selectedArtists)}
                  disabled={!canContinue}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${canContinue
                     ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105'
                     : 'bg-white/10 text-white/50 cursor-not-allowed'
                     }`}
               >
                  <Sparkles className="w-5 h-5" />
                  Create Playlist
               </button>
            </div>
         </div>
      </div>
   );
};

export default ArtistSelection;