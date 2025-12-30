
import React, { useState, useRef, useEffect } from 'react';
import { SessionState, Role } from '../types';

interface PuppeteerPanelProps {
  sessions: Record<string, SessionState>;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onSendResponse: (id: string, text: string) => void;
  onToggleThinking: (id: string, thinking: boolean) => void;
  onPurgeSession: (id: string) => void;
}

const PuppeteerPanel: React.FC<PuppeteerPanelProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onSendResponse,
  onToggleThinking,
  onPurgeSession
}) => {
  const [response, setResponse] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sessionList = Object.values(sessions).sort((a, b) => b.lastActive - a.lastActive);
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, activeSession?.isThinking]);

  const handleSend = () => {
    if (!activeSessionId || !response.trim()) return;
    onSendResponse(activeSessionId, response);
    setResponse('');
  };

  return (
    <div className="h-screen w-full flex bg-[#0c0d10] text-slate-300 font-sans overflow-hidden">
      {/* Target Manifest Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col bg-[#111218]">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Live Intercept</h1>
          </div>
          <p className="text-[9px] text-slate-500 font-mono">ESTABLISHED_CHANNELS: {sessionList.length}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {sessionList.map(s => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`group cursor-pointer p-4 rounded-xl transition-all border ${
                activeSessionId === s.id 
                  ? 'bg-rose-500/10 border-rose-500/40' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-mono font-bold ${activeSessionId === s.id ? 'text-rose-400' : 'text-slate-400'}`}>
                  {s.id}
                </span>
                {s.isUserTyping && (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate mb-2">
                {s.messages[s.messages.length - 1]?.content || 'Initializing...'}
              </div>
              <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] text-slate-600 font-mono">{new Date(s.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onPurgeSession(s.id); }}
                   className="text-[9px] text-rose-500/60 hover:text-rose-400 font-bold"
                 >
                   TERMINATE
                 </button>
              </div>
            </div>
          ))}
          {sessionList.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-600 opacity-40">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.14-4.562l.053.09c.42.709.923 1.36 1.494 1.936m-19.141 0c.571-.576 1.074-1.227 1.494-1.936M12 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04L11.26 3.57A10.003 10.003 0 0112 3a10.003 10.003 0 018.14 4.562l.053-.09c.42-.709.923-1.36 1.494-1.936m-19.141 0c.571.576 1.074 1.227 1.494 1.936"></path></svg>
              <span className="text-[10px] tracking-widest uppercase">Searching for users...</span>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
          <a href="#/user" className="flex items-center justify-center gap-2 text-[10px] text-slate-500 hover:text-white transition group">
            <span>SWITCH TO USER PORTAL</span>
            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>
      </aside>

      {/* Primary Interaction Space */}
      <main className="flex-1 flex flex-col bg-[#0c0d10] relative">
        {activeSession ? (
          <>
            <header className="h-16 border-b border-white/5 bg-[#111218]/50 px-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-xs font-bold text-white mb-0.5 tracking-tight">SESSION: <span className="text-rose-500">{activeSession.id}</span></h2>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-tighter">Handshake Active</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/5"></div>
                <div className="max-w-md">
                   <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">User Draft Buffer:</span>
                   <p className="text-xs text-emerald-400 font-mono truncate h-4 italic">
                     {activeSession.userDraft || <span className="opacity-20">Awaiting keystrokes...</span>}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleThinking(activeSession.id, !activeSession.isThinking)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeSession.isThinking 
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_-5px_rgba(245,158,11,0.5)]' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                >
                  {activeSession.isThinking ? (
                    <>
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                      Simulating Thinking...
                    </>
                  ) : 'Simulate Thinking'}
                </button>
              </div>
            </header>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-12 space-y-8 hide-scrollbar"
            >
              {activeSession.messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === Role.USER ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-3 mb-2 px-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${m.role === Role.USER ? 'text-blue-500' : 'text-rose-500'}`}>
                      {m.role === Role.USER ? 'TARGET_DATA' : 'OPERATOR_SIGNAL'}
                    </span>
                    <span className="text-[9px] text-slate-700 font-mono">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`p-5 rounded-2xl text-sm leading-relaxed max-w-2xl border transition-all ${
                    m.role === Role.USER 
                      ? 'bg-[#16171d] border-white/5 text-slate-300 shadow-xl' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-100 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.1)]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {activeSession.isThinking && (
                <div className="flex flex-col items-end animate-pulse">
                  <div className="text-[9px] font-black uppercase text-amber-500/50 mb-2 px-2 tracking-widest">THINK_SIMULATION</div>
                  <div className="w-24 h-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Injection Control Bar */}
            <div className="p-8 bg-[#111218] border-t border-white/5">
              <div className="max-w-4xl mx-auto flex gap-6 items-end">
                <div className="flex-1 relative">
                  <textarea 
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="ENTER SIGNAL DATA TO INJECT..."
                    className="w-full bg-[#0c0d10] border border-white/5 rounded-2xl p-6 pr-24 text-sm font-mono text-slate-200 focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition-all resize-none min-h-[120px]"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button onClick={() => setResponse("Understood. Analyzing patterns...")} className="text-[8px] font-bold text-slate-600 hover:text-rose-400 bg-white/5 px-2 py-1 rounded transition-colors border border-transparent hover:border-rose-500/20">PRESET_1</button>
                    <button onClick={() => setResponse("That is an intriguing question. Let me verify my knowledge base.")} className="text-[8px] font-bold text-slate-600 hover:text-rose-400 bg-white/5 px-2 py-1 rounded transition-colors border border-transparent hover:border-rose-500/20">PRESET_2</button>
                  </div>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!response.trim()}
                  className="h-[120px] px-10 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-slate-700 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex flex-col items-center justify-center gap-3 shadow-lg shadow-rose-900/10 active:scale-95 group"
                >
                  <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                  Inject
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative w-24 h-24 border border-white/5 rounded-full flex items-center justify-center bg-white/5">
                <svg className="w-10 h-10 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.5em] mb-4">Signal Intercept System</h3>
            <p className="text-[10px] text-slate-700 max-w-sm text-center leading-relaxed font-mono">
              Waiting for neural handshake... Select a target from the left panel to begin manual response injection.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PuppeteerPanel;
