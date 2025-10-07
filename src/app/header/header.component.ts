import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyAuthService } from '../services/spotify-auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userAvatar = 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=264248917912963&height=50&width=50&ext=1745333721&hash=AbY0F-XxsJ-cxkLlRTmHnueb';
  userName = '';
  isAuthenticated = false;
  isLoading = false;

  constructor(private spotifyAuth: SpotifyAuthService) {}

  ngOnInit(): void {
    // Kiểm tra trạng thái authentication
    this.spotifyAuth.accessToken$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (this.isAuthenticated) {
        this.loadUserProfile();
      } else {
        this.resetUserInfo();
      }
    });
  }

  loginWithSpotify(): void {
    this.spotifyAuth.login();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.spotifyAuth.getUserProfile().subscribe({
      next: (userProfile) => {
        this.userName = userProfile.display_name || userProfile.id;
        this.userAvatar = userProfile.images?.[0]?.url || this.userAvatar;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.resetUserInfo();
        this.isLoading = false;
      }
    });
  }

  resetUserInfo(): void {
    this.userName = 'Guest User';
    this.userAvatar = 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=264248917912963&height=50&width=50&ext=1745333721&hash=AbY0F-XxsJ-cxkLlRTmHnueb';
  }

  logout(): void {
    this.spotifyAuth.logout();
  }
}