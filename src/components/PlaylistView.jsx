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
   Loader
} from 'lucide-react';
import { StorageService } from '../utils/storage';
import { getPopularTracksForCountry, getRecommendations } from '../services/spotifyService';

const PlaylistView = ({ onCreateNew }) => {
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist, setPlaylist] = useState(StorageService.getLatestPlaylist());

   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());

   const [suggestedTracks, setSuggestedTracks] = useState([]);
   const [suggestedArtists, setSuggestedArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // --- Load tracks & artists from latest playlist ---
   useEffect(() => {
      setIsLoading(true);

      if (playlist?.tracks && playlist.tracks.length > 0) {
         setSuggestedTracks(playlist.tracks);

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

   // --- FUTURE PLAY BUTTON (כרגע רק לוג) ---
   const handlePlay = () => {
      console.log('Play playlist (future implementation)', playlist);
      alert('Play will be implemented later – right now זה רק פלייליסט שנשמר ב־localStorage 🙂');
   };

   // --- REFRESH PLAYLIST: מושך פלייליסט חדש לפי ההעדפות ---
   const handleRefreshPlaylist = async () => {
      try {
         setIsLoading(true);

         let tracks = [];

         if (playlist.type === 'default') {
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
               24: 'afrobeat'
            };

            const genreNamesArr =
               preferences?.genres?.map((id) => genreMap[id]).filter(Boolean) || [];
            const artistIds =
               preferences?.artists?.map((a) => a.id).filter(Boolean) || [];
            const countryCode = userData?.country || 'IL';

            tracks = await getRecommendations(
               genreNamesArr.length > 0 ? genreNamesArr : ['pop'],
               artistIds,
               50,
               countryCode
            );
         }

         const newPlaylist = {
            ...playlist,
            tracks,
            createdAt: new Date().toISOString()
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
      setPlaylist(updatedPlaylist); // יגרום ל-useEffect למלא מחדש את ה־state
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
                              <button
                                 onClick={() => handleRemoveTrack(track.id)}
                                 className="p-2 rounded-full bg-red-500/70 hover:bg-red-600 text-white"
                                 title="Remove track from playlist"
                              >
                                 <X className="w-5 h-5" />
                              </button>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-white/40 text-lg">
                        No tracks found for this playlist.
                     </p>
                  )}
               </div>

               {/* GENRES SECTION (custom) */}
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
