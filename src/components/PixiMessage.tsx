import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Graphics, Container } from '@pixi/react';
import { useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface PixiMessageProps {
    from: { x: number; y: number };
    to: { x: number; y: number };
    kind: 'request' | 'pre-prepare' | 'prepare' | 'commit' | 'reply';
    conflicting?: boolean;
    duration?: number;
    onComplete?: () => void;
}

const COLORS = {
    'request': 0x64748b, // slate-500
    'pre-prepare': 0x0ea5e9, // sky-500
    'prepare': 0xa855f7, // purple-500
    'commit': 0xf59e0b, // amber-500
    'reply': 0x64748b, // slate-500
};

export default function PixiMessage({ from, to, kind, conflicting, duration = 1.0, onComplete }: PixiMessageProps) {
    const [progress, setProgress] = useState(0);
    const startTime = useRef(Date.now());

    // Calculate quadratic bezier control point for curve
    const controlPoint = useMemo(() => {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const norm = Math.sqrt(dx * dx + dy * dy) || 1;

        // Perpendicular offset
        const nx = -dy / norm;
        const ny = dx / norm;
        const curve = 100; // curvature amount

        return {
            x: mx + nx * curve,
            y: my + ny * curve
        };
    }, [from, to]);

    useTick((delta) => {
        const now = Date.now();
        const elapsed = (now - startTime.current) / 1000;
        const p = Math.min(elapsed / duration, 1);

        setProgress(p);

        if (p >= 1 && onComplete) {
            // onComplete(); // In a real app we might trigger something here
        }
    });

    const drawPath = useMemo(() => {
        return (g: any) => {
            g.clear();
            g.lineStyle(1, conflicting ? 0xff0000 : 0xcbd5e1, 0.15); // Faint trail
            g.moveTo(from.x, from.y);
            g.quadraticCurveTo(controlPoint.x, controlPoint.y, to.x, to.y);
        };
    }, [from, to, controlPoint, conflicting]);

    const drawParticle = useMemo(() => {
        return (g: any) => {
            g.clear();

            // Calculate current position on bezier curve
            const t = progress;
            const mt = 1 - t;
            const x = mt * mt * from.x + 2 * mt * t * controlPoint.x + t * t * to.x;
            const y = mt * mt * from.y + 2 * mt * t * controlPoint.y + t * t * to.y;

            // Glow (reduced intensity)
            g.beginFill(COLORS[kind], 0.2);
            g.drawCircle(x, y, 6);
            g.endFill();

            // Core (slightly smaller)
            g.beginFill(COLORS[kind], 0.9);
            g.drawCircle(x, y, 3);
            g.endFill();
        };
    }, [from, to, controlPoint, progress, kind]);

    return (
        <Container>
            <Graphics draw={drawPath} />
            <Graphics draw={drawParticle} />
        </Container>
    );
}
