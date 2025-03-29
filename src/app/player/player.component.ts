// src/app/player/player.component.ts
import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
export class PlayerComponent implements OnChanges, OnInit {
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
  isShuffle = false; // Thêm biến theo dõi trạng thái shuffle
  repeatMode: 'none' | 'all' | 'one' = 'none'; // Thêm biến theo dõi chế độ lặp
  previousVolume: number = 100; // Lưu âm lượng trước khi tắt

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

      // Tự động phát bài mới
      if (this.song) {
        this.song.play();
        this.isPlaying = true;
        this.updateProgressLoop();
      }
    }
  }

  ngOnInit(): void {
    // Khởi tạo giá trị ban đầu cho thanh điều chỉnh âm lượng
    const slider = document.querySelector('.volume-slider') as HTMLElement;
    if (slider) {
      slider.style.setProperty('--volume', `${this.volume}%`);
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
          
          // Xử lý khi bài hát kết thúc
          if (this.repeatMode === 'one') {
            // Nếu đang ở chế độ lặp một bài
            if (this.song) {
              this.song.seek(0);
              this.song.play();
              this.isPlaying = true;
              this.updateProgressLoop();
            }
          } else {
            // Nếu không phải lặp một bài, phát bài tiếp theo
            this.nextSong();
          }
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
    if (this.song) {
      const seek = this.song.seek() as number;
      const duration = this.song.duration() as number;
      this.currentProgress = (seek / duration) * 100;
      this.currentTime = this.formatTime(seek);
      this.totalTime = this.formatTime(duration);
    }
  }

  updateProgressLoop(): void {
    if (this.song && this.song.playing()) {
      this.updateProgress();
      requestAnimationFrame(() => this.updateProgressLoop());
    }
  }

  // Thêm phương thức để lấy bài hát ngẫu nhiên
  getRandomSongIndex(): number {
    return Math.floor(Math.random() * this.songs.length);
  }

  // Thêm phương thức xử lý sự kiện shuffle
  toggleShuffle(): void {
    this.isShuffle = !this.isShuffle;
    console.log('Shuffle mode:', this.isShuffle);
  }

  // Thêm phương thức xử lý sự kiện repeat
  toggleRepeat(): void {
    switch (this.repeatMode) {
      case 'none':
        this.repeatMode = 'all';
        break;
      case 'all':
        this.repeatMode = 'one';
        break;
      case 'one':
        this.repeatMode = 'none';
        break;
    }
    console.log('Repeat mode:', this.repeatMode);
  }

  // Chỉnh sửa phương thức nextSong để xử lý cả shuffle và repeat
  nextSong(): void {
    console.log('Next song clicked');
    console.log('Selected song:', this.selectedSong);

    if (this.songs.length === 0) return;

    // Nếu đang ở chế độ lặp một bài
    if (this.repeatMode === 'one') {
      if (this.song) {
        this.song.seek(0);
        this.song.play();
      }
      return;
    }

    // Nếu đang ở chế độ shuffle
    if (this.isShuffle) {
      let newIndex;
      do {
        newIndex = this.getRandomSongIndex();
      } while (newIndex === this.currentSongIndex && this.songs.length > 1);
      this.currentSongIndex = newIndex;
    } else {
      // Nếu không phải shuffle, phát bài tiếp theo
      this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    }

    this.selectedSong = this.songs[this.currentSongIndex];
    if (this.selectedSong) {
      this.imageUrl = this.selectedSong.coverSrc;
    }

    if (this.song) {
      this.song.stop();
      this.currentProgress = 0;
      this.currentTime = '0:00';
    }
    this.initializeHowl();
    
    // Tự động phát bài mới
    if (this.song) {
      this.song.play();
      this.isPlaying = true;
      this.updateProgressLoop();
    }
  }

  togglePlay(): void {
    if (!this.song) return;

    if (this.isPlaying) {
      this.song.pause();
      console.log('Song paused');
    } else {
      this.song.play();
      console.log('Song played');
      this.updateProgressLoop();
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

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const progressWidth = rect.width;
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / progressWidth) * 100));
    this.currentProgress = percentage;
    
    const seek = (percentage / 100) * (this.song.duration() as number);
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
    // Cập nhật âm lượng cho bài hát nếu có
    if (this.song) {
      this.song.volume(volume / 100);
    }
    
    // Luôn cập nhật biến volume và CSS variable, bất kể có bài hát hay không
    this.volume = volume;
    localStorage.setItem('volume', volume.toString());
    const slider = document.querySelector('.volume-slider') as HTMLElement;
    if (slider) {
      slider.style.setProperty('--volume', `${volume}%`);
    }
  }

  onVolumeClick(event: MouseEvent): void {
    const volumeBar = event.currentTarget as HTMLElement;
    const rect = volumeBar.getBoundingClientRect();
    const volumeWidth = rect.width;
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / volumeWidth) * 100));
    
    this.volume = Math.round(percentage);
    this.onVolumeChange(this.volume);
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

  toggleMute() {
    if (this.volume === 0) {
      // Nếu đang tắt, khôi phục âm lượng cũ
      this.volume = this.previousVolume;
    } else {
      // Nếu đang bật, lưu âm lượng hiện tại và tắt
      this.previousVolume = this.volume;
      this.volume = 0;
    }
    this.onVolumeChange(this.volume);
  }
}