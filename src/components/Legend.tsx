import React from 'react';

export default function Legend() {
  return (
  <div className="bg-white rounded-xl shadow p-3 text-sm">
      <div className="uppercase tracking-wide text-slate-500 mb-2">Legend</div>
      <ul className="space-y-1">
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