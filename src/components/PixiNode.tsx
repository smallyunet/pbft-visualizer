import React, { useMemo, useRef } from 'react';
import { Container, Graphics, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { NodeUi, usePbftStore } from '../store/pbftStore';

interface PixiNodeProps {
    node: NodeUi;
    x: number;
    y: number;
    hovered: boolean;
    status?: 'idle' | 'proposed' | 'prepared' | 'committed';
    prepareCount?: number;
    commitCount?: number;
    onHover: (id: number | null) => void;
}

// Status color and label mapping
const STATUS_CONFIG: Record<string, { color: number; label: string }> = {
    idle: { color: 0x94a3b8, label: '' },
    proposed: { color: 0x0ea5e9, label: 'READY' },
    prepared: { color: 0xa855f7, label: 'PREPARED' },
    committed: { color: 0xf59e0b, label: 'COMMITTED' },
};

export default function PixiNode({ node, x, y, hovered, status = 'idle', prepareCount = 0, commitCount = 0, onHover }: PixiNodeProps) {
    const isLeader = node.role === 'leader';
    const isFaulty = node.state === 'faulty';
    const isClient = node.id === -1;
    const f = usePbftStore((s) => s.f);
    const phase = usePbftStore((s) => s.phase);

    const needed = 2 * f + 1;
    const radius = isClient ? 28 : 38;
    const graphicsRef = useRef<any>(null);
    const pulseRef = useRef(0);

    useTick((delta) => {
        pulseRef.current += delta * 0.025;
        if (graphicsRef.current) {
            drawNodeGraphics(graphicsRef.current);
        }
    });

    function drawNodeGraphics(g: any) {
        g.clear();

        if (isClient) {
            drawClientNode(g);
            return;
        }

        drawVoteSlots(g);
        drawStatusBadge(g);
        drawGlowEffect(g);
        drawMainCircle(g);
        drawLeaderCrown(g);
    }

    function drawClientNode(g: any) {
        const pulse = 1 + Math.sin(pulseRef.current) * 0.03;

        // Outer glow
        g.beginFill(0x64748b, 0.1);
        g.drawCircle(0, 0, radius + 10 * pulse);
        g.endFill();

        // Main circle - user icon style
        g.beginFill(0x475569);
        g.lineStyle(2, 0x94a3b8);
        g.drawCircle(0, 0, radius);
        g.endFill();

        // User head
        g.beginFill(0xffffff, 0.9);
        g.drawCircle(0, -6, 10);
        g.endFill();

        // User body
        g.beginFill(0xffffff, 0.9);
        g.drawEllipse(0, 12, 14, 10);
        g.endFill();
    }

    function drawVoteSlots(g: any) {
        // Only show vote slots during relevant phases
        const showPrepare = phase === 'prepare' || phase === 'commit' || phase === 'reply';
        const showCommit = phase === 'commit' || phase === 'reply';

        const slotRadius = radius + 22;
        const slotSize = 10;

        // PREPARE vote slots (left arc) - purple
        if (showPrepare) {
            const prepareStartAngle = Math.PI * 0.75;
            for (let i = 0; i < needed; i++) {
                const angle = prepareStartAngle + (i - (needed - 1) / 2) * 0.35;
                const sx = slotRadius * Math.cos(angle);
                const sy = slotRadius * Math.sin(angle);

                const filled = i < prepareCount;

                // Slot background
                g.beginFill(filled ? 0xa855f7 : 0x1e293b, filled ? 1 : 0.6);
                g.lineStyle(1.5, 0xa855f7, filled ? 1 : 0.4);
                g.drawRoundedRect(sx - slotSize / 2, sy - slotSize / 2, slotSize, slotSize, 2);
                g.endFill();

                // Checkmark for filled slots
                if (filled) {
                    g.lineStyle(2, 0xffffff, 1);
                    g.moveTo(sx - 2.5, sy);
                    g.lineTo(sx - 0.5, sy + 2.5);
                    g.lineTo(sx + 3, sy - 2);
                }
            }
        }

        // COMMIT vote slots (right arc) - amber
        if (showCommit) {
            const commitStartAngle = Math.PI * 0.25;
            for (let i = 0; i < needed; i++) {
                const angle = commitStartAngle - (i - (needed - 1) / 2) * 0.35;
                const sx = slotRadius * Math.cos(angle);
                const sy = slotRadius * Math.sin(angle);

                const filled = i < commitCount;

                // Slot background
                g.beginFill(filled ? 0xf59e0b : 0x1e293b, filled ? 1 : 0.6);
                g.lineStyle(1.5, 0xf59e0b, filled ? 1 : 0.4);
                g.drawRoundedRect(sx - slotSize / 2, sy - slotSize / 2, slotSize, slotSize, 2);
                g.endFill();

                // Checkmark for filled slots
                if (filled) {
                    g.lineStyle(2, 0xffffff, 1);
                    g.moveTo(sx - 2.5, sy);
                    g.lineTo(sx - 0.5, sy + 2.5);
                    g.lineTo(sx + 3, sy - 2);
                }
            }
        }

        // Threshold met indicator
        if ((showPrepare && prepareCount >= needed) || (showCommit && commitCount >= needed)) {
            const pulse = Math.sin(pulseRef.current * 2);
            g.lineStyle(2.5, 0x22c55e, 0.7 + pulse * 0.2);
            g.drawCircle(0, 0, radius + 14);
        }
    }

    function drawStatusBadge(g: any) {
        // Status is now indicated by the green threshold ring when reached
        // No additional badge needed for cleaner look
    }

    function drawGlowEffect(g: any) {
        if (!hovered && !isLeader && status === 'idle') return;

        const pulse = 1 + Math.sin(pulseRef.current) * 0.08;
        let glowColor = 0x3b82f6;
        let glowAlpha = 0.2;

        if (isFaulty) {
            glowColor = 0xff0000;
            glowAlpha = 0.3;
        } else if (status === 'committed') {
            glowColor = 0xf59e0b;
            glowAlpha = 0.35;
        } else if (status === 'prepared') {
            glowColor = 0xa855f7;
            glowAlpha = 0.3;
        } else if (isLeader) {
            glowColor = 0x10b981;
            glowAlpha = 0.35;
        }

        g.beginFill(glowColor, glowAlpha * pulse);
        g.drawCircle(0, 0, radius + 12 * pulse);
        g.endFill();
    }

    function drawMainCircle(g: any) {
        const fillColor = isFaulty ? 0xef4444 : isLeader ? 0x10b981 : 0x3b82f6;
        const borderWidth = hovered ? 4 : 3;

        // Shadow
        g.beginFill(0x000000, 0.15);
        g.drawCircle(2, 3, radius);
        g.endFill();

        // Main circle
        g.beginFill(fillColor);
        g.lineStyle(borderWidth, 0xffffff);
        g.drawCircle(0, 0, radius);
        g.endFill();

        // Faulty cross
        if (isFaulty) {
            g.lineStyle(4, 0xffffff, 0.8);
            const s = radius * 0.4;
            g.moveTo(-s, -s);
            g.lineTo(s, s);
            g.moveTo(s, -s);
            g.lineTo(-s, s);
        }
    }

    function drawLeaderCrown(g: any) {
        if (!isLeader) return;

        const crownY = -radius - 18;
        const crownWidth = 24;
        const crownHeight = 14;

        // Crown shape
        g.beginFill(0xfbbf24);
        g.lineStyle(1, 0xf59e0b);
        g.moveTo(-crownWidth / 2, crownY + crownHeight);
        g.lineTo(-crownWidth / 2, crownY + 4);
        g.lineTo(-crownWidth / 4, crownY + 8);
        g.lineTo(0, crownY);
        g.lineTo(crownWidth / 4, crownY + 8);
        g.lineTo(crownWidth / 2, crownY + 4);
        g.lineTo(crownWidth / 2, crownY + crownHeight);
        g.closePath();
        g.endFill();

        // Crown jewels
        g.beginFill(0xff0000);
        g.drawCircle(0, crownY + 4, 2);
        g.endFill();
    }

    const textStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: isClient ? 14 : 15,
        fontWeight: 'bold',
        align: 'center',
    }), [isClient]);

    const labelStyle = useMemo(() => new TextStyle({
        fill: '#cbd5e1',
        fontSize: 10,
        fontWeight: 'normal',
        align: 'center',
    }), []);

    const statusStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
        align: 'center',
        letterSpacing: 0.5,
    }), []);

    const displayId = isClient ? '' : `N${node.id}`;
    const displayLabel = isClient ? 'CLIENT' : isLeader ? 'LEADER' : '';

    return (
        <Container
            x={x}
            y={y}
            eventMode="static"
            onpointerenter={() => onHover(node.id)}
            onpointerleave={() => onHover(null)}
            cursor="pointer"
        >
            <Graphics ref={graphicsRef} />
            {!isClient && (
                <Text
                    text={displayId}
                    anchor={0.5}
                    y={2}
                    style={textStyle}
                />
            )}
            <Text
                text={displayLabel}
                anchor={0.5}
                y={isClient ? radius + 14 : radius + 14}
                style={labelStyle}
            />
        </Container>
    );
}
