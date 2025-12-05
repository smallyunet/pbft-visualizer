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
    const round = usePbftStore((s) => s.round);

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
            case 'prepare': return 'Replicas exchange votes (Need 2f+1)';
            case 'commit': return 'Replicas commit to order (Need 2f+1)';
            case 'reply': return 'Replicas reply result to Client';
            default: return '';
        }
    }, [phase]);

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
