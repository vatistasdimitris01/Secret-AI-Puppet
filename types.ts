
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
  messages: Message[];
  isThinking: boolean;
  isUserTyping: boolean;
  userDraft: string;
  lastActive: number;
  userName?: string;
}

export interface GlobalChatState {
  sessions: Record<string, SessionState>;
  activeSessionId: string | null;
}

// Event types for our simulated "API"
export type ChatEvent = 
  | { type: 'USER_JOINED'; sessionId: string }
  | { type: 'USER_TYPING'; sessionId: string; text: string }
  | { type: 'USER_MESSAGE'; sessionId: string; message: Message }
  | { type: 'AI_THINKING'; sessionId: string; thinking: boolean }
  | { type: 'AI_MESSAGE'; sessionId: string; message: Message }
  | { type: 'SESSION_PURGE'; sessionId: string };
