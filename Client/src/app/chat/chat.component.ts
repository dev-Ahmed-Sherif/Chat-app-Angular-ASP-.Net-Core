import { Component } from '@angular/core';
import { ChatSidebarComponent } from '../components/chat-sidebar/chat-sidebar.component';

@Component({
  selector: 'app-chat',
  imports: [ChatSidebarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {}
