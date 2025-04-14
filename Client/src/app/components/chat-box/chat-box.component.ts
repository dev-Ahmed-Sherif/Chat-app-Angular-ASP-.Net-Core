import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-box',
  imports: [],
  templateUrl: './chat-box.component.html',
  styles: ``,
})
export class ChatBoxComponent {
  chatService = inject(ChatService);
}
