import { Component, EventEmitter, Output } from '@angular/core';
import { Song, songs } from '../songs';
import { CommonModule,NgFor } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-content',
  imports: [CommonModule,NgFor],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  songs: Song[] = songs;

  @Output() songSelected = new EventEmitter<Song>();

  selectSong(song: Song) {
    console.log('Song selected in ContentComponent:', song); // Thêm log để kiểm tra
    this.songSelected.emit(song);
  }
}
