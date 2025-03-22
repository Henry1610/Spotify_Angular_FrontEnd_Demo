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
    title: 'Song 1',
    artist: 'Artist 1',
    audioSrc: 'assets/audio/song1.mp3',
    coverSrc: 'assets/images/cover1.jpg',
  },
  {
    id: 2,
    title: 'Song 2',
    artist: 'Artist 2',
    audioSrc: 'assets/audio/song2.mp3',
    coverSrc: 'assets/images/cover2.jpg',
  },
  // Thêm các bài hát khác...
  {
    id: 10,
    title: 'Song 10',
    artist: 'Artist 10',
    audioSrc: 'assets/audio/song10.mp3',
    coverSrc: 'assets/images/cover10.jpg',
  },
];