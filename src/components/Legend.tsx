import React from 'react';

export default function Legend() {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-4 text-xs sm:text-sm transition-all duration-300 hover:shadow-xl animate-slide-in-right">
      <div className="uppercase tracking-wide text-slate-500 font-semibold text-xs mb-3">Legend</div>
      <ul className="space-y-2.5">
        {/* Message Types */}
        <li className="flex items-center gap-3">
          <div className="w-8 flex justify-center text-slate-500">
            <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
            </svg>
          </div>
          <span className="text-slate-600">Request</span>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 flex justify-center text-sky-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="text-slate-600">Pre-prepare (Proposal)</span>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 flex justify-center text-purple-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-slate-600">Prepare (Vote)</span>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 flex justify-center text-amber-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8L10 14L8 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-slate-600">Commit (Seal)</span>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 flex justify-center text-slate-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-slate-600">Reply</span>
        </li>

        <div className="h-px bg-slate-100 my-2"></div>

        {/* Node Types */}
        <li className="flex items-center gap-3">
          <svg width={24} height={24}><circle cx={12} cy={12} r={10} className="fill-node-leader stroke-slate-700 stroke-[2px]" /></svg>
          <span className="text-slate-600">Leader</span>
        </li>
        <li className="flex items-center gap-3">
          <svg width={24} height={24}><circle cx={12} cy={12} r={10} className="fill-node-normal stroke-slate-700 stroke-[2px]" /></svg>
          <span className="text-slate-600">Replica</span>
        </li>
        <li className="flex items-center gap-3">
          <svg width={24} height={24}><circle cx={12} cy={12} r={10} className="fill-slate-800 stroke-slate-600 stroke-[2px]" /></svg>
          <span className="text-slate-600">Client</span>
        </li>
      </ul>
    </div>
  );
}