export interface User { id: string; name: string; profileImagePath?: string; colorProfile?: string }
export interface Reaction { type: string; count: number; users: User[] }
export interface MessageData {
  roomId: string;
  roomMessageId: string;
  user: User;
  content: string;
  createdAt: number;
  deleted: boolean;
  emergency: boolean;
  reactions: Reaction[];
  files: { id: string; data: string }[];
  messageUpdated?: boolean;
  clientMessageId?: string;
  threadMessageId?: string;
  replyMessage?: { roomMessageId: string; user: User; content: string };
  thread?: { count: number; messageLastSentTime: number };
  vote?: { items: unknown[] };
  bookmarked?: boolean;
}
export type MessageList = Record<string, MessageData>;
export interface MessagePage { content: MessageData[]; nextPage?: string }
export type PageParam = { id?: string; order: 'DESC' | 'ASC' };
export type DatasetKind = 'mixed' | 'text';
