import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Library, Music, Play, Trash2 } from 'lucide-react';

const PlaylistLibrary = ({ onBack, onLoadPlaylist }) => {
   const [playlists, setPlaylists] = useState([]);

   const loadPlaylists = () => {
      try {
         const stored = JSON.parse(localStorage.getItem('my_playlists'));
         if (Array.isArray(stored)) {
            setPlaylists(stored);
         } else {
            setPlaylists([]);
         }
      } catch (e) {
         console.error('Failed to load saved playlists', e);
         setPlaylists([]);
      }
   };

   useEffect(() => {
      loadPlaylists();
   }, []);

   const persist = (next) => {
      setPlaylists(next);
      localStorage.setItem('my_playlists', JSON.stringify(next));
   };

   const handleDelete = (id) => {
      const next = playlists.filter((p) => p.id !== id);
      persist(next);
   };

   const handleRename = (id) => {
      const current = playlists.find((p) => p.id === id);
      if (!current) return;

      const nextName = window.prompt('Rename playlist', current.name || '');
      if (nextName === null) return;

      const trimmed = nextName.trim();
      const updated = playlists.map((p) =>
         p.id === id ? { ...p, name: trimmed || current.name || 'Playlist' } : p
      );
      persist(updated);
   };

   const handleLoad = (playlist) => {
      if (onLoadPlaylist) {
         onLoadPlaylist(playlist);
      } else {
         console.log('Load playlist', playlist);
      }
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'Recently saved';
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return 'Recently saved';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
         <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3 text-white">
                  <Library className="w-8 h-8 text-pink-300" />
                  <div>
                     <h1 className="text-3xl font-bold">My Library</h1>
                     <p className="text-white/60 text-sm">Saved playlists live here</p>
                  </div>
               </div>
               {onBack && (
                  <button
                     onClick={onBack}
                     className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
                  >
                     <ArrowLeft className="w-4 h-4" /> Back to Generator
                  </button>
               )}
            </div>

            {playlists.length === 0 ? (
               <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 text-center text-white/80">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                     <Music className="w-8 h-8 text-pink-300" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">No playlists saved yet</h2>
                  <p className="text-white/60">Save a playlist from the generator to see it here.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                     <div
                        key={playlist.id}
                        className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-white shadow-xl flex flex-col gap-4"
                     >
                        <div className="flex items-start justify-between gap-4">
                           <div>
                              <h3 className="text-xl font-bold leading-tight">{playlist.name || 'Playlist'}</h3>
                              <p className="text-sm text-white/60">{formatDate(playlist.date)}</p>
                           </div>
                           <span className="text-xs bg-black/30 px-3 py-1 rounded-full border border-white/10">{playlist.tracks?.length || 0} tracks</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                           <button
                              onClick={() => handleLoad(playlist)}
                              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-100 px-3 py-2 rounded-lg border border-green-300/20 transition-colors"
                           >
                              <Play className="w-4 h-4" /> Load
                           </button>
                           <button
                              onClick={() => handleRename(playlist.id)}
                              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/10 transition-colors"
                           >
                              <Edit2 className="w-4 h-4" /> Rename
                           </button>
                           <button
                              onClick={() => handleDelete(playlist.id)}
                              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-2 rounded-lg border border-red-300/20 transition-colors"
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
   );
};

export default PlaylistLibrary;
