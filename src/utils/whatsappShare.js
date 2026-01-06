export function buildWhatsAppShareUrl({ playlistTitle, tracks = [], spotifyUrl }) {
  const title = (playlistTitle || 'P-Play Playlist').trim();

  const lines = [];
  lines.push(`🎧 ${title}`);
  lines.push('');

  if (Array.isArray(tracks) && tracks.length > 0) {
    lines.push('🎵 Tracklist:');
    tracks.slice(0, 10).forEach((t, i) => {
      const trackTitle = t?.title || t?.name || 'Unknown title';
      const artist = t?.artist || t?.artistName || t?.artists?.[0]?.name || '';
      lines.push(`${i + 1}. ${trackTitle}${artist ? ' — ' + artist : ''}`);
    });
    if (tracks.length > 10) lines.push(`… +${tracks.length - 10} more`);
    lines.push('');
  }

  if (spotifyUrl) {
    lines.push(`Listen on Spotify: ${spotifyUrl}`);
    lines.push('');
  }

  lines.push('Generated via P-Play');

  const text = lines.join('\n');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
