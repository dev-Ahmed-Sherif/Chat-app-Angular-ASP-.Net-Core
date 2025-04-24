import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  ViewChild,
  viewChild,
} from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner, MatIconModule, DatePipe],
  templateUrl: './chat-box.component.html',
  styles: [
    `
      .chat-box {
        display: flex;
        flex-direction: column;
        height: 70vh;
        overflow: hidden;
        overflow-y: scroll;
        padding: 10px;
        background-color: #f5f5f5;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 7px;
      }

      .chat-box::-webkit-scrollbar {
        width: 7px;
        transition: background-color 0.3s;
        background-color: #f5f5f5;
      }

      .chat-box:hover::-webkit-scrollbar-thumb {
        width: 7px;
        border-radius: 10px;
      }

      .chat-box::-webkit-scrollbar-track {
        background-color: transparent;
        border-radius: 10px;
      }

      .chat-box::-webkit-scrollbar-thumb {
        background-color: gray;
        border-radius: 10px;
      }

      .chat-box::-webkit-scrollbar-thumb:hover {
        background-color: #aaa;
      }

      .chat-icon {
        width: 30px;
        height: 30px;
        font-size: 48px;
        margin-right: 10px;
      }
    `,
  ],
})
export class ChatBoxComponent implements AfterViewChecked {
  @ViewChild('chatBox', { read: ElementRef }) public chatbox!: ElementRef;

  chatService = inject(ChatService);
  authService = inject(AuthService);
  private pageNumber = 2;

  loadMoreMessages() {
    this.pageNumber++;
    this.chatService.loadMessages(this.pageNumber);
    this.chatService.isLoading.update(() => true);
    setTimeout(() => {
      this.chatService.isLoading.update(() => false);
    }, 5000);
    this.scrollToTop();
  }
  ngAfterViewChecked(): void {
    if (this.chatService.autoScrollEnabled()) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    this.chatService.autoScrollEnabled.set(true);
    this.chatbox.nativeElement.scrollTo({
      top: this.chatbox.nativeElement.scrollHeight,
      behavior: 'smooth',
    });
  }

  scrollToTop() {
    this.chatService.autoScrollEnabled.set(false);
    this.chatbox.nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
