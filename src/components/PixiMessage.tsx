import React, { useMemo, useRef, useCallback } from 'react';
import { Graphics, Container, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';
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

const COLORS: Record<string, number> = {
    'request': 0x64748b,     // slate-500
    'pre-prepare': 0x0ea5e9, // sky-500
    'prepare': 0xa855f7,     // purple-500
    'commit': 0xf59e0b,      // amber-500
    'reply': 0x22c55e,       // green-500
};

const KIND_LABELS: Record<string, string> = {
    'request': 'REQ',
    'pre-prepare': 'PP',
    'prepare': 'P',
    'commit': 'C',
    'reply': 'OK',
};

// Smooth easing function for natural motion
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

// Easing for the receipt ripple effect
function easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
}

export default function PixiMessage({ message, from, to, kind, conflicting, startAt, duration }: PixiMessageProps) {
    const setHoveredMessage = usePbftStore(s => s.setHoveredMessage);

    // Graphics refs
    const pathRef = useRef<any>(null);
    const envelopeRef = useRef<any>(null);
    const trailRef = useRef<any>(null);
    const receiptRef = useRef<any>(null);
    const hitAreaRef = useRef<any>(null);
    const labelRef = useRef<any>(null);

    // Calculate bezier control point
    const controlPoint = useMemo(() => {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const norm = Math.sqrt(dx * dx + dy * dy) || 1;

        const nx = -dy / norm;
        const ny = dx / norm;
        const curve = 70;

        return { x: mx + nx * curve, y: my + ny * curve };
    }, [from.x, from.y, to.x, to.y]);

    // Memoized bezier position calculator
    const getPosAt = useCallback((t: number) => {
        const mt = 1 - t;
        return {
            x: mt * mt * from.x + 2 * mt * t * controlPoint.x + t * t * to.x,
            y: mt * mt * from.y + 2 * mt * t * controlPoint.y + t * t * to.y
        };
    }, [from.x, from.y, to.x, to.y, controlPoint.x, controlPoint.y]);

    // Get tangent angle at position t
    const getAngleAt = useCallback((t: number) => {
        const mt = 1 - t;
        // Derivative of quadratic bezier
        const dx = 2 * mt * (controlPoint.x - from.x) + 2 * t * (to.x - controlPoint.x);
        const dy = 2 * mt * (controlPoint.y - from.y) + 2 * t * (to.y - controlPoint.y);
        return Math.atan2(dy, dx);
    }, [from.x, from.y, to.x, to.y, controlPoint.x, controlPoint.y]);

    const color = COLORS[kind] ?? 0x64748b;
    const label = KIND_LABELS[kind] ?? '?';
    const durationMs = duration * 1000;

    useTick(() => {
        const currentTime = usePbftStore.getState().t;
        const age = currentTime - startAt;
        const rawProgress = age / durationMs;
        const progress = rawProgress <= 1 ? easeOutCubic(rawProgress) : rawProgress;

        const receiptDurationMs = 700;
        const receiptProgress = (age - durationMs) / receiptDurationMs;

        // Phase 1: Message in flight - envelope animation
        if (rawProgress >= 0 && rawProgress <= 1) {
            renderFlightPath(rawProgress);
            renderTrail(progress);
            renderEnvelope(progress, age);
            updateLabel(progress);
            hideReceipt();
        }
        // Phase 2: Arrival effect - "opening" animation
        else if (rawProgress > 1 && receiptProgress <= 1) {
            hideFlightElements();
            renderReceipt(receiptProgress);
        }
        // Phase 3: Done
        else {
            hideAllElements();
        }
    });

    function renderFlightPath(rawProgress: number) {
        if (!pathRef.current) return;

        pathRef.current.visible = true;
        pathRef.current.clear();

        // Dashed line showing the path
        const pathAlpha = 0.25;
        pathRef.current.lineStyle(1.5, conflicting ? 0xff0000 : 0x94a3b8, pathAlpha);

        // Draw dashed path
        const segments = 20;
        for (let i = 0; i < segments; i++) {
            if (i % 2 === 0) {
                const t1 = i / segments;
                const t2 = (i + 1) / segments;
                const p1 = getPosAt(t1);
                const p2 = getPosAt(t2);
                pathRef.current.moveTo(p1.x, p1.y);
                pathRef.current.lineTo(p2.x, p2.y);
            }
        }
    }

    function renderTrail(progress: number) {
        if (!trailRef.current) return;

        trailRef.current.visible = true;
        trailRef.current.clear();

        // Motion blur trail
        const trailLength = 0.15;
        const trailSteps = 8;

        for (let i = 1; i <= trailSteps; i++) {
            const trailT = progress - (i / trailSteps) * trailLength;
            if (trailT > 0 && trailT <= 1) {
                const pos = getPosAt(trailT);
                const fadeFactor = 1 - i / trailSteps;
                const alpha = fadeFactor * fadeFactor * 0.4;
                const size = 12 - i * 1.2;

                trailRef.current.beginFill(color, alpha);
                trailRef.current.drawRoundedRect(pos.x - size / 2, pos.y - size / 2, size, size * 0.7, 2);
                trailRef.current.endFill();
            }
        }
    }

    function renderEnvelope(progress: number, age: number) {
        if (!envelopeRef.current) return;

        envelopeRef.current.visible = true;
        envelopeRef.current.clear();

        const pos = getPosAt(Math.min(progress, 1));
        const angle = getAngleAt(Math.min(progress, 1));

        // Envelope dimensions
        const width = 32;
        const height = 22;

        // Save transform
        envelopeRef.current.position.set(pos.x, pos.y);
        envelopeRef.current.rotation = angle;

        // Subtle bobbing
        const bob = Math.sin(age * 0.008) * 2;

        // Shadow
        envelopeRef.current.beginFill(0x000000, 0.15);
        envelopeRef.current.drawRoundedRect(-width / 2 + 2, -height / 2 + bob + 3, width, height, 3);
        envelopeRef.current.endFill();

        // Envelope body
        envelopeRef.current.beginFill(conflicting ? 0xff6b6b : 0xffffff);
        envelopeRef.current.lineStyle(2, color);
        envelopeRef.current.drawRoundedRect(-width / 2, -height / 2 + bob, width, height, 3);
        envelopeRef.current.endFill();

        // Envelope flap (triangle)
        envelopeRef.current.beginFill(color, 0.9);
        envelopeRef.current.moveTo(-width / 2, -height / 2 + bob);
        envelopeRef.current.lineTo(0, bob + 2);
        envelopeRef.current.lineTo(width / 2, -height / 2 + bob);
        envelopeRef.current.closePath();
        envelopeRef.current.endFill();

        // Conflicting indicator
        if (conflicting) {
            envelopeRef.current.lineStyle(2, 0xff0000);
            envelopeRef.current.moveTo(-width / 2 - 5, -height / 2 - 5 + bob);
            envelopeRef.current.lineTo(width / 2 + 5, height / 2 + 5 + bob);
            envelopeRef.current.moveTo(width / 2 + 5, -height / 2 - 5 + bob);
            envelopeRef.current.lineTo(-width / 2 - 5, height / 2 + 5 + bob);
        }

        // Hit area
        if (hitAreaRef.current) {
            hitAreaRef.current.visible = true;
            hitAreaRef.current.clear();
            hitAreaRef.current.position.set(pos.x, pos.y);
            hitAreaRef.current.beginFill(0xffffff, 0.001);
            hitAreaRef.current.drawCircle(0, 0, 30);
            hitAreaRef.current.endFill();
        }
    }

    function updateLabel(progress: number) {
        if (!labelRef.current) return;

        const pos = getPosAt(Math.min(progress, 1));
        labelRef.current.visible = true;
        labelRef.current.position.set(pos.x, pos.y - 22);
        labelRef.current.alpha = 0.9;
    }

    function renderReceipt(receiptProgress: number) {
        if (!receiptRef.current) return;

        receiptRef.current.visible = true;
        receiptRef.current.clear();

        const easedProgress = easeOutQuad(Math.min(receiptProgress, 1));
        const alpha = Math.max(0, 1 - easedProgress);

        // "Opening envelope" effect
        const openAngle = easedProgress * Math.PI * 0.3;
        const scale = 1 + easedProgress * 0.3;

        // Expanding glow
        receiptRef.current.beginFill(color, alpha * 0.3);
        receiptRef.current.drawCircle(to.x, to.y, 20 + easedProgress * 30);
        receiptRef.current.endFill();

        // Success checkmark for non-conflicting
        if (!conflicting && alpha > 0.3) {
            receiptRef.current.lineStyle(3, 0x22c55e, alpha);
            const cx = to.x;
            const cy = to.y;
            const size = 12 * scale;
            receiptRef.current.moveTo(cx - size * 0.5, cy);
            receiptRef.current.lineTo(cx - size * 0.1, cy + size * 0.4);
            receiptRef.current.lineTo(cx + size * 0.5, cy - size * 0.3);
        }

        // Conflicting X mark
        if (conflicting && alpha > 0.3) {
            receiptRef.current.lineStyle(3, 0xff0000, alpha);
            const cx = to.x;
            const cy = to.y;
            const size = 10 * scale;
            receiptRef.current.moveTo(cx - size, cy - size);
            receiptRef.current.lineTo(cx + size, cy + size);
            receiptRef.current.moveTo(cx + size, cy - size);
            receiptRef.current.lineTo(cx - size, cy + size);
        }
    }

    function hideReceipt() {
        if (receiptRef.current) receiptRef.current.visible = false;
    }

    function hideFlightElements() {
        if (pathRef.current) pathRef.current.visible = false;
        if (envelopeRef.current) envelopeRef.current.visible = false;
        if (trailRef.current) trailRef.current.visible = false;
        if (hitAreaRef.current) hitAreaRef.current.visible = false;
        if (labelRef.current) labelRef.current.visible = false;
    }

    function hideAllElements() {
        hideFlightElements();
        hideReceipt();
    }

    const labelStyle = useMemo(() => new TextStyle({
        fill: conflicting ? '#ef4444' : '#475569',
        fontSize: 11,
        fontWeight: 'bold',
        align: 'center',
    }), [conflicting]);

    return (
        <Container>
            <Graphics ref={pathRef} />
            <Graphics ref={trailRef} />
            <Graphics ref={envelopeRef} />
            <Graphics ref={receiptRef} />
            <Text ref={labelRef} text={label} anchor={0.5} style={labelStyle} />
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
