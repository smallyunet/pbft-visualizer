import React, { useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { NodeUi } from '../store/pbftStore';

interface PixiNodeProps {
    node: NodeUi;
    x: number;
    y: number;
    hovered: boolean;
    onHover: (id: number | null) => void;
}

export default function PixiNode({ node, x, y, hovered, onHover }: PixiNodeProps) {
    const isLeader = node.role === 'leader';
    const isFaulty = node.state === 'faulty';

    const radius = 30;

    const drawNode = useMemo(() => {
        return (g: any) => {
            g.clear();

            // Glow effect if hovered or leader
            if (hovered || isLeader) {
                g.beginFill(isFaulty ? 0xff0000 : isLeader ? 0x10b981 : 0x3b82f6, 0.15);
                g.drawCircle(0, 0, radius + 8);
                g.endFill();
            }

            // Main circle
            g.beginFill(isFaulty ? 0xef4444 : isLeader ? 0x10b981 : 0x3b82f6);
            g.lineStyle(3, 0xffffff);
            g.drawCircle(0, 0, radius);
            g.endFill();
        };
    }, [isLeader, isFaulty, hovered]);

    const textStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        align: 'center',
    }), []);

    const labelStyle = useMemo(() => new TextStyle({
        fill: '#64748b',
        fontSize: 12,
        fontWeight: 'normal',
        align: 'center',
    }), []);

    return (
        <Container
            x={x}
            y={y}
            eventMode="static"
            pointerenter={() => onHover(node.id)}
            pointerleave={() => onHover(null)}
            cursor="pointer"
        >
            <Graphics draw={drawNode} />
            <Text
                text={`N${node.id}`}
                anchor={0.5}
                style={textStyle}
            />
            <Text
                text={isLeader ? 'LEADER' : 'REPLICA'}
                anchor={0.5}
                y={radius + 15}
                style={labelStyle}
            />
        </Container>
    );
}
