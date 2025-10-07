import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyApiService } from '../services/spotify-api.service';
import { SpotifyDataConverterService } from '../services/spotify-data-converter.service';
import { SpotifyAuthService } from '../services/spotify-auth.service';
import { Song } from '../songs';

@Component({
  selector: 'app-spotify-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="spotify-search">
      <div class="search-header">
        <h3>Spotify Search</h3>
        <div class="auth-section">
          <button 
            *ngIf="!isAuthenticated" 
            (click)="login()" 
            class="login-btn">
            Login to Spotify
          </button>
          <div *ngIf="isAuthenticated" class="user-info">
            <span>Connected to Spotify</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div *ngIf="isAuthenticated" class="search-section">
        <div class="search-input">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="searchTracks()"
            placeholder="Search for songs on Spotify..."
            class="search-field">
          <button (click)="searchTracks()" class="search-btn">Search</button>
        </div>

        <div *ngIf="isLoading" class="loading">Searching...</div>

        <div *ngIf="searchResults.length > 0" class="results">
          <h4>Search Results ({{ searchResults.length }})</h4>
          <div class="track-list">
            <div 
              *ngFor="let track of searchResults" 
              class="track-item"
              (click)="selectTrack(track)">
              <img [src]="track.coverSrc" [alt]="track.title" class="track-cover">
              <div class="track-info">
                <div class="track-title">{{ track.title }}</div>
                <div class="track-artist">{{ track.artist }}</div>
                <div class="track-album" *ngIf="track.albumName">{{ track.albumName }}</div>
                <div class="track-duration" *ngIf="track.duration">
                  {{ formatDuration(track.duration) }}
                </div>
              </div>
              <div class="track-actions">
                <button 
                  (click)="selectTrack(track); $event.stopPropagation()" 
                  class="select-btn">
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="errorMessage" class="error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spotify-search {
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      margin: 20px;
    }

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .search-header h3 {
      color: white;
      margin: 0;
    }

    .auth-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .login-btn, .logout-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .login-btn:hover, .logout-btn:hover {
      background: #1ed760;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 14px;
    }

    .search-section {
      margin-top: 20px;
    }

    .search-input {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .search-field {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
    }

    .search-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }

    .search-btn:hover {
      background: #1ed760;
    }

    .loading {
      text-align: center;
      color: white;
      padding: 20px;
    }

    .results h4 {
      color: white;
      margin-bottom: 15px;
    }

    .track-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .track-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .track-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .track-cover {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      margin-right: 15px;
    }

    .track-info {
      flex: 1;
      color: white;
    }

    .track-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .track-artist {
      color: #ccc;
      font-size: 14px;
      margin-bottom: 3px;
    }

    .track-album {
      color: #aaa;
      font-size: 12px;
      margin-bottom: 3px;
    }

    .track-duration {
      color: #888;
      font-size: 12px;
    }

    .track-actions {
      margin-left: 10px;
    }

    .select-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 12px;
    }

    .select-btn:hover {
      background: #1ed760;
    }

    .error {
      color: #ff6b6b;
      text-align: center;
      padding: 10px;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 5px;
    }
  `]
})
export class SpotifySearchComponent {
  @Output() trackSelected = new EventEmitter<Song>();

  searchQuery = '';
  searchResults: Song[] = [];
  isLoading = false;
  errorMessage = '';
  isAuthenticated = false;

  constructor(
    private spotifyApi: SpotifyApiService,
    private dataConverter: SpotifyDataConverterService,
    private authService: SpotifyAuthService
  ) {
    // Kiểm tra trạng thái authentication
    this.authService.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
    this.searchResults = [];
    this.errorMessage = '';
  }

  searchTracks(): void {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search query';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];

    this.spotifyApi.searchTracks(this.searchQuery, 20)
      .subscribe({
        next: (spotifyTracks) => {
          this.searchResults = this.dataConverter.convertSpotifyTracksToSongs(spotifyTracks);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error searching tracks: ' + error.message;
          this.isLoading = false;
        }
      });
  }

  selectTrack(track: Song): void {
    this.trackSelected.emit(track);
  }

  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
