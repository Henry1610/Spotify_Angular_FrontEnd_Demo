import { Component, EventEmitter, Output, OnInit, Input, OnChanges } from '@angular/core';
import { Song } from '../songs';
import { CommonModule } from '@angular/common';
import { SpotifyApiService } from '../services/spotify-api.service';
import { SpotifyAuthService } from '../services/spotify-auth.service';
import { SpotifyDataConverterService } from '../services/spotify-data-converter.service';

@Component({
  selector: 'app-content',
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit, OnChanges {
  @Input() selectedPlaylistId: string | null = null;
  songs: Song[] = [];
  isLoading = false;
  isAuthenticated = false;
  currentPlaylistId: string | null = null;

  @Output() songSelected = new EventEmitter<Song>();

  constructor(
    private spotifyApi: SpotifyApiService,
    private spotifyAuth: SpotifyAuthService,
    private dataConverter: SpotifyDataConverterService
  ) {}

  ngOnInit(): void {
    // Kiểm tra trạng thái authentication
    this.spotifyAuth.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (this.isAuthenticated && this.selectedPlaylistId) {
        this.loadPlaylistTracks(this.selectedPlaylistId);
      } else if (!this.isAuthenticated) {
        this.loadFallbackSongs();
      }
    });
  }

  ngOnChanges(): void {
    if (this.selectedPlaylistId && this.selectedPlaylistId !== this.currentPlaylistId) {
      this.loadPlaylistTracks(this.selectedPlaylistId);
    }
  }

  loadPlaylistTracks(playlistId: string): void {
    if (!this.isAuthenticated) return;
    
    this.isLoading = true;
    this.currentPlaylistId = playlistId;
    
    this.spotifyApi.getPlaylistTracks(playlistId, 50).subscribe({
      next: (spotifyTracks) => {
        this.songs = this.dataConverter.convertSpotifyTracksToSongs(spotifyTracks);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading playlist tracks:', error);
        this.isLoading = false;
        this.loadFallbackSongs();
      }
    });
  }

  loadFallbackSongs(): void {
    // Dữ liệu mẫu khi chưa đăng nhập hoặc có lỗi
    this.songs = [
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
      }
    ];
  }

  selectSong(song: Song) {
    this.songSelected.emit(song);
  }

  playSpotifyTrack(song: Song): void {
    if (!this.isAuthenticated || !song.isSpotifyTrack) {
      this.selectSong(song);
      return;
    }

    // Kiểm tra xem có preview URL không (ưu tiên preview cho Free users)
    if (song.previewUrl || song.audioSrc) {
      this.selectSong(song);
      return;
    }

    // Chỉ gọi API Spotify nếu không có preview URL
    const trackUri = `spotify:track:${song.id}`;
    
    this.spotifyApi.playTrack(trackUri).subscribe({
      next: () => {
        this.selectSong(song);
      },
      error: (error) => {
        
        // Hiển thị thông báo lỗi cụ thể
        if (error.message.includes('No active device')) {
          alert('Không tìm thấy device Spotify đang active. Vui lòng mở Spotify trên thiết bị của bạn.');
        } else if (error.message.includes('Premium required') || error.status === 403) {
          alert('Cần có Spotify Premium để phát nhạc đầy đủ. Bài hát này không có preview.');
        } else if (error.message.includes('Authentication failed')) {
          alert('Lỗi xác thực. Vui lòng đăng nhập lại.');
        } else {
          alert('Không thể phát nhạc: ' + error.message);
        }
      }
    });
  }

  formatDuration(durationMs?: number): string {
    if (!durationMs) return '0:00';
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
