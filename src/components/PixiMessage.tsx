import React, { useMemo, useRef, useState } from 'react';
import { Graphics, Container, useTick } from '@pixi/react';
import { usePbftStore, RenderedMessage } from '../store/pbftStore';

interface PixiMessageProps {
    message: RenderedMessage;
    from: { x: number; y: number };
    to: { x: number; y: number };
    kind: 'request' | 'pre-prepare' | 'prepare' | 'commit' | 'reply';
    conflicting?: boolean;
    startAt: number;
    duration: number;
}

const COLORS = {
    'request': 0x64748b, // slate-500
    'pre-prepare': 0x0ea5e9, // sky-500
    'prepare': 0xa855f7, // purple-500
    'commit': 0xf59e0b, // amber-500
    'reply': 0x64748b, // slate-500
};

export default function PixiMessage({ message, from, to, kind, conflicting, startAt, duration }: PixiMessageProps) {
    const [visible, setVisible] = useState(false);
    const setHoveredMessage = usePbftStore(s => s.setHoveredMessage);

    // Mutable refs for graphics to update them without re-rendering React component
    const pathRef = useRef<any>(null);
    const particleRef = useRef<any>(null);
    const receiptRef = useRef<any>(null);
    const hitAreaRef = useRef<any>(null);

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

    // Animation loop: runs every frame (~60fps)
    useTick(() => {
        const t = usePbftStore.getState().t;
        const age = t - startAt;
        const durationMs = duration * 1000;
        const progress = age / durationMs;

        // Receipt animation duration (after message arrives)
        const receiptDuration = 0.3; // 300ms
        const receiptProgress = (age - durationMs) / (receiptDuration * 1000);

        // 1. Message in flight
        if (progress >= 0 && progress <= 1) {
            if (pathRef.current) {
                pathRef.current.visible = true;
                pathRef.current.clear();
                pathRef.current.lineStyle(2, conflicting ? 0xff0000 : 0xcbd5e1, 0.4);
                pathRef.current.moveTo(from.x, from.y);
                pathRef.current.quadraticCurveTo(controlPoint.x, controlPoint.y, to.x, to.y);
            }

            if (particleRef.current) {
                particleRef.current.visible = true;
                particleRef.current.clear();

                // Calculate current position on bezier curve
                const t = Math.max(0, Math.min(1, progress));
                const mt = 1 - t;
                const x = mt * mt * from.x + 2 * mt * t * controlPoint.x + t * t * to.x;
                const y = mt * mt * from.y + 2 * mt * t * controlPoint.y + t * t * to.y;

                // Glow
                particleRef.current.beginFill(COLORS[kind], 0.4);
                particleRef.current.drawCircle(x, y, 8);
                particleRef.current.endFill();

                // Core
                particleRef.current.beginFill(COLORS[kind], 1.0);
                particleRef.current.drawCircle(x, y, 4);
                particleRef.current.endFill();

                // Update hit area to follow particle
                if (hitAreaRef.current) {
                    hitAreaRef.current.visible = true;
                    hitAreaRef.current.clear();
                    hitAreaRef.current.beginFill(0xffffff, 0.001); // Almost transparent but interactive
                    hitAreaRef.current.drawCircle(x, y, 20); // Larger hit area
                    hitAreaRef.current.endFill();
                }
            }
            
            if (receiptRef.current) receiptRef.current.visible = false;
        } 
        // 2. Message arrived (Receipt animation)
        else if (progress > 1 && receiptProgress <= 1) {
            if (pathRef.current) pathRef.current.visible = false;
            if (particleRef.current) particleRef.current.visible = false;
            if (hitAreaRef.current) hitAreaRef.current.visible = false;

            if (receiptRef.current) {
                receiptRef.current.visible = true;
                receiptRef.current.clear();
                
                const alpha = 1 - receiptProgress;
                const radius = 10 + receiptProgress * 20; // Expand from 10 to 30

                receiptRef.current.lineStyle(2, COLORS[kind], alpha);
                receiptRef.current.drawCircle(to.x, to.y, radius);
            }
        }
        // 3. Done
        else {
            if (pathRef.current) pathRef.current.visible = false;
            if (particleRef.current) particleRef.current.visible = false;
            if (receiptRef.current) receiptRef.current.visible = false;
            if (hitAreaRef.current) hitAreaRef.current.visible = false;
        }
    });

    return (
        <Container>
            <Graphics ref={pathRef} />
            <Graphics ref={particleRef} />
            <Graphics ref={receiptRef} />
            <Graphics 
                ref={hitAreaRef} 
                eventMode="static"
                cursor="help"
                onpointerenter={() => setHoveredMessage(message)}
                onpointerleave={() => setHoveredMessage(null)}
            />
        </Container>
    );
}
