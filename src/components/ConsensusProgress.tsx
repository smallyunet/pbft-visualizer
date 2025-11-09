import React, { useMemo } from 'react';
import { usePbftStore } from '../store/pbftStore';
import type { PbftState, RenderedMessage } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';

// Progress bar showing matching (non-conflicting) messages collected toward 2f+1 threshold.
export default function ConsensusProgress(): React.ReactElement | null {
  const { timeline, phase, f, expectedPayload } = usePbftStore(
    (s: PbftState) => ({ timeline: s.timeline, phase: s.phase, f: s.f, expectedPayload: s.expectedPayload }),
    shallow
  );
  const needed = 2 * f + 1;

  const prepareCount = useMemo(
    () => timeline.filter((m: RenderedMessage) => m.kind === 'prepare' && !m.conflicting && m.payload === expectedPayload).length,
    [timeline, expectedPayload]
  );
  const commitCount = useMemo(
    () => timeline.filter((m: RenderedMessage) => m.kind === 'commit' && !m.conflicting && m.payload === expectedPayload).length,
    [timeline, expectedPayload]
  );

  const current = phase === 'prepare' ? prepareCount : phase === 'commit' ? commitCount : 0;
  const pct = Math.min(100, (current / needed) * 100);
  if (phase === 'pre-prepare') return null;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-4 transition-all duration-300 hover:shadow-xl">
      <div className="uppercase tracking-wide text-slate-500 font-semibold text-xs mb-2">Threshold</div>
      <div className="mb-2 text-slate-700 text-sm font-medium">Collected {current} / {needed} {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (need 2f+1)</div>
      <div className="progress-bg w-full h-4 rounded-full overflow-hidden">
        <div className="progress-fill h-4" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}