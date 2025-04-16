// src/app/songs.ts
export interface Song {
  id: number;
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc: string;
}

export const songs: Song[] = [
  {
    id: 1,
    title: 'Midnight Vibes',
    artist: 'Luna Wave',
    audioSrc: 'assets/audio/song1.mp3',
    coverSrc: 'assets/images/cover1.jpg',
  },
  {
    id: 2,
    title: 'Neon Dreams',
    artist: 'Synth Horizon',
    audioSrc: 'assets/audio/song2.mp3',
    coverSrc: 'assets/images/cover2.jpg',
  },
  {
    id: 3,
    title: 'Eternal Echoes',
    artist: 'Aurora Sky',
    audioSrc: 'assets/audio/song3.mp3',
    coverSrc: 'assets/images/cover3.jpg',
  },
  {
    id: 4,
    title: 'Lost in Tokyo',
    artist: 'Kyoto Beats',
    audioSrc: 'assets/audio/song4.mp3',
    coverSrc: 'assets/images/cover4.jpg',
  },
  {
    id: 5,
    title: 'Stardust Melody',
    artist: 'Cosmic Flow',
    audioSrc: 'assets/audio/song5.mp3',
    coverSrc: 'assets/images/cover5.jpg',
  },
  {
    id: 6,
    title: 'Ocean Breeze',
    artist: 'Seaside Serenade',
    audioSrc: 'assets/audio/song6.mp3',
    coverSrc: 'assets/images/cover6.jpg',
  },
  {
    id: 7,
    title: 'Golden Hour',
    artist: 'Sunset Drive',
    audioSrc: 'assets/audio/song7.mp3',
    coverSrc: 'assets/images/cover7.jpg',
  },
  {
    id: 8,
    title: 'Afterglow',
    artist: 'Moonlight Sonata',
    audioSrc: 'assets/audio/song8.mp3',
    coverSrc: 'assets/images/cover8.jpg',
  },
  {
    id: 9,
    title: 'Mystic Journey',
    artist: 'Echo Wanderer',
    audioSrc: 'assets/audio/song9.mp3',
    coverSrc: 'assets/images/cover9.jpg',
  },
  {
    id: 10,
    title: 'City Lights',
    artist: 'Urban Groove',
    audioSrc: 'assets/audio/song10.mp3',
    coverSrc: 'assets/images/cover10.jpg',
  },
];
