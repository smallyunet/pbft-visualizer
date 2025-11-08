import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { pathBetween } from '../utils/layout';


export type MessageArrowProps = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  fromId?: number;
  toId?: number;
  kind: 'pre-prepare' | 'prepare' | 'commit';
  conflicting?: boolean;
  duration?: number; // seconds for draw animation
  payload?: string;
  alpha?: number; // dynamic opacity for fade-out (0..1)
};


// Map message kind to stroke style for teaching clarity
const colorByKind: Record<MessageArrowProps['kind'], string> = {
  'pre-prepare': 'stroke-stage-pre',
  'prepare': 'stroke-stage-prepare',
  'commit': 'stroke-stage-commit',
};


// Default duration aligned with STEP_MS in phases to complete before next batch.
export default function MessageArrow({ id, from, to, fromId, toId, kind, conflicting, duration = 1.1, payload, alpha = 1 }: MessageArrowProps) {
  const d = useMemo(() => pathBetween(from, to), [from, to]);
  const offset = useMemo(() => {
    // Deterministic small offset to reduce label overlap among parallel edges
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
    const options = ['45%', '50%', '55%'];
    return options[h % options.length];
  }, [id]);


  const [hover, setHover] = useState(false);
  return (
    <g aria-label={`${kind} ${id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <title>{`${kind.toUpperCase()} ${fromId != null ? `n${fromId}` : ''}${fromId != null || toId != null ? '->' : ''}${toId != null ? `n${toId}` : ''}${payload ? ` payload=${payload}` : ''}${conflicting ? ' (conflict)' : ''}`}</title>
      <motion.path
        id={`path-${id}`}
        d={d}
        className={`${conflicting ? 'stroke-node-faulty' : colorByKind[kind]} ${conflicting ? 'stroke-[4px] stroke-dasharray-[7_7]' : 'stroke-[4px]'} fill-none`}
        style={{ opacity: alpha * (conflicting ? 0.9 : 1) }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration, ease: 'easeOut' }}
        markerEnd="url(#arrowhead)"
      />
      {/* A traveling dot to emphasize direction */}
      <motion.circle r={6} className={`${conflicting ? 'stroke-node-faulty fill-white' : `${colorByKind[kind]} fill-white`}`} style={{ opacity: alpha }}>
        <animateMotion
          path={d}
          dur={`${duration}s`}
          begin="0s"
          fill="freeze"
          keyPoints="0;1"
          keyTimes="0;1"
          calcMode="linear"
        />
      </motion.circle>
      {/* Payload label along the path */}
      {payload && (
        <g style={{ opacity: alpha }}>
          {/* Outline duplicate for better contrast on busy backgrounds */}
          <text className="text-[11px] fill-white stroke-white stroke-[4px] opacity-80">
            <textPath href={`#path-${id}`} startOffset={offset} textAnchor="middle">{payload}</textPath>
          </text>
          <text className={`text-[11px] ${conflicting ? 'fill-red-600' : 'fill-slate-700'}`}>
            <textPath href={`#path-${id}`} startOffset={offset} textAnchor="middle">{payload}</textPath>
          </text>
        </g>
      )}
      {hover && (
        <foreignObject x={Math.min(from.x, to.x) + (to.x - from.x) / 2 - 84} y={Math.min(from.y, to.y) + (to.y - from.y) / 2 - 70} width={168} height={92}>
          <div className="tooltip-card">
            <div className="tooltip-title">{kind.toUpperCase()}</div>
            <div className="tooltip-grid">
              <div>From:</div><div>{fromId != null ? `n${fromId}` : '—'}</div>
              <div>To:</div><div>{toId != null ? `n${toId}` : '—'}</div>
              <div>Payload:</div><div>{payload ?? '—'}</div>
              <div>Status:</div><div>{conflicting ? 'conflict' : 'ok'}</div>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}