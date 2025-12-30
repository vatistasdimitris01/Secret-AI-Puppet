
export enum Role {
  USER = 'user',
  AI = 'assistant'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface SessionState {
  id: string;
  userName: string;
  messages: Message[];
  isThinking: boolean;
  isUserTyping: boolean;
  userDraft: string;
  lastActive: number;
  disconnectedAt?: number;
  startTime: number;
  status: 'online' | 'offline';
  deviceInfo?: string;
}

export type ChatEvent = 
  | { type: 'USER_JOINED'; sessionId: string; userName: string; deviceInfo: string; startTime: number }
  | { type: 'USER_PING'; sessionId: string }
  | { type: 'USER_TYPING'; sessionId: string; text: string }
  | { type: 'USER_MESSAGE'; sessionId: string; message: Message }
  | { type: 'AI_THINKING'; sessionId: string; thinking: boolean }
  | { type: 'AI_MESSAGE'; sessionId: string; message: Message }
  | { type: 'SESSION_PURGE'; sessionId: string }
  | { type: 'USER_LEFT'; sessionId: string; timestamp: number }
  | { type: 'REQUEST_MANIFEST' };
