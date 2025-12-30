
import React, { useState, useRef, useEffect } from 'react';
import { SessionState, Role } from '../types';

interface PuppeteerPanelProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  sessions: Record<string, SessionState>;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onSendResponse: (id: string, text: string) => void;
  onToggleThinking: (id: string, thinking: boolean) => void;
  onPurgeSession: (id: string) => void;
}

const PuppeteerPanel: React.FC<PuppeteerPanelProps> = ({
  isLoggedIn,
  onLogin,
  sessions,
  activeSessionId,
  onSelectSession,
  onSendResponse,
  onToggleThinking,
  onPurgeSession
}) => {
  const [token, setToken] = useState('');
  const [response, setResponse] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sessionList = Object.values(sessions).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
    return b.lastActive - a.lastActive;
  });
  
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, activeSession?.isThinking]);

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#08090a] p-6 font-mono overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="grid grid-cols-12 h-full w-full gap-4 p-8">
              {Array.from({length: 48}).map((_, i) => (
                <div key={i} className="h-1 bg-rose-500/20 rounded-full animate-pulse" style={{animationDelay: `${i * 100}ms`}}></div>
              ))}
           </div>
        </div>
        <div className="w-full max-w-sm p-10 bg-[#12131a] rounded-3xl border border-white/5 flex flex-col items-center relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-8 text-rose-500 animate-pulse">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-white text-sm font-black tracking-[0.6em] uppercase mb-10 text-center">Neural Portal 2</h2>
          <div className="w-full space-y-6">
            <input 
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && token === 'master' && onLogin()}
              placeholder="SECRET_AUTH_TOKEN"
              className="w-full bg-black/50 border border-white/10 px-6 py-4 rounded-xl text-white focus:outline-none focus:border-rose-500/50 text-center tracking-[0.3em] text-xs placeholder:opacity-20"
            />
            <button 
              onClick={() => token === 'master' && onLogin()}
              className="w-full py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-xl hover:bg-rose-500 transition-all shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]"
            >
              Verify Uplink
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#0c0d10] text-slate-400 font-sans overflow-hidden">
      {/* Target Manifest Sidebar */}
      <aside className="w-96 border-r border-white/5 flex flex-col bg-[#111218] relative z-20">
        <div className="p-8 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse"></div>
            <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">Target Manifest</h1>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
               <span className="block text-slate-600 mb-1">CHANNELS</span>
               <span className="text-white font-bold">{sessionList.length}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
               <span className="block text-slate-600 mb-1">ONLINE</span>
               <span className="text-emerald-400 font-bold">{sessionList.filter(s => s.status === 'online').length}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {sessionList.map(s => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`group cursor-pointer p-5 rounded-2xl transition-all border ${
                activeSessionId === s.id 
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_30px_-15px_rgba(244,63,94,0.3)]' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold tracking-tight mb-0.5 ${activeSessionId === s.id ? 'text-rose-400' : 'text-slate-200'}`}>
                    {s.userName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600">{s.id}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${s.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                  {s.status.toUpperCase()}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-[9px] text-slate-500 font-mono truncate bg-black/20 p-1 px-2 rounded">{s.deviceInfo || 'Unknown Node'}</p>
                <div className="flex gap-2 text-[8px] font-mono text-slate-600">
                  <span>START: {new Date(s.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  {s.disconnectedAt && (
                    <span className="text-rose-500/60">LEFT: {new Date(s.disconnectedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic truncate opacity-60">
                {s.messages[s.messages.length - 1]?.content || '---'}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <span className="text-[9px] font-bold text-slate-600">MSG_COUNT: {s.messages.length}</span>
                <button onClick={(e) => { e.stopPropagation(); onPurgeSession(s.id); }} className="text-[9px] font-black text-rose-500/80 hover:text-rose-400 tracking-tighter">TERMINATE_LOG</button>
              </div>
            </div>
          ))}
          {sessionList.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-600 opacity-20">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              <span className="text-[10px] tracking-[0.4em] uppercase">No Handshakes Detected</span>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/40">
           <a href="#/user" className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.2em]">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             RETURN_PORTAL_1
           </a>
        </div>
      </aside>

      {/* Main Neural Intercept Space */}
      <main className="flex-1 flex flex-col bg-[#0c0d10] relative overflow-hidden">
        {activeSession ? (
          <>
            <header className="h-24 border-b border-white/5 bg-[#111218]/90 backdrop-blur-3xl px-10 flex items-center justify-between z-10">
              <div className="flex items-center gap-8">
                <div>
                  <h2 className="text-sm font-black text-white tracking-widest mb-1">INTERCEPTING: <span className="text-rose-500">{activeSession.userName.toUpperCase()}</span></h2>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activeSession.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
                      {activeSession.status === 'online' ? 'Synchronized' : `Signal Lost (Last seen: ${new Date(activeSession.lastActive).toLocaleTimeString()})`}
                    </span>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="max-w-md">
                   <span className="text-[10px] text-slate-700 uppercase font-black block mb-1 tracking-widest">Real-time Buffer:</span>
                   <p className="text-sm text-emerald-400/90 font-mono truncate italic h-6 min-w-[200px] bg-black/20 px-3 py-0.5 rounded-lg border border-white/5">
                     {activeSession.isUserTyping ? activeSession.userDraft : (activeSession.status === 'online' ? <span className="opacity-20">_listening_</span> : 'N/A')}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => onToggleThinking(activeSession.id, !activeSession.isThinking)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeSession.isThinking 
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]' 
                      : 'bg-white/5 border-white/10 text-slate-600 hover:border-white/20'
                  }`}
                >
                  {activeSession.isThinking ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      Sim_Thinking_Active
                    </>
                  ) : 'Simulate Thinking'}
                </button>
              </div>
            </header>

            {/* Neural Log history */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 hide-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(18,20,28,1)_0%,rgba(12,13,16,1)_100%)]">
              {activeSession.messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === Role.USER ? 'items-start' : 'items-end'} animate-in fade-in duration-500`}>
                  <div className="flex items-center gap-4 mb-3 px-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${m.role === Role.USER ? 'text-blue-500/80' : 'text-rose-500/80'}`}>
                      {m.role === Role.USER ? 'UPLINK_DATA' : 'OPERATOR_SIGNAL'}
                    </span>
                    <span className="text-[9px] text-slate-800 font-mono">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`p-6 rounded-3xl text-[14px] leading-relaxed max-w-2xl border transition-all ${
                    m.role === Role.USER 
                      ? 'bg-[#161822] border-white/5 text-slate-300 shadow-2xl' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-100 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.15)]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {activeSession.isThinking && (
                <div className="flex flex-col items-end animate-pulse">
                  <div className="text-[10px] font-black uppercase text-amber-500/50 mb-3 px-4 tracking-widest">THINK_ENGINE_SIM</div>
                  <div className="w-32 h-16 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Injection Interface */}
            <div className="p-10 bg-[#111218] border-t border-white/5 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
              <div className="max-w-5xl mx-auto flex gap-8 items-end">
                <div className="flex-1 relative group">
                  <textarea 
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (response.trim()) {
                           onSendResponse(activeSession.id, response);
                           setResponse('');
                        }
                      }
                    }}
                    placeholder="ENTER NEURAL RESPONSE TO INJECT..."
                    className="w-full bg-[#08090a] border border-white/10 rounded-3xl p-8 text-[15px] font-mono text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all resize-none min-h-[160px] shadow-inner"
                  />
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <button onClick={() => setResponse("Neural cores synchronized. Analyzing user data patterns.")} className="text-[9px] font-black text-slate-700 hover:text-rose-400 bg-white/5 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-rose-500/30 uppercase tracking-tighter">Handshake_P1</button>
                    <button onClick={() => setResponse("Processing multimodal request. This may take a moment.")} className="text-[9px] font-black text-slate-700 hover:text-rose-400 bg-white/5 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-rose-500/30 uppercase tracking-tighter">Thinking_P2</button>
                  </div>
                </div>
                <button 
                  onClick={() => response.trim() && (onSendResponse(activeSession.id, response), setResponse(''))}
                  disabled={!response.trim()}
                  className="h-[160px] px-12 bg-rose-600 hover:bg-rose-500 disabled:bg-white/5 disabled:text-slate-800 rounded-3xl font-black text-[12px] uppercase tracking-[0.5em] transition-all flex flex-col items-center justify-center gap-6 shadow-2xl shadow-rose-900/20 active:scale-95 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <svg className="w-10 h-10 group-hover:-translate-y-2 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span className="relative z-10">Inject</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="relative w-32 h-32 border border-white/5 rounded-[2.5rem] flex items-center justify-center bg-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6">
                <svg className="w-14 h-14 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.14-4.562l.053.09c.42.709.923 1.36 1.494 1.936m-19.141 0c.571-.576 1.074-1.227 1.494-1.936M12 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04L11.26 3.57A10.003 10.003 0 0112 3a10.003 10.003 0 018.14 4.562l.053-.09c.42-.709.923-1.36 1.494-1.936m-19.141 0c.571.576 1.074-1.227 1.494-1.936"></path></svg>
              </div>
            </div>
            <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[1em] mb-6">Neural_Uplink_Standby</h3>
            <p className="text-[11px] text-slate-800 max-w-sm font-mono leading-relaxed px-10">
              MANIFEST_SCANNER: ONLINE <br/>
              Awaiting neural target selection from the manifest. Once selected, manual response injection will be authorized.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PuppeteerPanel;
