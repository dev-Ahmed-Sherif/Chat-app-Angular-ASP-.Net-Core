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

  autoScrollEnabled = signal<boolean>(true);

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

    this.hubConnection.on('Notify', (user: User) => {
      // console.log('User is typing:', user);
      // this.onlineUsers.update((users) => {
      //   const index = users.findIndex((u) => u.userName === user.userName);
      //   if (index !== -1) {
      //     users[index].isTyping = true;
      //   }
      //   return [...users];
      // });
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Active Now', {
            body: `${user.userName} is Now online 🟢`,
            icon: user.profileImage,
          });
        }
      });
    });

    this.hubConnection.on('ReceiveMessageList', (message) => {
      console.log('Received message:', message);
      this.isLoading.update(() => true);
      this.chatMessages.update((messages) => [...messages, ...message]);
      this.isLoading.update(() => false);
    });

    this.hubConnection.on('ReceiveNewMessage', (message: Message) => {
      // document.title = `New message from ${message.senderId}`;
      document.title = `(1) New Message`;
      console.log('Received message:', message);
      this.chatMessages.update((messages) => [...messages, message]);
    });

    this.hubConnection.on('NotifyTypingToUser', (senderUserName) => {
      console.log('User is typing:', senderUserName);
      this.onlineUsers.update((users) =>
        users.map((user) => {
          if (user.userName === senderUserName) {
            user.isTyping = true;
          }
          return user;
        })
      );

      setTimeout(() => {
        this.onlineUsers.update((users) => {
          return users.map((user) => {
            if (user.userName === senderUserName) {
              user.isTyping = false;
            }
            return user;
          });
        });
      }, 2000);
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
    this.isLoading.update(() => true);
    this.hubConnection
      ?.invoke('LoadMessages', this.currentOpendedChat()?.id, pageNumber)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }

  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  sendMessage(message: string) {
    let newMessageId = this.generateGUID();
    this.chatMessages.update((messages) => [
      ...messages,
      {
        content: message,
        senderId: this.authService.currentLoggedUser!.id,
        receiverId: this.currentOpendedChat()!.id,
        createdDate: new Date().toString(),
        isRead: false,
        id: newMessageId,
      },
    ]);
    this.hubConnection
      ?.invoke('SendMessage', {
        content: message,
        // senderId: this.authService.currentLoggedUser!.id,
        receiverId: this.currentOpendedChat()!.id,
        // createdDate: new Date().toString(),
        // isRead: false,
        // id: newMessageId,
      })
      .then((id) => {
        console.log('message sent to:', id);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        this.chatMessages.update((messages) =>
          messages.filter((msg) => msg.id !== newMessageId)
        );
      });
  }

  notifyTyping() {
    this.hubConnection
      ?.invoke('NotifyTyping', this.currentOpendedChat()?.userName)
      .then((x) => {
        console.log('Notfy to', x);
      })
      .catch((error) => {
        console.error('Error notifying typing:', error);
      });
  }
}
