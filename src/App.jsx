import React, { useState, useEffect } from 'react';
import { CheckCircle, Music, Heart, Info, LogOut } from 'lucide-react';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/onboarding/RegistrationScreen';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GenreSelection from './components/onboarding/GenreSelection';
import LanguageSelection from './components/onboarding/LanguageSelection';
import YearSelection from './components/onboarding/YearSelection';
import ArtistSelection from './components/onboarding/ArtistSelection';
import PlaylistView from './components/PlaylistView';
import { StorageService } from './utils/storage';
import Sprint1Complete from './components/Sprint1Complete';

// Import Spotify service functions
import {
   getSpotifyRecommendations,
   getArtistTopTracks,
   getPopularTracksForCountry,
   searchTracksByGenreAndYear
} from './services/spotifyService';

function App() {
   const onboardingSteps = ['genres', 'languages', 'years', 'artists'];

   // States: 'landing', 'login', 'registration', 'welcome', etc.
   const [currentStep, setCurrentStep] = useState('landing');
   const [userData, setUserData] = useState(null);
   const [selectedGenres, setSelectedGenres] = useState([]);
   const [selectedLanguages, setSelectedLanguages] = useState([]);
   const [selectedYears, setSelectedYears] = useState({ from: 2010, to: 2025 });
   const [selectedArtists, setSelectedArtists] = useState([]);

   const [likedSongs, setLikedSongs] = useState(() => {
      try {
         return StorageService.getLikedSongs() || [];
      } catch (e) {
         return [];
      }
   });

   const [isLoading, setIsLoading] = useState(false);
   const [isComplete, setIsComplete] = useState(false);
   const [playlistType, setPlaylistType] = useState(null);
   const [toast, setToast] = useState(null);

   const goToStep = (step) => {
      const inProgress = onboardingSteps.includes(step);
      StorageService.setOnboardingInProgress(inProgress);

      if (inProgress) StorageService.setCurrentStep(step);
      else StorageService.clearCurrentStep();

      setCurrentStep(step);
   };

   // --- INITIAL AUTH CHECK ---
   useEffect(() => {
      const activeUser = StorageService.getUserData();

      if (activeUser) {
         setUserData(activeUser);

         const savedStep = StorageService.getCurrentStep();
         const inProgress = StorageService.getOnboardingInProgress();
         const savedPlaylists = StorageService.getPlaylists();

         // Restore preferences
         const savedPreferences = StorageService.getPreferences();
         if (savedPreferences) {
            setSelectedGenres(savedPreferences.genres || []);
            setSelectedLanguages(savedPreferences.languages || []);
            setSelectedYears(savedPreferences.years || { from: 2010, to: 2025 });
            setSelectedArtists(savedPreferences.artists || []);
         }

         if (savedPlaylists?.length > 0) {
            setCurrentStep('playlist');
         } else if (inProgress && savedStep && onboardingSteps.includes(savedStep)) {
            setCurrentStep(savedStep);
         } else {
            setCurrentStep('welcome');
         }
      } else {
         setCurrentStep('landing');
      }
   }, []);

   const showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
   };

   // --- LOGIN / LOGOUT LOGIC ---

   const handleLogout = () => {
      if (confirm('Are you sure you want to log out?')) {
         StorageService.logoutUser();
         setUserData(null);
         setLikedSongs([]);
         setCurrentStep('landing');
      }
   };

   const handleLoginSuccess = (user) => {
      setUserData(user);
      const playlists = StorageService.getPlaylists();
      if (playlists && playlists.length > 0) {
         setCurrentStep('playlist');
      } else {
         setCurrentStep('welcome');
      }
   };

   // --- REGISTRATION LOGIC ---

   const handleRegistrationComplete = (data) => {
      try {
         StorageService.registerUser(data);
         setUserData(data);
         goToStep('welcome');
      } catch (e) {
         alert(e.message);
      }
   };

   const handleCustomPlaylist = () => {
      setIsComplete(false);
      setPlaylistType('custom');
      StorageService.setOnboardingInProgress(true);
      StorageService.setCurrentStep('genres');
      goToStep('genres');
   };

   const handleDefaultPlaylist = () => {
      setIsComplete(false);
      setPlaylistType('default');
      startGenerationProcess('default');
   };

   const handleGenreContinue = (genres) => {
      setSelectedGenres(genres);
      StorageService.savePreferences({ genres });
      goToStep('languages');
   };

   const handleGenreSkip = (genres) => {
      setSelectedGenres(genres);
      StorageService.savePreferences({ genres });
      startGenerationProcess('custom');
   };

   const handleLanguageContinue = (languages) => {
      setSelectedLanguages(languages);
      StorageService.savePreferences({ languages });
      goToStep('years');
   };

   const handleLanguageSkip = (languages) => {
      setSelectedLanguages(languages);
      StorageService.savePreferences({ languages });
      startGenerationProcess('custom');
   };

   const handleYearContinue = (years) => {
      setSelectedYears(years);
      StorageService.savePreferences({ years });
      goToStep('artists');
   };

   const handleYearSkip = (years) => {
      setSelectedYears(years);
      StorageService.savePreferences({ years });
      startGenerationProcess('custom');
   };

   const handleArtistContinue = (artists) => {
      setSelectedArtists(artists);
      StorageService.savePreferences({ artists });
      startGenerationProcess('custom');
   };

   const handleArtistSkip = (artists) => {
      setSelectedArtists(artists);
      StorageService.savePreferences({ artists });
      startGenerationProcess('custom');
   };

   const isLiked = (trackId) => {
      if (!likedSongs || !Array.isArray(likedSongs)) return false;
      return likedSongs.some((t) => t?.id === trackId);
   };

   const toggleLikedSong = (track) => {
      if (!track) return;
      StorageService.toggleLike(track);
      const next = StorageService.getLikedSongs() || [];
      setLikedSongs(next);

      const isNowLiked = next.some(t => t.id === track.id);
      if (isNowLiked) {
         showToast(`Added "${track.title}" to Liked Songs`, 'success');
      } else {
         showToast(`Removed "${track.title}" from Liked Songs`, 'info');
      }
   };

   // =====================================================
   //   IMPROVED PLAYLIST GENERATION
   // =====================================================

   const startGenerationProcess = async (type) => {
      setIsLoading(true);

      try {
         let tracks = [];
         const countryCode = userData?.country || 'US';

         if (type === 'default') {
            // Get popular tracks for user's country
            tracks = await getPopularTracksForCountry(countryCode, 50);
         } else {
            // Custom playlist with REAL filtering
            console.log('🎵 Creating custom playlist with preferences:', {
               genres: selectedGenres,
               languages: selectedLanguages,
               years: selectedYears,
               artists: selectedArtists
            });

            const artistIds = selectedArtists.map((a) => a.id).filter(Boolean);

            // Use the improved Spotify Recommendations API with proper filtering
            const recommendedTracks = await getSpotifyRecommendations({
               genreIds: selectedGenres.length > 0 ? selectedGenres : [1], // Default to pop if no genre
               artistIds: artistIds,
               yearRange: selectedYears,
               languageIds: selectedLanguages,
               limit: 40,
               userCountry: countryCode
            });

            tracks = [...recommendedTracks];

            // If we need more tracks, use search with year filter
            if (tracks.length < 30) {
               const additionalTracks = await searchTracksByGenreAndYear(
                  selectedGenres.length > 0 ? selectedGenres : [1],
                  selectedYears,
                  countryCode,
                  30 - tracks.length
               );

               tracks = [...tracks, ...additionalTracks];
            }

            // If artists were selected, add their top tracks
            if (artistIds.length > 0) {
               const artistTracksPromises = artistIds.slice(0, 3).map((artistId) =>
                  getArtistTopTracks(artistId, countryCode)
               );
               const artistTracksResults = await Promise.all(artistTracksPromises);
               let artistTracks = artistTracksResults.flat();

               // Filter artist tracks by year range
               if (selectedYears?.from && selectedYears?.to) {
                  artistTracks = artistTracks.filter(track => {
                     if (!track.releaseYear) return true;
                     return track.releaseYear >= selectedYears.from && track.releaseYear <= selectedYears.to;
                  });
               }

               tracks = [...tracks, ...artistTracks];
            }

            // Remove duplicates
            const uniqueTracks = Array.from(new Map(tracks.map((t) => [t.id, t])).values());

            // Final sort by popularity and limit
            tracks = uniqueTracks
               .sort((a, b) => b.popularity - a.popularity)
               .slice(0, 50);

            console.log(`✅ Generated playlist with ${tracks.length} tracks`);
         }

         const playlistData = {
            type,
            userData,
            tracks,
            preferences: type === 'custom'
               ? { genres: selectedGenres, languages: selectedLanguages, years: selectedYears, artists: selectedArtists }
               : null,
            createdAt: new Date().toISOString()
         };

         StorageService.savePlaylist(playlistData);
         StorageService.setOnboardingInProgress(false);
         StorageService.clearCurrentStep();

         setIsLoading(false);
         setIsComplete(true);
         setCurrentStep('playlist');
      } catch (error) {
         console.error('❌ Error generating playlist:', error);
         setIsLoading(false);
         alert('Failed to generate playlist. Please try again.');
      }
   };

   const handleViewPlaylist = () => {
      setIsComplete(false);
      goToStep('playlist');
   };

   const handleCreateNew = () => {
      if (confirm('Create a new playlist? This will start the process from scratch.')) {
         const freshYears = { from: 2010, to: 2025 };

         setSelectedGenres([]);
         setSelectedLanguages([]);
         setSelectedYears(freshYears);
         setSelectedArtists([]);

         StorageService.savePreferences({
            genres: [],
            languages: [],
            years: freshYears,
            artists: []
         });

         StorageService.setOnboardingInProgress(false);
         StorageService.clearCurrentStep();

         setIsComplete(false);
         setPlaylistType(null);
         goToStep('welcome');
      }
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl border border-white/20">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Music className="w-8 h-8 text-white/50" />
                  </div>
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">
                     {playlistType === 'default' ? 'Creating Your Popular Playlist' : 'Making Your Custom Playlist'}
                  </h2>
                  <p className="text-white/70">
                     {playlistType === 'default'
                        ? `Finding top hits in ${userData?.country}...`
                        : 'Finding tracks that match your preferences...'}
                  </p>
                  {playlistType === 'custom' && (
                     <div className="mt-4 space-y-1 text-white/50 text-sm">
                        {selectedGenres.length > 0 && <p>🎵 Filtering by {selectedGenres.length} genre(s)</p>}
                        {selectedLanguages.length > 0 && <p>🌍 Filtering by {selectedLanguages.length} language(s)</p>}
                        {selectedYears && <p>📅 Year range: {selectedYears.from} - {selectedYears.to}</p>}
                        {selectedArtists.length > 0 && <p>🎤 Including tracks from {selectedArtists.length} artist(s)</p>}
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   }

   if (isComplete) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl border border-white/20">
               <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 mb-2">
                  <CheckCircle className="w-12 h-12 text-white" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white">
                     {playlistType === 'default' ? 'Popular Playlist Ready!' : 'Custom Playlist Ready!'}
                  </h2>
                  <p className="text-white/80">Your Spotify playlist has been created!</p>
               </div>
               <button
                  onClick={handleViewPlaylist}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 mt-4 shadow-lg"
               >
                  View My Playlist
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">

         {/* --- GLOBAL LOGOUT BUTTON --- */}
         {userData && currentStep !== 'landing' && currentStep !== 'login' && currentStep !== 'registration' && (
            <div className="absolute top-6 left-6 z-50">
               <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-200 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
               >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Log out</span>
               </button>
            </div>
         )}

         {/* Toast Notification Component */}
         {toast && (
            <div className={`fixed bottom-10 right-4 md:right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-white text-pink-600' : 'bg-gray-800 text-white'
               }`}>
               {toast.type === 'success' ? (
                  <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
               ) : (
                  <Info className="w-6 h-6" />
               )}
               <p className="font-semibold text-sm md:text-base">{toast.message}</p>
            </div>
         )}

         {/* --- SCREENS --- */}
         {currentStep === 'landing' && (
            <LandingScreen
               onLoginClick={() => setCurrentStep('login')}
               onSignupClick={() => setCurrentStep('registration')}
            />
         )}

         {currentStep === 'login' && (
            <LoginScreen
               onLoginSuccess={handleLoginSuccess}
               onBack={() => setCurrentStep('landing')}
            />
         )}

         {/* Registration with onBack prop */}
         {currentStep === 'registration' && (
            <RegistrationScreen
               onComplete={handleRegistrationComplete}
               onBack={() => setCurrentStep('landing')}
            />
         )}

         {currentStep === 'welcome' && (
            <WelcomeScreen
               userData={userData}
               onCustomPlaylist={handleCustomPlaylist}
               onDefaultPlaylist={handleDefaultPlaylist}
            />
         )}

         {currentStep === 'genres' && (
            <GenreSelection
               initialSelected={selectedGenres}
               onContinue={handleGenreContinue}
               onSkip={handleGenreSkip}
               onBack={() => goToStep('welcome')}
            />
         )}

         {currentStep === 'languages' && (
            <LanguageSelection
               initialSelected={selectedLanguages}
               onContinue={handleLanguageContinue}
               onSkip={handleLanguageSkip}
               onBack={() => goToStep('genres')}
            />
         )}

         {currentStep === 'years' && (
            <YearSelection
               initialSelected={selectedYears}
               onContinue={handleYearContinue}
               onSkip={handleYearSkip}
               onBack={() => goToStep('languages')}
            />
         )}

         {currentStep === 'artists' && (
            <ArtistSelection
               initialSelected={selectedArtists}
               selectedGenres={selectedGenres}
               selectedLanguages={selectedLanguages}
               selectedYears={selectedYears}
               onContinue={handleArtistContinue}
               onSkip={handleArtistSkip}
               onBack={() => goToStep('years')}
            />
         )}

         {currentStep === 'playlist' && (
            <PlaylistView
               onCreateNew={handleCreateNew}
               likedSongs={likedSongs}
               toggleLikedSong={toggleLikedSong}
               isLiked={isLiked}
            />
         )}

         {currentStep === 'sprint1complete' && <Sprint1Complete />}
      </div>
   );
}

export default App;