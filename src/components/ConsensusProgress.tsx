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
    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <div className="uppercase tracking-wide text-slate-500 mb-1">Threshold</div>
      <div className="mb-1 text-slate-700 text-sm">Collected {current} / {needed} {phase === 'prepare' ? 'PREPARE' : 'COMMIT'} messages (need 2f+1)</div>
      <div className="progress-bg w-full h-3 rounded overflow-hidden">
        <div className="progress-fill h-3" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}