import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyApiService } from '../services/spotify-api.service';
import { SpotifyAuthService } from '../services/spotify-auth.service';
import { SpotifyDataConverterService } from '../services/spotify-data-converter.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  playlists: any[] = [];
  isLoading = false;
  isAuthenticated = false;

  @Output() playlistSelected = new EventEmitter<string>();

  constructor(
    private spotifyApi: SpotifyApiService,
    private spotifyAuth: SpotifyAuthService,
    private dataConverter: SpotifyDataConverterService
  ) { }

  ngOnInit(): void {
    // Kiểm tra trạng thái authentication
    this.spotifyAuth.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (this.isAuthenticated) {
        this.loadPlaylists();
      }
    });
  }

  loadPlaylists(): void {
    this.isLoading = true;
    this.spotifyApi.getUserPlaylists(20).subscribe({
      next: (spotifyPlaylists) => {
        this.playlists = this.dataConverter.convertSpotifyPlaylistsToPlaylists(spotifyPlaylists);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
        this.isLoading = false;
      }
    });
  }

  loginWithSpotify(): void {
    this.spotifyAuth.login();
  }

  selectPlaylist(playlist: any): void {
    // Đặt tất cả playlist về trạng thái không hoạt động
    this.playlists.forEach(p => p.isActive = false);
    // Đặt playlist được chọn thành hoạt động
    playlist.isActive = true;

    // Emit playlist ID nếu có
    if (playlist.id) {
      this.playlistSelected.emit(playlist.id);
    }
  }

  getDisplayPlaylists(): any[] {
    return this.isAuthenticated ? this.playlists : [];
  }

}
