import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PlayerComponent } from './player/player.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Song } from './songs';
@Component({
  selector: 'app-root',
  imports: [CommonModule,HeaderComponent,
    ContentComponent,
    SidebarComponent,
    PlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedSong: Song | null = null;

  onSongSelected(song: Song) {
    console.log('Song received in AppComponent:', song); // Thêm log để kiểm tra
    this.selectedSong = song;
    console.log('Updated selectedSong in AppComponent:', this.selectedSong); // Thêm log để kiểm tra
  }
}
