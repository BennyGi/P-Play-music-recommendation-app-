import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, Music } from 'lucide-react';
import RegistrationScreen from './components/onboarding/RegistrationScreen';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GenreSelection from './components/onboarding/GenreSelection';
import LanguageSelection from './components/onboarding/LanguageSelection';
import YearSelection from './components/onboarding/YearSelection';
import ArtistSelection from './components/onboarding/ArtistSelection';
import PlaylistView from './components/PlaylistView';
import { StorageService } from './utils/storage';
import Sprint1Complete from './components/Sprint1Complete';


function App() {
   const [currentStep, setCurrentStep] = useState('registration');
   const [userData, setUserData] = useState(null);
   const [selectedGenres, setSelectedGenres] = useState([]);
   const [selectedLanguages, setSelectedLanguages] = useState([]);
   const [selectedYears, setSelectedYears] = useState({ from: 2010, to: 2025 });
   const [selectedArtists, setSelectedArtists] = useState([]);

   const [isLoading, setIsLoading] = useState(false);
   const [isComplete, setIsComplete] = useState(false);
   const [playlistType, setPlaylistType] = useState(null);

   useEffect(() => {
      const savedUserData = StorageService.getUserData();
      const savedPreferences = StorageService.getPreferences();
      const savedPlaylists = StorageService.getPlaylists();

      if (savedUserData && savedPlaylists.length > 0) {
         setUserData(savedUserData);
         if (savedPreferences) {
            setSelectedGenres(savedPreferences.genres || []);
            setSelectedLanguages(savedPreferences.languages || []);
            setSelectedYears(savedPreferences.years || { from: 2010, to: 2025 });
            setSelectedArtists(savedPreferences.artists || []);
         }
         setCurrentStep('playlist');
      }
   }, []);

   const handleRegistrationComplete = (data) => {
      setUserData(data);
      StorageService.saveUserData(data);
      setCurrentStep('welcome');
   };

   const handleCustomPlaylist = () => {
      setPlaylistType('custom');
      setCurrentStep('genres');
   };

   const handleDefaultPlaylist = () => {
      setPlaylistType('default');
      startGenerationProcess('default');
   };

   const handleGenreContinue = (genres) => {
      setSelectedGenres(genres);
      StorageService.savePreferences({ genres });
      setCurrentStep('languages');
   };

   const handleGenreSkip = (genres) => {
      setSelectedGenres(genres);
      StorageService.savePreferences({ genres });
      handleSkipAll();
   };

   const handleLanguageContinue = (languages) => {
      setSelectedLanguages(languages);
      StorageService.savePreferences({ languages });
      setCurrentStep('years');
   };

   const handleLanguageSkip = (languages) => {
      setSelectedLanguages(languages);
      StorageService.savePreferences({ languages });
      handleSkipAll();
   };

   const handleYearContinue = (years) => {
      setSelectedYears(years);
      StorageService.savePreferences({ years });
      setCurrentStep('artists');
   };

   const handleYearSkip = (years) => {
      setSelectedYears(years);
      StorageService.savePreferences({ years });
      handleSkipAll();
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

   const handleSkipAll = () => {
      startGenerationProcess('custom');
   };

   const startGenerationProcess = (type) => {
      setIsLoading(true);
      setTimeout(() => {
         const playlistData = {
            type: type,
            userData: userData,
            preferences: type === 'custom' ? {
               genres: selectedGenres,
               languages: selectedLanguages,
               years: selectedYears,
               artists: selectedArtists
            } : null
         };

         StorageService.savePlaylist(playlistData);

         setIsLoading(false);
         setIsComplete(true);
      }, 3000);
   };

   const handleViewPlaylist = () => {
      setIsLoading(true);
      setIsComplete(false);

      setTimeout(() => {
         setIsLoading(false);
         setCurrentStep('sprint1complete');
      }, 2000);
   };

   const handleCreateNew = () => {
      if (confirm('Create a new playlist? This will start the process from scratch.')) {
         setCurrentStep('welcome');
         setIsComplete(false);
      }
   };

   const handleBackToRegistration = () => setCurrentStep('registration');
   const handleBackToWelcome = () => setCurrentStep('welcome');
   const handleBackToGenres = () => setCurrentStep('genres');
   const handleBackToLanguages = () => setCurrentStep('languages');
   const handleBackToYears = () => setCurrentStep('years');

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
                     {playlistType === 'default'
                        ? 'Creating Your Popular Playlist'
                        : 'Curating Your Custom Playlist'}
                  </h2>
                  <p className="text-white/70">
                     {playlistType === 'default'
                        ? `Finding top hits in ${userData?.country}...`
                        : 'Analyzing your music taste...'}
                  </p>
               </div>
               <div className="flex gap-2 mt-4">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
         </div>
      );
   }

   if (isComplete) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl border border-white/20 animate-fadeIn">
               <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 mb-2">
                  <CheckCircle className="w-12 h-12 text-white" />
               </div>

               <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white">
                     {playlistType === 'default' ? 'Popular Playlist Ready!' : 'Custom Playlist Ready!'}
                  </h2>
                  <p className="text-white/80">
                     Your preferences have been saved!
                  </p>
               </div>

               <div className="w-full bg-black/20 rounded-xl p-4 text-left space-y-2 mt-4">
                  <div className="flex justify-between text-white/90">
                     <span>Playlist Type:</span>
                     <span className="font-bold">
                        {playlistType === 'default' ? 'Popular Hits' : 'Custom Mix'}
                     </span>
                  </div>
                  {playlistType === 'custom' && (
                     <>
                        <div className="flex justify-between text-white/90">
                           <span>Genres Selected:</span>
                           <span className="font-bold">{selectedGenres.length}</span>
                        </div>
                        <div className="flex justify-between text-white/90">
                           <span>Languages:</span>
                           <span className="font-bold">{selectedLanguages.length || 'All'}</span>
                        </div>
                        <div className="flex justify-between text-white/90">
                           <span>Era:</span>
                           <span className="font-bold">{selectedYears.from} - {selectedYears.to}</span>
                        </div>
                        <div className="flex justify-between text-white/90">
                           <span>Artists:</span>
                           <span className="font-bold">{selectedArtists.length}</span>
                        </div>
                     </>
                  )}
                  {playlistType === 'default' && (
                     <div className="flex justify-between text-white/90">
                        <span>Country:</span>
                        <span className="font-bold">{userData?.country}</span>
                     </div>
                  )}
               </div>

               <button
                  onClick={handleViewPlaylist}
                  className="w-full bg-white text-emerald-900 font-bold py-4 rounded-xl hover:bg-emerald-50 transition-colors mt-4"
               >
                  View My Playlist
               </button>
            </div>
         </div>
      );
   }

   return (
      <div>
         {currentStep === 'registration' && (
            <RegistrationScreen onComplete={handleRegistrationComplete} />
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
               onContinue={handleGenreContinue}
               onSkip={handleGenreSkip}
               onBack={handleBackToWelcome}
            />
         )}

         {currentStep === 'languages' && (
            <LanguageSelection
               onContinue={handleLanguageContinue}
               onSkip={handleLanguageSkip}
               onBack={handleBackToGenres}
            />
         )}

         {currentStep === 'years' && (
            <YearSelection
               onContinue={handleYearContinue}
               onSkip={handleYearSkip}
               onBack={handleBackToLanguages}
            />
         )}

         {currentStep === 'artists' && (
            <ArtistSelection
               selectedGenres={selectedGenres}
               selectedLanguages={selectedLanguages}
               selectedYears={selectedYears}
               onContinue={handleArtistContinue}
               onSkip={handleArtistSkip}
               onBack={handleBackToYears}
            />
         )}

         {currentStep === 'playlist' && (
            <PlaylistView onCreateNew={handleCreateNew} />
         )}

         {currentStep === 'sprint1complete' && (
            <Sprint1Complete />
         )}
      </div>
   );
}

export default App;