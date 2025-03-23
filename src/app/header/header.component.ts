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
  userAvatar = 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=264248917912963&height=50&width=50&ext=1745333721&hash=AbY0F-XxsJ-cxkLlRTmHnueb'; // Thay bằng đường dẫn ảnh của bạn
}