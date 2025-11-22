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
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-5 transition-all duration-300 hover:shadow-xl">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Phase</div>
  <div className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</div>
  <AnimatePresence mode="wait">
    <motion.p
      key={explanation}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="text-slate-700 leading-relaxed text-base"
    >
      {explanation}
    </motion.p>
  </AnimatePresence>
      {phase !== 'pre-prepare' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-slate-700 font-mono border border-blue-200">
          Need 2f + 1 = {needed} matching {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (counts local vote, f = {f}). Collected {currentCollected}/{needed}{remaining > 0 ? ` (need ${remaining} more)` : ' ✓ threshold met'}
        </div>
      )}
      <div className="mt-3 p-3 bg-slate-100 rounded-lg text-sm text-slate-700 font-mono border border-slate-200">
        Round {round}: proposed delta {expectedPayload}, current value {value}, after commit → {value + nextIncrement}
      </div>
    </div>
  );
}
