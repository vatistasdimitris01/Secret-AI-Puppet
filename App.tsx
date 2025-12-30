
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Role, Message, SessionState, ChatEvent } from './types';
import UserView from './components/UserView';
import PuppeteerPanel from './components/PuppeteerPanel';

const syncChannel = new BroadcastChannel('ai_puppet_v4_final');

const getLocalSessionId = () => {
  let id = localStorage.getItem('my_session_id');
  if (!id) {
    id = 'U-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    localStorage.setItem('my_session_id', id);
  }
  return id;
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Record<string, SessionState>>(() => {
    const saved = localStorage.getItem('puppet_sessions_v4');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [route, setRoute] = useState<string>(window.location.hash || '#/user');
  const [userLoggedIn, setUserLoggedIn] = useState(!!localStorage.getItem('user_name'));
  const [controlLoggedIn, setControlLoggedIn] = useState(!!sessionStorage.getItem('control_auth'));

  const mySessionId = useMemo(() => getLocalSessionId(), []);
  const myUserName = localStorage.getItem('user_name') || 'Anonymous';
  const startTime = useMemo(() => Date.now(), []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('puppet_sessions_v4', JSON.stringify(sessions));
  }, [sessions]);

  // Presence Heartbeat
  useEffect(() => {
    if (route.startsWith('#/user') && userLoggedIn) {
      const ping = () => syncChannel.postMessage({ type: 'USER_PING', sessionId: mySessionId });
      const interval = setInterval(ping, 4000);
      
      const handleUnload = () => {
        syncChannel.postMessage({ type: 'USER_LEFT', sessionId: mySessionId, timestamp: Date.now() });
      };
      
      window.addEventListener('beforeunload', handleUnload);
      ping();

      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
  }, [route, userLoggedIn, mySessionId]);

  // Main Event Switchboard
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/user');
    window.addEventListener('hashchange', handleHashChange);
    
    const handleSync = (event: MessageEvent<ChatEvent>) => {
      const ev = event.data;
      
      // Fixed: Early return for 'REQUEST_MANIFEST' to avoid sessionId property access errors
      if (ev.type === 'REQUEST_MANIFEST') {
        if (route.startsWith('#/user') && userLoggedIn) {
          syncChannel.postMessage({ 
            type: 'USER_JOINED', 
            sessionId: mySessionId, 
            userName: myUserName,
            deviceInfo: navigator.userAgent.split(') ')[0] + ')',
            startTime: startTime
          });
        }
        return;
      }

      setSessions(prev => {
        const next = { ...prev };
        // Fixed: ev.sessionId is now valid because ev is narrowed (REQUEST_MANIFEST is handled above)
        const sid = ev.sessionId;
        
        // Fixed: Explicitly typed 'session' and provided defaults for optional fields to avoid access errors
        const session: SessionState = next[sid] || {
          id: sid,
          userName: 'Anonymous',
          messages: [{ id: 'init', role: Role.AI, content: "Hello! I am Gemini 4.0. How can I assist you today?", timestamp: Date.now() }],
          isThinking: false,
          isUserTyping: false,
          userDraft: '',
          lastActive: Date.now(),
          startTime: Date.now(),
          status: 'online',
          deviceInfo: undefined,
          disconnectedAt: undefined
        };

        switch (ev.type) {
          case 'USER_JOINED':
            session.userName = ev.userName;
            session.deviceInfo = ev.deviceInfo;
            session.startTime = ev.startTime;
            session.status = 'online';
            session.lastActive = Date.now();
            session.disconnectedAt = undefined;
            break;
          case 'USER_PING':
            session.status = 'online';
            session.lastActive = Date.now();
            session.disconnectedAt = undefined;
            break;
          case 'USER_LEFT':
            session.status = 'offline';
            session.disconnectedAt = ev.timestamp;
            break;
          case 'USER_TYPING':
            session.userDraft = ev.text;
            session.isUserTyping = ev.text.length > 0;
            session.lastActive = Date.now();
            session.status = 'online';
            break;
          case 'USER_MESSAGE':
            session.messages = [...session.messages, ev.message];
            session.userDraft = '';
            session.isUserTyping = false;
            session.lastActive = Date.now();
            session.status = 'online';
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
            delete next[sid];
            return next;
        }
        
        next[sid] = session;
        return next;
      });
    };

    syncChannel.onmessage = handleSync;
    
    // Announce if user portal is active
    if (route.startsWith('#/user') && userLoggedIn) {
      syncChannel.postMessage({ 
        type: 'USER_JOINED', 
        sessionId: mySessionId, 
        userName: myUserName,
        deviceInfo: navigator.userAgent.split(') ')[0] + ')',
        startTime: startTime
      });
    }

    // If control portal is open, ask for anyone existing
    if (route === '#/control' && controlLoggedIn) {
      syncChannel.postMessage({ type: 'REQUEST_MANIFEST' });
    }

    const presenceMonitor = setInterval(() => {
      setSessions(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(id => {
          const s = next[id];
          if (s.status === 'online' && Date.now() - s.lastActive > 12000) {
            s.status = 'offline';
            s.disconnectedAt = s.lastActive;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 5000);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      syncChannel.onmessage = null;
      clearInterval(presenceMonitor);
    };
  }, [route, userLoggedIn, controlLoggedIn, mySessionId, myUserName, startTime]);

  // Portal 1 Handlers
  const handleUserLogin = (name: string) => {
    localStorage.setItem('user_name', name);
    setUserLoggedIn(true);
  };

  // Portal 2 Handlers
  const handleControlLogin = () => {
    sessionStorage.setItem('control_auth', 'true');
    setControlLoggedIn(true);
    // Immediately request manifest upon successful login
    syncChannel.postMessage({ type: 'REQUEST_MANIFEST' });
  };

  const handleUserSendMessage = useCallback((text: string) => {
    const msg: Message = { id: Date.now().toString(), role: Role.USER, content: text, timestamp: Date.now() };
    syncChannel.postMessage({ type: 'USER_MESSAGE', sessionId: mySessionId, message: msg });
    setSessions(prev => ({
      ...prev,
      [mySessionId]: { ...prev[mySessionId], messages: [...(prev[mySessionId]?.messages || []), msg], userDraft: '', isUserTyping: false, lastActive: Date.now() }
    }));
  }, [mySessionId]);

  const handleUserTyping = useCallback((text: string) => {
    syncChannel.postMessage({ type: 'USER_TYPING', sessionId: mySessionId, text });
  }, [mySessionId]);

  const handleOperatorSend = useCallback((sessionId: string, text: string) => {
    const msg: Message = { id: Date.now().toString(), role: Role.AI, content: text, timestamp: Date.now() };
    syncChannel.postMessage({ type: 'AI_MESSAGE', sessionId, message: msg });
    setSessions(prev => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], messages: [...(prev[sessionId]?.messages || []), msg], isThinking: false, lastActive: Date.now() }
    }));
  }, []);

  const handleOperatorThinking = useCallback((sessionId: string, thinking: boolean) => {
    syncChannel.postMessage({ type: 'AI_THINKING', sessionId, thinking });
    setSessions(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], isThinking: thinking } }));
  }, []);

  const handlePurge = useCallback((sessionId: string) => {
    syncChannel.postMessage({ type: 'SESSION_PURGE', sessionId });
    setSessions(prev => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
    if (activeSessionId === sessionId) setActiveSessionId(null);
  }, [activeSessionId]);

  if (route === '#/control') {
    return (
      <PuppeteerPanel 
        isLoggedIn={controlLoggedIn}
        onLogin={handleControlLogin}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onSendResponse={handleOperatorSend}
        onToggleThinking={handleOperatorThinking}
        onPurgeSession={handlePurge}
      />
    );
  }

  return (
    <UserView 
      isLoggedIn={userLoggedIn}
      onLogin={handleUserLogin}
      messages={sessions[mySessionId]?.messages || []}
      isThinking={sessions[mySessionId]?.isThinking || false}
      onSendMessage={handleUserSendMessage}
      onTyping={handleUserTyping}
    />
  );
};

export default App;
