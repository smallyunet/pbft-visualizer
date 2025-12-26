import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import type { PbftState } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';

// Progress bar showing matching (non-conflicting) messages collected toward 2f+1 threshold.
export default function ConsensusProgress(): React.ReactElement | null {
  const { phase, f, nodeStats, nodes } = usePbftStore(
    (s: PbftState) => ({ phase: s.phase, f: s.f, nodeStats: s.nodeStats, nodes: s.nodes }),
    shallow
  );
  const needed = 2 * f + 1;

  const healthy = useMemo(() => nodeStats.filter((_, idx) => nodes[idx]?.state !== 'faulty'), [nodeStats, nodes]);
  const prepareCount = useMemo(
    () => (healthy.length ? Math.min(...healthy.map((st) => st.prepare)) : 0),
    [healthy]
  );
  const commitCount = useMemo(
    () => (healthy.length ? Math.min(...healthy.map((st) => st.commit)) : 0),
    [healthy]
  );

  const rawCurrent = phase === 'prepare' ? prepareCount : phase === 'commit' ? commitCount : 0;
  // Cap displayed count at threshold to avoid confusing "4/3" display
  const current = Math.min(rawCurrent, needed);
  const isComplete = rawCurrent >= needed;
  const pct = Math.min(100, (current / needed) * 100);
  if (phase === 'pre-prepare' || phase === 'request') return null;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-3 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="uppercase tracking-wide text-slate-500 font-semibold text-[10px]">
          {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} Votes
        </span>
        <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
          {isComplete && <span className="text-emerald-500">✓</span>}
          {current}/{needed}
        </span>
      </div>
      <div className="progress-bg w-full h-3 rounded-full overflow-hidden relative">
        <motion.div
          className={`progress-fill h-3 ${isComplete ? 'bg-emerald-400' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: pct + '%' }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        />
      </div>
      <div className="text-[10px] text-slate-500 mt-1">Need 2f+1 = {needed} (f={f})</div>
    </div>
  );
}

