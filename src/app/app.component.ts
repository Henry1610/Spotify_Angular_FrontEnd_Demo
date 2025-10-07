import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PlayerComponent } from './player/player.component';
import { SpotifySearchComponent } from './spotify-search/spotify-search.component';
import { DebugComponent } from './debug/debug.component';
import { CommonModule } from '@angular/common';
import { Song } from './songs';
import { SpotifyAuthService } from './services/spotify-auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent,
    ContentComponent,
    SidebarComponent,
    PlayerComponent,
    SpotifySearchComponent,
    DebugComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  selectedSong: Song | null = null;
  songsList: Song[] = [];
  selectedPlaylistId: string | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private spotifyAuth: SpotifyAuthService
  ) {}

  ngOnInit(): void {
    // Kiểm tra trạng thái authentication
    this.spotifyAuth.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!this.isAuthenticated) {
        this.loadFallbackSongs();
      }
    });
    
    // Kiểm tra nếu có access token trong URL (Implicit Grant Flow)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code');
    
    if (token) {
      // Xử lý token từ Implicit Grant Flow
      localStorage.setItem('spotify_access_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    } else if (code) {
      // Redirect đến callback component với code (Authorization Code Flow)
      this.router.navigate(['/callback'], { queryParams: { code: code } });
    }
  }

  loadFallbackSongs(): void {
    // Dữ liệu mẫu khi chưa đăng nhập
    this.songsList = [
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

  onSongSelected(song: Song) {
    this.selectedSong = song;
  }

  onSpotifyTrackSelected(track: Song) {
    this.selectedSong = track;
  }

  onPlaylistSelected(playlistId: string) {
    this.selectedPlaylistId = playlistId;
  }

  isCallbackRoute(): boolean {
    return this.router.url === '/callback';
  }
}
