
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Role, Message, SessionState, GlobalChatState, ChatEvent } from './types';
import UserView from './components/UserView';
import PuppeteerPanel from './components/PuppeteerPanel';

const syncChannel = new BroadcastChannel('ai_puppet_v2');

// Helper to get or create a local Session ID for the "User"
const getLocalSessionId = () => {
  let id = localStorage.getItem('my_session_id');
  if (!id) {
    id = 'target_' + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('my_session_id', id);
  }
  return id;
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Record<string, SessionState>>(() => {
    const saved = localStorage.getItem('puppet_sessions');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [route, setRoute] = useState<string>(window.location.hash || '#/user');
  const mySessionId = useMemo(() => getLocalSessionId(), []);

  // Update localStorage and broadcast changes
  useEffect(() => {
    localStorage.setItem('puppet_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/user');
    window.addEventListener('hashchange', handleHashChange);
    
    const handleSync = (event: MessageEvent<ChatEvent>) => {
      const ev = event.data;
      setSessions(prev => {
        const next = { ...prev };
        const session = next[ev.sessionId] || {
          id: ev.sessionId,
          messages: [],
          isThinking: false,
          isUserTyping: false,
          userDraft: '',
          lastActive: Date.now()
        };

        switch (ev.type) {
          case 'USER_JOINED':
            session.lastActive = Date.now();
            break;
          case 'USER_TYPING':
            session.userDraft = ev.text;
            session.isUserTyping = ev.text.length > 0;
            session.lastActive = Date.now();
            break;
          case 'USER_MESSAGE':
            session.messages = [...session.messages, ev.message];
            session.userDraft = '';
            session.isUserTyping = false;
            session.lastActive = Date.now();
            break;
          case 'AI_THINKING':
            session.isThinking = ev.thinking;
            break;
          case 'AI_MESSAGE':
            session.messages = [...session.messages, ev.message];
            session.isThinking = false;
            session.lastActive = Date.now();
            break;
          case 'SESSION_PURGE':
            delete next[ev.sessionId];
            return next;
        }
        
        next[ev.sessionId] = session;
        return next;
      });
    };

    syncChannel.onmessage = handleSync;
    
    // Announce presence if we are a user
    if (route.startsWith('#/user')) {
      syncChannel.postMessage({ type: 'USER_JOINED', sessionId: mySessionId });
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      syncChannel.onmessage = null;
    };
  }, [route, mySessionId]);

  // User Actions
  const handleUserSendMessage = useCallback((text: string) => {
    const msg: Message = { id: Date.now().toString(), role: Role.USER, content: text, timestamp: Date.now() };
    const ev: ChatEvent = { type: 'USER_MESSAGE', sessionId: mySessionId, message: msg };
    syncChannel.postMessage(ev);
    // Local update for immediate feedback
    setSessions(prev => ({
      ...prev,
      [mySessionId]: { ...prev[mySessionId], messages: [...(prev[mySessionId]?.messages || []), msg], userDraft: '', isUserTyping: false }
    }));
  }, [mySessionId]);

  const handleUserTyping = useCallback((text: string) => {
    syncChannel.postMessage({ type: 'USER_TYPING', sessionId: mySessionId, text });
  }, [mySessionId]);

  // Operator Actions
  const handleOperatorSend = useCallback((sessionId: string, text: string) => {
    const msg: Message = { id: Date.now().toString(), role: Role.AI, content: text, timestamp: Date.now() };
    syncChannel.postMessage({ type: 'AI_MESSAGE', sessionId, message: msg });
  }, []);

  const handleOperatorThinking = useCallback((sessionId: string, thinking: boolean) => {
    syncChannel.postMessage({ type: 'AI_THINKING', sessionId, thinking });
  }, []);

  const handlePurge = useCallback((sessionId: string) => {
    syncChannel.postMessage({ type: 'SESSION_PURGE', sessionId });
  }, []);

  if (route === '#/control') {
    return (
      <PuppeteerPanel 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onSendResponse={handleOperatorSend}
        onToggleThinking={handleOperatorThinking}
        onPurgeSession={handlePurge}
      />
    );
  }

  // Ensure default message exists for new users
  const currentUserSession = sessions[mySessionId] || {
    id: mySessionId,
    messages: [{ id: 'init', role: Role.AI, content: "Hello! I am Gemini 4.0. How can I assist you today?", timestamp: Date.now() }],
    isThinking: false,
    isUserTyping: false,
    userDraft: '',
    lastActive: Date.now()
  };

  return (
    <UserView 
      messages={currentUserSession.messages}
      isThinking={currentUserSession.isThinking}
      onSendMessage={handleUserSendMessage}
      onTyping={handleUserTyping}
    />
  );
};

export default App;
