
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';

interface PuppeteerPanelProps {
  userDraft: string;
  isThinking: boolean;
  lastUserMessage?: Message;
  onSendResponse: (text: string) => void;
  onToggleThinking: (thinking: boolean) => void;
}

const PuppeteerPanel: React.FC<PuppeteerPanelProps> = ({ 
  userDraft, 
  isThinking, 
  lastUserMessage, 
  onSendResponse, 
  onToggleThinking 
}) => {
  const [response, setResponse] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!response.trim()) return;
    onSendResponse(response);
    setResponse('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 gap-6 text-slate-300">
      
      {/* Target Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Real-time User Buffer
          </div>
          <div className="min-h-[50px] text-emerald-400 font-mono text-sm break-all leading-relaxed">
            {userDraft || <span className="text-slate-700 italic">Waiting for target to type...</span>}
            {userDraft && <span className="animate-pulse ml-1 text-emerald-500">|</span>}
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="text-[10px] text-slate-500 font-mono mb-1 uppercase tracking-widest">Model Simulation Parameters</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">STATE:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isThinking ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-500'}`}>
                {isThinking ? 'THINKING_SIM' : 'READY_TO_DISPATCH'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full bg-indigo-500 transition-all duration-1000 ${isThinking ? 'w-full animate-pulse' : 'w-0'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Interface */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Response Payload</h2>
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-rose-500"></div>
              <div className="w-1 h-3 bg-rose-500 opacity-50"></div>
              <div className="w-1 h-3 bg-rose-500 opacity-20"></div>
            </div>
          </div>
          
          <button 
            onClick={() => onToggleThinking(!isThinking)}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${isThinking ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
          >
            <span className="text-[10px] font-bold uppercase">{isThinking ? 'Stop Thinking' : 'Start Thinking'}</span>
            <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>
          </button>
        </div>

        <div className="flex-1 relative group">
          <textarea
            ref={textAreaRef}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Compose Gemini's response here... (Ctrl + Enter to send)"
            className="w-full h-full bg-slate-900/80 border border-slate-800 rounded-xl p-5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all resize-none shadow-inner text-indigo-100 placeholder:text-slate-700"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
             <button 
              onClick={() => setResponse("I'm experiencing a momentary connection issue. Please bear with me.")}
              className="px-3 py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition font-bold"
            >
              Lag Script
            </button>
            <button 
              onClick={() => setResponse("As a large language model, I don't have feelings, but I'm here to help!")}
              className="px-3 py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition font-bold"
            >
              Bot Script
            </button>
          </div>
        </div>

        <button 
          onClick={handleSend}
          disabled={!response.trim()}
          className="group relative overflow-hidden w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-black rounded-xl transition-all shadow-xl active:scale-[0.99]"
        >
          <div className="relative z-10 flex items-center justify-center gap-2 tracking-[0.2em] text-sm uppercase">
            Execute Signal Injection
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      </div>

      {/* Terminal Footer */}
      <div className="bg-black/40 rounded-lg p-4 font-mono text-[10px] text-slate-600 border border-slate-900 space-y-2">
        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-slate-500">SYSTEM_DIAGNOSTICS</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-900">UPTIME: 04:12:88</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span>NODE: US-EAST-1</span>
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-indigo-900/50 flex gap-2">
            <span>[INFO]</span>
            <span>Link established via BroadcastChannel protocol</span>
          </p>
          {lastUserMessage && (
            <p className="text-rose-900/70 flex gap-2">
              <span>[RECV]</span>
              <span className="truncate">"{lastUserMessage.content}"</span>
            </p>
          )}
          <p className="text-slate-800">&gt; awaiting next user event...</p>
        </div>
      </div>
    </div>
  );
};

export default PuppeteerPanel;
