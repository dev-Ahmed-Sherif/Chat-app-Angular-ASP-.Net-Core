export interface User {
  id: string;
  profilePicture: string;
  photoUrl: string;
  fullName: string;
  userName: string;
  isOnline: boolean;
  connectionId: string;
  lastMessage: string;
  unreadCount: number;
  isTyping: boolean; // Optional property
}
