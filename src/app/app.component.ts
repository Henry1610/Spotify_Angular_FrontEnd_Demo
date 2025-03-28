import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PlayerComponent } from './player/player.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Song, songs  } from './songs';
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
  songsList = songs; // Danh sách bài hát

  onSongSelected(song: Song) {
    console.log('Song received in AppComponent:', song); // Thêm log để kiểm tra
    this.selectedSong = song;
  }
}
