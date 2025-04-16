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
  isFullscreen = false; // Thêm biến theo dõi trạng thái mở rộng
  dominantColor = '#000000'; // Màu chủ đạo của ảnh bìa

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
      this.updateDominantColor(); // Cập nhật màu chủ đạo khi bài hát thay đổi

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
    const slider = document.querySelector('.volume-slider-container') as HTMLElement;
    if (slider) {
      slider.style.setProperty('--volume', `${this.volume}%`);
    }
    
    // Khôi phục âm lượng từ localStorage nếu có
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume !== null) {
      this.volume = parseInt(savedVolume, 10);
      this.onVolumeChange(this.volume);
    }
    
    // Khôi phục chế độ lặp từ localStorage
    const savedRepeatMode = localStorage.getItem('repeatMode');
    if (savedRepeatMode && (savedRepeatMode === 'none' || savedRepeatMode === 'all' || savedRepeatMode === 'one')) {
      this.repeatMode = savedRepeatMode as 'none' | 'all' | 'one';
    }
    
    // Khôi phục trạng thái shuffle từ localStorage
    const savedShuffle = localStorage.getItem('shuffle');
    if (savedShuffle === 'true') {
      this.isShuffle = true;
    }
  }

  initializeHowl(): void {
    if (this.selectedSong) {
      const selectedSong = this.selectedSong;
      this.song = new Howl({
        src: [selectedSong.audioSrc],
        html5: true,
        volume: this.volume / 100,
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
          
          // Xử lý khi bài hát kết thúc theo chế độ lặp
          if (this.repeatMode === 'one') {
            // Nếu đang ở chế độ lặp một bài
            if (this.song) {
              this.song.seek(0);
              this.song.play();
              this.isPlaying = true;
              this.updateProgressLoop();
            }
          } else if (this.repeatMode === 'all' || this.isShuffle) {
            // Nếu đang ở chế độ lặp tất cả hoặc shuffle, phát bài tiếp theo
            this.nextSong();
          } else {
            // Nếu là bài cuối cùng và không có chế độ lặp
            if (this.currentSongIndex === this.songs.length - 1) {
              // Dừng phát nhạc
              console.log('End of playlist');
            } else {
              // Phát bài tiếp theo
              this.nextSong();
            }
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
    
    // Lưu trạng thái shuffle vào localStorage
    localStorage.setItem('shuffle', this.isShuffle.toString());
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
    
    // Lưu trạng thái lặp vào localStorage
    localStorage.setItem('repeatMode', this.repeatMode);
  }

  // Chỉnh sửa phương thức nextSong để xử lý cả shuffle và repeat
  nextSong(): void {
    console.log('Next song clicked');

    if (this.songs.length === 0) return;

    // Nếu đang ở chế độ lặp một bài
    if (this.repeatMode === 'one') {
      if (this.song) {
        this.song.seek(0);
        this.song.play();
        this.updateProgressLoop();
      }
      return;
    }

    // Tính toán index bài tiếp theo
    let nextIndex;
    
    // Nếu đang ở chế độ shuffle
    if (this.isShuffle) {
      do {
        nextIndex = this.getRandomSongIndex();
      } while (nextIndex === this.currentSongIndex && this.songs.length > 1);
    } else {
      // Tính toán bài tiếp theo
      nextIndex = (this.currentSongIndex + 1) % this.songs.length;
      
      // Kiểm tra nếu đang là bài cuối cùng và không ở chế độ lặp tất cả
      if (nextIndex === 0 && this.repeatMode === 'none') {
        // Nếu không lặp, dừng ở bài cuối
        if (this.song) {
          this.song.stop();
          this.isPlaying = false;
        }
        return;
      }
    }
    
    this.currentSongIndex = nextIndex;
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
    const slider = document.querySelector('.volume-slider-container') as HTMLElement;
    if (slider) {
      slider.style.setProperty('--volume', `${volume}%`);
    }
  }

  // Phương thức cũ này giữ lại nhưng không được sử dụng trong template
  onVolumeClick(event: MouseEvent): void {
    const volumeBar = event.currentTarget as HTMLElement;
    const rect = volumeBar.getBoundingClientRect();
    const volumeWidth = rect.width;
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / volumeWidth) * 100));
    
    this.volume = Math.round(percentage);
    this.onVolumeChange(this.volume);
  }

  // Phương thức mới xử lý click trên container của thanh âm lượng
  onVolumeContainerClick(event: MouseEvent): void {
    // Ngăn sự kiện lan truyền lên phần tử cha
    event.stopPropagation();
    
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
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

  // Thêm phương thức prevSong để xử lý nút quay lại
  prevSong(): void {
    console.log('Previous song clicked');
    
    if (this.songs.length === 0) return;

    // Nếu đang ở chế độ lặp một bài
    if (this.repeatMode === 'one') {
      if (this.song) {
        this.song.seek(0);
        this.song.play();
        this.updateProgressLoop();
      }
      return;
    }

    // Tính toán index bài trước đó
    let prevIndex;
    
    // Nếu đang ở chế độ shuffle
    if (this.isShuffle) {
      do {
        prevIndex = this.getRandomSongIndex();
      } while (prevIndex === this.currentSongIndex && this.songs.length > 1);
    } else {
      // Tính toán bài trước đó
      prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
      
      // Kiểm tra nếu đang là bài đầu tiên và không ở chế độ lặp tất cả
      if (prevIndex === this.songs.length - 1 && this.repeatMode === 'none') {
        // Nếu ở bài đầu tiên và không ở chế độ lặp, chỉ quay về đầu bài hiện tại
        if (this.song) {
          this.song.seek(0);
          this.updateProgress();
          return;
        }
      }
    }
    
    this.currentSongIndex = prevIndex;
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

  // Thêm phương thức xử lý mở rộng
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      document.body.style.overflow = 'hidden';
      this.updateDominantColor();
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  // Thêm phương thức lấy màu chủ đạo từ ảnh bìa
  private updateDominantColor(): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = this.imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        // Lấy mẫu 100 pixel từ ảnh để tính màu trung bình
        for (let i = 0; i < imageData.length; i += 4) {
          if (count % 100 === 0) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
          }
        }
        
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          this.dominantColor = `rgb(${r}, ${g}, ${b})`;
        }
      }
    };
  }
}