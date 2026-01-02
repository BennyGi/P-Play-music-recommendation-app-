import React, { useState, useEffect } from 'react';
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
   Heart
} from 'lucide-react';
import { StorageService } from '../utils/storage';
import {
   getPopularTracksForCountry,
   getRecommendations
} from '../services/spotifyService';

const PlaylistView = ({ onCreateNew }) => {
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist, setPlaylist] = useState(StorageService.getLatestPlaylist());

   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());

   const [suggestedTracks, setSuggestedTracks] = useState([]);
   const [suggestedArtists, setSuggestedArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // Music Player State
   const [currentTrack, setCurrentTrack] = useState(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [progress, setProgress] = useState(0);
   const [volume, setVolume] = useState(75);
   const [likedTrackIds, setLikedTrackIds] = useState(new Set());
   const [isShuffle, setIsShuffle] = useState(false);
   const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
   const [history, setHistory] = useState([]); // Track history for smart Previous

   // --- Load tracks & artists from latest playlist ---
   useEffect(() => {
      setIsLoading(true);

      if (playlist?.tracks && playlist.tracks.length > 0) {
         setSuggestedTracks(playlist.tracks);

         // Initialize current track with first track
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

   // --- Sync Music Player with suggestedTracks changes (e.g., refresh) ---
   useEffect(() => {
      if (suggestedTracks.length > 0) {
         setCurrentTrack(suggestedTracks[0]);
         setIsPlaying(false);
         setProgress(0);
      }
   }, [suggestedTracks]);

   const refreshState = () => {
      setBlacklist(StorageService.getBlacklist());
   };

   const handleBlockGenre = (genreName) => {
      const blacklistId = `genre:${genreName}`;
      StorageService.saveBlacklist(blacklistId);
      refreshState();
   };

   const handleUnblock = (id) => {
      StorageService.removeFromBlacklist(id);
      refreshState();
   };

   const handleExportData = () => {
      const data = StorageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
         type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-preferences-${Date.now()}.json`;
      a.click();
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });
   };

   // Music Player Handlers
   const handlePlayPause = () => {
      setIsPlaying(!isPlaying);
   };

   const toggleShuffle = () => {
      setIsShuffle(!isShuffle);
   };

   const toggleRepeat = () => {
      const modes = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      setRepeatMode(modes[nextIndex]);
   };

   const handleNext = () => {
      if (suggestedTracks.length === 0) return;

      const currentIndex = suggestedTracks.findIndex(t => t.id === currentTrack?.id);

      // Repeat One: replay current track
      if (repeatMode === 'one') {
         setProgress(0);
         return;
      }

      // Add current index to history before changing track
      if (currentIndex !== -1) {
         setHistory(prev => [...prev, currentIndex]);
      }

      // Shuffle: pick random track
      if (isShuffle) {
         const randomIndex = Math.floor(Math.random() * suggestedTracks.length);
         setCurrentTrack(suggestedTracks[randomIndex]);
         setProgress(0);
         return;
      }

      // Normal or Repeat All: go to next
      const nextIndex = (currentIndex + 1) % suggestedTracks.length;

      // If at end and repeat mode is 'off', stop
      if (repeatMode === 'off' && currentIndex === suggestedTracks.length - 1) {
         setIsPlaying(false);
         return;
      }

      setCurrentTrack(suggestedTracks[nextIndex]);
      setProgress(0);
   };

   const handlePrevious = () => {
      if (suggestedTracks.length === 0) return;

      // Check if history has items - use smart previous
      if (history.length > 0) {
         const lastIndex = history[history.length - 1];
         setHistory(prev => prev.slice(0, -1)); // Remove last item
         setCurrentTrack(suggestedTracks[lastIndex]);
         setProgress(0);
         return;
      }

      // Fallback to standard previous behavior
      const currentIndex = suggestedTracks.findIndex(t => t.id === currentTrack?.id);
      const prevIndex = currentIndex <= 0 ? suggestedTracks.length - 1 : currentIndex - 1;
      setCurrentTrack(suggestedTracks[prevIndex]);
      setProgress(0);
   };

   const toggleLike = (trackId) => {
      setLikedTrackIds(prev => {
         const newSet = new Set(prev);
         if (newSet.has(trackId)) {
            newSet.delete(trackId);
         } else {
            newSet.add(trackId);
         }
         return newSet;
      });
   };

   if (!playlist) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
            <div className="text-center text-white">
               <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <h2 className="text-2xl font-bold mb-2">No Playlist Found</h2>
               <button
                  onClick={onCreateNew}
                  className="mt-4 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition-colors"
               >
                  Create Your First Playlist
               </button>
            </div>
         </div>
      );
   }

   const genreNames = {
      1: 'Pop',
      2: 'Rock',
      3: 'Hip Hop',
      4: 'Rap',
      5: 'Electronic',
      6: 'Jazz',
      7: 'Classical',
      8: 'R&B',
      9: 'Country',
      10: 'Latin',
      11: 'Metal',
      12: 'Indie',
      13: 'EDM',
      14: 'Reggae',
      15: 'Blues',
      16: 'Folk',
      17: 'Soul',
      18: 'Punk',
      19: 'Funk',
      20: 'House',
      21: 'K-Pop',
      22: 'Lo-Fi',
      23: 'Ambient',
      24: 'Afrobeats'
   };

   const selectedGenreNames =
      preferences?.genres?.map((id) => genreNames[id]).filter(Boolean) || [];

   // --- FUTURE PLAY BUTTON ---
   const handlePlay = () => {
      console.log('Play playlist (future implementation)', playlist);
      alert('Play יתממשק בעתיד לנגן. כרגע הפלייליסט נשמר ומוצג בלבד 🙂');
   };

   // --- REFRESH PLAYLIST: generate new set of tracks ---
   const handleRefreshPlaylist = async () => {
      try {
         setIsLoading(true);

         const refreshSeed = Math.floor(Math.random() * 100000);
         console.log('Refreshing playlist, seed:', refreshSeed);

         let tracks = [];

         if (playlist.type === 'default') {
            const countryCode = userData?.country || 'IL';
            tracks = await getPopularTracksForCountry(countryCode, 80);
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
               24: 'afrobeat'
            };

            const genreNamesArr =
               (preferences?.genres || [])
                  .map((id) => genreMap[id])
                  .filter(Boolean);

            const shuffledGenres = [...genreNamesArr].sort(
               () => 0.5 - Math.random()
            );

            const artistIds =
               (preferences?.artists || [])
                  .map((a) => a.id)
                  .filter(Boolean);

            const countryCode = userData?.country || 'IL';

            tracks = await getRecommendations(
               shuffledGenres.length > 0 ? shuffledGenres : ['pop'],
               artistIds,
               80,
               countryCode
            );
         }

         const shuffledTracks = [...tracks]
            .sort(() => 0.5 - Math.random())
            .slice(0, 50);

         const newPlaylist = {
            ...playlist,
            tracks: shuffledTracks,
            createdAt: new Date().toISOString(),
            refreshSeed
         };

         StorageService.savePlaylist(newPlaylist);
         setPlaylist(newPlaylist);
      } catch (e) {
         console.error('Error refreshing playlist', e);
         alert('Failed to refresh playlist, try again.');
      } finally {
         setIsLoading(false);
      }
   };

   // --- Remove single track from playlist (X button) ---
   const handleRemoveTrack = (trackId) => {
      const filtered = suggestedTracks.filter((t) => t.id !== trackId);

      const updatedPlaylist = {
         ...playlist,
         tracks: filtered
      };

      StorageService.savePlaylist(updatedPlaylist);
      setPlaylist(updatedPlaylist);
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 py-8">
         <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 space-y-10">
               {/* USER INFO */}
               <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-6">
                        <div className="p-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl">
                           <User className="w-12 h-12 text-white" />
                        </div>
                        <div>
                           <h1 className="text-5xl font-bold text-white">
                              {userData?.firstName && userData?.lastName
                                 ? `${userData.firstName} ${userData.lastName}`
                                 : 'Your Profile'}
                           </h1>
                           <p className="text-white/60 text-xl mt-2">
                              {playlist.type === 'default'
                                 ? 'Popular Hits Playlist'
                                 : 'Custom Playlist'}
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={onCreateNew}
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors text-lg"
                     >
                        <RefreshCw className="w-5 h-5" /> New Playlist
                     </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-pink-300 mb-3">
                           <Mail className="w-6 h-6" />
                           <span className="text-lg font-medium">Email</span>
                        </div>
                        <p className="text-white text-xl font-semibold truncate">
                           {userData?.email || 'N/A'}
                        </p>
                     </div>

                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-purple-300 mb-3">
                           <Calendar className="w-6 h-6" />
                           <span className="text-lg font-medium">Birth Date</span>
                        </div>
                        <p className="text-white text-xl font-semibold">
                           {formatDate(userData?.birthDate)}
                        </p>
                     </div>

                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 text-blue-300 mb-3">
                           <MapPin className="w-6 h-6" />
                           <span className="text-lg font-medium">Country</span>
                        </div>
                        <p className="text-white text-xl font-semibold">
                           {userData?.country || 'N/A'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* TOP ARTISTS */}
               <div className="bg-black/20 rounded-xl p-8">
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                     <User className="w-7 h-7 text-pink-400" /> Top Artists
                  </h3>

                  {isLoading ? (
                     <div className="flex justify-center p-12">
                        <Loader className="w-12 h-12 text-white animate-spin" />
                     </div>
                  ) : suggestedArtists.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {suggestedArtists.map((artist) => (
                           <div
                              key={artist.id || artist.name}
                              className="relative group p-6 rounded-xl text-center transition-all overflow-hidden bg-white/5 hover:bg-white/10"
                           >
                              {artist.image ? (
                                 <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="w-24 h-24 mx-auto rounded-full mb-3 object-cover"
                                 />
                              ) : (
                                 <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-white">
                                    {artist.name[0]}
                                 </div>
                              )}

                              <p className="font-semibold text-base mb-4 truncate px-2 text-white">
                                 {artist.name}
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-white/40 text-lg">
                        No artists found for this playlist.
                     </p>
                  )}
               </div>

               {/* MUSIC PLAYER */}
               {currentTrack && (
                  <div className="relative bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-8 overflow-hidden">
                     {/* Dynamic Background */}
                     {currentTrack.image && (
                        <>
                           <img
                              src={currentTrack.image}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 -z-10"
                           />
                           <div className="absolute inset-0 bg-black/50 -z-10" />
                        </>
                     )}

                     <div className="flex items-center justify-between gap-8">
                        {/* LEFT: Current Track Info - 30% width */}
                        <div className="flex items-center gap-4 w-[30%] min-w-0">
                           {currentTrack.image && (
                              <img
                                 src={currentTrack.image}
                                 alt={currentTrack.title}
                                 className="w-16 h-16 rounded-md object-cover shadow-lg flex-shrink-0"
                              />
                           )}
                           <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-xl truncate">
                                 {currentTrack.title}
                              </h4>
                              <p className="text-gray-300 text-base truncate">
                                 {currentTrack.artist}
                              </p>
                           </div>
                           <button
                              onClick={() => toggleLike(currentTrack.id)}
                              className={`p-2 rounded-full transition-all flex-shrink-0 hover:scale-110 ${likedTrackIds.has(currentTrack.id)
                                 ? 'text-red-500'
                                 : 'text-gray-400 hover:text-red-400'
                                 }`}
                           >
                              <Heart
                                 className="w-6 h-6"
                                 fill={likedTrackIds.has(currentTrack.id) ? 'currentColor' : 'none'}
                              />
                           </button>
                        </div>

                        {/* CENTER: Playback Controls - 40% width, most important */}
                        <div className="flex flex-col items-center gap-3 w-[40%] max-w-xl">
                           {/* Row 1: Control Buttons */}
                           <div className="flex items-center justify-center gap-6">
                              <button
                                 onClick={toggleShuffle}
                                 className={`transition-colors hover:scale-110 ${isShuffle ? 'text-green-500' : 'text-white/50 hover:text-white'
                                    }`}
                              >
                                 <Shuffle className="w-5 h-5" />
                              </button>
                              <button
                                 onClick={handlePrevious}
                                 className="text-white/70 hover:text-white transition-colors"
                              >
                                 <SkipBack className="w-6 h-6" />
                              </button>
                              <button
                                 onClick={handlePlayPause}
                                 className="bg-white hover:bg-white/90 text-black rounded-full p-4 transition-all hover:scale-110 shadow-xl"
                              >
                                 {isPlaying ? (
                                    <Pause className="w-6 h-6" fill="currentColor" />
                                 ) : (
                                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                                 )}
                              </button>
                              <button
                                 onClick={handleNext}
                                 className="text-white/70 hover:text-white transition-colors"
                              >
                                 <SkipForward className="w-6 h-6" />
                              </button>
                              <button
                                 onClick={toggleRepeat}
                                 className={`transition-colors hover:scale-110 relative ${repeatMode !== 'off' ? 'text-green-500' : 'text-white/50 hover:text-white'
                                    }`}
                                 title={`Repeat: ${repeatMode}`}
                              >
                                 <Repeat className="w-5 h-5" />
                                 {repeatMode === 'one' && (
                                    <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                                 )}
                              </button>
                           </div>

                           {/* Row 2: Progress Bar */}
                           <div className="w-full flex items-center gap-3">
                              <span className="text-white/60 text-xs font-medium tabular-nums">
                                 {Math.floor(progress / 60)}:{String(progress % 60).padStart(2, '0')}
                              </span>
                              <div className="relative flex-1 group">
                                 <input
                                    type="range"
                                    min="0"
                                    max="180"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer transition-all group-hover:h-1.5"
                                    style={{
                                       background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${(progress / 180) * 100}%, rgb(75 85 99) ${(progress / 180) * 100}%, rgb(75 85 99) 100%)`
                                    }}
                                 />
                              </div>
                              <span className="text-white/60 text-xs font-medium tabular-nums">3:00</span>
                           </div>
                        </div>

                        {/* RIGHT: Volume Control - 30% width */}
                        <div className="flex items-center gap-3 w-[30%] justify-end">
                           <Volume2 className="w-5 h-5 text-white/60 flex-shrink-0" />
                           <div className="relative group w-24">
                              <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 value={volume}
                                 onChange={(e) => setVolume(Number(e.target.value))}
                                 className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer transition-all group-hover:h-1.5"
                                 style={{
                                    background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${volume}%, rgb(75 85 99) ${volume}%, rgb(75 85 99) 100%)`
                                 }}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* TRACKS + PLAY/REFRESH HEADER */}
               <div className="bg-black/20 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Music className="w-7 h-7 text-purple-400" /> Your Playlist
                     </h3>
                     <div className="flex items-center gap-3">
                        <button
                           onClick={handlePlay}
                           className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm md:text-base"
                        >
                           <Play className="w-5 h-5" />
                           Play
                        </button>
                        <button
                           onClick={handleRefreshPlaylist}
                           disabled={isLoading}
                           className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm md:text-base disabled:opacity-50"
                        >
                           <RefreshCw className="w-5 h-5" />
                           Refresh
                        </button>
                     </div>
                  </div>

                  {isLoading ? (
                     <div className="flex justify-center p-12">
                        <Loader className="w-12 h-12 text-white animate-spin" />
                     </div>
                  ) : suggestedTracks.length > 0 ? (
                     <div className="space-y-4">
                        {suggestedTracks.map((track) => (
                           <div
                              key={track.id}
                              className="flex items-center justify-between p-4 rounded-lg transition-colors bg-white/5 hover:bg-white/10"
                           >
                              <div className="flex items-center gap-4 overflow-hidden">
                                 {track.image && (
                                    <img
                                       src={track.image}
                                       alt=""
                                       className="w-14 h-14 rounded object-cover"
                                    />
                                 )}
                                 <div className="min-w-0">
                                    <p className="font-semibold text-lg truncate text-white">
                                       {track.title}
                                    </p>
                                    <p className="text-base text-white/60 truncate">
                                       {track.artist}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <button
                                    onClick={() => toggleLike(track.id)}
                                    className={`p-2 hover:scale-110 transition-all ${likedTrackIds.has(track.id)
                                       ? 'text-red-500'
                                       : 'text-gray-500 hover:text-rose-500'
                                       }`}
                                    title="Like track"
                                 >
                                    <Heart
                                       className="w-6 h-6"
                                       fill={likedTrackIds.has(track.id) ? 'currentColor' : 'none'}
                                    />
                                 </button>
                                 <button
                                    onClick={() => handleRemoveTrack(track.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:scale-110 transition-all"
                                    title="Remove track from playlist"
                                 >
                                    <X className="w-6 h-6" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-white/40 text-lg">
                        No tracks found for this playlist.
                     </p>
                  )}
               </div>

               {/* GENRES SECTION (custom only) */}
               {playlist.type === 'custom' && selectedGenreNames.length > 0 && (
                  <div className="bg-black/20 rounded-xl p-8">
                     <div className="flex items-center gap-4 mb-6">
                        <Music className="w-7 h-7 text-purple-400" />
                        <h3 className="text-3xl font-bold text-white">
                           Selected Genres
                        </h3>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        {selectedGenreNames.map((genre) => {
                           const key = `genre:${genre}`;
                           const isBlocked = blacklist.includes(key);
                           return (
                              <button
                                 key={key}
                                 onClick={() =>
                                    isBlocked ? handleUnblock(key) : handleBlockGenre(genre)
                                 }
                                 className={`px-4 py-2 rounded-full text-base flex items-center gap-2 transition-all ${isBlocked
                                    ? 'bg-red-500/50 text-white line-through opacity-70'
                                    : 'bg-purple-500/30 text-white hover:bg-red-500/30'
                                    }`}
                              >
                                 {genre}
                                 {isBlocked ? <X className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               )}

               {/* BLACKLIST DISPLAY */}
               {blacklist.length > 0 && (
                  <div className="bg-black/20 rounded-xl p-8 border border-red-500/20">
                     <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <Ban className="w-7 h-7 text-red-400" /> Blocked Content
                     </h3>
                     <div className="flex flex-wrap gap-3">
                        {blacklist.map((item) => (
                           <div
                              key={item}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-200 rounded-full text-base"
                           >
                              <span>
                                 {item
                                    .replace('genre:', 'Genre: ')
                                    .replace('artist:', 'Artist: ')}
                              </span>
                              <button
                                 onClick={() => handleUnblock(item)}
                                 className="hover:text-white"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* ACTIONS */}
               <div className="mt-10 flex gap-6">
                  <button
                     onClick={handleExportData}
                     className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl transition-colors text-lg"
                  >
                     <Download className="w-6 h-6" /> Export Data
                  </button>
                  <button
                     onClick={() => {
                        if (confirm('Are you sure you want to clear all data?')) {
                           StorageService.clearAllData();
                           window.location.reload();
                        }
                     }}
                     className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-4 rounded-xl transition-colors text-lg"
                  >
                     Clear All Data
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PlaylistView;
