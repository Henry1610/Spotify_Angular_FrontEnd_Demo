import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyAuthService } from '../services/spotify-auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div *ngIf="isLoading" class="loading">
          <h3>Connecting to Spotify...</h3>
          <div class="spinner"></div>
        </div>
        
        <div *ngIf="errorMessage" class="error">
          <h3>Authentication Failed</h3>
          <p>{{ errorMessage }}</p>
          <button (click)="goHome()" class="retry-btn">Go Home</button>
        </div>
        
        <div *ngIf="success" class="success">
          <h3>Successfully Connected!</h3>
          <p>You can now search and play music from Spotify.</p>
          <button (click)="goHome()" class="continue-btn">Continue</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .callback-content {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      color: white;
      max-width: 400px;
      width: 90%;
    }

    .loading h3, .error h3, .success h3 {
      margin-bottom: 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      color: #ff6b6b;
    }

    .success {
      color: #51cf66;
    }

    .retry-btn, .continue-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
      transition: background 0.3s;
    }

    .retry-btn:hover, .continue-btn:hover {
      background: #1ed760;
    }

    .retry-btn {
      background: #ff6b6b;
    }

    .retry-btn:hover {
      background: #ff5252;
    }
  `]
})
export class CallbackComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: SpotifyAuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.errorMessage = 'Authentication was cancelled or failed.';
        this.isLoading = false;
        return;
      }

      if (code) {
        this.exchangeCodeForToken(code);
      } else {
        this.errorMessage = 'No authorization code received.';
        this.isLoading = false;
      }
    });
  }

  private exchangeCodeForToken(code: string): void {
    this.authService.handleAuthCallback(code).subscribe({
      next: (tokenResponse) => {
        this.authService.setAccessToken(tokenResponse.access_token);
        this.success = true;
        this.isLoading = false;
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          this.goHome();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to exchange authorization code for access token: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
