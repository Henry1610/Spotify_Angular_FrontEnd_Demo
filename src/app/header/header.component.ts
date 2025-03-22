import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  // Dữ liệu cho ảnh đại diện người dùng
  userAvatar = 'assets/images/user-avatar.jpg'; // Thay bằng đường dẫn ảnh của bạn
}