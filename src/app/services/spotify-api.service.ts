import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SpotifyAuthService } from './spotify-auth.service';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyApiService {
  private readonly BASE_URL = 'https://api.spotify.com/v1';

  constructor(
    private http: HttpClient,
    private authService: SpotifyAuthService
  ) {}

  /**
   * Tạo headers với authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Tìm kiếm bài hát trên Spotify
   */
  searchTracks(query: string, limit: number = 20): Observable<SpotifyTrack[]> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
    
    return this.http.get<SpotifySearchResponse>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => response.tracks.items),
        catchError(error => {
          console.error('Error searching tracks:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Lấy thông tin chi tiết của một bài hát
   */
  getTrack(trackId: string): Observable<SpotifyTrack> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/tracks/${trackId}`;
    
    return this.http.get<SpotifyTrack>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error getting track:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Lấy danh sách playlist của user
   */
  getUserPlaylists(limit: number = 20): Observable<SpotifyPlaylist[]> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/me/playlists?limit=${limit}`;
    
    return this.http.get<{ items: SpotifyPlaylist[] }>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => response.items),
        catchError(error => {
          console.error('Error getting user playlists:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Lấy các bài hát trong playlist
   */
  getPlaylistTracks(playlistId: string, limit: number = 50): Observable<SpotifyTrack[]> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/playlists/${playlistId}/tracks?limit=${limit}`;
    
    return this.http.get<{ items: { track: SpotifyTrack }[] }>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => response.items.map(item => item.track).filter(track => track !== null)),
        catchError(error => {
          console.error('Error getting playlist tracks:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser(): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/me`;
    
    return this.http.get(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error getting current user:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Lấy các bài hát đã lưu của user
   */
  getUserSavedTracks(limit: number = 50): Observable<SpotifyTrack[]> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/me/tracks?limit=${limit}`;
    
    return this.http.get<{ items: { track: SpotifyTrack }[] }>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => response.items.map(item => item.track)),
        catchError(error => {
          console.error('Error getting user saved tracks:', error);
          return throwError(() => error);
        })
      );
  }


  /**
   * Phát một bài hát trên Spotify
   */
  playTrack(trackUri: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.BASE_URL}/me/player/play`;
    const body = {
      uris: [trackUri]
    };
    
    
    return this.http.put(url, body, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          // Xử lý các lỗi cụ thể
          if (error.status === 404) {
            return throwError(() => new Error('No active device found. Please open Spotify on your device.'));
          } else if (error.status === 403) {
            return throwError(() => new Error('Premium required to play music.'));
          } else if (error.status === 401) {
            return throwError(() => new Error('Authentication failed.'));
          }
          
          return throwError(() => error);
        })
      );
  }

}
