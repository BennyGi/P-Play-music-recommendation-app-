import React, { useState, useEffect, useRef } from 'react';
import {
   Music,
   User,
   Mail,
   Calendar,
   MapPin,
   RefreshCw,
   Download,
   Ban,
   X,
   Play,
   Loader,
   Pause,
   SkipBack,
   SkipForward,
   Shuffle,
   Repeat,
   Volume2,
   Heart,
   ExternalLink,
   Info
} from 'lucide-react';
import { StorageService } from '../utils/storage';
import EmptyState from './EmptyState';
import { buildWhatsAppShareUrl } from '../utils/whatsappShare';
import {
   getSpotifyRecommendations,
   getPopularTracksForCountry,
   searchTracksByGenreAndYear,
   getArtistTopTracks
} from '../services/spotifyService';

const PlaylistView = ({ onCreateNew, likedSongs, toggleLikedSong, isLiked }) => {
   console.log("PlaylistView props:", { onCreateNew, likedSongs, toggleLikedSong, isLiked });

   // --- DATA STATE ---
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist, setPlaylist] = useState(StorageService.getLatestPlaylist());
   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());

   const [suggestedTracks, setSuggestedTracks] = useState([]);
   const [suggestedArtists, setSuggestedArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [hoveredTrack, setHoveredTrack] = useState(null);

   // --- AUDIO PLAYER STATE ---
   const [currentTrack, setCurrentTrack] = useState(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoadingSource, setIsLoadingSource] = useState(false);
   const [progress, setProgress] = useState(0);
   const [duration, setDuration] = useState(0);
   const [volume, setVolume] = useState(75);

   // Player Features
   const [isShuffle, setIsShuffle] = useState(false);
   const [repeatMode, setRepeatMode] = useState('off');
   const [history, setHistory] = useState([]);

   // Audio Reference
   const audioRef = useRef(new Audio());

   // --- GENRE & LANGUAGE MAPS ---
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
      40: 'Portuguese (BR)', 41: 'Spanish (MX)'
   };

   // --- INITIAL LOAD ---
   useEffect(() => {
      setIsLoading(true);

      if (playlist?.tracks && playlist.tracks.length > 0) {
         setSuggestedTracks(playlist.tracks);

         if (!currentTrack && playlist.tracks[0]) {
            setCurrentTrack(playlist.tracks[0]);
         }

         const artistMap = new Map();
         playlist.tracks.forEach((t) => {
            if (t.artistId && !artistMap.has(t.artistId)) {
               artistMap.set(t.artistId, {
                  id: t.artistId,
                  name: t.artist,
                  image: t.image || null
               });
            }
         });
         setSuggestedArtists(Array.from(artistMap.values()));
      } else {
         setSuggestedTracks([]);
         setSuggestedArtists([]);
      }

      setIsLoading(false);
   }, [playlist]);

   // --- BUILD TRACK TOOLTIP ---
   const getTrackTooltip = (track) => {
      if (!preferences || playlist?.type === 'default') {
         return 'This track is popular in your country';
      }

      const reasons = [];

      // Genre matching
      if (preferences.genres && preferences.genres.length > 0) {
         const selectedGenresList = preferences.genres.map(id => genreNames[id]).filter(Boolean);
         if (selectedGenresList.length > 0) {
            reasons.push(`🎵 Genre: ${selectedGenresList.join(', ')}`);
         }
      }

      // Language/Market matching
      if (preferences.languages && preferences.languages.length > 0) {
         const selectedLangsList = preferences.languages.map(id => languageNames[id]).filter(Boolean);
         if (selectedLangsList.length > 0) {
            reasons.push(`🌍 Language: ${selectedLangsList.join(', ')}`);
         }
      }

      // Year range matching
      if (preferences.years) {
         const { from, to } = preferences.years;
         if (track.releaseYear && track.releaseYear >= from && track.releaseYear <= to) {
            reasons.push(`📅 Released: ${track.releaseYear} (within ${from}-${to})`);
         } else {
            reasons.push(`📅 Era: ${from} - ${to}`);
         }
      }

      // Artist matching
      if (preferences.artists && preferences.artists.length > 0) {
         const artistNames = preferences.artists.map(a => a.name);
         const matchedArtist = artistNames.find(name =>
            track.artist?.toLowerCase().includes(name.toLowerCase())
         );
         if (matchedArtist) {
            reasons.push(`🎤 Artist: ${matchedArtist} (your selection)`);
         }
      }

      if (reasons.length === 0) {
         return 'Matches your music preferences';
      }

      return reasons.join('\n');
   };

   // --- AUDIO LOGIC: iTunes Fallback ---
   const getItunesPreview = async (trackTitle, artistName) => {
      try {
         const query = `${trackTitle} ${artistName}`;
         const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
         const data = await response.json();
         return data.results?.[0]?.previewUrl || null;
      } catch (error) {
         console.error("iTunes fallback failed:", error);
         return null;
      }
   };

   // --- AUDIO LOGIC: Load & Play ---
   useEffect(() => {
      if (!currentTrack) return;

      const loadAndPlay = async () => {
         audioRef.current.pause();
         setIsLoadingSource(true);
         setProgress(0);

         let urlToPlay = currentTrack.previewUrl;

         if (!urlToPlay) {
            console.log(`Searching iTunes for: ${currentTrack.title}`);
            const fallbackUrl = await getItunesPreview(currentTrack.title, currentTrack.artist);
            if (fallbackUrl) urlToPlay = fallbackUrl;
         }

         setIsLoadingSource(false);

         if (urlToPlay) {
            audioRef.current.src = urlToPlay;
            audioRef.current.volume = volume / 100;

            if (isPlaying) {
               audioRef.current.play().catch(e => {
                  console.error("Play error:", e);
                  setIsPlaying(false);
               });
            }
         }
      };

      loadAndPlay();
   }, [currentTrack]);

   // --- AUDIO LOGIC: Listeners ---
   useEffect(() => {
      const audio = audioRef.current;
      const onTimeUpdate = () => setProgress(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration);
      const onEnded = () => {
         setIsPlaying(false);
         setProgress(0);
         handleNext();
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('ended', onEnded);

      return () => {
         audio.removeEventListener('timeupdate', onTimeUpdate);
         audio.removeEventListener('loadedmetadata', onLoadedMetadata);
         audio.removeEventListener('ended', onEnded);
      };
   }, []);

   useEffect(() => {
      if (audioRef.current) {
         audioRef.current.volume = volume / 100;
      }
   }, [volume]);

   // --- HANDLERS: Player Controls ---
   const handlePlayPause = () => {
      if (!audioRef.current.src) return;
      if (isPlaying) {
         audioRef.current.pause();
      } else {
         audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
   };

   const handleStartPlaylist = () => {
      if (suggestedTracks.length > 0) {
         if (!currentTrack) setCurrentTrack(suggestedTracks[0]);
         setIsPlaying(true);
         setTimeout(() => audioRef.current.play(), 100);
      }
   };

   const toggleShuffle = () => setIsShuffle(!isShuffle);

   const toggleRepeat = () => {
      const modes = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(repeatMode);
      setRepeatMode(modes[(currentIndex + 1) % modes.length]);
   };

   const handleNext = () => {
      if (suggestedTracks.length === 0) return;
      const currentIndex = suggestedTracks.findIndex(t => t.id === currentTrack?.id);

      if (repeatMode === 'one') {
         audioRef.current.currentTime = 0;
         audioRef.current.play();
         return;
      }

      if (currentIndex !== -1) setHistory(prev => [...prev, currentIndex]);

      if (isShuffle) {
         let randomIndex;
         do {
            randomIndex = Math.floor(Math.random() * suggestedTracks.length);
         } while (randomIndex === currentIndex && suggestedTracks.length > 1);
         setCurrentTrack(suggestedTracks[randomIndex]);
      } else {
         const nextIndex = (currentIndex + 1) % suggestedTracks.length;
         if (repeatMode === 'off' && currentIndex === suggestedTracks.length - 1) {
            setIsPlaying(false);
            return;
         }
         setCurrentTrack(suggestedTracks[nextIndex]);
      }
      setIsPlaying(true);
   };

   const handlePrevious = () => {
      if (suggestedTracks.length === 0) return;

      if (history.length > 0) {
         const lastIndex = history[history.length - 1];
         setHistory(prev => prev.slice(0, -1));
         setCurrentTrack(suggestedTracks[lastIndex]);
      } else {
         const currentIndex = suggestedTracks.findIndex(t => t.id === currentTrack?.id);
         const prevIndex = currentIndex <= 0 ? suggestedTracks.length - 1 : currentIndex - 1;
         setCurrentTrack(suggestedTracks[prevIndex]);
      }
      setIsPlaying(true);
   };

   // --- HANDLERS: Playlist Refresh (FIXED!) ---
   const handleRefreshPlaylist = async () => {
      try {
         setIsLoading(true);
         console.log('🔄 Refreshing playlist with preferences:', preferences);

         let tracks = [];
         const countryCode = userData?.country || 'US';

         // Get existing track IDs to exclude them
         const existingTrackIds = new Set(suggestedTracks.map(t => t.id));

         if (playlist.type === 'default') {
            // Get new popular tracks
            const allTracks = await getPopularTracksForCountry(countryCode, 100);
            // Filter out existing tracks and shuffle
            tracks = allTracks
               .filter(t => !existingTrackIds.has(t.id))
               .sort(() => Math.random() - 0.5)
               .slice(0, 50);
         } else {
            // Custom playlist - use saved preferences
            const genreIds = preferences?.genres || [1]; // Default to pop
            const languageIds = preferences?.languages || [];
            const yearRange = preferences?.years || { from: 2010, to: 2025 };
            const artistIds = (preferences?.artists || []).map(a => a.id).filter(Boolean);

            console.log('🎵 Fetching new recommendations with:', {
               genreIds, languageIds, yearRange, artistIds
            });

            // Get recommendations with different offset/seed for variety
            const recommendedTracks = await getSpotifyRecommendations({
               genreIds,
               artistIds,
               yearRange,
               languageIds,
               limit: 80,
               userCountry: countryCode
            });

            // Also get tracks via search for more variety
            const searchTracks = await searchTracksByGenreAndYear(
               genreIds,
               yearRange,
               countryCode,
               50
            );

            // Combine and filter out existing tracks
            const allNewTracks = [...recommendedTracks, ...searchTracks];
            const uniqueNewTracks = Array.from(
               new Map(allNewTracks.map(t => [t.id, t])).values()
            );

            tracks = uniqueNewTracks
               .filter(t => !existingTrackIds.has(t.id))
               .sort(() => Math.random() - 0.5)
               .slice(0, 50);

            // If still not enough unique tracks, include some from recommendations
            if (tracks.length < 20) {
               console.log('⚠️ Not enough unique tracks, including some overlaps');
               tracks = uniqueNewTracks
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 50);
            }
         }

         if (tracks.length === 0) {
            alert('Could not find new tracks. Try changing your preferences.');
            setIsLoading(false);
            return;
         }

         console.log(`✅ Found ${tracks.length} new tracks`);

         // Create new playlist with the new tracks
         const newPlaylist = {
            ...playlist,
            tracks,
            createdAt: new Date().toISOString(),
            refreshedAt: new Date().toISOString()
         };

         // Save and update state
         StorageService.savePlaylist(newPlaylist);
         setPlaylist(newPlaylist);
         setSuggestedTracks(tracks);

         // Reset player
         if (tracks.length > 0) {
            setCurrentTrack(tracks[0]);
            setIsPlaying(false);
            setProgress(0);
         }

      } catch (e) {
         console.error('❌ Error refreshing playlist:', e);
         alert('Failed to refresh playlist. Please check your internet connection.');
      } finally {
         setIsLoading(false);
      }
   };

   const handleRemoveTrack = (trackId) => {
      const filtered = suggestedTracks.filter((t) => t.id !== trackId);
      const updatedPlaylist = { ...playlist, tracks: filtered };
      StorageService.savePlaylist(updatedPlaylist);
      setPlaylist(updatedPlaylist);
      setSuggestedTracks(filtered);

      // If removed track was playing, switch to next
      if (currentTrack?.id === trackId && filtered.length > 0) {
         setCurrentTrack(filtered[0]);
      }
   };

   // --- HANDLERS: Data & Settings ---
   const refreshState = () => setBlacklist(StorageService.getBlacklist());
   const handleBlockGenre = (genre) => { StorageService.saveBlacklist(`genre:${genre}`); refreshState(); };
   const handleUnblock = (id) => { StorageService.removeFromBlacklist(id); refreshState(); };

   const handleExportData = () => {
      const data = StorageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-preferences-${Date.now()}.json`;
      a.click();
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric', month: 'long', day: 'numeric'
      });
   };

   const formatTime = (time) => {
      if (!time || isNaN(time)) return '0:00';
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
   };

   const handleShareOnWhatsApp = () => {
      const spotifyUrl = currentTrack?.spotifyUrl || suggestedTracks.find((t) => t?.spotifyUrl)?.spotifyUrl;
      const playlistTitle = userData?.firstName ? `${userData.firstName}'s Playlist` : 'P-Play Playlist';

      const url = buildWhatsAppShareUrl({
         playlistTitle,
         tracks: suggestedTracks,
         spotifyUrl
      });

      window.open(url, '_blank', 'noopener,noreferrer');
   };

   // --- RENDER HELPERS ---
   if (!playlist || !playlist?.tracks || playlist.tracks.length === 0) {
      return (
         <EmptyState
            title="Empty Library"
            subtitle="No playlists yet. Create one to start listening."
            actionLabel="Create Playlist"
            onAction={onCreateNew}
         />
      );
   }

   const selectedGenreNames = preferences?.genres?.map(id => genreNames[id] || 'Genre').filter(Boolean) || [];

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 py-8">
         <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 space-y-10">

               {/* HEADER USER INFO */}
               <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-6">
                        <div className="p-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl">
                           <User className="w-12 h-12 text-white" />
                        </div>
                        <div>
                           <h1 className="text-5xl font-bold text-white">
                              {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : 'Your Profile'}
                           </h1>
                           <p className="text-white/60 text-xl mt-2">
                              {playlist.type === 'default' ? 'Popular Hits' : 'Custom Mix'}
                           </p>
                        </div>
                     </div>
                     <button onClick={onCreateNew} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg">
                        <RefreshCw className="w-5 h-5" /> New Playlist
                     </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-pink-300 mb-3">
                           <Mail className="w-6 h-6" /> <span className="text-lg font-medium">Email</span>
                        </div>
                        <p className="text-white text-xl font-semibold truncate">{userData?.email || 'N/A'}</p>
                     </div>
                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-purple-300 mb-3">
                           <Calendar className="w-6 h-6" /> <span className="text-lg font-medium">Birth Date</span>
                        </div>
                        <p className="text-white text-xl font-semibold">{formatDate(userData?.birthDate)}</p>
                     </div>
                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-blue-300 mb-3">
                           <MapPin className="w-6 h-6" /> <span className="text-lg font-medium">Country</span>
                        </div>
                        <p className="text-white text-xl font-semibold">{userData?.country || 'N/A'}</p>
                     </div>
                  </div>
               </div>

               {/* MUSIC PLAYER */}
               {currentTrack && (
                  <div className="relative bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-8 overflow-hidden">
                     {currentTrack.image && (
                        <>
                           <img src={currentTrack.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 -z-10" />
                           <div className="absolute inset-0 bg-black/50 -z-10" />
                        </>
                     )}

                     <div className="flex items-center justify-between gap-8">
                        {/* Track Info */}
                        <div className="flex items-center gap-4 w-[30%] min-w-0">
                           {currentTrack.image && <img src={currentTrack.image} className={`w-16 h-16 rounded-md object-cover shadow-lg ${isPlaying ? 'animate-pulse' : ''}`} />}
                           <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-xl truncate">{currentTrack.title}</h4>
                              <p className="text-gray-300 text-base truncate">{currentTrack.artist}</p>
                              {currentTrack.spotifyUrl && (
                                 <a href={currentTrack.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-400 text-xs mt-1 hover:underline">
                                    <ExternalLink className="w-3 h-3" /> Listen on Spotify
                                 </a>
                              )}

                              <button
                                 onClick={handleShareOnWhatsApp}
                                 className="mt-2 inline-flex items-center gap-2 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-1.5 rounded-full transition-colors"
                              >
                                 Share On WhatsApp
                              </button>
                           </div>
                           <button
                              onClick={() => toggleLikedSong(currentTrack)}
                              className={`p-2 rounded-full ${isLiked(currentTrack.id) ? 'text-red-500' : 'text-gray-400'}`}
                           >
                              <Heart className="w-6 h-6" fill={isLiked(currentTrack.id) ? 'currentColor' : 'none'} />
                           </button>

                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-3 w-[40%] max-w-xl">
                           <div className="flex items-center justify-center gap-6">
                              <button onClick={toggleShuffle} className={isShuffle ? 'text-green-500' : 'text-white/50'}><Shuffle className="w-5 h-5" /></button>
                              <button onClick={handlePrevious} className="text-white/70 hover:text-white"><SkipBack className="w-6 h-6" /></button>
                              <button onClick={handlePlayPause} disabled={isLoadingSource} className="bg-white text-black rounded-full p-4 hover:scale-110 transition-all shadow-xl">
                                 {isLoadingSource ? <Loader className="w-6 h-6 animate-spin" /> : isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                              </button>
                              <button onClick={handleNext} className="text-white/70 hover:text-white"><SkipForward className="w-6 h-6" /></button>
                              <button onClick={toggleRepeat} className={repeatMode !== 'off' ? 'text-green-500' : 'text-white/50'}>
                                 <Repeat className="w-5 h-5" />
                                 {repeatMode === 'one' && <span className="absolute text-[10px] font-bold top-0">1</span>}
                              </button>
                           </div>
                           <div className="w-full flex items-center gap-3">
                              <span className="text-white/60 text-xs font-mono">{formatTime(progress)}</span>
                              <input type="range" min="0" max={duration || 30} value={progress}
                                 onChange={(e) => { audioRef.current.currentTime = Number(e.target.value); setProgress(Number(e.target.value)); }}
                                 className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-purple-500" />
                              <span className="text-white/60 text-xs font-mono">{formatTime(duration)}</span>
                           </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-3 w-[30%] justify-end">
                           <Volume2 className="w-5 h-5 text-white/60" />
                           <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-purple-500" />
                        </div>
                     </div>
                  </div>
               )}

               {/* TRACK LIST */}
               <div className="bg-black/20 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Music className="w-7 h-7 text-purple-400" /> Your Playlist
                        <span className="text-lg text-white/50 font-normal">({suggestedTracks.length} tracks)</span>
                     </h3>
                     <div className="flex items-center gap-3">
                        <button onClick={handleStartPlaylist} className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-full">
                           <Play className="w-5 h-5" /> Play
                        </button>
                        <button
                           onClick={handleRefreshPlaylist}
                           disabled={isLoading}
                           className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full disabled:opacity-50"
                           title="Get new songs matching your preferences"
                        >
                           <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                           {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {suggestedTracks.map((track, index) => (
                        <div
                           key={track.id}
                           className={`relative flex items-center justify-between p-4 rounded-lg transition-colors ${currentTrack?.id === track.id ? 'bg-white/10 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                           onMouseEnter={() => setHoveredTrack(track.id)}
                           onMouseLeave={() => setHoveredTrack(null)}
                        >
                           {/* Track Number */}
                           <span className="text-white/30 w-8 text-center font-mono">{index + 1}</span>

                           <div className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1" onClick={() => setCurrentTrack(track)}>
                              {track.image && <img src={track.image} alt="" className="w-14 h-14 rounded object-cover" />}
                              <div className="min-w-0 flex-1">
                                 <p className={`font-semibold text-lg truncate ${currentTrack?.id === track.id ? 'text-purple-300' : 'text-white'}`}>{track.title}</p>
                                 <p className="text-base text-white/60 truncate">{track.artist}</p>
                                 {track.releaseYear && (
                                    <p className="text-xs text-white/40">{track.releaseYear}</p>
                                 )}
                              </div>
                           </div>

                           {/* Tooltip on hover */}
                           {hoveredTrack === track.id && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-80">
                                 <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl">
                                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                                       <Info className="w-4 h-4" />
                                       <span className="font-medium text-sm">Why this song?</span>
                                    </div>
                                    <p className="text-white/80 text-sm whitespace-pre-line">
                                       {getTrackTooltip(track)}
                                    </p>
                                    {/* Arrow */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900/95"></div>
                                 </div>
                              </div>
                           )}

                           <div className="flex items-center gap-4">
                              <button
                                 onClick={() => toggleLikedSong(track)}
                                 className={`p-2 ${isLiked(track.id) ? 'text-red-500' : 'text-gray-500 hover:text-rose-500'}`}
                              >
                                 <Heart className="w-6 h-6" fill={isLiked(track.id) ? 'currentColor' : 'none'} />
                              </button>

                              <button onClick={() => handleRemoveTrack(track.id)} className="p-2 text-gray-500 hover:text-red-500 hover:scale-110 transition-all">
                                 <X className="w-6 h-6" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* PREFERENCES INFO */}
               {playlist.type === 'custom' && preferences && (
                  <div className="bg-black/20 rounded-xl p-8">
                     <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Info className="w-6 h-6 text-purple-400" /> Your Preferences
                     </h3>
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Genres */}
                        {preferences.genres && preferences.genres.length > 0 && (
                           <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-white/60 text-sm mb-2">🎵 Genres</p>
                              <div className="flex flex-wrap gap-2">
                                 {preferences.genres.map(id => (
                                    <span key={id} className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                                       {genreNames[id]}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Languages */}
                        {preferences.languages && preferences.languages.length > 0 && (
                           <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-white/60 text-sm mb-2">🌍 Languages</p>
                              <div className="flex flex-wrap gap-2">
                                 {preferences.languages.map(id => (
                                    <span key={id} className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                                       {languageNames[id]}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Years */}
                        {preferences.years && (
                           <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-white/60 text-sm mb-2">📅 Year Range</p>
                              <span className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full text-sm">
                                 {preferences.years.from} - {preferences.years.to}
                              </span>
                           </div>
                        )}

                        {/* Artists */}
                        {preferences.artists && preferences.artists.length > 0 && (
                           <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-white/60 text-sm mb-2">🎤 Artists</p>
                              <div className="flex flex-wrap gap-2">
                                 {preferences.artists.slice(0, 3).map(a => (
                                    <span key={a.id} className="bg-pink-500/30 text-pink-200 px-3 py-1 rounded-full text-sm">
                                       {a.name}
                                    </span>
                                 ))}
                                 {preferences.artists.length > 3 && (
                                    <span className="text-white/50 text-sm">+{preferences.artists.length - 3} more</span>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* GENRES & BLACKLIST */}
               {playlist.type === 'custom' && selectedGenreNames.length > 0 && (
                  <div className="bg-black/20 rounded-xl p-8">
                     <div className="flex items-center gap-4 mb-6">
                        <Music className="w-7 h-7 text-purple-400" /> <h3 className="text-3xl font-bold text-white">Selected Genres</h3>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        {selectedGenreNames.map(genre => {
                           const key = `genre:${genre}`;
                           const isBlocked = blacklist.includes(key);
                           return (
                              <button key={key} onClick={() => isBlocked ? handleUnblock(key) : handleBlockGenre(genre)}
                                 className={`px-4 py-2 rounded-full text-base flex items-center gap-2 transition-all ${isBlocked ? 'bg-red-500/50 text-white line-through opacity-70' : 'bg-purple-500/30 text-white hover:bg-red-500/30'}`}>
                                 {genre} {isBlocked ? <X className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               )}

               {blacklist.length > 0 && (
                  <div className="bg-black/20 rounded-xl p-8 border border-red-500/20">
                     <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3"><Ban className="w-7 h-7 text-red-400" /> Blocked Content</h3>
                     <div className="flex flex-wrap gap-3">
                        {blacklist.map(item => (
                           <div key={item} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-200 rounded-full">
                              <span>{item.replace('genre:', 'Genre: ')}</span>
                              <button onClick={() => handleUnblock(item)} className="hover:text-white"><X className="w-4 h-4" /></button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* BOTTOM ACTIONS */}
               <div className="mt-10 flex gap-6">
                  <button onClick={handleExportData} className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl transition-colors text-lg">
                     <Download className="w-6 h-6" /> Export Data
                  </button>
                  <button onClick={() => { if (confirm('Clear all data?')) { StorageService.clearAllData(); window.location.reload(); } }}
                     className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-4 rounded-xl transition-colors text-lg">
                     Clear All Data
                  </button>
               </div>

            </div>
         </div>
      </div>
   );
};

export default PlaylistView;