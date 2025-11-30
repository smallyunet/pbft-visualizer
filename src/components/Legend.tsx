import React from 'react';

export default function Legend() {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-3 text-xs transition-all duration-300 hover:shadow-xl">
      <div className="uppercase tracking-wide text-slate-500 font-semibold text-[10px] mb-2">Legend</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {/* Message Types */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 bg-sky-500 rounded text-white text-[8px] font-bold flex items-center justify-center">PP</div>
          <span className="text-slate-600 text-[11px]">Pre-prepare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 bg-purple-500 rounded text-white text-[8px] font-bold flex items-center justify-center">P</div>
          <span className="text-slate-600 text-[11px]">Prepare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 bg-amber-500 rounded text-white text-[8px] font-bold flex items-center justify-center">C</div>
          <span className="text-slate-600 text-[11px]">Commit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 bg-green-500 rounded text-white text-[8px] font-bold flex items-center justify-center">OK</div>
          <span className="text-slate-600 text-[11px]">Reply</span>
        </div>
        
        {/* Node Types */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-emerald-500 rounded-full border border-white shadow-sm"></div>
          <span className="text-slate-600 text-[11px]">Leader</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-blue-500 rounded-full border border-white shadow-sm"></div>
          <span className="text-slate-600 text-[11px]">Replica</span>
        </div>
      </div>
    </div>
  );
}