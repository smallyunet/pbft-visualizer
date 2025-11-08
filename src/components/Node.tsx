import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { NodeUi } from '../store/pbftStore';
import { usePbftStore } from '../store/pbftStore';


export type NodeProps = {
  node: NodeUi;
  x: number;
  y: number;
};


const roleColor = (role: NodeUi['role']) => (role === 'leader' ? 'fill-node-leader' : 'fill-node-normal');
const strokeByState = (s: NodeUi['state']) => (s === 'faulty' ? 'stroke-node-faulty' : 'stroke-node-normal-stroke');


export default function Node({ node, x, y }: NodeProps) {
  const { nodeStats, f, phase, expectedPayload } = usePbftStore();
  const stats = nodeStats[node.id];
  const status = stats?.status;
  const badgeColor = status === 'committed' ? 'bg-green-600' : status === 'prepared' ? 'bg-purple-600' : status === 'proposed' ? 'bg-sky-600' : 'bg-slate-500';
  const showBadge = !!status && status !== 'idle';
  const needed = 2 * f + 1;
  const pulse = phase === 'prepare' || phase === 'commit';

  // Emphasize the active phase count
  const prepClass = phase === 'prepare' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600';
  const commClass = phase === 'commit' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  const [hover, setHover] = useState(false);
  return (
    <g transform={`translate(${x}, ${y})`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <title>{`Node n${node.id} (${node.role}) state=${node.state} status=${status ?? 'idle'} P=${stats?.prepare ?? 0} C=${stats?.commit ?? 0}`}</title>
      <motion.circle
        r={36}
        className={`${roleColor(node.role)} ${strokeByState(node.state)} stroke-[4px]`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        filter={node.role === 'leader' ? 'url(#leaderGlow)' : undefined}
      />
      {pulse && (
        <circle cx={0} cy={0} r={46} className="fill-transparent stroke-sky-400/40">
          <animate attributeName="r" values="40;54;40" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={0} y={2} textAnchor="middle" className="fill-white font-bold text-[14px] select-none">
        {node.role === 'leader' ? 'Leader' : `N${node.id}`}
      </text>
      <text x={0} y={20} textAnchor="middle" className="fill-white text-[11px] opacity-90 select-none">
        {node.state === 'faulty' ? 'Faulty' : 'Normal'}
      </text>
      {showBadge && (
        <foreignObject x={-32} y={46} width={64} height={22}>
          <div className={`w-full text-[10px] leading-tight text-white text-center rounded ${badgeColor} px-1 py-[3px] font-mono`}>
            {status}
          </div>
        </foreignObject>
      )}
      {/* Per-node counts: PREP/COM towards 2f+1 */}
      <foreignObject x={-38} y={70} width={76} height={22}>
        <div className="w-full text-[10px] leading-tight text-center flex items-center justify-center gap-1">
          <span className={`rounded px-1 ${prepClass}`}>P {stats?.prepare ?? 0}/{needed}</span>
          <span className={`rounded px-1 ${commClass}`}>C {stats?.commit ?? 0}/{needed}</span>
        </div>

      </foreignObject>
      {/* Show proposed delta on leader for clarity */}
      {node.role === 'leader' && (
        <foreignObject x={-22} y={96} width={44} height={20}>
          <div className="w-full text-[10px] leading-tight text-center rounded bg-slate-200 text-slate-700 font-mono">{expectedPayload}</div>
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