import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5093/chat';
  private currentUser = this.authService.currentLoggedUser;
  onlineUsers = signal<User[]>([]);
  currentOpendedChat = signal<User | null>(null);
  chatMessages = signal<Message[]>([]);
  isLoading = signal<boolean>(true);

  private hubConnection?: HubConnection;

  startConnection(token: string, senderId?: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connected to chat hub');
      })
      .catch((err) => console.log('Connection or login error', err));

    this.hubConnection.on('OnlineUsers', (users: User[]) => {
      console.log('Online Users:', users);
      this.onlineUsers.update(() =>
        users.filter((user) => user.userName !== this.currentUser!.userName)
      );
    });

    this.hubConnection.on('ReceiveMessageList', (message) => {
      console.log('Received message:', message);
      this.chatMessages.update((messages) => [...messages, ...message]);
      this.isLoading.update(() => false);
    });
  }

  stopConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection
        .stop()
        .then(() => {
          console.log('Disconnected from chat hub');
        })
        .catch((err) => console.log('Disconnection error', err));
    }
  }

  status(userName: string): string {
    const currentChatUser = this.currentOpendedChat();
    if (!currentChatUser) {
      return 'offline';
    }

    const onlineUser = this.onlineUsers().find(
      (user) => user.userName === userName
    );

    return onlineUser?.isTyping ? 'Typing....' : this.isUserOnline();
  }

  isUserOnline(): string {
    let onlineUser = this.onlineUsers().find(
      (user) => user.userName === this.currentOpendedChat()?.userName
    );

    return onlineUser?.isOnline
      ? 'online'
      : this.currentOpendedChat()!.userName;
  }

  loadMessages(pageNumber: number) {
    this.hubConnection
      ?.invoke('LoadMessages', this.currentOpendedChat()?.id, pageNumber)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }
}
