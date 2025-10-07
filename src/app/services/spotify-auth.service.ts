import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {
  private readonly CLIENT_ID = environment.spotify.clientId;
  private readonly CLIENT_SECRET = environment.spotify.clientSecret;
  private readonly REDIRECT_URI = environment.spotify.redirectUri;
  private readonly SCOPES = environment.spotify.scopes.join(' ');
  
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Kiểm tra token trong localStorage khi khởi tạo
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      this.accessTokenSubject.next(storedToken);
    }
  }

  /**
   * Bắt đầu quá trình authentication với Spotify
   */
  login(): void {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${this.CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(this.SCOPES)}`;
    
    window.location.href = authUrl;
  }

  /**
   * Xử lý callback từ Spotify sau khi user authorize
   */
  handleAuthCallback(code: string): Observable<SpotifyTokenResponse> {
    const tokenUrl = '/api/token';
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', this.REDIRECT_URI);
    body.set('client_id', this.CLIENT_ID);
    body.set('client_secret', this.CLIENT_SECRET);


    return this.http.post<SpotifyTokenResponse>(tokenUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * Lưu access token
   */
  setAccessToken(token: string): void {
    localStorage.setItem('spotify_access_token', token);
    this.accessTokenSubject.next(token);
  }

  /**
   * Lấy access token hiện tại
   */
  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem('spotify_access_token');
    this.accessTokenSubject.next(null);
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getUserProfile(): Observable<any> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const token = this.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get('https://api.spotify.com/v1/me', { headers })
      .pipe(
        catchError(error => {
          console.error('Error getting user profile:', error);
          return throwError(() => error);
        })
      );
  }
}
