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
  kind: 'request' | 'pre-prepare' | 'prepare' | 'commit' | 'reply';
  conflicting?: boolean;
  duration?: number; // seconds for draw animation
  payload?: string;
  alpha?: number; // dynamic opacity for fade-out (0..1)
};

// Map message kind to stroke style
const colorByKind: Record<MessageArrowProps['kind'], string> = {
  'request': 'stroke-slate-500',
  'pre-prepare': 'stroke-stage-pre',
  'prepare': 'stroke-stage-prepare',
  'commit': 'stroke-stage-commit',
  'reply': 'stroke-slate-500',
};

// Icon Definitions
const Icons = {
  request: (
    <g transform="translate(-12, -12)">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" />
    </g>
  ),
  'pre-prepare': (
    <g transform="translate(-12, -12)">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="currentColor" strokeWidth="2" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
    </g>
  ),
  'prepare': (
    <g transform="translate(-12, -12)">
      <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  'commit': (
    <g transform="translate(-12, -12)">
      <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8L10 14L8 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'reply': (
    <g transform="translate(-12, -12)">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
};

export default function MessageArrow({ id, from, to, fromId, toId, kind, conflicting, duration = 1.1, payload, alpha = 1 }: MessageArrowProps) {
  const d = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
    const jitter = ((h % 7) - 3) * 1.2;
    return pathBetween(from, to, jitter);
  }, [from, to, id]);

  const [hover, setHover] = useState(false);
  const { phase, focusCurrentPhase, hoveredNodeId, showLabels } = usePbftStore((s) => ({ phase: s.phase, focusCurrentPhase: s.focusCurrentPhase, hoveredNodeId: s.hoveredNodeId, showLabels: s.showLabels }));

  const phaseAlpha = focusCurrentPhase && kind !== phase ? 0.15 : 1;
  const hoverEmphasis = hoveredNodeId == null || (fromId === hoveredNodeId || toId === hoveredNodeId) ? 1 : 0.1;
  const finalOpacity = alpha * phaseAlpha * hoverEmphasis;

  const colorClass = conflicting ? 'text-red-600' : (kind === 'request' || kind === 'reply') ? 'text-slate-500' : {
    'pre-prepare': 'text-sky-500',
    'prepare': 'text-purple-500',
    'commit': 'text-amber-500',
  }[kind];

  const strokeClass = conflicting ? 'stroke-red-600' : (kind === 'request' || kind === 'reply') ? 'stroke-slate-400' : colorByKind[kind];

  return (
    <g aria-label={`${kind} ${id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <title>{`${kind.toUpperCase()} ${fromId != null ? `n${fromId}` : 'Client'}${fromId != null || toId != null ? '->' : ''}${toId != null ? `n${toId}` : 'Client'}`}</title>

      {/* Path Line - Faint Guide Rail (restored for context) */}
      <motion.path
        id={`path-${id}`}
        d={d}
        className={`${strokeClass} ${conflicting ? 'stroke-[4px] stroke-dasharray-[4_4]' : 'stroke-[2px]'} fill-none`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: hover ? 0.6 : 0.15 }}
        transition={{ duration, ease: "linear" }}
      />

      {/* Traveling Icon */}
      <motion.g
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration, ease: "linear" }}
        style={{ offsetPath: `path("${d}")`, opacity: finalOpacity }}
        className={colorClass}
      >
        <g transform="scale(1.2) translate(-12, -12)">
          {Icons[kind]}
        </g>
      </motion.g>
    </g>
  );
}