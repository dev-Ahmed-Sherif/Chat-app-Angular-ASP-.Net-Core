import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from './../../services/chat.service';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIconModule, MatMenuModule, TitleCasePipe],
  templateUrl: './chat-sidebar.component.html',
  styles: ``,
})
export class ChatSidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  chatService = inject(ChatService);
  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getAccessToken!);
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  get user() {
    return this.authService.currentLoggedUser;
  }
}
