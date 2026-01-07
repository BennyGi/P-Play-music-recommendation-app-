import React, { useEffect, useState } from 'react';
import {
   Edit2,
   Library,
   Music,
   Play,
   Trash2,
   X,
   Check,
   Loader,
   AlertTriangle,
   Heart,
   Clock
} from 'lucide-react';
import { StorageService } from '../utils/storage';

const PlaylistLibrary = ({ onLoadPlaylist, showToast, likedSongs = [] }) => {
   const [playlists, setPlaylists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // Modal States
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showRenameModal, setShowRenameModal] = useState(false);
   const [selectedPlaylist, setSelectedPlaylist] = useState(null);
   const [newName, setNewName] = useState('');

   // Load playlists from StorageService
   const loadData = () => {
      setIsLoading(true);
      try {
         const storedPlaylists = StorageService.getLibraryPlaylists();
         setPlaylists(Array.isArray(storedPlaylists) ? storedPlaylists : []);
      } catch (e) {
         console.error('Failed to load data', e);
         setPlaylists([]);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      loadData();
   }, []);

   // Persist changes via StorageService
   const persist = (next) => {
      setPlaylists(next);
      StorageService.setLibraryPlaylists(next);
   };

   // --- DELETE with Confirmation Modal ---
   const openDeleteModal = (playlist) => {
      setSelectedPlaylist(playlist);
      setShowDeleteModal(true);
   };

   const confirmDelete = () => {
      if (!selectedPlaylist) return;

      const next = playlists.filter((p) => p.id !== selectedPlaylist.id);
      persist(next);

      if (showToast) {
         showToast(`"${selectedPlaylist.name}" deleted`, 'info');
      }

      setShowDeleteModal(false);
      setSelectedPlaylist(null);
   };

   // --- RENAME with Custom Modal ---
   const openRenameModal = (playlist) => {
      setSelectedPlaylist(playlist);
      setNewName(playlist.name || '');
      setShowRenameModal(true);
   };

   const confirmRename = () => {
      if (!selectedPlaylist) return;

      const trimmed = newName.trim();
      if (!trimmed) {
         if (showToast) showToast('Name cannot be empty', 'error');
         return;
      }

      const updated = playlists.map((p) =>
         p.id === selectedPlaylist.id ? { ...p, name: trimmed } : p
      );
      persist(updated);

      if (showToast) {
         showToast(`Renamed to "${trimmed}"`, 'success');
      }

      setShowRenameModal(false);
      setSelectedPlaylist(null);
      setNewName('');
   };

   // --- LOAD Playlist ---
   const handleLoad = (playlist) => {
      if (onLoadPlaylist) {
         onLoadPlaylist(playlist);
      }
   };

   // --- LOAD Liked Songs as Playlist ---
   const handleLoadLikedSongs = () => {
      if (likedSongs.length === 0) {
         if (showToast) showToast('No liked songs yet!', 'info');
         return;
      }

      const likedPlaylist = {
         id: 'liked_songs_playlist',
         name: '❤️ Liked Songs',
         type: 'liked_songs',
         tracks: likedSongs,
         trackCount: likedSongs.length,
         date: new Date().toISOString()
      };

      if (onLoadPlaylist) {
         onLoadPlaylist(likedPlaylist);
      }
   };

   // --- Format Date ---
   const formatDate = (dateString) => {
      if (!dateString) return 'Recently saved';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently saved';
      return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric'
      });
   };

   // Get playlist type label
   const getTypeLabel = (type) => {
      if (type === 'default') return '🌍 Popular';
      if (type === 'liked_based') return '💜 From Likes';
      return '🎵 Custom';
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 pt-20">

         {/* DELETE CONFIRMATION MODAL */}
         {showDeleteModal && selectedPlaylist && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-gradient-to-br from-gray-900 to-red-900/50 rounded-2xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-red-500/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Delete Playlist?</h3>
                  </div>

                  <p className="text-white/70 mb-6">
                     Are you sure you want to delete <span className="text-white font-semibold">"{selectedPlaylist.name}"</span>?
                     This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                     <button
                        onClick={() => {
                           setShowDeleteModal(false);
                           setSelectedPlaylist(null);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                     >
                        <Trash2 className="w-5 h-5" />
                        Delete
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* RENAME MODAL */}
         {showRenameModal && selectedPlaylist && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Edit2 className="w-6 h-6 text-purple-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Rename Playlist</h3>
                  </div>

                  <div className="mb-6">
                     <label className="block text-white/80 text-sm font-medium mb-2">
                        New Name
                     </label>
                     <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter playlist name..."
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && confirmRename()}
                     />
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => {
                           setShowRenameModal(false);
                           setSelectedPlaylist(null);
                           setNewName('');
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={confirmRename}
                        disabled={!newName.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        <Check className="w-5 h-5" />
                        Save
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className="max-w-6xl mx-auto">
            {/* Header - NO BACK BUTTON (using App.jsx navigation instead) */}
            <div className="flex items-center gap-3 text-white mb-8">
               <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Library className="w-8 h-8 text-pink-300" />
               </div>
               <div>
                  <h1 className="text-3xl font-bold">My Library</h1>
                  <p className="text-white/60 text-sm">
                     Your saved playlists and liked songs
                  </p>
               </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
               <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 text-center">
                  <Loader className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
                  <p className="text-white/60">Loading your library...</p>
               </div>
            ) : (
               <div className="space-y-8">

                  {/* ❤️ LIKED SONGS SECTION */}
                  <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-pink-500/30 rounded-xl">
                              <Heart className="w-6 h-6 text-pink-400" fill="currentColor" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
                              <p className="text-white/60 text-sm">{likedSongs.length} songs you love</p>
                           </div>
                        </div>
                        <button
                           onClick={handleLoadLikedSongs}
                           disabled={likedSongs.length === 0}
                           className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full font-medium transition-all"
                        >
                           <Play className="w-5 h-5" /> Play All
                        </button>
                     </div>

                     {likedSongs.length === 0 ? (
                        <div className="text-center py-6 text-white/50">
                           <Heart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                           <p>No liked songs yet. Tap the ❤️ on songs you love!</p>
                        </div>
                     ) : (
                        <div className="bg-black/20 rounded-xl p-4 max-h-64 overflow-y-auto">
                           <div className="space-y-2">
                              {likedSongs.slice(0, 10).map((track, idx) => (
                                 <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                    <span className="text-white/30 w-6 text-center text-sm">{idx + 1}</span>
                                    {track.image && (
                                       <img src={track.image} alt="" className="w-10 h-10 rounded object-cover" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                       <p className="text-white font-medium truncate">{track.title}</p>
                                       <p className="text-white/50 text-sm truncate">{track.artist}</p>
                                    </div>
                                    <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
                                 </div>
                              ))}
                              {likedSongs.length > 10 && (
                                 <p className="text-center text-white/40 text-sm py-2">
                                    +{likedSongs.length - 10} more songs
                                 </p>
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* 📚 SAVED PLAYLISTS SECTION */}
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                        <Music className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-bold text-white">Saved Playlists</h2>
                        <span className="text-white/50 text-sm">({playlists.length})</span>
                     </div>

                     {playlists.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 text-center text-white/80">
                           <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                              <Music className="w-8 h-8 text-purple-300" />
                           </div>
                           <h3 className="text-xl font-semibold mb-2">No Saved Playlists</h3>
                           <p className="text-white/60">
                              Click "Save to Library" in the player to save your playlists here.
                           </p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {playlists.map((playlist) => (
                              <div
                                 key={playlist.id}
                                 className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-white shadow-xl flex flex-col gap-4 hover:bg-white/15 transition-colors"
                              >
                                 {/* Playlist Header */}
                                 <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                       <h3 className="text-xl font-bold leading-tight truncate">
                                          {playlist.name || 'Playlist'}
                                       </h3>
                                       <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatDate(playlist.date || playlist.createdAt)}
                                       </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                       <span className="text-xs bg-black/30 px-3 py-1 rounded-full border border-white/10">
                                          {playlist.tracks?.length || playlist.trackCount || 0} tracks
                                       </span>
                                       <span className="text-xs text-white/50">
                                          {getTypeLabel(playlist.type)}
                                       </span>
                                    </div>
                                 </div>

                                 {/* Track Preview */}
                                 {playlist.tracks && playlist.tracks.length > 0 && (
                                    <div className="bg-black/20 rounded-lg p-3 space-y-2">
                                       {playlist.tracks.slice(0, 3).map((track, idx) => (
                                          <div key={track.id || idx} className="flex items-center gap-2 text-sm">
                                             <span className="text-white/30 w-4">{idx + 1}</span>
                                             <span className="text-white/80 truncate flex-1">{track.title}</span>
                                             <span className="text-white/40 truncate max-w-[80px]">{track.artist}</span>
                                          </div>
                                       ))}
                                       {playlist.tracks.length > 3 && (
                                          <p className="text-xs text-white/40 pl-6">
                                             +{playlist.tracks.length - 3} more
                                          </p>
                                       )}
                                    </div>
                                 )}

                                 {/* Action Buttons */}
                                 <div className="flex flex-wrap gap-2 mt-auto">
                                    <button
                                       onClick={() => handleLoad(playlist)}
                                       className="flex-1 min-w-[80px] flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-100 px-3 py-2.5 rounded-lg border border-green-300/20 transition-colors font-medium"
                                    >
                                       <Play className="w-4 h-4" /> Load
                                    </button>
                                    <button
                                       onClick={() => openRenameModal(playlist)}
                                       className="flex-1 min-w-[80px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-lg border border-white/10 transition-colors"
                                    >
                                       <Edit2 className="w-4 h-4" /> Rename
                                    </button>
                                    <button
                                       onClick={() => openDeleteModal(playlist)}
                                       className="flex-1 min-w-[80px] flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-2.5 rounded-lg border border-red-300/20 transition-colors"
                                    >
                                       <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default PlaylistLibrary;