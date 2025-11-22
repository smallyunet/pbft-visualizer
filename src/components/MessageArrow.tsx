import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { pathBetween } from '../utils/layout';
import { usePbftStore } from '../store/pbftStore';


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

const themeColors = {
  'pre-prepare': '#0ea5e9',
  'prepare': '#a855f7',
  'commit': '#f59e0b',
};


// Default duration aligned with STEP_MS in phases to complete before next batch.
export default function MessageArrow({ id, from, to, fromId, toId, kind, conflicting, duration = 1.1, payload, alpha = 1 }: MessageArrowProps) {
  const d = useMemo(() => {
    // Add tiny deterministic curvature jitter so parallel edges are easier to distinguish
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
    const jitter = ((h % 7) - 3) * 1.2; // approx [-3.6, +3.6]
    return pathBetween(from, to, jitter);
  }, [from, to, id]);
  const offset = useMemo(() => {
    // Deterministic small offset to reduce label overlap among parallel edges
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
    const options = ['45%', '50%', '55%'];
    return options[h % options.length];
  }, [id]);


  const [hover, setHover] = useState(false);
  const { phase, focusCurrentPhase, hoveredNodeId, showLabels } = usePbftStore((s) => ({ phase: s.phase, focusCurrentPhase: s.focusCurrentPhase, hoveredNodeId: s.hoveredNodeId, showLabels: s.showLabels }));
  // Dim messages not belonging to current phase when focusCurrentPhase is enabled.
  const phaseAlpha = focusCurrentPhase && kind !== phase ? 0.15 : 1;
  const hoverEmphasis = hoveredNodeId != null && (fromId === hoveredNodeId || toId === hoveredNodeId) ? 1 : 0.35;
  const finalOpacity = alpha * phaseAlpha * hoverEmphasis;
  // Compute arrow head geometry manually so we can delay its appearance until line mostly drawn.
  const headSize = 14; // slightly smaller to reduce overlap
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  // Points for triangle (tip at 'to') rotated by angle.
  const makeHeadPath = () => {
    if (len === 0) { return ''; }
    const tipX = to.x;
    const tipY = to.y;
    const backX = tipX - Math.cos(angle) * headSize;
    const backY = tipY - Math.sin(angle) * headSize;
    const orthoX = -Math.sin(angle);
    const orthoY = Math.cos(angle);
    const wingSpread = headSize * 0.45;
    const leftX = backX + orthoX * wingSpread;
    const leftY = backY + orthoY * wingSpread;
    const rightX = backX - orthoX * wingSpread;
    const rightY = backY - orthoY * wingSpread;
    return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
  };

  return (
    <g aria-label={`${kind} ${id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <title>{`${kind.toUpperCase()} ${fromId != null ? `n${fromId}` : ''}${fromId != null || toId != null ? '->' : ''}${toId != null ? `n${toId}` : ''}${payload ? ` payload=${payload}` : ''}${conflicting ? ' (conflict)' : ''}`}</title>
      <motion.path
        id={`path-${id}`}
        d={d}
        className={`${conflicting ? 'stroke-node-faulty' : colorByKind[kind]} ${conflicting ? 'stroke-[5px] stroke-dasharray-[7_7]' : 'stroke-[4px]'} fill-none`}
        style={{ opacity: finalOpacity * (conflicting ? 0.9 : 1) }}
        // Use pathLength animation for stroke reveal only; remove markerEnd to prevent premature head display.
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: finalOpacity * (conflicting ? 0.9 : 1) }}
        transition={{ duration, ease: [0.3, 0, 0.2, 1] }}
        filter={conflicting ? 'url(#conflictGlow)' : hover ? 'url(#edgeGlow)' : undefined}
      />
      {/* Arrow head rendered separately; delayed so line begins drawing first. */}
      {len > 0 && (
        <motion.path
          d={makeHeadPath()}
          className={`${conflicting ? 'stroke-node-faulty' : colorByKind[kind]} fill-none stroke-[4px]`}
          style={{ opacity: finalOpacity }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: finalOpacity, scale: 1 }}
          transition={{ delay: duration * 0.85, duration: 0.15, ease: 'easeOut' }}
          filter={conflicting ? 'url(#conflictGlow)' : hover ? 'url(#edgeGlow)' : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {/* A traveling dot to emphasize direction */}
      {!conflicting && (
        <motion.circle
          r={5}
          fill={themeColors[kind]}
          style={{ offsetPath: `path("${d}")` }}
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={{ offsetDistance: "100%", opacity: finalOpacity }}
          transition={{ duration, ease: [0.3, 0, 0.2, 1] }}
        />
      )}
      {/* Arrival Burst */}
      {!conflicting && (
        <motion.circle
          cx={to.x}
          cy={to.y}
          r={0}
          fill="none"
          stroke={themeColors[kind]}
          strokeWidth={2}
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: 30, opacity: [0, 0.8, 0] }}
          transition={{ delay: duration * 0.9, duration: 0.6, ease: "easeOut" }}
        />
      )}
      {/* Payload label along the path */}


// Default duration aligned with STEP_MS in phases to complete before next batch.
export default function MessageArrow({ id, from, to, fromId, toId, kind, conflicting, duration = 1.1, payload, alpha = 1 }: MessageArrowProps) {
  const d = useMemo(() => {
    // Add tiny deterministic curvature jitter so parallel edges are easier to distinguish
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
    const jitter = ((h % 7) - 3) * 1.2; // approx [-3.6, +3.6]
    return pathBetween(from, to, jitter);
  }, [from, to, id]);
  const offset = useMemo(() => {
    // Deterministic small offset to reduce label overlap among parallel edges
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
    const options = ['45%', '50%', '55%'];
    return options[h % options.length];
  }, [id]);


  const [hover, setHover] = useState(false);
  const { phase, focusCurrentPhase, hoveredNodeId, showLabels } = usePbftStore((s) => ({ phase: s.phase, focusCurrentPhase: s.focusCurrentPhase, hoveredNodeId: s.hoveredNodeId, showLabels: s.showLabels }));
  // Dim messages not belonging to current phase when focusCurrentPhase is enabled.
  const phaseAlpha = focusCurrentPhase && kind !== phase ? 0.15 : 1;
  const hoverEmphasis = hoveredNodeId != null && (fromId === hoveredNodeId || toId === hoveredNodeId) ? 1 : 0.35;
  const finalOpacity = alpha * phaseAlpha * hoverEmphasis;
  // Compute arrow head geometry manually so we can delay its appearance until line mostly drawn.
  const headSize = 14; // slightly smaller to reduce overlap
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  // Points for triangle (tip at 'to') rotated by angle.
  const makeHeadPath = () => {
    if (len === 0) { return ''; }
    const tipX = to.x;
    const tipY = to.y;
    const backX = tipX - Math.cos(angle) * headSize;
    const backY = tipY - Math.sin(angle) * headSize;
    const orthoX = -Math.sin(angle);
    const orthoY = Math.cos(angle);
    const wingSpread = headSize * 0.45;
    const leftX = backX + orthoX * wingSpread;
    const leftY = backY + orthoY * wingSpread;
    const rightX = backX - orthoX * wingSpread;
    const rightY = backY - orthoY * wingSpread;
    return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
  };

  return (
    <g aria-label={`${kind} ${id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <title>{`${kind.toUpperCase()} ${fromId != null ? `n${fromId}` : ''}${fromId != null || toId != null ? '->' : ''}${toId != null ? `n${toId}` : ''}${payload ? ` payload=${payload}` : ''}${conflicting ? ' (conflict)' : ''}`}</title>
      <motion.path
        id={`path-${id}`}
        d={d}
        className={`${conflicting ? 'stroke-node-faulty' : colorByKind[kind]} ${conflicting ? 'stroke-[5px] stroke-dasharray-[7_7]' : 'stroke-[4px]'} fill-none`}
        style={{ opacity: finalOpacity * (conflicting ? 0.9 : 1) }}
        // Use pathLength animation for stroke reveal only; remove markerEnd to prevent premature head display.
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: finalOpacity * (conflicting ? 0.9 : 1) }}
        transition={{ duration, ease: [0.3, 0, 0.2, 1] }}
        filter={conflicting ? 'url(#conflictGlow)' : hover ? 'url(#edgeGlow)' : undefined}
      />
      {/* Arrow head rendered separately; delayed so line begins drawing first. */}
      {len > 0 && (
        <motion.path
          d={makeHeadPath()}
          className={`${conflicting ? 'stroke-node-faulty' : colorByKind[kind]} fill-none stroke-[4px]`}
          style={{ opacity: finalOpacity }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: finalOpacity, scale: 1 }}
          transition={{ delay: duration * 0.65, duration: 0.35, ease: 'easeOut' }}
          filter={conflicting ? 'url(#conflictGlow)' : hover ? 'url(#edgeGlow)' : undefined}
          strokeLinejoin="round"
        />
      )}
      {/* A traveling dot to emphasize direction */}
      <motion.circle
        r={6}
        className={`${conflicting ? 'stroke-node-faulty fill-white' : `${colorByKind[kind]} fill-white`} stroke-[2px]`}
        style={{ opacity: finalOpacity }}
        filter={conflicting ? 'url(#conflictGlow)' : undefined}
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
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
      {payload && (hover || showLabels) && (
        <g style={{ opacity: finalOpacity }}>
          {/* Outline duplicate for better contrast on busy backgrounds */}
          <text className="text-[12px] fill-white stroke-white stroke-[4px] opacity-80">
            <textPath href={`#path-${id}`} startOffset={offset} textAnchor="middle">{payload}</textPath>
          </text>
          <text className={`${conflicting ? 'fill-red-600' : 'fill-slate-700'} text-[12px]`}>
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