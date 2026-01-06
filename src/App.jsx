import React, { useState, useEffect } from 'react';
import { CheckCircle, Music } from 'lucide-react';

import RegistrationScreen from './components/onboarding/RegistrationScreen';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GenreSelection from './components/onboarding/GenreSelection';
import LanguageSelection from './components/onboarding/LanguageSelection';
import YearSelection from './components/onboarding/YearSelection';
import ArtistSelection from './components/onboarding/ArtistSelection';

import PlaylistView from './components/PlaylistView';
import Sprint1Complete from './components/Sprint1Complete';

import { StorageService } from './utils/storage';
import {
  getRecommendations,
  getArtistTopTracks,
  getPopularTracksForCountry,
} from './services/spotifyService';

import toast, { Toaster } from 'react-hot-toast';

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

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    StorageService.saveUserData(data);
    goToStep('welcome');
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

  const isLiked = (trackId) => likedSongs.some((t) => t?.id === trackId);

  const toggleLikedSong = (track) => {
    const next = StorageService.toggleLike(track);
    setLikedSongs(next);

    const isNowLiked = next.some((t) => t?.id === track?.id);
    if (isNowLiked) {
      toast.success(`Added "${track.title}" to Liked Songs`);
    } else {
      toast(`Removed "${track.title}" from Liked Songs`);
    }
  };

  const startGenerationProcess = async (type) => {
    setIsLoading(true);

    try {
      let tracks = [];

      if (type === 'default') {
        const countryCode = userData?.country || 'IL';
        tracks = await getPopularTracksForCountry(countryCode, 50);
      } else {
        const genreMap = {
          1: 'pop',
          2: 'rock',
          3: 'hip-hop',
          4: 'rap',
          5: 'electronic',
          6: 'jazz',
          7: 'classical',
          8: 'r-n-b',
          9: 'country',
          10: 'latin',
          11: 'metal',
          12: 'indie',
          13: 'edm',
          14: 'reggae',
          15: 'blues',
          16: 'folk',
          17: 'soul',
          18: 'punk',
          19: 'funk',
          20: 'house',
          21: 'k-pop',
          22: 'chill',
          23: 'ambient',
          24: 'afrobeat',
        };

        const genreNames = selectedGenres.map((id) => genreMap[id]).filter(Boolean);
        const artistIds = selectedArtists.map((a) => a.id).filter(Boolean);
        const countryCode = userData?.country || 'US';

        const recommendedTracks = await getRecommendations(
          genreNames.length > 0 ? genreNames : ['pop'],
          artistIds,
          30,
          countryCode
        );

        tracks = [...recommendedTracks];

        if (artistIds.length > 0) {
          const artistTracksPromises = artistIds.slice(0, 3).map((artistId) =>
            getArtistTopTracks(artistId, countryCode)
          );
          const artistTracksResults = await Promise.all(artistTracksPromises);
          const artistTracks = artistTracksResults.flat();

          const allTracks = [...tracks, ...artistTracks];
          const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());
          tracks = uniqueTracks.slice(0, 50);
        }
      }

      const playlistData = {
        type,
        userData,
        tracks,
        preferences:
          type === 'custom'
            ? { genres: selectedGenres, languages: selectedLanguages, years: selectedYears, artists: selectedArtists }
            : null,
        createdAt: new Date().toISOString(),
      };

      StorageService.savePlaylist(playlistData);
      StorageService.setOnboardingInProgress(false);
      StorageService.clearCurrentStep();

      setIsLoading(false);
      setIsComplete(true);
      setCurrentStep('playlist');
    } catch (error) {
      console.error('Error generating playlist:', error);
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
        artists: [],
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
      <>
        <Toaster position="bottom-right" />
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
                  : 'Fetching tracks from Spotify...'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isComplete) {
    return (
      <>
        <Toaster position="bottom-right" />
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
      </>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
        {currentStep === 'registration' && <RegistrationScreen onComplete={handleRegistrationComplete} />}

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
            selectedGenres={selectedGenres}
            selectedLanguages={selectedLanguages}
            selectedYears={selectedYears}
            onContinue={handleArtistContinue}
            onSkip={handleArtistSkip}
            onBack={() => goToStep('years')}
          />
        )}

        {currentStep === 'playlist' && (
          <PlaylistView onCreateNew={handleCreateNew} likedSongs={likedSongs} toggleLikedSong={toggleLikedSong} isLiked={isLiked} />
        )}

        {currentStep === 'sprint1complete' && <Sprint1Complete />}
      </div>
    </>
  );
}

export default App;
