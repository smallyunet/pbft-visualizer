import React, { useMemo } from 'react';
import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { usePbftStore } from '../store/pbftStore';

interface CentralStatusProps {
    x: number;
    y: number;
}

export default function CentralStatus({ x, y }: CentralStatusProps) {
    const phase = usePbftStore((s) => s.phase);
    const nodeStats = usePbftStore((s) => s.nodeStats);
    const f = usePbftStore((s) => s.f);
    const nodes = usePbftStore((s) => s.nodes);

    // Calculate global progress
    const needed = 2 * f + 1;
    const healthyNodes = nodes.filter(n => n.state !== 'faulty').length;
    
    const preparedCount = nodeStats.filter(n => n.status === 'prepared' || n.status === 'committed').length;
    const committedCount = nodeStats.filter(n => n.status === 'committed').length;

    const phaseTitle = useMemo(() => {
        switch (phase) {
            case 'request': return 'REQUEST PHASE';
            case 'pre-prepare': return 'PRE-PREPARE PHASE';
            case 'prepare': return 'PREPARE PHASE';
            case 'commit': return 'COMMIT PHASE';
            case 'reply': return 'REPLY PHASE';
            default: return '';
        }
    }, [phase]);

    const phaseDesc = useMemo(() => {
        switch (phase) {
            case 'request': return 'Client sends request to Leader';
            case 'pre-prepare': return 'Leader broadcasts proposal';
            case 'prepare': 
                return `Replicas exchange votes (${preparedCount}/${healthyNodes} Prepared)`;
            case 'commit': 
                return `Replicas commit to order (${committedCount}/${healthyNodes} Committed)`;
            case 'reply': return 'Replicas reply result to Client';
            default: return '';
        }
    }, [phase, preparedCount, committedCount, healthyNodes]);

    const titleStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        align: 'center',
        letterSpacing: 2,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowDistance: 2,
    }), []);

    const descStyle = useMemo(() => new TextStyle({
        fill: '#94a3b8', // Slate-400
        fontSize: 16,
        fontWeight: 'normal',
        align: 'center',
    }), []);

    return (
        <Container x={x} y={y}>
            <Text
                text={phaseTitle}
                anchor={0.5}
                y={-15}
                style={titleStyle}
            />
            <Text
                text={phaseDesc}
                anchor={0.5}
                y={15}
                style={descStyle}
            />
        </Container>
    );
}
