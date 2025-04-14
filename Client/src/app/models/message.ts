export interface Message {
  id: string;
  senderId: string | null;
  receiverId: string | null;
  content: string | null;
  createdDate: Date;
  isRead: boolean;
}
