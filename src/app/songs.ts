// src/app/songs.ts
export interface Song {
  id: string; // Changed from number to string for Spotify compatibility
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc: string;
  duration?: number; // Duration in milliseconds
  previewUrl?: string; // Spotify preview URL
  externalUrl?: string; // Spotify external URL
  albumName?: string; // Album name
  artistId?: string; // Spotify artist ID
  albumId?: string; // Spotify album ID
  isSpotifyTrack?: boolean; // Flag to identify Spotify tracks
}

export const songs: Song[] = [
  {
    id: '1',
    title: 'Midnight Vibes',
    artist: 'Luna Wave',
    audioSrc: 'assets/audio/song1.mp3',
    coverSrc: 'assets/images/cover1.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '2',
    title: 'Neon Dreams',
    artist: 'Synth Horizon',
    audioSrc: 'assets/audio/song2.mp3',
    coverSrc: 'assets/images/cover2.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '3',
    title: 'Eternal Echoes',
    artist: 'Aurora Sky',
    audioSrc: 'assets/audio/song3.mp3',
    coverSrc: 'assets/images/cover3.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '4',
    title: 'Lost in Tokyo',
    artist: 'Kyoto Beats',
    audioSrc: 'assets/audio/song4.mp3',
    coverSrc: 'assets/images/cover4.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '5',
    title: 'Stardust Melody',
    artist: 'Cosmic Flow',
    audioSrc: 'assets/audio/song5.mp3',
    coverSrc: 'assets/images/cover5.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '6',
    title: 'Ocean Breeze',
    artist: 'Seaside Serenade',
    audioSrc: 'assets/audio/song6.mp3',
    coverSrc: 'assets/images/cover6.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '7',
    title: 'Golden Hour',
    artist: 'Sunset Drive',
    audioSrc: 'assets/audio/song7.mp3',
    coverSrc: 'assets/images/cover7.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '8',
    title: 'Afterglow',
    artist: 'Moonlight Sonata',
    audioSrc: 'assets/audio/song8.mp3',
    coverSrc: 'assets/images/cover8.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '9',
    title: 'Mystic Journey',
    artist: 'Echo Wanderer',
    audioSrc: 'assets/audio/song9.mp3',
    coverSrc: 'assets/images/cover9.jpg',
    isSpotifyTrack: false,
  },
  {
    id: '10',
    title: 'City Lights',
    artist: 'Urban Groove',
    audioSrc: 'assets/audio/song10.mp3',
    coverSrc: 'assets/images/cover10.jpg',
    isSpotifyTrack: false,
  },
];
