import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { VideoChatService } from '../../services/video-chat.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from '../video-chat/video-chat.component';

@Component({
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule, ChatBoxComponent],
  templateUrl: './chat-window.component.html',
  styles: ``,
})
export class ChatWindowComponent {
  @ViewChild('chatBox') chatContainer!: ElementRef;
  dialog = inject(MatDialog);

  chatService = inject(ChatService);
  signalRService = inject(VideoChatService);
  message: string = '';

  sendMessage() {
    if (!this.message) return;
    this.chatService.sendMessage(this.message);
    this.message = '';
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (!this.chatContainer) return;
    setTimeout(() => {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    }, 10);
  }

  displayDialog(receverId: string) {
    this.signalRService.remoteUserId = receverId;

    this.dialog.open(VideoChatComponent, {
      width: '42rem',
      height: '600px',
      disableClose: false,
      autoFocus: false,
    });
  }
}
