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
    idle: { color: 0x475569, label: '' },
    proposed: { color: 0x38bdf8, label: 'READY' }, // Sky-400
    prepared: { color: 0xc084fc, label: 'PREPARED' }, // Purple-400
    committed: { color: 0xfacc15, label: 'COMMITTED' }, // Yellow-400
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

        // Main circle - simplified to standard node style
        g.beginFill(0x334155); // Slate-700
        g.lineStyle(3, 0x94a3b8);
        g.drawCircle(0, 0, radius);
        g.endFill();
        
        // "C" letter is drawn by Text component now, no need for custom drawing
    }

    function drawVoteSlots(g: any) {
        // Only show vote slots during relevant phases
        const showPrepare = phase === 'prepare' || phase === 'commit' || phase === 'reply';
        const showCommit = phase === 'commit' || phase === 'reply';

        // Move slots further out for better visibility
        const slotRadius = radius + 28;
        const slotSize = 6; // Radius of the dot

        // PREPARE vote slots (left arc) - purple
        if (showPrepare) {
            const prepareStartAngle = Math.PI * 0.8; // Start a bit lower
            const angleStep = 0.4;
            
            for (let i = 0; i < needed; i++) {
                const angle = prepareStartAngle + (i - (needed - 1) / 2) * angleStep;
                const sx = slotRadius * Math.cos(angle);
                const sy = slotRadius * Math.sin(angle);

                const filled = i < prepareCount;

                // Slot background (empty socket)
                g.beginFill(0x1e293b, 0.5);
                g.lineStyle(1, 0x475569, 0.5);
                g.drawCircle(sx, sy, slotSize);
                g.endFill();

                // Filled Orb
                if (filled) {
                    // Glow
                    g.beginFill(0xc084fc, 0.4);
                    g.lineStyle(0);
                    g.drawCircle(sx, sy, slotSize + 4);
                    g.endFill();

                    // Core
                    g.beginFill(0xc084fc); // Purple-400
                    g.lineStyle(1.5, 0xffffff);
                    g.drawCircle(sx, sy, slotSize);
                    g.endFill();
                }
            }
        }

        // COMMIT vote slots (right arc) - amber
        if (showCommit) {
            const commitStartAngle = Math.PI * 0.2; // Start a bit lower
            const angleStep = 0.4;

            for (let i = 0; i < needed; i++) {
                const angle = commitStartAngle - (i - (needed - 1) / 2) * angleStep;
                const sx = slotRadius * Math.cos(angle);
                const sy = slotRadius * Math.sin(angle);

                const filled = i < commitCount;

                // Slot background
                g.beginFill(0x1e293b, 0.5);
                g.lineStyle(1, 0x475569, 0.5);
                g.drawCircle(sx, sy, slotSize);
                g.endFill();

                // Filled Orb
                if (filled) {
                    // Glow
                    g.beginFill(0xfacc15, 0.4);
                    g.lineStyle(0);
                    g.drawCircle(sx, sy, slotSize + 4);
                    g.endFill();

                    // Core
                    g.beginFill(0xfacc15); // Yellow-400
                    g.lineStyle(1.5, 0xffffff);
                    g.drawCircle(sx, sy, slotSize);
                    g.endFill();
                }
            }
        }

        // Threshold met indicator - A connecting ring
        if ((showPrepare && prepareCount >= needed) || (showCommit && commitCount >= needed)) {
             // No extra ring needed if the orbs are glowing enough
        }
    }

    function drawStatusBadge(g: any) {
        // Draw status text badge below the node
        if (status === 'idle' && !isFaulty) return;

        const config = isFaulty ? { color: 0xf87171, label: 'FAULTY' } : STATUS_CONFIG[status]; // Red-400
        if (!config || !config.label) return;

        const badgeW = 60;
        const badgeH = 16;
        const badgeY = radius + 28; // Position below the label

        // Badge background
        g.beginFill(config.color);
        g.drawRoundedRect(-badgeW / 2, badgeY, badgeW, badgeH, 8);
        g.endFill();
    }

    function drawGlowEffect(g: any) {
        if (!hovered && !isLeader && status === 'idle') return;

        const pulse = 1 + Math.sin(pulseRef.current) * 0.08;
        let glowColor = 0x3b82f6;
        let glowAlpha = 0.2;

        if (isFaulty) {
            glowColor = 0xf87171; // Red-400
            glowAlpha = 0.3;
        } else if (status === 'committed') {
            glowColor = 0xfacc15; // Yellow-400
            glowAlpha = 0.35;
        } else if (status === 'prepared') {
            glowColor = 0xc084fc; // Purple-400
            glowAlpha = 0.3;
        } else if (isLeader) {
            glowColor = 0x34d399; // Emerald-400
            glowAlpha = 0.35;
        }

        g.beginFill(glowColor, glowAlpha * pulse);
        g.drawCircle(0, 0, radius + 12 * pulse);
        g.endFill();
    }

    function drawMainCircle(g: any) {
        const fillColor = isFaulty ? 0x991b1b : isLeader ? 0x065f46 : 0x1e293b; // Darker base colors: Red-800, Emerald-800, Slate-800
        const strokeColor = isFaulty ? 0xf87171 : isLeader ? 0x34d399 : 0x94a3b8; // Brighter strokes: Red-400, Emerald-400, Slate-400
        const borderWidth = hovered ? 4 : 3;

        // Shadow
        g.beginFill(0x000000, 0.3);
        g.drawCircle(4, 4, radius);
        g.endFill();

        // Main circle
        g.beginFill(fillColor);
        g.lineStyle(borderWidth, strokeColor);
        g.drawCircle(0, 0, radius);
        g.endFill();

        // Faulty cross
        if (isFaulty) {
            g.lineStyle(4, 0xf87171, 0.8);
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
        fontSize: isClient ? 14 : 20, // Increased from 15
        fontWeight: 'bold',
        align: 'center',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowDistance: 1,
    }), [isClient]);

    const labelStyle = useMemo(() => new TextStyle({
        fill: '#cbd5e1',
        fontSize: 11, // Increased from 10
        fontWeight: 'bold', // Changed to bold
        align: 'center',
    }), []);

    const statusStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
        align: 'center',
        letterSpacing: 0.5,
    }), []);

    const displayId = isClient ? 'C' : `N${node.id}`;
    const displayLabel = isClient ? 'CLIENT' : isLeader ? 'LEADER' : '';
    
    // Determine status label text
    const statusConfig = isFaulty ? { label: 'FAULTY' } : STATUS_CONFIG[status];
    const showStatus = (status !== 'idle' || isFaulty) && statusConfig?.label;

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
            {showStatus && (
                <Text
                    text={statusConfig.label}
                    anchor={0.5}
                    y={radius + 36} // Centered in the badge drawn in drawStatusBadge
                    style={statusStyle}
                />
            )}
        </Container>
    );
}
