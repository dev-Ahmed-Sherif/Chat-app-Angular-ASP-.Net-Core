import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5093/chat';
  private currentUser = this.authService.currentLoggedUser;
  onlineUsers = signal<User[]>([]);

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
  }
}
