import React from 'react';

export default function Legend() {
  return (
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-4 text-sm transition-all duration-300 hover:shadow-xl">
      <div className="uppercase tracking-wide text-slate-500 font-semibold text-xs mb-3">Legend</div>
      <ul className="space-y-2">
        <li className="legend-item">
          <svg width={34} height={12}><line x1={2} y1={6} x2={32} y2={6} className="stroke-stage-pre stroke-[3px]" /></svg>
          Pre‑prepare
        </li>
        <li className="legend-item">
          <svg width={34} height={12}><line x1={2} y1={6} x2={32} y2={6} className="stroke-stage-prepare stroke-[3px]" /></svg>
          Prepare
        </li>
        <li className="legend-item">
          <svg width={34} height={12}><line x1={2} y1={6} x2={32} y2={6} className="stroke-stage-commit stroke-[3px]" /></svg>
          Commit
        </li>
        <li className="legend-item">
          <svg width={34} height={12}><line x1={2} y1={6} x2={32} y2={6} className="stroke-node-faulty stroke-[3px] stroke-dasharray-[6_6]" /></svg>
          Faulty / Conflicting
        </li>
        <li className="legend-item">
          <svg width={28} height={28}><circle cx={14} cy={14} r={12} className="fill-node-leader stroke-slate-700 stroke-[2px]" /></svg>
          Leader
        </li>
        <li className="legend-item">
          <svg width={28} height={28}><circle cx={14} cy={14} r={12} className="fill-node-normal stroke-slate-700 stroke-[2px]" /></svg>
          Replica
        </li>
      </ul>
    </div>
  );
}