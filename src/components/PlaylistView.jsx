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
   Info,
   Sparkles,
   Save,
   Library,
   Check
} from 'lucide-react';
import { StorageService } from '../utils/storage';
import EmptyState from './EmptyState';
import { buildWhatsAppShareUrl } from '../utils/whatsappShare';
import {
   getSpotifyRecommendations,
   getPopularTracksForCountry,
   searchTracksByGenreAndYear,
   getArtistTopTracks,
   generateMoreFromLiked
} from '../services/spotifyService';

const PlaylistView = ({ onCreateNew, likedSongs, toggleLikedSong: toggleLikedSongProp, onToggleLike, isLiked, showToast, spotifyProfile, onNewPlaylist, onGoToLibrary }) => {
   console.log("PlaylistView props:", { onCreateNew, likedSongs, toggleLikedSong: toggleLikedSongProp, isLiked });

   const toggleLikedSong = toggleLikedSongProp || onToggleLike;

   // --- DATA STATE ---
   const [userData] = useState(StorageService.getUserData());
   const [preferences] = useState(StorageService.getPreferences());
   const [playlist, setPlaylist] = useState(StorageService.getLatestPlaylist());
   const [blacklist, setBlacklist] = useState(StorageService.getBlacklist());

   const [suggestedTracks, setSuggestedTracks] = useState([]);
   const [suggestedArtists, setSuggestedArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [hoveredTrack, setHoveredTrack] = useState(null);
   const [isGeneratingMore, setIsGeneratingMore] = useState(false);

   // --- SAVE TO LIBRARY MODAL STATE ---
   const [showSaveModal, setShowSaveModal] = useState(false);
   const [playlistName, setPlaylistName] = useState('');
   const [isSaving, setIsSaving] = useState(false);
   const [showDuplicateModal, setShowDuplicateModal] = useState(false);

   const areTrackListsEqual = (a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
         if (a[i] !== b[i]) return false;
      }
      return true;
   };



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

   // --- SAVE TO LIBRARY ---
   const handleOpenSaveModal = () => {
      if (!suggestedTracks || suggestedTracks.length === 0) {
         if (showToast) showToast('No tracks to save. Generate a playlist first.', 'error');
         return;
      }
      // Duplicate check before opening modal
      try {
         const existingPlaylists = StorageService.getLibraryPlaylists();
         const currentIds = suggestedTracks.map(t => t.id);
         const duplicateFound = (existingPlaylists || []).some(pl => {
            const ids = (pl?.tracks || []).map(t => t.id);
            return areTrackListsEqual(currentIds, ids);
         });
         if (duplicateFound) {
            setShowDuplicateModal(true);
            return;
         }
      } catch (e) {
         console.warn('Duplicate check failed:', e);
      }

      const existingPlaylists = StorageService.getLibraryPlaylists();
      const defaultName = `My Playlist ${existingPlaylists.length + 1}`;
      setPlaylistName(defaultName);
      setShowSaveModal(true);
   };

   const handleSaveToLibrary = () => {
      if (!suggestedTracks || suggestedTracks.length === 0) return;
      // Duplicate check prior to save
      try {
         const existingPlaylists = StorageService.getLibraryPlaylists();
         const currentIds = suggestedTracks.map(t => t.id);
         const duplicateFound = (existingPlaylists || []).some(pl => {
            const ids = (pl?.tracks || []).map(t => t.id);
            return areTrackListsEqual(currentIds, ids);
         });
         if (duplicateFound) {
            setShowDuplicateModal(true);
            setShowSaveModal(false);
            return;
         }
      } catch (e) {
         console.warn('Duplicate check failed:', e);
      }

      setIsSaving(true);

      try {
         const trimmedName = playlistName.trim();
         const existingPlaylists = StorageService.getLibraryPlaylists();
         const finalName = trimmedName || `My Playlist ${existingPlaylists.length + 1}`;

         const playlistToSave = {
            id: Date.now(),
            name: finalName,
            type: playlist?.type || 'custom',
            tracks: suggestedTracks,
            trackCount: suggestedTracks.length,
            date: new Date().toISOString(),
            preferences: preferences || null
         };

         const success = StorageService.saveToLibrary(playlistToSave);

         if (success) {
            if (showToast) showToast(`"${finalName}" saved to library!`, 'success');
            setShowSaveModal(false);
            setPlaylistName('');
         } else {
            if (showToast) showToast('Storage is full. Please delete some playlists.', 'error');
         }
      } catch (error) {
         console.error('Save to library error:', error);
         if (showToast) showToast('Failed to save playlist. Please try again.', 'error');
      } finally {
         setIsSaving(false);
      }
   };

   // --- BUILD TRACK TOOLTIP ---
   const getTrackTooltip = (track) => {
      if (!preferences || playlist?.type === 'default') {
         return 'This track is popular in your country';
      }

      if (playlist?.type === 'liked_based' || playlist?.type === 'liked_songs') {
         return '💜 Generated based on songs you liked';
      }

      const reasons = [];

      if (preferences.genres && preferences.genres.length > 0) {
         const selectedGenresList = preferences.genres.map(id => genreNames[id]).filter(Boolean);
         if (selectedGenresList.length > 0) {
            reasons.push(`🎵 Genre: ${selectedGenresList.join(', ')}`);
         }
      }

      if (preferences.languages && preferences.languages.length > 0) {
         const selectedLangsList = preferences.languages.map(id => languageNames[id]).filter(Boolean);
         if (selectedLangsList.length > 0) {
            reasons.push(`🌍 Language: ${selectedLangsList.join(', ')}`);
         }
      }

      if (preferences.years) {
         const { from, to } = preferences.years;
         if (track.releaseYear && track.releaseYear >= from && track.releaseYear <= to) {
            reasons.push(`📅 Released: ${track.releaseYear} (within ${from}-${to})`);
         } else {
            reasons.push(`📅 Era: ${from} - ${to}`);
         }
      }

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

   // --- CLEANUP: Stop audio when leaving PlaylistView (e.g., switching to Library) ---
   useEffect(() => {
      return () => {
         // This runs when component unmounts
         if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
         }
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

   // --- HANDLERS: Playlist Refresh (uses PREFERENCES) ---
   const handleRefreshPlaylist = async () => {
      try {
         setIsLoading(true);
         console.log('🔄 Refreshing playlist with preferences:', preferences);

         let tracks = [];
         const countryCode = userData?.country || 'US';
         const existingTrackIds = new Set(suggestedTracks.map(t => t.id));

         if (playlist.type === 'default') {
            const allTracks = await getPopularTracksForCountry(countryCode, 100);
            tracks = allTracks
               .filter(t => !existingTrackIds.has(t.id))
               .sort(() => Math.random() - 0.5)
               .slice(0, 50);
         } else {
            const genreIds = preferences?.genres || [1];
            const languageIds = preferences?.languages || [];
            const yearRange = preferences?.years || { from: 2010, to: 2025 };
            const artistIds = (preferences?.artists || []).map(a => a.id).filter(Boolean);

            const recommendedTracks = await getSpotifyRecommendations({
               genreIds,
               artistIds,
               yearRange,
               languageIds,
               limit: 80,
               userCountry: countryCode
            });

            const searchTracksResult = await searchTracksByGenreAndYear(
               genreIds,
               yearRange,
               countryCode,
               50
            );

            const allNewTracks = [...recommendedTracks, ...searchTracksResult];
            const uniqueNewTracks = Array.from(
               new Map(allNewTracks.map(t => [t.id, t])).values()
            );

            tracks = uniqueNewTracks
               .filter(t => !existingTrackIds.has(t.id))
               .sort(() => Math.random() - 0.5)
               .slice(0, 50);

            if (tracks.length < 20) {
               tracks = uniqueNewTracks
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 50);
            }
         }

         if (tracks.length === 0) {
            if (showToast) showToast('Could not find new tracks. Try changing your preferences.', 'error');
            setIsLoading(false);
            return;
         }

         const newPlaylist = {
            ...playlist,
            tracks,
            createdAt: new Date().toISOString(),
            refreshedAt: new Date().toISOString()
         };

         StorageService.savePlaylist(newPlaylist);
         setPlaylist(newPlaylist);
         setSuggestedTracks(tracks);

         if (tracks.length > 0) {
            setCurrentTrack(tracks[0]);
            setIsPlaying(false);
            setProgress(0);
         }

         if (showToast) showToast(`Found ${tracks.length} new tracks based on your preferences!`, 'success');

      } catch (e) {
         console.error('❌ Error refreshing playlist:', e);
         if (showToast) showToast('Failed to refresh playlist.', 'error');
      } finally {
         setIsLoading(false);
      }
   };

   // --- HANDLERS: Generate More Songs (uses LIKED SONGS) ---
   const handleGenerateMoreSongs = async () => {
      try {
         if (!likedSongs || likedSongs.length === 0) {
            if (showToast) showToast('Like some songs first by tapping the ❤️!', 'info');
            return;
         }

         setIsGeneratingMore(true);
         setIsLoading(true);

         const countryCode = userData?.country || 'IL';
         const alreadyShownIds = new Set(
            (playlist?.tracks || []).map((t) => t?.id).filter(Boolean)
         );

         const collected = [];
         const collectedIds = new Set([...alreadyShownIds]);

         let rounds = 0;
         while (collected.length < 50 && rounds < 4) {
            const needed = 50 - collected.length;
            const batch = await generateMoreFromLiked(
               likedSongs,
               needed,
               countryCode,
               Array.from(collectedIds)
            );

            for (const t of batch || []) {
               if (!t?.id) continue;
               if (collectedIds.has(t.id)) continue;
               collectedIds.add(t.id);
               collected.push(t);
               if (collected.length >= 50) break;
            }

            rounds++;
            if (!batch || batch.length === 0) break;
         }

         let finalTracks = collected.slice(0, 50);

         if (finalTracks.length < 50) {
            const fallback = await getPopularTracksForCountry(countryCode, 80);
            for (const t of fallback || []) {
               if (!t?.id) continue;
               if (collectedIds.has(t.id)) continue;
               finalTracks.push(t);
               collectedIds.add(t.id);
               if (finalTracks.length >= 50) break;
            }
            finalTracks = finalTracks.slice(0, 50);
         }

         if (finalTracks.length === 0) {
            if (showToast) showToast("Couldn't generate songs. Try again.", 'error');
            return;
         }

         const newPlaylist = {
            ...playlist,
            type: 'liked_based',
            tracks: finalTracks,
            createdAt: new Date().toISOString()
         };

         StorageService.savePlaylist(newPlaylist);
         setPlaylist(newPlaylist);
         setSuggestedTracks(finalTracks);

         if (finalTracks[0]) {
            setCurrentTrack(finalTracks[0]);
            setIsPlaying(false);
            setProgress(0);
         }

         if (showToast) showToast(`Generated ${finalTracks.length} songs based on your ${likedSongs.length} liked songs!`, 'success');

      } catch (e) {
         console.error(e);
         if (showToast) showToast('Failed to generate songs.', 'error');
      } finally {
         setIsGeneratingMore(false);
         setIsLoading(false);
      }
   };

   const handleRemoveTrack = (trackId) => {
      const filtered = suggestedTracks.filter((t) => t.id !== trackId);
      const updatedPlaylist = { ...playlist, tracks: filtered };
      StorageService.savePlaylist(updatedPlaylist);
      setPlaylist(updatedPlaylist);
      setSuggestedTracks(filtered);

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

   const getPlaylistTypeLabel = () => {
      if (playlist.type === 'default') return 'Popular Hits';
      if (playlist.type === 'liked_based') return 'Based on Liked Songs 💜';
      if (playlist.type === 'liked_songs') return '❤️ Liked Songs';
      if (playlist.loadedFromLibrary) return `📚 ${playlist.name || 'Loaded Playlist'}`;
      return 'Custom Mix';
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 py-8 pt-20">

         {/* SAVE TO LIBRARY MODAL */}
         {showSaveModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-3 bg-pink-500/20 rounded-xl">
                        <Library className="w-6 h-6 text-pink-400" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white">Save to Library</h3>
                        <p className="text-white/60 text-sm">{suggestedTracks.length} tracks</p>
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block text-white/80 text-sm font-medium mb-2">
                        Playlist Name
                     </label>
                     <input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="Enter playlist name..."
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition-colors"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveToLibrary()}
                     />
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isSaving ? (
                           <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                           <>
                              <Check className="w-5 h-5" />
                              Save
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* DUPLICATE MODAL */}
         {showDuplicateModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-[#181818] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2">Playlist Already Exists</h3>
                  <p className="text-white/80 mb-6">This playlist is already in your library.</p>
                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowDuplicateModal(false)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-colors font-semibold"
                     >
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 space-y-10">

               {/* HEADER USER INFO */}
               <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-6">
                        <div className="rounded-full p-1 bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg">
                           {spotifyProfile?.images?.[0]?.url ? (
                              <img
                                 src={spotifyProfile.images[0].url}
                                 alt={spotifyProfile.display_name || 'Spotify user'}
                                 className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                              />
                           ) : (
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 flex items-center justify-center">
                                 <User className="w-6 h-6 text-white" />
                              </div>
                           )}
                        </div>
                        <div>
                           <h1 className="text-5xl font-bold text-white">
                              {spotifyProfile?.display_name || (userData?.firstName ? `${userData.firstName} ${userData.lastName}` : 'Your Profile')}
                           </h1>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={onCreateNew} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg">
                           <RefreshCw className="w-5 h-5" /> New Playlist
                        </button>
                     </div>
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

                        {/* REFRESH BUTTON with tooltip */}
                        <div className="relative group">
                           <button
                              onClick={handleRefreshPlaylist}
                              disabled={isLoading}
                              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full disabled:opacity-50"
                           >
                              <RefreshCw className={`w-5 h-5 ${isLoading && !isGeneratingMore ? 'animate-spin' : ''}`} />
                              Refresh
                           </button>
                           {/* Tooltip */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 border border-white/20 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              <p className="text-white text-sm font-medium mb-1">🎵 Refresh</p>
                              <p className="text-white/70 text-xs">Get new songs based on your <span className="text-purple-300">original preferences</span> (genres, languages, years, artists)</p>
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900/95"></div>
                           </div>
                        </div>

                        {/* GENERATE MORE BUTTON with tooltip */}
                        <div className="relative group">
                           <button
                              onClick={handleGenerateMoreSongs}
                              disabled={isLoading || isGeneratingMore || !likedSongs || likedSongs.length === 0}
                              className="flex items-center gap-2 bg-purple-500/40 hover:bg-purple-500/60 text-white px-4 py-2 rounded-full disabled:opacity-50 transition-all"
                           >
                              <Sparkles className={`w-5 h-5 ${isGeneratingMore ? 'animate-pulse' : ''}`} />
                              {isGeneratingMore ? 'Generating...' : 'Generate More'}
                           </button>
                           {/* Tooltip */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 border border-white/20 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              <p className="text-white text-sm font-medium mb-1">✨ Generate More</p>
                              <p className="text-white/70 text-xs">
                                 Get new songs based on <span className="text-pink-300">songs you liked</span> (❤️).
                                 {likedSongs?.length > 0
                                    ? ` You have ${likedSongs.length} liked songs.`
                                    : ' Like some songs first!'}
                              </p>
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900/95"></div>
                           </div>
                        </div>

                        {/* Save to Library moved here */}
                        <button
                           onClick={handleOpenSaveModal}
                           className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 px-4 py-2 rounded-full border border-pink-500/30"
                        >
                           <Save className="w-5 h-5" /> Save to Library
                        </button>

                     </div>
                  </div>
                  {/* Moved badge: Based on Liked Songs */}
                  {(playlist?.type === 'liked_based' || playlist?.type === 'liked_songs') && (
                     <div className="mt-2 mb-4 inline-flex items-center gap-2 bg-pink-500/20 text-pink-200 px-3 py-1 rounded-full text-sm border border-pink-500/30">
                        <Heart className="w-4 h-4" fill="currentColor" /> Based on Liked Songs
                     </div>
                  )}

                  {likedSongs && likedSongs.length > 0 && (
                     <div className="mb-4 flex items-center gap-2 text-pink-300 text-sm">
                        <Heart className="w-4 h-4" fill="currentColor" />
                        <span>{likedSongs.length} liked songs - click "Generate More" for personalized recommendations!</span>
                     </div>
                  )}

                  <div className="space-y-4">
                     {suggestedTracks.map((track, index) => (
                        <div
                           key={track.id}
                           className={`relative flex items-center justify-between p-4 rounded-lg transition-colors ${currentTrack?.id === track.id ? 'bg-white/10 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                           onMouseEnter={() => setHoveredTrack(track.id)}
                           onMouseLeave={() => setHoveredTrack(null)}
                        >
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

                        {preferences.years && (
                           <div className="bg-white/5 rounded-lg p-4">
                              <p className="text-white/60 text-sm mb-2">📅 Year Range</p>
                              <span className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full text-sm">
                                 {preferences.years.from} - {preferences.years.to}
                              </span>
                           </div>
                        )}

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