
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

export interface ChatState {
  messages: Message[];
  isThinking: boolean;
  isUserTyping: boolean;
  userDraft: string;
}
