
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
      const timer = setTimeout(() => setSecretClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f9fafc] h-full relative overflow-hidden font-sans">
      {/* Polished Gemini Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100/50">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 text-[14px]">Gemini 4.0 Pro</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">Ultra</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Active Core</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Model Latency</span>
            <span className="text-[11px] font-mono text-gray-600">0.012s</span>
          </div>
          <div className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 hide-scrollbar"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex mb-10 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm border ${
                  msg.role === Role.USER 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-white text-gray-400 border-gray-100'
                }`}>
                  {msg.role === Role.USER ? 'ME' : 'AI'}
                </div>
                <div className={`p-5 rounded-3xl text-[15px] leading-relaxed shadow-sm transition-all ${
                  msg.role === Role.USER 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-50 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300">
                  AI
                </div>
                <div className="p-6 rounded-3xl bg-white border border-gray-50 rounded-tl-none flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Zone */}
      <div className="p-6 md:p-10 bg-white border-t border-gray-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="flex gap-4 items-center">
            <div className="relative flex-1 group">
              <input 
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Message Gemini 4.0 Pro..."
                className="w-full pl-6 pr-14 py-5 bg-gray-50/50 border border-gray-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all text-[15px] shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <button type="button" className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                 </button>
              </div>
            </div>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="w-14 h-14 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-indigo-200 active:scale-90 flex items-center justify-center shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
          </form>
          
          <div className="mt-6 flex justify-center items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <span>Context aware</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <span 
                onClick={handleSecretClick} 
                className="cursor-default select-none transition-colors hover:text-indigo-300"
              >
                Encrypted Session
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <span>v4.0.2 Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
