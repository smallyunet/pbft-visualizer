import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { NodeUi } from '../store/pbftStore';
import { usePbftStore } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export type NodeProps = {
  node: NodeUi;
  x: number;
  y: number;
};


const roleColor = (role: NodeUi['role']) => (role === 'leader' ? 'fill-node-leader' : 'fill-node-normal');
const strokeByState = (s: NodeUi['state']) => (s === 'faulty' ? 'stroke-node-faulty' : 'stroke-node-normal-stroke');


export default function Node({ node, x, y }: NodeProps) {
  const { nodeStats, f, phase, expectedPayload, setHoveredNodeId } = usePbftStore(
    (s) => ({ nodeStats: s.nodeStats, f: s.f, phase: s.phase, expectedPayload: s.expectedPayload, setHoveredNodeId: s.setHoveredNodeId }),
    shallow
  );
  const stats = nodeStats[node.id];
  const status = stats?.status;
  const badgeColor = status === 'committed' ? 'bg-green-600' : status === 'prepared' ? 'bg-purple-600' : status === 'proposed' ? 'bg-sky-600' : 'bg-slate-500';
  const showBadge = !!status && status !== 'idle';
  const needed = 2 * f + 1;
  const pulse = phase === 'prepare' || phase === 'commit';

  // Emphasize the active phase count
  const reachedPrepare = (stats?.prepare ?? 0) >= (2 * f + 1);
  const reachedCommit = (stats?.commit ?? 0) >= (2 * f + 1);
  const prepClass = reachedPrepare
    ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-500/70'
    : phase === 'prepare'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-slate-100 text-slate-600';
  const commClass = reachedCommit
    ? 'bg-amber-200 text-amber-800 ring-2 ring-amber-500/70'
    : phase === 'commit'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600';
  const [hover, setHover] = useState(false);
  return (
    <g transform={`translate(${x}, ${y})`} onMouseEnter={() => { setHover(true); setHoveredNodeId(node.id); }} onMouseLeave={() => { setHover(false); setHoveredNodeId(null); }}>
      <title>{`Node n${node.id} (${node.role}) state=${node.state} status=${status ?? 'idle'} P=${stats?.prepare ?? 0} C=${stats?.commit ?? 0}`}</title>
      <motion.circle
        r={36}
        className={`${roleColor(node.role)} ${strokeByState(node.state)} stroke-[4px]`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        filter={node.role === 'leader' ? 'url(#leaderGlow)' : undefined}
      />
      {pulse && (
        <>
          <motion.circle
            cx={0}
            cy={0}
            r={36}
            className="fill-transparent stroke-sky-400/50 stroke-[2px]"
            initial={{ r: 36, opacity: 0.6 }}
            animate={{ r: 58, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={0}
            cy={0}
            r={36}
            className="fill-transparent stroke-purple-400/50 stroke-[2px]"
            initial={{ r: 36, opacity: 0.6 }}
            animate={{ r: 58, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}
      {/* One-off celebration ring when reaching prepared/committed for the first time */}
      {(status === 'prepared' || status === 'committed') && (
        <motion.circle
          key={`celebrate-${status}`}
          cx={0}
          cy={0}
          r={36}
          className={`fill-transparent ${status === 'committed' ? 'stroke-amber-500/70' : 'stroke-purple-500/70'} stroke-[3px]`}
          initial={{ r: 36, opacity: 0.9 }}
          animate={{ r: 74, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      )}
      <text x={0} y={2} textAnchor="middle" className="fill-white font-bold text-base select-none">
        {node.role === 'leader' ? 'Leader' : `N${node.id}`}
      </text>
      <text x={0} y={20} textAnchor="middle" className="fill-white text-sm opacity-90 select-none">
        {node.state === 'faulty' ? 'Faulty' : 'Normal'}
      </text>
      {showBadge && (
        <foreignObject x={-32} y={46} width={64} height={22}>
          <div className="w-full h-full flex items-center justify-center">
            {/* Animate status transitions for better affordance */}
            <motion.div
              key={status}
              initial={{ scale: 0.7, opacity: 0.0, y: -5 }}
              animate={{ scale: 1.0, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`text-sm leading-tight text-white text-center rounded-md shadow-lg ${badgeColor} px-2 py-[3px] font-mono`}
            >
              {status}
            </motion.div>
          </div>
        </foreignObject>
      )}
      {/* Per-node counts: PREP/COM towards 2f+1 */}
      <foreignObject x={-54} y={70} width={108} height={30}>
        <div className="w-full text-[11px] leading-tight text-center flex items-center justify-center gap-1.5">
          <span className={`rounded-md px-1.5 py-0.5 shadow-sm font-semibold ${prepClass}`}>P {stats?.prepare ?? 0}/{needed}</span>
          <span className={`rounded-md px-1.5 py-0.5 shadow-sm font-semibold ${commClass}`}>C {stats?.commit ?? 0}/{needed}</span>
        </div>
      </foreignObject>
      {/* Show proposed delta on leader for clarity */}
      {node.role === 'leader' && (
        <foreignObject x={-22} y={96} width={44} height={20}>
            <div className="w-full text-sm leading-tight text-center rounded bg-slate-200 text-slate-700 font-mono">{expectedPayload}</div>
        </foreignObject>
      )}
      {hover && (
        <foreignObject x={-84} y={-138} width={168} height={112}>
          <div className="tooltip-card">
            <div className="tooltip-title">n{node.id} {node.role === 'leader' ? '(Leader)' : ''}</div>
            <div className="tooltip-grid">
              <div>State:</div><div>{node.state}</div>
              <div>Status:</div><div>{status ?? 'idle'}</div>
              <div>Prepare:</div><div>{stats?.prepare ?? 0}/{needed}</div>
              <div>Commit:</div><div>{stats?.commit ?? 0}/{needed}</div>
              <div>Phase:</div><div>{phase}</div>
              <div>Payload:</div><div>{expectedPayload}</div>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}