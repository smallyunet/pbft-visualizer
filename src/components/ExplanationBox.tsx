import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import type { PbftState } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export default function ExplanationBox(): React.ReactElement {
  const { phase, explanation, f, round, value, nextIncrement, expectedPayload, nodeStats, nodes } = usePbftStore(
    (s: PbftState) => ({
      phase: s.phase,
      explanation: s.explanation,
      f: s.f,
      round: s.round,
      value: s.value,
      nextIncrement: s.nextIncrement,
      expectedPayload: s.expectedPayload,
      nodeStats: s.nodeStats,
      nodes: s.nodes,
    }),
    shallow
  );
  const title = phase === 'pre-prepare' ? 'Pre‑prepare' : phase === 'prepare' ? 'Prepare' : 'Commit';
  const needed = 2 * f + 1;
  const healthy = useMemo(() => nodeStats.filter((_, idx) => nodes[idx]?.state !== 'faulty'), [nodeStats, nodes]);
  const prepareCollected = useMemo(() => {
    if (!healthy.length) return 0;
    return Math.min(...healthy.map((st) => st.prepare));
  }, [healthy]);
  const commitCollected = useMemo(() => {
    if (!healthy.length) return 0;
    return Math.min(...healthy.map((st) => st.commit));
  }, [healthy]);
  const currentCollected = phase === 'prepare' ? prepareCollected : phase === 'commit' ? commitCollected : 0;
  const remaining = Math.max(0, needed - currentCollected);
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-blue-900/20 animate-slide-in-right">
      <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Phase</div>
  <div className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">{title}</div>
  <AnimatePresence mode="wait">
    <motion.p
      key={explanation}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="text-slate-200 leading-relaxed text-base font-light"
    >
      {explanation}
    </motion.p>
  </AnimatePresence>
      {phase !== 'pre-prepare' && (
        <div className="mt-4 p-3 bg-blue-950/40 rounded-lg text-xs sm:text-sm text-blue-200 font-mono border border-blue-800/50 leading-relaxed shadow-inner">
          Need 2f + 1 = {needed} matching {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (counts local vote, f = {f}). Collected {currentCollected}/{needed}{remaining > 0 ? ` (need ${remaining} more)` : ' ✓ threshold met'}
        </div>
      )}
      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-xs sm:text-sm text-slate-300 font-mono border border-slate-700/50 leading-relaxed shadow-inner">
        Round {round}: proposed delta {expectedPayload}, current value {value}, after commit → {value + nextIncrement}
      </div>
    </div>
  );
}
