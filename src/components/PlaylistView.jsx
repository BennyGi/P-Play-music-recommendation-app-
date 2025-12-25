import React, { useState, useEffect } from 'react';
import { Music, User, Globe, Calendar, Mic, RefreshCw, Download, ThumbsUp, ThumbsDown, Ban, X, Plus, Loader } from 'lucide-react';
import { StorageService } from '../utils/storage';
import { MusicDbService } from '../services/musicDbService';

const PlaylistView = ({ onCreateNew }) => {
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist] = useState(StorageService.getLatestPlaylist());
   
   // State for interactive UI
   const [ratings, setRatings] = useState(StorageService.getRatings());
   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());
   
   // Dynamic Real Data
   const [suggestedTracks, setSuggestedTracks] = useState([]);
   const [suggestedArtists, setSuggestedArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // Fetch data on load
   useEffect(() => {
      const fetchData = async () => {
         setIsLoading(true);
         if (preferences?.genres) {
            const { tracks, artists } = await MusicDbService.fetchRecommendations(preferences.genres);
            setSuggestedTracks(tracks);
            setSuggestedArtists(artists);
         }
         setIsLoading(false);
      };

      fetchData();
   }, [preferences]);

   const handleExportData = () => {
      const data = StorageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-preferences-${Date.now()}.json`;
      a.click();
   };

   // --- LOGIC: LIKE = SAVE, DISLIKE = BLOCK ---

   const handleLike = (id, type = 'track') => {
      const key = type === 'artist' ? `artist:${id}` : id;
      const isLiked = ratings[key];
      
      if (isLiked) {
         StorageService.removeRating(key);
      } else {
         StorageService.saveRating(key, 'liked');
         StorageService.removeFromBlacklist(key);
      }
      refreshState();
   };

   const handleDislike = (id, type = 'track') => {
      const key = type === 'artist' ? `artist:${id}` : id;
      const isBlocked = blacklist.includes(key);

      if (isBlocked) {
         StorageService.removeFromBlacklist(key);
      } else {
         StorageService.saveBlacklist(key);
         StorageService.removeRating(key);
      }
      refreshState();
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

   const refreshState = () => {
      setRatings(StorageService.getRatings());
      setBlacklist(StorageService.getBlacklist());
   };

   if (!playlist) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
            <div className="text-center text-white">
               <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <h2 className="text-2xl font-bold mb-2">No Playlist Found</h2>
               <button onClick={onCreateNew} className="mt-4 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition-colors">
                  Create Your First Playlist
               </button>
            </div>
         </div>
      );
   }

   const genreNames = {
      1: 'Pop', 2: 'Rock', 3: 'Hip Hop', 4: 'Rap', 5: 'Electronic',
      6: 'Jazz', 7: 'Classical', 8: 'R&B', 9: 'Country', 10: 'Latin',
      11: 'Metal', 12: 'Indie', 13: 'EDM', 14: 'Reggae', 15: 'Blues',
      16: 'Folk', 17: 'Soul', 18: 'Punk', 19: 'Funk', 20: 'House',
      21: 'K-Pop', 22: 'Lo-Fi', 23: 'Ambient', 24: 'Afrobeats'
   };

   const selectedGenreNames = preferences?.genres?.map(id => genreNames[id]).filter(Boolean) || [];

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
         <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl">
                        <Music className="w-8 h-8 text-white" />
                     </div>
                     <div>
                        <h1 className="text-3xl font-bold text-white">
                           {userData?.name ? `${userData.name}'s Playlist` : 'Your Playlist'}
                        </h1>

                        <p className="text-white/60">
                           {playlist.type === 'default' ? 'Popular Hits' : 'Custom Mix'}
                        </p>
                     </div>
                  </div>
                  <button onClick={onCreateNew} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                     <RefreshCw className="w-4 h-4" /> Create New
                  </button>
               </div>

               <div className="space-y-6">
                  {/* --- REAL ARTISTS SECTION --- */}
                  <div className="bg-black/20 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-pink-400" /> Top Artists (Last.fm Data)
                     </h3>
                     
                     {isLoading ? (
                        <div className="flex justify-center p-8"><Loader className="w-8 h-8 text-white animate-spin" /></div>
                     ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {suggestedArtists.map((artist, idx) => {
                              const artistKey = `artist:${artist.name}`;
                              const isLiked = ratings[artistKey];
                              const isBlocked = blacklist.includes(artistKey);
                              
                              return (
                                 <div key={idx} className={`relative group p-4 rounded-xl text-center transition-all overflow-hidden ${isBlocked ? 'bg-red-900/20 opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                                    {artist.image ? (
                                       <img src={artist.image} alt={artist.name} className="w-16 h-16 mx-auto rounded-full mb-2 object-cover" />
                                    ) : (
                                       <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-2 flex items-center justify-center text-lg font-bold text-white">
                                          {artist.name[0]}
                                       </div>
                                    )}
                                    
                                    <p className={`font-semibold text-sm mb-3 truncate px-2 ${isBlocked ? 'text-white/50 line-through' : 'text-white'}`}>{artist.name}</p>
                                    
                                    <div className="flex justify-center gap-2">
                                       <button 
                                          onClick={() => handleLike(artist.name, 'artist')}
                                          className={`p-1.5 rounded-full ${isLiked ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-green-500/50 text-white/70'}`}
                                          title="Save Artist"
                                       >
                                          <Plus className="w-3 h-3" />
                                       </button>
                                       <button 
                                          onClick={() => handleDislike(artist.name, 'artist')}
                                          className={`p-1.5 rounded-full ${isBlocked ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-red-500/50 text-white/70'}`}
                                          title="Block Artist"
                                       >
                                          <Ban className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                           {suggestedArtists.length === 0 && !isLoading && <p className="text-white/40 col-span-4">Select genres to see artists.</p>}
                        </div>
                     )}
                  </div>

                  {/* --- REAL TRACKS SECTION --- */}
                  <div className="bg-black/20 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white mb-4">Recommended Tracks</h3>
                     {isLoading ? (
                        <div className="flex justify-center p-8"><Loader className="w-8 h-8 text-white animate-spin" /></div>
                     ) : (
                        <div className="space-y-3">
                           {suggestedTracks.map(track => {
                              const isLiked = ratings[track.id];
                              const isBlocked = blacklist.includes(track.id);

                              return (
                                 <div key={track.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isBlocked ? 'bg-red-900/20 opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       {track.image && <img src={track.image} alt="" className="w-10 h-10 rounded object-cover" />}
                                       <div className="min-w-0">
                                          <p className={`font-semibold truncate ${isBlocked ? 'text-white/50 line-through' : 'text-white'}`}>{track.title}</p>
                                          <p className="text-sm text-white/60 truncate">{track.artist}</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                       <button 
                                          onClick={() => handleLike(track.id)}
                                          disabled={isBlocked}
                                          className={`p-2 rounded-full transition-all ${isLiked ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 hover:bg-green-500/50'} ${isBlocked ? 'cursor-not-allowed opacity-0' : ''}`}
                                       >
                                          <ThumbsUp className="w-4 h-4" />
                                       </button>
                                       <button 
                                          onClick={() => handleDislike(track.id)}
                                          className={`p-2 rounded-full transition-all ${isBlocked ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-red-500/50'}`}
                                       >
                                          <ThumbsDown className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                           {suggestedTracks.length === 0 && !isLoading && <p className="text-white/40">Select genres to see tracks.</p>}
                        </div>
                     )}
                  </div>

                  {/* --- GENRE BLACKLIST --- */}
                  {playlist.type === 'custom' && selectedGenreNames.length > 0 && (
                     <div className="bg-black/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <Music className="w-5 h-5 text-purple-400" />
                           <h3 className="text-xl font-bold text-white">Genres (Block)</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {selectedGenreNames.map((genre, idx) => {
                              const isBlocked = blacklist.includes(`genre:${genre}`);
                              return (
                                 <button
                                    key={idx}
                                    onClick={() => isBlocked ? handleUnblock(`genre:${genre}`) : handleBlockGenre(genre)}
                                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-all ${
                                       isBlocked 
                                          ? 'bg-red-500/50 text-white strike-through opacity-70' 
                                          : 'bg-purple-500/30 text-white hover:bg-red-500/30'
                                    }`}
                                 >
                                    {genre}
                                    {isBlocked ? <X className="w-3 h-3" /> : <Ban className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* --- ACTIVE BLACKLIST DISPLAY --- */}
                  {blacklist.length > 0 && (
                     <div className="bg-black/20 rounded-xl p-6 border border-red-500/20">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <Ban className="w-5 h-5 text-red-400" /> Blocked Content
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {blacklist.map((item) => (
                              <div key={item} className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-sm">
                                 <span>{item.replace('genre:', 'Genre: ').replace('artist:', 'Artist: ')}</span>
                                 <button onClick={() => handleUnblock(item)} className="hover:text-white">
                                    <X className="w-3 h-3" />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="mt-8 flex gap-4">
                     <button onClick={handleExportData} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors">
                        <Download className="w-5 h-5" /> Export Data
                     </button>
                     <button onClick={() => {
                           if (confirm('Are you sure you want to clear all data?')) {
                              StorageService.clearAllData();
                              window.location.reload();
                           }
                        }}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-3 rounded-xl transition-colors"
                     >
                        Clear All Data
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PlaylistView;