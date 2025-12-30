
import React, { useState, useCallback, useEffect } from 'react';
import { Role, Message, ChatState } from './types';
import UserView from './components/UserView';
import PuppeteerPanel from './components/PuppeteerPanel';

// Sync channel for cross-tab communication
const syncChannel = new BroadcastChannel('ai_puppet_sync');

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>(() => {
    const saved = localStorage.getItem('chat_state');
    return saved ? JSON.parse(saved) : {
      messages: [
        {
          id: '1',
          role: Role.AI,
          content: "Hello! I am Gemini 4.0. How can I assist you today?",
          timestamp: Date.now()
        }
      ],
      isThinking: false,
      isUserTyping: false,
      userDraft: ''
    };
  });

  const [route, setRoute] = useState<string>(window.location.hash || '#/user');

  // Sync state to localStorage and other tabs
  useEffect(() => {
    localStorage.setItem('chat_state', JSON.stringify(state));
    syncChannel.postMessage(state);
  }, [state]);

  // Listen for sync events from other tabs
  useEffect(() => {
    const handleSync = (event: MessageEvent) => {
      setState(event.data);
    };
    syncChannel.onmessage = handleSync;

    const handleHashChange = () => {
      setRoute(window.location.hash || '#/user');
    };
    
    // Set initial route if none exists
    if (!window.location.hash) {
      window.location.hash = '#/user';
    }

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      syncChannel.onmessage = null;
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Handle User Side interactions
  const handleUserSendMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.USER,
      content: text,
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isUserTyping: false,
      userDraft: ''
    }));
  }, []);

  const handleUserTyping = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      isUserTyping: text.length > 0,
      userDraft: text
    }));
  }, []);

  // Handle Puppeteer interactions
  const handlePuppetResponse = useCallback((text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.AI,
      content: text,
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isThinking: false
    }));
  }, []);

  const toggleThinking = useCallback((thinking: boolean) => {
    setState(prev => ({ ...prev, isThinking: thinking }));
  }, []);

  const clearChat = () => {
    const reset = {
      messages: [{ id: '1', role: Role.AI, content: "Session reset. New context initialized.", timestamp: Date.now() }],
      isThinking: false,
      isUserTyping: false,
      userDraft: ''
    };
    setState(reset);
  };

  // Render separate "pages" based on route
  if (route === '#/control') {
    return (
      <div className="h-screen w-full flex flex-col bg-slate-950 overflow-hidden font-mono">
        <header className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ghost Shell Console</span>
          </div>
          <div className="flex gap-4">
             <button onClick={clearChat} className="text-[10px] text-slate-500 hover:text-rose-400 transition uppercase">Purge Logs</button>
             <a href="#/user" className="text-[10px] text-slate-500 hover:text-white transition uppercase">View Target Client</a>
          </div>
        </header>
        <PuppeteerPanel 
          userDraft={state.userDraft}
          isThinking={state.isThinking}
          onSendResponse={handlePuppetResponse}
          onToggleThinking={toggleThinking}
          lastUserMessage={state.messages.filter(m => m.role === Role.USER).slice(-1)[0]}
        />
      </div>
    );
  }

  // Default: User View
  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      <UserView 
        messages={state.messages} 
        isThinking={state.isThinking}
        onSendMessage={handleUserSendMessage}
        onTyping={handleUserTyping}
      />
    </div>
  );
};

export default App;
