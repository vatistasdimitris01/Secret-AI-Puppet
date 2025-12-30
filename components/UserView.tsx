
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';

interface UserViewProps {
  isLoggedIn: boolean;
  onLogin: (name: string) => void;
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  onTyping: (text: string) => void;
}

const UserView: React.FC<UserViewProps> = ({ isLoggedIn, onLogin, messages, isThinking, onSendMessage, onTyping }) => {
  const [input, setInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 2) {
      window.location.hash = '#/control';
      setClickCount(0);
    } else {
      setClickCount(nextCount);
      const timer = setTimeout(() => setClickCount(0), 1000);
      return () => clearTimeout(timer);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fdfdfd] p-6 font-sans">
        <div className="w-full max-w-sm p-10 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-8 rotate-3">G</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Gemini 4.0</h1>
          <p className="text-gray-400 text-sm text-center mb-10 leading-relaxed px-4">Experience the next generation of multimodal intelligence.</p>
          <div className="w-full space-y-4">
            <input 
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && nameInput.trim() && onLogin(nameInput.trim())}
              placeholder="What should we call you?"
              className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-center placeholder:text-gray-300"
            />
            <button 
              onClick={() => nameInput.trim() && onLogin(nameInput.trim())}
              disabled={!nameInput.trim()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-20 transition-all shadow-xl shadow-indigo-100/50 active:scale-95"
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fafbfc] h-full relative overflow-hidden font-sans">
      {/* Portal 1 Header */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white/70 backdrop-blur-2xl shadow-sm shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div 
            onClick={handleLogoClick}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 transition-transform active:scale-90 cursor-default select-none"
          >
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Gemini 4.0 Pro</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Ultra v4</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></span>
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-tight">Core Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Network Speed</span>
            <span className="text-xs font-mono text-gray-600">842.1 MB/S</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 hover:text-gray-600 transition-all active:scale-95">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 hide-scrollbar">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-12 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
              <div className={`flex gap-5 max-w-[85%] md:max-w-[78%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black shadow-sm border ${msg.role === Role.USER ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-gray-300 border-gray-100'}`}>
                  {msg.role === Role.USER ? 'ME' : 'AI'}
                </div>
                <div className={`p-6 rounded-[2rem] text-[16px] leading-[1.6] shadow-sm transition-all ${msg.role === Role.USER ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-50 rounded-tl-none shadow-indigo-100/10'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-200">AI</div>
                <div className="p-7 rounded-[2rem] bg-white border border-gray-50 rounded-tl-none flex items-center gap-3 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Zone */}
      <div className="p-8 md:p-12 bg-white border-t border-gray-50/50 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); input.trim() && (onSendMessage(input), setInput('')); }} 
            className="flex gap-5 items-center"
          >
            <div className="relative flex-1 group">
              <input 
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); onTyping(e.target.value); }}
                placeholder="Ask Gemini anything..."
                className="w-full pl-8 pr-8 py-6 bg-gray-50/50 border border-gray-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white transition-all text-base shadow-inner"
              />
            </div>
            <button 
              type="submit" 
              disabled={!input.trim()} 
              className="w-16 h-16 bg-indigo-600 text-white rounded-3xl hover:bg-indigo-700 disabled:opacity-20 transition-all shadow-2xl shadow-indigo-200 active:scale-90 flex items-center justify-center shrink-0"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M3 12h18"></path></svg>
            </button>
          </form>
          <div className="mt-8 flex justify-center gap-10 text-[11px] text-gray-400 font-black uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span> Multi-Modal Engine
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span> Secure Session
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span> Stability Update 4.0.2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
