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

  const current = phase === 'prepare' ? prepareCount : phase === 'commit' ? commitCount : 0;
  const pct = Math.min(100, (current / needed) * 100);
  if (phase === 'pre-prepare') return null;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-4 transition-all duration-300 hover:shadow-xl animate-slide-in-right">
      <div className="uppercase tracking-wide text-slate-500 font-semibold text-xs mb-2">Threshold</div>
      <div className="mb-2 text-slate-700 text-xs sm:text-sm font-medium">Collected {current} / {needed} {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (need 2f+1)</div>
      <div className="progress-bg w-full h-4 rounded-full overflow-hidden relative">
        <motion.div 
          className="progress-fill h-4" 
          initial={{ width: 0 }}
          animate={{ width: pct + '%' }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-slate-700/80 select-none">{Math.round(pct)}%</div>
      </div>
    </div>
  );
}
