// src/app/player/player.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Song } from '../songs';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnChanges {
  @Input() selectedSong: Song | null = null;
  @Input() songs: Song[] = [];
  isPlaying = false;
  currentProgress = 0;
  currentTime = '0:00';
  totalTime = '0:00';
  volume = 50;
  imageUrl = 'assets/images/cover1.jpg'; // Giá trị mặc định
  isDragging = false;
  currentSongIndex = 0;
  song: Howl | null = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSong'] && this.selectedSong) {
      console.log('Selected song changed:', this.selectedSong); // Debug

      // Cập nhật currentSongIndex
      this.currentSongIndex = this.songs.findIndex(song => song.id === this.selectedSong?.id);

      // Dừng và hủy bài cũ nếu đang phát
      if (this.song) {
        this.song.stop();
        this.song.unload();
        this.currentProgress = 0;
        this.currentTime = '0:00';
      }

      // Cập nhật ảnh bìa
      this.imageUrl = this.selectedSong.coverSrc || 'assets/images/cover1.jpg';

      // Khởi tạo bài mới
      this.initializeHowl();

      // Tự động phát bài mới nếu trước đó đang phát
      if (this.isPlaying && this.song) {
        this.song.play();
        this.updateProgressLoop();
      }
    }
  }

  initializeHowl(): void {
    if (this.selectedSong) {
      const selectedSong = this.selectedSong;
      this.song = new Howl({
        src: [selectedSong.audioSrc],
        html5: true,
      });
  
      const song = this.song;
      song.on('load', () => {
        console.log('Song loaded in Howler:', selectedSong.audioSrc);
        setInterval(() => {
          this.updateProgress();
        }, 1000);
  
        song.on('end', () => {
          console.log('Song ended');
          this.isPlaying = false;
          this.currentProgress = 0;
          this.currentTime = '0:00';
        });
      });
  
      song.on('loaderror', (id, error) => {
        console.error('Error loading song:', selectedSong.audioSrc, error);
      });
  
      song.on('playerror', (id, error) => {
        console.error('Error playing song:', selectedSong.audioSrc, error);
      });
    }
  }

  updateProgress(): void {
    if (this.song && this.song.playing()) {
      const seek = this.song.seek() as number;
      const duration = this.song.duration() as number;
      this.currentProgress = (seek / duration) * 100;
      this.currentTime = this.formatTime(seek);
      this.totalTime = this.formatTime(duration);
    } else {
      this.currentProgress = 0;
      this.currentTime = '0:00';
    }
  }
  updateProgressLoop(): void {
    if (this.song && this.song.playing()) {
      this.updateProgress();
      requestAnimationFrame(() => this.updateProgressLoop());
    }
  }
  nextSong(): void {
    console.log('Next song clicked'); // Kiểm tra sự kiện có chạy không
    console.log('Selected song:', this.selectedSong);

    if (this.songs.length === 0) return;

    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.selectedSong = this.songs[this.currentSongIndex];
    if (this.selectedSong) { // Kiểm tra null trước khi truy cập
      this.imageUrl = this.selectedSong.coverSrc;
    }

    if (this.song) {
      this.song.stop();
      this.currentProgress = 0;
      this.currentTime = '0:00';
    }
    this.initializeHowl();
    if (this.isPlaying && this.song) {
      this.song.play();
      this.updateProgressLoop();
    }
  }
  togglePlay(): void {
    if (!this.song) return;

    if (this.isPlaying) {
      this.song.pause();
      console.log('Song paused'); // Log để kiểm tra
    } else {
      this.song.play();
      console.log('Song played'); // Log để kiểm tra
    }
    this.isPlaying = !this.isPlaying;
  }

  onProgressClick(event: MouseEvent): void {
    if (!this.isDragging) {
      this.updateProgressFromMouseEvent(event);
    }
  }

  updateProgressFromMouseEvent(event: MouseEvent): void {
    if (!this.song) return;

    const progressBar = event.target as HTMLElement;
    const progressWidth = progressBar.offsetWidth;
    const clickX = event.offsetX;
    this.currentProgress = (clickX / progressWidth) * 100;
    const seek = (this.currentProgress / 100) * (this.song.duration() as number);
    this.song.seek(seek);
    this.currentTime = this.formatTime(seek);
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.updateProgressFromMouseEvent(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.updateProgressFromMouseEvent(event);
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onVolumeChange(volume: number) {
    if (this.song) {
      this.song.volume(volume / 100);
      const slider = document.querySelector('.volume-slider') as HTMLElement;
      slider.style.background = `linear-gradient(to right, #fff ${volume}%, #444 ${volume}%)`;
      
      // Hover sẽ được xử lý trong CSS, nhưng cần thêm logic nếu muốn thay đổi màu khi hover
      slider.onmouseover = () => {
        slider.style.background = `linear-gradient(to right, #1DB954 ${volume}%, #444 ${volume}%)`;
      };
      slider.onmouseout = () => {
        slider.style.background = `linear-gradient(to right, #fff ${volume}%, #444 ${volume}%)`;
      };
    }
  }

  onVolumeClick(event: MouseEvent): void {
    // Có thể thêm logic nếu cần, ví dụ: mute/unmute
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  parseTime(time: string): number {
    const parts = time.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  
}