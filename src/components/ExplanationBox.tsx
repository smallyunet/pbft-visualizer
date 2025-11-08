import React, { useMemo } from 'react';
import { usePbftStore } from '../store/pbftStore';


export default function ExplanationBox() {
  const { phase, explanation, f, round, value, nextIncrement, expectedPayload, timeline } = usePbftStore();
  const title = phase === 'pre-prepare' ? 'Pre‑prepare' : phase === 'prepare' ? 'Prepare' : 'Commit';
  const needed = 2 * f + 1;
  const prepareCollected = useMemo(() => timeline.filter(m => m.kind === 'prepare' && !m.conflicting && m.payload === expectedPayload).length, [timeline, expectedPayload]);
  const commitCollected = useMemo(() => timeline.filter(m => m.kind === 'commit' && !m.conflicting && m.payload === expectedPayload).length, [timeline, expectedPayload]);
  const currentCollected = phase === 'prepare' ? prepareCollected : phase === 'commit' ? commitCollected : 0;
  const remaining = Math.max(0, needed - currentCollected);
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">Phase</div>
      <div className="text-xl font-semibold mb-2">{title}</div>
      <p className="text-slate-700 leading-relaxed">{explanation}</p>
      {phase !== 'pre-prepare' && (
        <div className="mt-3 text-[11px] text-slate-600 font-mono">
          Need 2f + 1 = {needed} matching {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (f = {f}). Collected {currentCollected}/{needed}{remaining > 0 ? ` (need ${remaining} more)` : ' ✓ threshold met'}
        </div>
      )}
      <div className="mt-3 text-[11px] text-slate-600 font-mono">
        Round {round}: proposed delta {expectedPayload}, current value {value}, after commit → {value + nextIncrement}
      </div>
    </div>
  );
}