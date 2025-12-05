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

    const displayId = isClient ? 'C' : node.id.toString();
    const displayLabel = isClient ? 'CLIENT' : (isLeader ? 'LEADER' : `REPLICA ${node.id}`);
    
    const statusConfig = isFaulty ? { color: 0xf87171, label: 'FAULTY' } : STATUS_CONFIG[status];
    const showStatus = (status !== 'idle' || isFaulty) && statusConfig && statusConfig.label;

    const needed = 2 * f + 1;
    const radius = isClient ? 28 : 38;
    const graphicsRef = useRef<any>(null);
    const pulseRef = useRef(0);
    
    // Action Bubble State
    const [bubbleText, setBubbleText] = React.useState<string | null>(null);
    const bubbleTimerRef = useRef<any>(null);
    const prevStatusRef = useRef(status);
    const prevPhaseRef = useRef(phase);

    // Detect status changes to trigger bubbles
    if (prevStatusRef.current !== status) {
        if (status === 'proposed') showBubble('New Proposal');
        if (status === 'prepared') showBubble('Quorum Met! (2f+1)');
        if (status === 'committed') showBubble('Quorum Met! (2f+1)');
        prevStatusRef.current = status;
    }

    // Detect phase changes for Leader actions
    if (prevPhaseRef.current !== phase) {
        if (isLeader && phase === 'pre-prepare') showBubble('Broadcasting Proposal');
        if (phase === 'reply' && status === 'committed') showBubble('Replying to Client');
        prevPhaseRef.current = phase;
    }

    function showBubble(text: string) {
        setBubbleText(text);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setBubbleText(null), 2500);
    }

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
        drawLocalLog(g);
        if (bubbleText) drawActionBubble(g);
    }

    function drawLocalLog(g: any) {
        // Draw a stack of blocks to represent the local ledger
        const round = usePbftStore.getState().round;
        const committedBlocks = round - 1;
        if (committedBlocks <= 0) return;

        const blockW = 12;
        const blockH = 4;
        const startX = radius + 15;
        const startY = radius;

        for (let i = 0; i < Math.min(committedBlocks, 5); i++) {
            g.beginFill(0x3b82f6); // Blue blocks
            g.lineStyle(1, 0x1e3a8a);
            g.drawRect(startX, startY - (i * (blockH + 2)), blockW, blockH);
            g.endFill();
        }
        
        // If more than 5, show a small plus
        if (committedBlocks > 5) {
             g.beginFill(0xffffff);
             g.drawCircle(startX + blockW/2, startY - (5 * (blockH + 2)) - 2, 1.5);
             g.endFill();
        }
    }

    function drawActionBubble(g: any) {
        if (!bubbleText) return;
        
        const bubbleW = 100;
        const bubbleH = 24;
        const bubbleY = -radius - 35;
        
        // Bubble tail
        g.beginFill(0xffffff);
        g.moveTo(0, -radius - 10);
        g.lineTo(-6, bubbleY + bubbleH/2);
        g.lineTo(6, bubbleY + bubbleH/2);
        g.endFill();

        // Bubble body
        g.beginFill(0xffffff);
        g.lineStyle(1, 0xcbd5e1);
        g.drawRoundedRect(-bubbleW/2, bubbleY - bubbleH/2, bubbleW, bubbleH, 12);
        g.endFill();
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

        // Progress Arc Parameters
        const arcRadius = radius + 12;
        const arcWidth = 4; // Reduced from 6
        
        // Helper to draw an arc
        const drawArc = (startAngle: number, endAngle: number, color: number, alpha: number = 1) => {
            g.lineStyle(arcWidth, color, alpha);
            g.arc(0, 0, arcRadius, startAngle, endAngle);
            g.lineStyle(0); // Reset
        };

        // PREPARE VOTES (Left Side Arc)
        if (showPrepare) {
            const maxVotes = needed; // We only care about reaching the threshold visually
            const progress = Math.min(prepareCount / maxVotes, 1);
            
            // Background Arc (Gray) - More subtle
            drawArc(Math.PI * 0.8, Math.PI * 2.2, 0x334155, 0.3); // Reduced alpha

            // Progress Arc (Purple)
            if (progress > 0) {
                const start = Math.PI * 0.8;
                const end = start + (Math.PI * 1.4 * progress);
                drawArc(start, end, 0xc084fc);
            }
        }

        // COMMIT VOTES (Outer Ring)
        if (showCommit) {
            const outerRadius = arcRadius + 8; // Closer spacing
            const maxVotes = needed;
            const progress = Math.min(commitCount / maxVotes, 1);

            // Background Arc - More subtle
            g.lineStyle(arcWidth, 0x334155, 0.3);
            g.arc(0, 0, outerRadius, Math.PI * 0.8, Math.PI * 2.2);
            g.lineStyle(0);

            // Progress Arc (Amber)
            if (progress > 0) {
                const start = Math.PI * 0.8;
                const end = start + (Math.PI * 1.4 * progress);
                g.lineStyle(arcWidth, 0xfacc15);
                g.arc(0, 0, outerRadius, start, end);
                g.lineStyle(0);
            }
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
        // Only show glow on hover or if faulty
        if (!hovered && !isFaulty) return;

        const pulse = 1 + Math.sin(pulseRef.current) * 0.08;
        let glowColor = 0xffffff; // Default white glow for hover
        let glowAlpha = 0.15;

        if (isFaulty) {
            glowColor = 0xf87171; // Red-400
            glowAlpha = 0.3;
        } else if (hovered) {
            glowColor = 0xffffff;
            glowAlpha = 0.1;
        }

        g.beginFill(glowColor, glowAlpha * pulse);
        g.drawCircle(0, 0, radius + 8 * pulse);
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
        fontSize: 10,
        fontWeight: 'bold',
        align: 'center',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowDistance: 1,
    }), []);

    const bubbleStyle = useMemo(() => new TextStyle({
        fill: '#0f172a', // Slate-900
        fontSize: 10,
        fontWeight: 'bold',
        align: 'center',
    }), []);

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
            {bubbleText && !isClient && (
                <Text
                    text={bubbleText}
                    anchor={0.5}
                    y={-radius - 35} // Centered in the bubble
                    style={bubbleStyle}
                />
            )}
        </Container>
    );
}
