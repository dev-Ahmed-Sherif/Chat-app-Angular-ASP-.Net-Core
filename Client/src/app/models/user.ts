export interface User {
  id: string;
  profilePicture: string;
  photoUrl: string;
  fullName: string;
  userName: string;
  connectionId: string;
  lastMessage: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
}
