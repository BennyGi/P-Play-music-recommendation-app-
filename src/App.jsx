import React, { useState, useEffect } from 'react';
import { CheckCircle, Music, Heart, Info, Database } from 'lucide-react';
import RegistrationScreen from './components/onboarding/RegistrationScreen';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GenreSelection from './components/onboarding/GenreSelection';
import LanguageSelection from './components/onboarding/LanguageSelection';
import YearSelection from './components/onboarding/YearSelection';
import ArtistSelection from './components/onboarding/ArtistSelection';
import PlaylistView from './components/PlaylistView';
import AdminDashboard from './components/AdminDashboard';
import { StorageService } from './utils/storage';
import Sprint1Complete from './components/Sprint1Complete';
import { MusicDbService } from './services/musicDbService';
import { BackendService } from './services/backendService';

function App() {
   const onboardingSteps = ['genres', 'languages', 'years', 'artists'];

   const [currentStep, setCurrentStep] = useState('registration');
   const [userData, setUserData] = useState(null);
   const [selectedGenres, setSelectedGenres] = useState([]);
   const [selectedLanguages, setSelectedLanguages] = useState([]);
   const [selectedYears, setSelectedYears] = useState({ from: 2010, to: 2025 });
   const [selectedArtists, setSelectedArtists] = useState([]);
   const [likedSongs, setLikedSongs] = useState(() => StorageService.getLikedSongs());

   const [isLoading, setIsLoading] = useState(false);
   const [isComplete, setIsComplete] = useState(false);
   const [playlistType, setPlaylistType] = useState(null);
   const [showAdmin, setShowAdmin] = useState(false);
   const [toast, setToast] = useState(null);

   // --- 1. LOGOUT FUNCTION ---
   const handleLogout = () => {
      if (confirm("Are you sure you want to log out?")) {
         // Clear browser memory
         StorageService.clearAllData();

         // Reset React State
         setUserData(null);
         setSelectedGenres([]);
         setSelectedLanguages([]);
         setSelectedYears({ from: 2010, to: 2025 });
         setSelectedArtists([]);
         setLikedSongs([]);
         setIsComplete(false);
         setPlaylistType(null);

         // Go back to start
         setCurrentStep('registration');
         // Force reload to ensure a completely clean slate
         window.location.reload();
      }
   };

   // --- 2. AUTH HANDLER (Login vs Signup) ---
   const handleRegistrationComplete = async (data, isLoginMode) => {
      setIsLoading(true);

      try {
         // PATH A: LOGIN MODE
         if (isLoginMode) {
            const loginRes = await BackendService.loginUser({
               email: data.email,
               password: data.password
            });

            if (loginRes && !loginRes.error) {
               showToast(`Welcome back, ${loginRes.firstName}!`, 'success');
               setUserData(loginRes);
               StorageService.saveUserData(loginRes);
               goToStep('welcome');
            } else {
               showToast("Invalid email or password", "info");
            }
         }
         // PATH B: SIGN UP MODE
         else {
            const res = await BackendService.saveUser(data);

            if (res?.error === "User already exists") {
               showToast("User already exists. Please switch to Log In.", "info");
            } else if (res && !res.error) {
               console.log("User saved:", res);
               setUserData(data);
               StorageService.saveUserData(data);
               goToStep('welcome');
            } else {
               showToast("Server connection failed.", "info");
            }
         }
      } catch (error) {
         console.error("Auth error:", error);
         showToast("Something went wrong.", "info");
      } finally {
         setIsLoading(false);
      }
   };

   const goToStep = (step) => {
      const inProgress = onboardingSteps.includes(step);
      StorageService.setOnboardingInProgress(inProgress);

      if (inProgress) StorageService.setCurrentStep(step);
      else StorageService.clearCurrentStep();

      setCurrentStep(step);
   };

   useEffect(() => {
      const savedUserData = StorageService.getUserData();
      const savedPreferences = StorageService.getPreferences();

      if (savedUserData) setUserData(savedUserData);

      if (savedPreferences) {
         setSelectedGenres(savedPreferences.genres || []);
         setSelectedLanguages(savedPreferences.languages || []);
         setSelectedYears(savedPreferences.years || { from: 2010, to: 2025 });
         setSelectedArtists(savedPreferences.artists || []);
      }

      const savedStep = StorageService.getCurrentStep();
      const inProgress = StorageService.getOnboardingInProgress();

      if (inProgress && savedStep && onboardingSteps.includes(savedStep)) {
         setCurrentStep(savedStep);
         return;
      }

      const savedPlaylists = StorageService.getPlaylists();
      if (savedPlaylists?.length > 0) {
         setCurrentStep('playlist');
         StorageService.setOnboardingInProgress(false);
         StorageService.clearCurrentStep();
         return;
      }

      if (savedUserData) setCurrentStep('welcome');
      else setCurrentStep('registration');

      StorageService.setOnboardingInProgress(false);
      StorageService.clearCurrentStep();
   }, []);

   const showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
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

   const handleGenreContinue = (genres) => { setSelectedGenres(genres); StorageService.savePreferences({ genres }); goToStep('languages'); };
   const handleGenreSkip = (genres) => { setSelectedGenres(genres); StorageService.savePreferences({ genres }); startGenerationProcess('custom'); };
   const handleLanguageContinue = (languages) => { setSelectedLanguages(languages); StorageService.savePreferences({ languages }); goToStep('years'); };
   const handleLanguageSkip = (languages) => { setSelectedLanguages(languages); StorageService.savePreferences({ languages }); startGenerationProcess('custom'); };
   const handleYearContinue = (years) => { setSelectedYears(years); StorageService.savePreferences({ years }); goToStep('artists'); };
   const handleYearSkip = (years) => { setSelectedYears(years); StorageService.savePreferences({ years }); startGenerationProcess('custom'); };
   const handleArtistContinue = (artists) => { setSelectedArtists(artists); StorageService.savePreferences({ artists }); startGenerationProcess('custom'); };
   const handleArtistSkip = (artists) => { setSelectedArtists(artists); StorageService.savePreferences({ artists }); startGenerationProcess('custom'); };

   const isLiked = (trackId) => likedSongs.some((t) => t?.id === trackId);

   const toggleLikedSong = (track) => {
      const next = StorageService.toggleLike(track);
      setLikedSongs(next);
      const isNowLiked = next.some(t => t.id === track.id);
      showToast(isNowLiked ? `Added "${track.title}"` : `Removed "${track.title}"`, isNowLiked ? 'success' : 'info');
   };

   const startGenerationProcess = async (type) => {
      setIsLoading(true);
      try {
         let tracks = [];
         const preferences = { genres: selectedGenres, languages: selectedLanguages, years: selectedYears, artists: selectedArtists };

         if (type === 'default') {
            const result = await MusicDbService.generatePlaylist({ genres: [1] });
            tracks = result.tracks;
         } else {
            const result = await MusicDbService.generatePlaylist(preferences);
            tracks = result.tracks;
         }

         const playlistData = {
            type, userData, tracks,
            preferences: type === 'custom' ? preferences : null,
            createdAt: new Date().toISOString()
         };

         StorageService.savePlaylist(playlistData);
         BackendService.savePlaylist({
            userEmail: userData?.email,
            name: type === 'default' ? 'Popular Hits' : 'My Custom Mix',
            type: type,
            preferences: playlistData.preferences || {},
            tracks: tracks
         });

         StorageService.setOnboardingInProgress(false);
         StorageService.clearCurrentStep();
         setIsLoading(false);
         setIsComplete(true);
         setCurrentStep('playlist');
      } catch (error) {
         console.error('Error:', error);
         setIsLoading(false);
         alert('Failed to generate playlist.');
      }
   };

   const handleViewPlaylist = () => { setIsComplete(false); goToStep('playlist'); };
   const handleCreateNew = () => {
      if (confirm('Create a new playlist?')) {
         const freshYears = { from: 2010, to: 2025 };
         setSelectedGenres([]); setSelectedLanguages([]); setSelectedYears(freshYears); setSelectedArtists([]);
         StorageService.savePreferences({ genres: [], languages: [], years: freshYears, artists: [] });
         StorageService.setOnboardingInProgress(false); StorageService.clearCurrentStep();
         setIsComplete(false); setPlaylistType(null); goToStep('welcome');
      }
   };

   if (showAdmin) return <AdminDashboard onBack={() => setShowAdmin(false)} />;

   if (isLoading) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6 text-center">
             <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl border border-white/20">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center"><Music className="w-8 h-8 text-white/50" /></div>
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-white">{playlistType === 'default' ? 'Creating Popular Playlist' : 'Making Custom Playlist'}</h2>
                   <p className="text-white/70">Fetching tracks...</p>
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
                <h2 className="text-4xl font-bold text-white">Playlist Ready!</h2>
                <button onClick={handleViewPlaylist} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 mt-4 shadow-lg">View My Playlist</button>
             </div>
          </div>
      );
   }

   return (
       <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
          <button onClick={() => setShowAdmin(true)} className="fixed bottom-4 left-4 z-50 p-3 bg-black/20 hover:bg-black/40 text-white/30 hover:text-white rounded-full transition-all"><Database className="w-5 h-5" /></button>

          {toast && (
              <div className={`fixed bottom-10 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${toast.type === 'success' ? 'bg-white text-pink-600' : 'bg-gray-800 text-white'}`}>
                 {toast.type === 'success' ? <Heart className="w-6 h-6 fill-pink-500 text-pink-500" /> : <Info className="w-6 h-6" />}
                 <p className="font-semibold">{toast.message}</p>
              </div>
          )}

          {currentStep === 'registration' && <RegistrationScreen onComplete={handleRegistrationComplete} />}

          {currentStep === 'welcome' && (
              <WelcomeScreen
                  userData={userData}
                  onCustomPlaylist={handleCustomPlaylist}
                  onDefaultPlaylist={handleDefaultPlaylist}
                  onLogout={handleLogout} // PASSED
              />
          )}

          {currentStep === 'genres' && <GenreSelection initialSelected={selectedGenres} onContinue={handleGenreContinue} onSkip={handleGenreSkip} onBack={() => goToStep('welcome')} />}
          {currentStep === 'languages' && <LanguageSelection initialSelected={selectedLanguages} onContinue={handleLanguageContinue} onSkip={handleLanguageSkip} onBack={() => goToStep('genres')} />}
          {currentStep === 'years' && <YearSelection initialSelected={selectedYears} onContinue={handleYearContinue} onSkip={handleYearSkip} onBack={() => goToStep('languages')} />}
          {currentStep === 'artists' && <ArtistSelection initialSelected={selectedArtists} selectedGenres={selectedGenres} selectedLanguages={selectedLanguages} selectedYears={selectedYears} onContinue={handleArtistContinue} onSkip={handleArtistSkip} onBack={() => goToStep('years')} />}

          {currentStep === 'playlist' && (
              <PlaylistView
                  onCreateNew={handleCreateNew}
                  likedSongs={likedSongs}
                  toggleLikedSong={toggleLikedSong}
                  isLiked={isLiked}
                  onLogout={handleLogout} // PASSED
              />
          )}
          {currentStep === 'sprint1complete' && <Sprint1Complete />}
       </div>
   );
}

export default App;