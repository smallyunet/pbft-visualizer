import React from 'react';

export default function Legend() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-3xl border border-white/10 p-4 text-xs transition-transform duration-500 hover:scale-[1.02]">
      <div className="uppercase tracking-[0.2em] text-slate-500 font-black text-[10px] mb-4 flex items-center gap-2">
        <div className="w-1 h-3 bg-indigo-500 rounded-full" />
        Legend
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Message Types */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-5 bg-sky-500 rounded-md text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">PP</div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight">Pre-prepare</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-5 bg-violet-500 rounded-md text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)]">P</div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight">Prepare</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-5 bg-amber-500 rounded-md text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">C</div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight">Commit</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-5 bg-emerald-500 rounded-md text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">OK</div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight">Reply</span>
        </div>

        {/* Node Types */}
        <div className="flex items-center gap-2.5 mt-1">
          <div className="w-4 h-4 bg-emerald-400 rounded-full border border-white/20 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight uppercase">Leader</span>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <div className="w-4 h-4 bg-indigo-400 rounded-full border border-white/20 shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
          <span className="text-slate-400 font-bold text-[10px] tracking-tight uppercase">Replica</span>
        </div>

        {/* Vote Progress Indicators */}
        <div className="col-span-2 mt-2 pt-4 border-t border-white/5">
          <div className="text-[9px] uppercase text-slate-500 font-black mb-3 tracking-widest">Quorum Progress</div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full rotate-[-90deg]">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="12" cy="12" r="8" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="25 50" strokeLinecap="round" className="drop-shadow-[0_0_3px_rgba(139,92,246,0.5)]" />
                </svg>
              </div>
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-tight">Prepare</span>
            </div>
            <div className="w-px h-12 bg-white/5" />
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full rotate-[-90deg]">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="35 60" strokeLinecap="round" className="drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
                </svg>
              </div>
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-tight">Commit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}