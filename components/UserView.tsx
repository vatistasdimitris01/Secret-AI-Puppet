
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';

interface UserViewProps {
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  onTyping: (text: string) => void;
}

const UserView: React.FC<UserViewProps> = ({ messages, isThinking, onSendMessage, onTyping }) => {
  const [input, setInput] = useState('');
  const [secretClicks, setSecretClicks] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    onTyping(val);
  };

  const handleSecretClick = () => {
    const newCount = secretClicks + 1;
    if (newCount >= 4) {
      window.location.hash = '#/control';
      setSecretClicks(0);
    } else {
      setSecretClicks(newCount);
      // Reset counter if no click within 2 seconds
      setTimeout(() => setSecretClicks(0), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative overflow-hidden">
      {/* Fake Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
            G
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Gemini 4.0 Pro</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ultra Core Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
            LATENCY: 14ms
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 hide-scrollbar"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${msg.role === Role.USER ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {msg.role === Role.USER ? 'YOU' : 'AI'}
                </div>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === Role.USER 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-4 max-w-[90%] md:max-w-[75%]">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                  AI
                </div>
                <div className="p-5 rounded-2xl bg-white border border-gray-100 rounded-tl-none flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto flex gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message Gemini 4.0..."
              className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-[15px] shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex gap-2">
               <button type="button" className="hover:text-indigo-600 transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
               </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim()}
            className="px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
          </button>
        </form>
        <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          <span>Multi-modal Engine</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
          <span>End-to-end <span onClick={handleSecretClick} className="cursor-default select-none active:text-gray-500 transition-colors">Encrypted</span></span>
          <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
          <span>v4.0.2 Stable</span>
        </div>
      </div>
    </div>
  );
};

export default UserView;
