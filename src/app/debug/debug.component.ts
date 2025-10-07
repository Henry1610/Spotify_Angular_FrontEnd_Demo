import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyAuthService } from '../services/spotify-auth.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <h3>Debug Information</h3>
      <div class="debug-item">
        <strong>Is Authenticated:</strong> {{ isAuthenticated }}
      </div>
      <div class="debug-item">
        <strong>Access Token:</strong> {{ accessToken ? 'Present' : 'Not Found' }}
      </div>
      <div class="debug-item">
        <strong>Token Preview:</strong> {{ tokenPreview }}
      </div>
      <div class="debug-item">
        <strong>LocalStorage Token:</strong> {{ localStorageToken ? 'Present' : 'Not Found' }}
      </div>
      <div class="debug-item">
        <strong>Current URL:</strong> {{ currentUrl }}
      </div>
      <div class="debug-item">
        <strong>Environment Client ID:</strong> {{ clientId }}
      </div>
      <div class="debug-item">
        <strong>Environment Redirect URI:</strong> {{ redirectUri }}
      </div>
      <div class="debug-item" *ngIf="hasCode">
        <strong>Authorization Code:</strong> {{ codePreview }}
      </div>
      <button (click)="clearStorage()" class="clear-btn">Clear Storage</button>
      <button (click)="refresh()" class="refresh-btn">Refresh</button>
      <button (click)="processCode()" *ngIf="hasCode" class="process-btn">Process Code</button>
    </div>
  `,
  styles: [`
    .debug-container {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      margin: 20px;
      border-radius: 10px;
      font-family: monospace;
    }

    .debug-item {
      margin-bottom: 10px;
      padding: 5px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }

    .clear-btn, .refresh-btn, .process-btn {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      margin-right: 10px;
      margin-top: 10px;
    }

    .refresh-btn {
      background: #1db954;
    }

    .process-btn {
      background: #ffa500;
    }

    .clear-btn:hover {
      background: #ff5252;
    }

    .refresh-btn:hover {
      background: #1ed760;
    }

    .process-btn:hover {
      background: #ff8c00;
    }
  `]
})
export class DebugComponent implements OnInit {
  isAuthenticated = false;
  accessToken: string | null = null;
  tokenPreview = '';
  localStorageToken: string | null = null;
  currentUrl = '';
  clientId = '';
  redirectUri = '';
  hasCode = false;
  codePreview = '';

  constructor(private authService: SpotifyAuthService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    // Kiểm tra authentication status
    this.authService.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
      this.accessToken = token;
      this.tokenPreview = token ? token.substring(0, 20) + '...' : 'No token';
    });

    // Kiểm tra localStorage
    this.localStorageToken = localStorage.getItem('spotify_access_token');

    // Kiểm tra URL hiện tại
    this.currentUrl = window.location.href;

    // Kiểm tra environment
    this.clientId = '737f3fda9efd4e23b7fe1a8141f017ac';
    this.redirectUri = 'http://127.0.0.1:8000/callback';

    // Kiểm tra authorization code hoặc token trong URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = urlParams.get('token');
    
    this.hasCode = !!code;
    this.codePreview = code ? code.substring(0, 30) + '...' : '';
    
    if (token) {
      this.codePreview = 'Token: ' + token.substring(0, 30) + '...';
    }
  }

  clearStorage(): void {
    localStorage.removeItem('spotify_access_token');
    this.authService.logout();
    this.refresh();
  }

  processCode(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Redirect đến callback component với code
      window.location.href = `/callback?code=${code}`;
    }
  }
}
