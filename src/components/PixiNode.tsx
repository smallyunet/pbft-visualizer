import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { Container, Graphics, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { NodeUi, usePbftStore } from '../store/pbftStore';
import { COLORS, getStatusColor } from '../styles/theme';

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

// --- Sub-Components for Optimization ---

// 1. Glow Effect (Animated)
const NodeGlow = React.memo(({ active, color, radius }: { active: boolean; color: number; radius: number }) => {
    const ref = useRef<any>(null);
    const pulseRef = useRef(0);

    useTick((delta) => {
        if (!active || !ref.current) return;
        pulseRef.current += delta * 0.05;
        const scale = 1 + Math.sin(pulseRef.current) * 0.05;
        ref.current.scale.set(scale);
        ref.current.alpha = 0.6 + Math.sin(pulseRef.current) * 0.2;
    });

    const draw = useCallback((g: any) => {
        g.clear();
        g.beginFill(color);
        g.drawCircle(0, 0, radius + 5);
        g.endFill();
    }, [color, radius]);

    return <Graphics ref={ref} draw={draw} visible={active} />;
});

// 2. Base Node Shape (Static-ish)
const NodeBase = React.memo(({ isClient, isLeader, isFaulty, radius, hovered }: { isClient: boolean; isLeader: boolean; isFaulty: boolean; radius: number; hovered: boolean }) => {
    const draw = useCallback((g: any) => {
        g.clear();
        
        // Colors
        let fillColor = COLORS.node.idle;
        let strokeColor = COLORS.stroke.idle;

        if (isClient) {
            fillColor = COLORS.node.client;
            strokeColor = COLORS.node.clientBorder;
        } else if (isFaulty) {
            fillColor = COLORS.node.faulty;
            strokeColor = COLORS.stroke.faulty;
        } else if (isLeader) {
            fillColor = COLORS.node.leader;
            strokeColor = COLORS.stroke.leader;
        }

        const borderWidth = hovered ? 4 : 3;

        // Shadow
        g.beginFill(0x000000, 0.3);
        g.drawCircle(4, 4, radius);
        g.endFill();

        // Main Circle
        g.beginFill(fillColor);
        g.lineStyle(borderWidth, strokeColor);
        g.drawCircle(0, 0, radius);
        g.endFill();

        // Faulty Cross
        if (isFaulty) {
            g.lineStyle(4, COLORS.stroke.faulty, 0.8);
            const s = radius * 0.4;
            g.moveTo(-s, -s);
            g.lineTo(s, s);
            g.moveTo(s, -s);
            g.lineTo(-s, s);
        }

        // Leader Crown
        if (isLeader && !isClient) {
            const crownY = -radius - 18;
            const crownWidth = 24;
            const crownHeight = 14;
            
            g.lineStyle(1, 0xf59e0b); // Amber-500
            g.beginFill(0xfbbf24);    // Amber-400
            g.moveTo(-crownWidth / 2, crownY + crownHeight);
            g.lineTo(-crownWidth / 2, crownY + 4);
            g.lineTo(-crownWidth / 4, crownY + 8);
            g.lineTo(0, crownY);
            g.lineTo(crownWidth / 4, crownY + 8);
            g.lineTo(crownWidth / 2, crownY + 4);
            g.lineTo(crownWidth / 2, crownY + crownHeight);
            g.closePath();
            g.endFill();

            // Jewel
            g.beginFill(0xdc2626); // Red
            g.lineStyle(0);
            g.drawCircle(0, crownY + 4, 2);
            g.endFill();
        }

    }, [isClient, isLeader, isFaulty, radius, hovered]);

    return <Graphics draw={draw} />;
});

// 3. Vote Slots & Status Badge (Updates on state change)
const NodeStatusOverlay = React.memo(({ 
    radius, status, isFaulty, phase, prepareCount, commitCount, needed 
}: { 
    radius: number; status: string; isFaulty: boolean; phase: string; prepareCount: number; commitCount: number; needed: number 
}) => {
    
    const draw = useCallback((g: any) => {
        g.clear();
        if (isFaulty) return; // Faulty nodes might not show normal status rings

        // --- Vote Slots ---
        const showPrepare = phase === 'prepare' || phase === 'commit' || phase === 'reply';
        const showCommit = phase === 'commit' || phase === 'reply';
        const arcRadius = radius + 12;
        const arcWidth = 4;

        const drawArc = (startAngle: number, endAngle: number, color: number, alpha: number = 1) => {
            g.lineStyle(arcWidth, color, alpha);
            g.arc(0, 0, arcRadius, startAngle, endAngle);
            g.lineStyle(0);
        };

        // Prepare Votes
        if (showPrepare) {
            const progress = Math.min(prepareCount / needed, 1);
            // Background
            drawArc(Math.PI * 0.8, Math.PI * 2.2, COLORS.ui.voteSlotBg, 0.3);
            // Progress
            if (progress > 0) {
                const start = Math.PI * 0.8;
                const end = start + (Math.PI * 1.4 * progress);
                drawArc(start, end, COLORS.status.prepared);
            }
            // Threshold Tick
            const endAngle = Math.PI * 0.8 + (Math.PI * 1.4);
            g.lineStyle(2, COLORS.ui.voteSlotThreshold, 0.5);
            const r1 = arcRadius - 4;
            const r2 = arcRadius + 4;
            g.moveTo(r1 * Math.cos(endAngle), r1 * Math.sin(endAngle));
            g.lineTo(r2 * Math.cos(endAngle), r2 * Math.sin(endAngle));
        }

        // Commit Votes
        if (showCommit) {
            const outerRadius = arcRadius + 8;
            const progress = Math.min(commitCount / needed, 1);
            
            // Background
            g.lineStyle(arcWidth, COLORS.ui.voteSlotBg, 0.3);
            g.arc(0, 0, outerRadius, Math.PI * 0.8, Math.PI * 2.2);
            
            // Progress
            if (progress > 0) {
                const start = Math.PI * 0.8;
                const end = start + (Math.PI * 1.4 * progress);
                g.lineStyle(arcWidth, COLORS.status.committed);
                g.arc(0, 0, outerRadius, start, end);
            }
             // Threshold Tick
             const endAngle = Math.PI * 0.8 + (Math.PI * 1.4);
             g.lineStyle(2, COLORS.ui.voteSlotThreshold, 0.5);
             const r1 = outerRadius - 4;
             const r2 = outerRadius + 4;
             g.moveTo(r1 * Math.cos(endAngle), r1 * Math.sin(endAngle));
             g.lineTo(r2 * Math.cos(endAngle), r2 * Math.sin(endAngle));
        }

        // --- Status Badge ---
        if (status !== 'idle') {
            const color = getStatusColor(status, isFaulty);
            const badgeW = 60;
            const badgeH = 16;
            const badgeY = radius + 28;

            g.beginFill(color);
            g.drawRoundedRect(-badgeW / 2, badgeY, badgeW, badgeH, 8);
            g.endFill();
        }

    }, [radius, status, isFaulty, phase, prepareCount, commitCount, needed]);

    return <Graphics draw={draw} />;
});

// 4. Local Log (Updates on round change)
const NodeLog = React.memo(({ radius, round }: { radius: number; round: number }) => {
    const draw = useCallback((g: any) => {
        g.clear();
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
        
        if (committedBlocks > 5) {
             g.beginFill(0xffffff);
             g.drawCircle(startX + blockW/2, startY - (5 * (blockH + 2)) - 2, 1.5);
             g.endFill();
        }
    }, [radius, round]);

    return <Graphics draw={draw} />;
});

// 5. Action Bubble (Dynamic)
const ActionBubble = React.memo(({ text, radius }: { text: string; radius: number }) => {
    const draw = useCallback((g: any) => {
        g.clear();
        if (!text) return;
        
        const bubbleW = 100;
        const bubbleH = 24;
        const bubbleY = -radius - 35;
        
        // Tail
        g.beginFill(COLORS.ui.bubbleBg);
        g.moveTo(0, -radius - 10);
        g.lineTo(-6, bubbleY + bubbleH/2);
        g.lineTo(6, bubbleY + bubbleH/2);
        g.endFill();

        // Body
        g.beginFill(COLORS.ui.bubbleBg);
        g.lineStyle(1, COLORS.ui.bubbleBorder);
        g.drawRoundedRect(-bubbleW/2, bubbleY - bubbleH/2, bubbleW, bubbleH, 12);
        g.endFill();
    }, [text, radius]);

    return <Graphics draw={draw} />;
});


// --- Main Component ---

export default function PixiNode({ node, x, y, hovered, status = 'idle', prepareCount = 0, commitCount = 0, onHover }: PixiNodeProps) {
    const isLeader = node.role === 'leader';
    const isFaulty = node.state === 'faulty';
    const isClient = node.id === -1;
    const f = usePbftStore((s) => s.f);
    const phase = usePbftStore((s) => s.phase);
    const round = usePbftStore((s) => s.round);
    const fontScale = usePbftStore((s) => s.fontScale);

    const displayId = isClient ? 'C' : node.id.toString();
    const displayLabel = isClient ? 'CLIENT' : (isLeader ? 'LEADER' : `REPLICA ${node.id}`);
    
    // Status Label
    const statusLabel = isFaulty ? 'FAULTY' : (status === 'idle' ? '' : (status === 'proposed' ? 'READY' : status.toUpperCase()));
    const showStatus = (status !== 'idle' || isFaulty) && statusLabel !== '';

    const needed = 2 * f + 1;
    const radius = isClient ? 28 : 38;
    
    // Action Bubble Logic
    const [bubbleText, setBubbleText] = React.useState<string | null>(null);
    const bubbleTimerRef = useRef<any>(null);
    const prevStatusRef = useRef(status);
    const prevPhaseRef = useRef(phase);

    React.useEffect(() => {
        if (prevStatusRef.current !== status) {
            if (status === 'proposed') showBubble('New Proposal');
            if (status === 'prepared') showBubble('Quorum Met! (2f+1)');
            if (status === 'committed') showBubble('Quorum Met! (2f+1)');
            prevStatusRef.current = status;
        }
    }, [status]);

    React.useEffect(() => {
        if (prevPhaseRef.current !== phase) {
            if (isLeader && phase === 'pre-prepare') showBubble('Broadcasting Proposal');
            if (phase === 'reply' && status === 'committed') showBubble('Replying to Client');
            prevPhaseRef.current = phase;
        }
    }, [phase, isLeader, status]);

    function showBubble(text: string) {
        setBubbleText(text);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setBubbleText(null), 2500);
    }

    // Styles
    const textStyle = useMemo(() => new TextStyle({
        fill: COLORS.ui.text,
        fontSize: (isClient ? 14 : 20) * fontScale,
        fontWeight: 'bold',
        align: 'center',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowDistance: 1,
    }), [isClient, fontScale]);

    const labelStyle = useMemo(() => new TextStyle({
        fill: COLORS.ui.label,
        fontSize: 11 * fontScale,
        fontWeight: 'bold',
        align: 'center',
    }), [fontScale]);

    const statusStyle = useMemo(() => new TextStyle({
        fill: COLORS.ui.text,
        fontSize: 10 * fontScale,
        fontWeight: 'bold',
        align: 'center',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowDistance: 1,
    }), [fontScale]);

    const bubbleTextStyle = useMemo(() => new TextStyle({
        fill: COLORS.ui.bubbleText,
        fontSize: 10 * fontScale,
        fontWeight: 'bold',
        align: 'center',
    }), [fontScale]);

    // Determine Glow Color
    let glowColor = 0xffffff;
    if (isFaulty) glowColor = COLORS.node.faulty;
    
    return (
        <Container
            x={x}
            y={y}
            eventMode="static"
            onpointerenter={() => onHover(node.id)}
            onpointerleave={() => onHover(null)}
            cursor="pointer"
        >
            {/* 1. Glow (Animated) */}
            <NodeGlow 
                active={hovered || isFaulty} 
                color={glowColor} 
                radius={radius} 
            />

            {/* 2. Base Shape (Static) */}
            <NodeBase 
                isClient={isClient} 
                isLeader={isLeader} 
                isFaulty={isFaulty} 
                radius={radius} 
                hovered={hovered}
            />

            {/* 3. Status & Votes (Dynamic) */}
            {!isClient && (
                <NodeStatusOverlay 
                    radius={radius}
                    status={status}
                    isFaulty={isFaulty}
                    phase={phase}
                    prepareCount={prepareCount}
                    commitCount={commitCount}
                    needed={needed}
                />
            )}

            {/* 4. Local Log (Dynamic) */}
            {!isClient && <NodeLog radius={radius} round={round} />}

            {/* 5. Action Bubble (Dynamic) */}
            {bubbleText && !isClient && (
                <ActionBubble text={bubbleText} radius={radius} />
            )}

            {/* Text Labels */}
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
                y={radius + 14}
                style={labelStyle}
            />
            {showStatus && (
                <Text
                    text={statusLabel}
                    anchor={0.5}
                    y={radius + 36}
                    style={statusStyle}
                />
            )}
            {bubbleText && !isClient && (
                <Text
                    text={bubbleText}
                    anchor={0.5}
                    y={-radius - 35}
                    style={bubbleTextStyle}
                />
            )}
        </Container>
    );
}