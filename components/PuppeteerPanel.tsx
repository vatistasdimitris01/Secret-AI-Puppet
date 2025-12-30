
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
  const sessionList = Object.values(sessions).sort((a, b) => b.lastActive - a.lastActive);
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  const handleSend = () => {
    if (!activeSessionId || !response.trim()) return;
    onSendResponse(activeSessionId, response);
    setResponse('');
  };

  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-300 font-mono overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <h1 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Manifest</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {sessionList.length === 0 && (
            <div className="p-4 text-[10px] text-slate-600 italic text-center">No active signals...</div>
          )}
          {sessionList.map(s => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-full text-left p-3 rounded-lg transition-all group relative border ${
                activeSessionId === s.id 
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-100' 
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold truncate pr-4">{s.id}</span>
                {s.isUserTyping && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded animate-pulse">TYPING</span>
                )}
              </div>
              <div className="text-[9px] opacity-60 truncate">
                {s.messages[s.messages.length - 1]?.content || 'Connected...'}
              </div>
              <div className="mt-2 text-[8px] opacity-40 flex justify-between">
                <span>{new Date(s.lastActive).toLocaleTimeString()}</span>
                <span className="group-hover:text-rose-400" onClick={(e) => { e.stopPropagation(); onPurgeSession(s.id); }}>[PURGE]</span>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 bg-black/20 text-[9px] text-slate-600 border-t border-slate-800">
          <a href="#/user" className="hover:text-slate-400 transition underline underline-offset-4">OPEN TARGET VIEW</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {activeSession ? (
          <>
            {/* Header */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400">SESSION: <span className="text-rose-400">{activeSession.id}</span></span>
                <div className="h-4 w-px bg-slate-800"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase text-slate-600">Buffer:</span>
                  <span className="text-[10px] text-emerald-500/80 font-bold truncate max-w-[200px]">
                    {activeSession.userDraft || '---'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onToggleThinking(activeSession.id, !activeSession.isThinking)}
                className={`text-[10px] uppercase font-bold px-3 py-1 rounded border transition-all ${
                  activeSession.isThinking ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {activeSession.isThinking ? 'SIMULATING_THINK' : 'IDLE'}
              </button>
            </header>

            {/* Log / Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/50">
              {activeSession.messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === Role.USER ? 'items-start' : 'items-end'}`}>
                  <div className="flex gap-2 items-center mb-1 px-1">
                    <span className={`text-[8px] font-bold uppercase ${m.role === Role.USER ? 'text-blue-500' : 'text-rose-500'}`}>{m.role}</span>
                    <span className="text-[8px] text-slate-700">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`p-3 rounded-lg text-[12px] max-w-[80%] border ${
                    m.role === Role.USER ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-rose-500/5 border-rose-500/20 text-rose-200'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Injection UI */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 space-y-4">
              <div className="relative">
                <textarea 
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="INJECT RESPONSE..."
                  className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-rose-500/50 transition-all resize-none h-24 placeholder:text-slate-800"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                   <button onClick={() => setResponse("Connecting to neural nodes...")} className="text-[9px] bg-slate-800 hover:bg-slate-700 p-1 px-2 rounded border border-slate-700">Preset A</button>
                   <button onClick={() => setResponse("I apologize for the delay. Processing...")} className="text-[9px] bg-slate-800 hover:bg-slate-700 p-1 px-2 rounded border border-slate-700">Preset B</button>
                </div>
              </div>
              <button 
                onClick={handleSend}
                disabled={!response.trim()}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
              >
                DISPATCH SIGNAL
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 p-10 text-center">
            <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <h2 className="text-xs uppercase tracking-[0.3em] font-black mb-2">Signal Selection Required</h2>
            <p className="text-[10px] max-w-xs">Awaiting manual target synchronization. Select an active session from the manifest to begin signal injection.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PuppeteerPanel;
