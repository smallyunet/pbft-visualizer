import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [hover, setHover] = useState(false);

  // Vote Accumulator Logic
  const prepareCount = stats?.prepare ?? 0;
  const commitCount = stats?.commit ?? 0;

  // Helper to render vote slots
  const renderSlots = (count: number, total: number, colorClass: string, emptyClass: string) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i < count ? 1 : 0.8,
              opacity: i < count ? 1 : 0.3,
              backgroundColor: i < count ? 'currentColor' : 'transparent'
            }}
            className={`w-2 h-3 rounded-sm border border-current ${i < count ? colorClass : emptyClass}`}
          />
        ))}
      </div>
    );
  };

  return (
    <g transform={`translate(${x}, ${y})`} onMouseEnter={() => { setHover(true); setHoveredNodeId(node.id); }} onMouseLeave={() => { setHover(false); setHoveredNodeId(null); }}>
      <title>{`Node n${node.id} (${node.role}) state=${node.state} status=${status ?? 'idle'} P=${prepareCount} C=${commitCount}`}</title>

      {/* Main Node Circle */}
      <motion.circle
        r={42}
        className={`${roleColor(node.role)} ${strokeByState(node.state)} stroke-[4px]`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        filter={node.role === 'leader' ? 'url(#leaderGlow)' : undefined}
      />

      {/* Pulse Effect for Active Phases */}
      {pulse && (
        <>
          <motion.circle
            cx={0}
            cy={0}
            r={42}
            className="fill-transparent stroke-sky-400/50 stroke-[2px]"
            initial={{ r: 42, opacity: 0.6 }}
            animate={{ r: 68, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Status Ring (Prepared/Committed) */}
      {(status === 'prepared' || status === 'committed') && (
        <motion.circle
          cx={0}
          cy={0}
          r={48}
          className={`fill-transparent ${status === 'committed' ? 'stroke-amber-400/30' : 'stroke-purple-400/30'} stroke-[2px] stroke-dasharray-[6_10]`}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Node Label */}
      <text x={0} y={4} textAnchor="middle" className="fill-white font-bold text-lg select-none pointer-events-none">
        {node.role === 'leader' ? 'L' : `N${node.id}`}
      </text>
      <text x={0} y={26} textAnchor="middle" className="fill-white text-[10px] opacity-90 select-none font-medium pointer-events-none">
        {node.state === 'faulty' ? 'FAULTY' : 'NORMAL'}
      </text>

      {/* Status Badge */}
      <AnimatePresence>
        {showBadge && (
          <foreignObject x={-35} y={-65} width={70} height={24}>
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                key={status}
                initial={{ scale: 0.7, opacity: 0, y: 5 }}
                animate={{ scale: 1.0, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className={`text-[10px] uppercase tracking-wider text-white text-center rounded-full shadow-sm ${badgeColor} px-2 py-0.5 font-bold`}
              >
                {status}
              </motion.div>
            </div>
          </foreignObject>
        )}
      </AnimatePresence>

      {/* Vote Accumulators (The Ballot Box) */}
      <foreignObject x={48} y={-30} width={60} height={60}>
        <div className="flex flex-col gap-1.5 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100">
          {/* Prepare Votes */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-purple-600 uppercase leading-none">Prep</span>
            <div className="text-purple-500">
              {renderSlots(prepareCount, needed, 'bg-purple-500', 'border-purple-200')}
            </div>
          </div>

          {/* Commit Votes */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-amber-600 uppercase leading-none">Com</span>
            <div className="text-amber-500">
              {renderSlots(commitCount, needed, 'bg-amber-500', 'border-amber-200')}
            </div>
          </div>
        </div>
      </foreignObject>

      {/* Tooltip */}
      {hover && (
        <foreignObject x={-84} y={-150} width={168} height={112}>
          <div className="tooltip-card">
            <div className="tooltip-title">n{node.id} {node.role === 'leader' ? '(Leader)' : ''}</div>
            <div className="tooltip-grid">
              <div>State:</div><div>{node.state}</div>
              <div>Status:</div><div>{status ?? 'idle'}</div>
              <div>Prepare:</div><div>{prepareCount}/{needed}</div>
              <div>Commit:</div><div>{commitCount}/{needed}</div>
              <div>Phase:</div><div>{phase}</div>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}