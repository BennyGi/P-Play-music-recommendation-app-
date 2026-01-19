// FILE: src/App.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Music, Heart, Info, LogOut, Library } from 'lucide-react';
import LandingScreen from "./components/onboarding/LandingScreen";
import LoginScreen from './components/LoginScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import RegistrationScreen from './components/onboarding/RegistrationScreen';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GenreSelection from './components/onboarding/GenreSelection';
import LanguageSelection from './components/onboarding/LanguageSelection';
import YearSelection from './components/onboarding/YearSelection';
import ArtistSelection from './components/onboarding/ArtistSelection';
import PlaylistView from './components/PlaylistView';
import PlaylistLibrary from './components/PlaylistLibrary';
import { StorageService } from './utils/storage';
import Sprint1Complete from './components/Sprint1Complete';

import {
  getSpotifyRecommendations,
  getArtistTopTracks,
  getPopularTracksForCountry,
  searchTracksByGenreAndYear,
  getAccessToken,
  getUserProfile
} from './services/spotifyService';
import { authenticateWithSpotify } from './services/spotifyService';

function App() {
  const onboardingSteps = ['genres', 'languages', 'years', 'artists'];

  const [currentStep, setCurrentStep] = useState('landing');
  const [userData, setUserData] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedYears, setSelectedYears] = useState({ from: 2010, to: 2025 });
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [activeView, setActiveView] = useState('generator');
  const [jumpToLibraryAfterLogin, setJumpToLibraryAfterLogin] = useState(false);

  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [playlistType, setPlaylistType] = useState(null);
  const [toast, setToast] = useState(null);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loadLikedSongsForUser = () => {
    try {
      const songs = StorageService.getLikedSongs();
      setLikedSongs(songs || []);
    } catch (e) {
      console.error('Failed to load liked songs:', e);
      setLikedSongs([]);
    }
  };

  const fetchSpotifyProfile = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const profile = await getUserProfile(token);
      if (profile) setSpotifyProfile(profile);
    } catch (error) {
      console.log('Failed to fetch Spotify profile:', error);
    }
  };

  const goToStep = (step) => {
    const inProgress = onboardingSteps.includes(step);
    StorageService.setOnboardingInProgress(inProgress);

    if (inProgress) StorageService.setCurrentStep(step);
    else StorageService.clearCurrentStep();

    setCurrentStep(step);
  };

  // --- INITIAL AUTH CHECK ---
  useEffect(() => {
    // Handle direct reset-password links (no router in this project)
    try {
      if (typeof window !== 'undefined' && window.location?.pathname === '/reset-password') {
        setCurrentStep('resetPassword');
        return;
      }
    } catch (e) {
      // ignore
    }

    const activeUser = StorageService.getUserData();

    if (activeUser) {
      setUserData(activeUser);
      loadLikedSongsForUser();

      const savedStep = StorageService.getCurrentStep();
      const inProgress = StorageService.getOnboardingInProgress();
      const savedPlaylists = StorageService.getPlaylists();

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
      setLikedSongs([]);
    }
  }, []);

  useEffect(() => {
    fetchSpotifyProfile();
  }, []);

  const handleConnectSpotify = () => {
    try {
      authenticateWithSpotify();
    } catch (e) {
      console.log('Failed to start Spotify auth:', e);
    }
  };

  const handleStartOver = () => {
    try {
      setSelectedGenres([]);
      setSelectedLanguages([]);
      setSelectedYears({ from: 2010, to: 2025 });
      setSelectedArtists([]);
      setIsComplete(false);
      setPlaylistType(null);
      setActiveView('generator');
      goToStep('welcome');
    } catch (e) {
      console.log('Failed to start over:', e);
    }
  };

  useEffect(() => {
    if (currentStep !== 'playlist') {
      setActiveView('generator');
    }
  }, [currentStep]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    StorageService.logoutUser();
    setUserData(null);
    setLikedSongs([]);
    setCurrentStep('landing');
    setShowLogoutModal(false);
  };

  const handleGoToLibrary = () => {
    setCurrentStep('library');
    setActiveView('library');
  };

  const handleLoginSuccess = (user) => {
    setUserData(user);
    loadLikedSongsForUser();

    const playlists = StorageService.getPlaylists();
    const libraryPlaylists = StorageService.getLibraryPlaylists();
    const hasLibrary = Array.isArray(libraryPlaylists) && libraryPlaylists.length > 0;

    if (jumpToLibraryAfterLogin && hasLibrary) {
      setJumpToLibraryAfterLogin(false);
      setCurrentStep('playlist');
      setActiveView('library');
      return;
    }

    if (playlists && playlists.length > 0) {
      setCurrentStep('playlist');
    } else {
      setCurrentStep('welcome');
    }
  };

  const handleRegistrationComplete = (data) => {
    try {
      StorageService.registerUser(data);
      setUserData(data);
      setLikedSongs([]);
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
    if (!track?.id) return;

    try {
      let updated;
      if (isLiked(track.id)) {
        updated = StorageService.removeLikedSong(track.id);
        showToast('Removed from Liked Songs', 'info');
      } else {
        updated = StorageService.addLikedSong(track);
        showToast('Added to Liked Songs', 'success');
      }
      setLikedSongs(updated);
    } catch (e) {
      console.error('Toggle like failed:', e);
      showToast('Action failed', 'error');
    }
  };

  const handleViewPlaylist = () => {
    setCurrentStep('playlist');
  };

  const handleLoadPlaylistFromLibrary = (playlist) => {
    if (!playlist) return;
    try {
      StorageService.savePlaylist(playlist);
      setActiveView('generator');
      setCurrentStep('playlist');
      showToast('Playlist loaded', 'success');
    } catch (e) {
      console.error('Load playlist failed:', e);
      showToast('Failed to load playlist', 'error');
    }
  };

  const startGenerationProcess = async (type) => {
    setIsLoading(true);
    setIsComplete(false);

    try {
      const userPrefs = StorageService.getPreferences();
      const user = StorageService.getUserData();

      let tracks = [];
      if (type === 'default') {
        tracks = await getPopularTracksForCountry(user?.country || 'US');
      } else {
        const genres = userPrefs?.genres || [];
        const years = userPrefs?.years || { from: 2010, to: 2025 };
        const artists = userPrefs?.artists || [];

        if (artists.length > 0) {
          const artistTopTracks = await getArtistTopTracks(artists[0].id);
          tracks = [...tracks, ...artistTopTracks];
        }

        const genreTracks = await getSpotifyRecommendations(genres, 20);
        tracks = [...tracks, ...genreTracks];

        const genreYearTracks = await searchTracksByGenreAndYear(genres[0] || 'pop', years.from, years.to);
        tracks = [...tracks, ...genreYearTracks];
      }

      const unique = [];
      const seen = new Set();
      for (const t of tracks) {
        if (t?.id && !seen.has(t.id)) {
          seen.add(t.id);
          unique.push(t);
        }
      }

      const playlist = {
        id: `playlist_${Date.now()}`,
        name: type === 'default' ? 'Popular Playlist' : 'Your Custom Playlist',
        tracks: unique.slice(0, 25),
        createdAt: new Date().toISOString(),
      };

      StorageService.savePlaylist(playlist);
      StorageService.setOnboardingInProgress(false);
      StorageService.clearCurrentStep();

      setIsLoading(false);
      setIsComplete(true);
    } catch (e) {
      console.error('Generation failed:', e);
      setIsLoading(false);
      showToast('Failed to generate playlist', 'error');
    }
  };

  if (currentStep === 'sprint1complete') {
    return <Sprint1Complete />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="inline-block p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-4 animate-spin">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Generating Playlist...</h2>
          <p className="text-white/70 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {playlistType === 'default' ? 'Popular Playlist Ready!' : 'Custom Playlist Ready!'}
          </h2>
          <p className="text-white/80">Your Spotify playlist has been created!</p>

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

  const savedLibraryPlaylists = StorageService.getLibraryPlaylists();
  const hasLibraryPlaylists = savedLibraryPlaylists && savedLibraryPlaylists.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {userData && currentStep !== 'landing' && currentStep !== 'login' && currentStep !== 'registration' && currentStep !== 'resetPassword' && (
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

      {userData && currentStep === 'playlist' && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1">
          <button
            onClick={() => setActiveView('generator')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'generator' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/80 hover:text-white'
              }`}
          >
            <Music className="w-4 h-4" />
            Player
          </button>
          <button
            onClick={() => setActiveView('library')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'library' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/80 hover:text-white'
              }`}
          >
            <Library className="w-4 h-4" />
            My Library
            {(hasLibraryPlaylists || likedSongs.length > 0) && (
              <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {savedLibraryPlaylists.length + (likedSongs.length > 0 ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
            {spotifyProfile ? (
              <div className="flex items-center gap-2">
                {spotifyProfile.images?.[0]?.url && (
                  <img src={spotifyProfile.images[0].url} alt={spotifyProfile.display_name || 'Spotify User'} className="w-8 h-8 rounded-full object-cover" />
                )}
                <span className="text-white text-sm">{spotifyProfile.display_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm">{userData?.firstName ? userData.firstName : (userData?.email || 'Profile')}</span>
                <button onClick={handleConnectSpotify} className="text-green-300 hover:text-green-200 border border-green-500/40 px-3 py-1 rounded-full text-xs">
                  Connect Spotify
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-10 right-4 md:right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success'
            ? 'bg-white text-pink-600'
            : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-white'
            }`}
        >
          {toast.type === 'success' ? (
            <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
          ) : (
            <Info className="w-6 h-6" />
          )}
          <p className="font-semibold text-sm md:text-base">{toast.message}</p>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Log Out</h3>
            <p className="text-white/80 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'library' && currentStep === 'playlist' ? (
        <PlaylistLibrary onLoadPlaylist={handleLoadPlaylistFromLibrary} showToast={showToast} likedSongs={likedSongs} />
      ) : (
        <>
          {currentStep === 'landing' && (
            <LandingScreen
              onLoginClick={() => setCurrentStep('login')}
              onSignupClick={() => setCurrentStep('registration')}
              onJumpToLibraryClick={() => {
                setJumpToLibraryAfterLogin(true);
                setCurrentStep('login');
              }}
            />
          )}

          {currentStep === 'resetPassword' && (
            <ResetPasswordScreen
              onBackToLogin={() => {
                try {
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/');
                  }
                } catch (e) {
                  // ignore
                }
                setCurrentStep('login');
              }}
            />
          )}

          {currentStep === 'login' && (
            <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={() => setCurrentStep('landing')} />
          )}

          {currentStep === 'registration' && (
            <RegistrationScreen onComplete={handleRegistrationComplete} onBack={() => setCurrentStep('landing')} />
          )}

          {currentStep === 'welcome' && (
            <WelcomeScreen userData={userData} onCustomPlaylist={handleCustomPlaylist} onDefaultPlaylist={handleDefaultPlaylist} />
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
              onContinue={handleArtistContinue}
              onSkip={handleArtistSkip}
              onBack={() => goToStep('years')}
            />
          )}

          {currentStep === 'playlist' && (
            <PlaylistView
              playlist={StorageService.getLatestPlaylist()}
              onToggleLike={toggleLikedSong}
              isLiked={isLiked}
              likedSongs={likedSongs}
              showToast={showToast}
              spotifyProfile={spotifyProfile}
              onCreateNew={handleStartOver}
              onGoToLibrary={handleGoToLibrary}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
