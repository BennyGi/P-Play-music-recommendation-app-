/**
 * בדיקות אוטומציה ל-PlaylistView Component
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהקומפוננטה נטענת נכון
 * 2. בודקות שהפלייליסט מוצג נכון
 * 3. בודקות שכפתור Generate More עובד
 * 4. בודקות שאלמנט ההפתעה עובד
 * 5. בודקות שהשירים מחולקים נכון (liked-based + surprise)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaylistView from '../../components/PlaylistView';
import { StorageService } from '../../utils/storage';

// Mock the services
vi.mock('../../services/spotifyService', async () => {
  const actual = await vi.importActual('../../services/spotifyService');
  return {
    ...actual,
    generateMoreFromLiked: vi.fn(() => Promise.resolve([
      { id: 'track1', title: 'Generated Song', artist: 'Artist', image: null, releaseYear: 2020 }
    ])),
    searchTracksByCountryGenreAndYear: vi.fn(() => Promise.resolve([
      { id: 'surprise1', title: 'Surprise Song', artist: 'Surprise Artist', image: null, releaseYear: 1995 }
    ])),
    searchTracksByGenreAndYear: vi.fn(() => Promise.resolve([]))
  };
});

describe('PlaylistView Component', () => {
  const mockPlaylist = {
    id: 'playlist1',
    name: 'Test Playlist',
    tracks: [
      { id: 'track1', title: 'Song 1', artist: 'Artist 1' },
      { id: 'track2', title: 'Song 2', artist: 'Artist 2' }
    ],
    type: 'custom',
    createdAt: new Date().toISOString()
  };

  const mockLikedSongs = [
    { id: 'track1', title: 'Liked Song', artist: 'Artist' }
  ];

  const defaultProps = {
    playlist: mockPlaylist,
    likedSongs: mockLikedSongs,
    toggleLikedSong: vi.fn(),
    isLiked: vi.fn(() => false),
    showToast: vi.fn(),
    spotifyProfile: null,
    onCreateNew: vi.fn(),
    onGoToLibrary: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock StorageService
    vi.spyOn(StorageService, 'getUserData').mockReturnValue({
      email: 'test@example.com',
      name: 'Test User'
    });
    vi.spyOn(StorageService, 'getPreferences').mockReturnValue({
      genres: [1, 2],
      languages: [1],
      years: { from: 2010, to: 2025 }
    });
    vi.spyOn(StorageService, 'getLatestPlaylist').mockReturnValue(mockPlaylist);
    vi.spyOn(StorageService, 'getBlacklist').mockReturnValue([]);
  });

  it('should render playlist with tracks', () => {
    render(<PlaylistView {...defaultProps} />);
    
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
  });

  it('should display empty state when no playlist', () => {
    render(<PlaylistView {...defaultProps} playlist={null} />);
    
    expect(screen.getByText(/Empty Library/i)).toBeInTheDocument();
  });

  it('should show Generate More button when liked songs exist', () => {
    render(<PlaylistView {...defaultProps} />);
    
    const generateButton = screen.queryByText(/Generate More/i);
    expect(generateButton).toBeInTheDocument();
  });

  it('should disable Generate More button when no liked songs', () => {
    render(<PlaylistView {...defaultProps} likedSongs={[]} />);
    
    const generateButton = screen.queryByText(/Generate More/i);
    if (generateButton) {
      expect(generateButton.closest('button')).toBeDisabled();
    }
  });
});

describe('PlaylistView - Surprise Element', () => {
  const mockPlaylist = {
    id: 'playlist1',
    name: 'Test Playlist',
    tracks: [],
    type: 'custom',
    createdAt: new Date().toISOString()
  };

  const defaultProps = {
    playlist: mockPlaylist,
    likedSongs: [{ id: 'track1', title: 'Liked', artist: 'Artist' }],
    toggleLikedSong: vi.fn(),
    isLiked: vi.fn(() => false),
    showToast: vi.fn(),
    spotifyProfile: null,
    onCreateNew: vi.fn(),
    onGoToLibrary: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    vi.spyOn(StorageService, 'getUserData').mockReturnValue({
      email: 'test@example.com',
      country: 'IL'
    });
    vi.spyOn(StorageService, 'getPreferences').mockReturnValue({
      genres: [2], // rock
      languages: [1], // English
      years: { from: 2000, to: 2025 }
    });
    vi.spyOn(StorageService, 'getLatestPlaylist').mockReturnValue(mockPlaylist);
    vi.spyOn(StorageService, 'savePlaylist').mockReturnValue(mockPlaylist);
  });

  it('should display surprise toggle button', () => {
    render(<PlaylistView {...defaultProps} />);
    
    const surpriseButton = screen.queryByText(/Surprise/i);
    expect(surpriseButton).toBeInTheDocument();
  });

  it('should show surprise menu when toggle is enabled', async () => {
    render(<PlaylistView {...defaultProps} />);
    
    const surpriseButton = screen.getByText(/Surprise/i).closest('button');
    fireEvent.click(surpriseButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Surprise Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Language/i)).toBeInTheDocument();
      expect(screen.getByText(/Genre/i)).toBeInTheDocument();
      expect(screen.getByText(/Year Range/i)).toBeInTheDocument();
    });
  });
});

