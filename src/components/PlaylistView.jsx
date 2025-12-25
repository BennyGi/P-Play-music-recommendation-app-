import React, {useState} from 'react';
import { Music, User, Globe, Calendar, Mic, RefreshCw, Download, Star, Ban} from 'lucide-react';
import { StorageService } from '../utils/storage';

const PlaylistView = ({ onCreateNew }) => {
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist] = useState(StorageService.getLatestPlaylist());

   // New state for DB testing
   const [ratings, setRatings] = useState(StorageService.getRatings());
   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());

   const handleExportData = () => {
      const data = StorageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-preferences-${Date.now()}.json`;
      a.click();
   };

   const runDbTest = () => {
      // Simulate saving a rating
      const testSongId = `song_${Date.now()}`;
      StorageService.saveRating(testSongId, 5);

      // Simulate blocking an artist
      const testArtist = `artist_${Date.now()}`;
      StorageService.saveBlacklist(testArtist);

      // Refresh state to show updates immediately
      setRatings(StorageService.getRatings());
      setBlacklist(StorageService.getBlacklist());
      alert("Test data saved! Check the Debug section below.");
   };

   if (!playlist) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
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
                        <h1 className="text-3xl font-bold text-white">Your Playlist</h1>
                        <p className="text-white/60">
                           {playlist.type === 'default' ? 'Popular Hits' : 'Custom Mix'}
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={onCreateNew}
                     className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                     <RefreshCw className="w-4 h-4" />
                     Create New
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="bg-black/20 rounded-xl p-6">
                     <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-pink-400" />
                        <h3 className="text-xl font-bold text-white">User Information</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-white/80">
                        <div>
                           <span className="text-white/60">Name:</span>
                           <p className="font-semibold">{userData?.name || 'N/A'}</p>
                        </div>
                        <div>
                           <span className="text-white/60">Email:</span>
                           <p className="font-semibold">{userData?.email || 'N/A'}</p>
                        </div>
                        <div>
                           <span className="text-white/60">Country:</span>
                           <p className="font-semibold">{userData?.country || 'N/A'}</p>
                        </div>
                        <div>
                           <span className="text-white/60">Birth Date:</span>
                           <p className="font-semibold">{userData?.birthDate || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-6 border border-yellow-500/30">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <Star className="w-5 h-5 text-yellow-400" />
                           <h3 className="text-xl font-bold text-white">Database & Preferences Debug</h3>
                        </div>
                        <button
                            onClick={runDbTest}
                            className="bg-yellow-600/50 hover:bg-yellow-600/70 text-white px-3 py-1 rounded text-sm"
                        >
                           Run Test (Save Data)
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ratings View */}
                        <div>
                           <h4 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4" /> Saved Ratings ({Object.keys(ratings).length})
                           </h4>
                           <div className="bg-black/40 p-3 rounded h-32 overflow-y-auto text-xs font-mono text-green-300">
                              {Object.keys(ratings).length > 0 ? (
                                  <pre>{JSON.stringify(ratings, null, 2)}</pre>
                              ) : (
                                  <span className="text-white/40">No ratings saved yet.</span>
                              )}
                           </div>
                        </div>

                        {/* Blacklist View */}
                        <div>
                           <h4 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                              <Ban className="w-4 h-4" /> Blacklist ({blacklist.length})
                           </h4>
                           <div className="bg-black/40 p-3 rounded h-32 overflow-y-auto text-xs font-mono text-red-300">
                              {blacklist.length > 0 ? (
                                  <pre>{JSON.stringify(blacklist, null, 2)}</pre>
                              ) : (
                                  <span className="text-white/40">Blacklist is empty.</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {playlist.type === 'custom' && preferences && (
                     <>
                        {selectedGenreNames.length > 0 && (
                           <div className="bg-black/20 rounded-xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                 <Music className="w-5 h-5 text-purple-400" />
                                 <h3 className="text-xl font-bold text-white">Genres</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {selectedGenreNames.map((genre, idx) => (
                                    <span
                                       key={idx}
                                       className="px-3 py-1 bg-purple-500/30 text-white rounded-full text-sm"
                                    >
                                       {genre}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )}

                        {preferences.languages && preferences.languages.length > 0 && (
                           <div className="bg-black/20 rounded-xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                 <Globe className="w-5 h-5 text-cyan-400" />
                                 <h3 className="text-xl font-bold text-white">Languages</h3>
                              </div>
                              <p className="text-white/80">{preferences.languages.length} language(s) selected</p>
                           </div>
                        )}

                        {preferences.years && (
                           <div className="bg-black/20 rounded-xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                 <Calendar className="w-5 h-5 text-orange-400" />
                                 <h3 className="text-xl font-bold text-white">Era</h3>
                              </div>
                              <p className="text-white/80 text-2xl font-bold">
                                 {preferences.years.from} - {preferences.years.to}
                              </p>
                           </div>
                        )}

                        {preferences.artists && preferences.artists.length > 0 && (
                           <div className="bg-black/20 rounded-xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                 <Mic className="w-5 h-5 text-pink-400" />
                                 <h3 className="text-xl font-bold text-white">Artists</h3>
                              </div>
                              <p className="text-white/80">{preferences.artists.length} artist(s) selected</p>
                           </div>
                        )}
                     </>
                  )}

                  <div className="bg-black/20 rounded-xl p-6">
                     <div className="text-white/60 text-sm">
                        <p>Created: {new Date(playlist.createdAt).toLocaleString()}</p>
                        <p className="mt-1">Playlist ID: {playlist.id}</p>
                     </div>
                  </div>
               </div>

               <div className="mt-8 flex gap-4">
                  <button
                     onClick={handleExportData}
                     className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors"
                  >
                     <Download className="w-5 h-5" />
                     Export Data
                  </button>
                  <button
                     onClick={() => {
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
   );
};

export default PlaylistView;