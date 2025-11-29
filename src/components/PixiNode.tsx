import React, { useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { NodeUi } from '../store/pbftStore';

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

export default function PixiNode({ node, x, y, hovered, status = 'idle', prepareCount = 0, commitCount = 0, onHover }: PixiNodeProps) {
    const isLeader = node.role === 'leader';
    const isFaulty = node.state === 'faulty';

    const radius = 35;

    const drawNode = useMemo(() => {
        return (g: any) => {
            g.clear();

            // Status Ring (Outer)
            if (status !== 'idle') {
                let color = 0x000000;
                if (status === 'proposed') color = 0x0ea5e9; // sky-500
                if (status === 'prepared') color = 0xa855f7; // purple-500
                if (status === 'committed') color = 0xf59e0b; // amber-500
                
                g.lineStyle(3, color, 0.6);
                g.drawCircle(0, 0, radius + 8);
            }

            // Vote Indicators (Dots)
            // Draw small dots around the node to show collected votes
            // Prepare votes (purple) on the left/top-left
            if (prepareCount > 0) {
                const startAngle = -Math.PI;
                const step = Math.PI / 6;
                g.beginFill(0xa855f7); // purple-500
                g.lineStyle(0);
                for (let i = 0; i < prepareCount; i++) {
                    const angle = startAngle + i * step;
                    const dx = (radius + 16) * Math.cos(angle);
                    const dy = (radius + 16) * Math.sin(angle);
                    g.drawCircle(dx, dy, 3);
                }
                g.endFill();
            }

            // Commit votes (amber) on the right/top-right
            if (commitCount > 0) {
                const startAngle = 0;
                const step = -Math.PI / 6;
                g.beginFill(0xf59e0b); // amber-500
                g.lineStyle(0);
                for (let i = 0; i < commitCount; i++) {
                    const angle = startAngle + i * step;
                    const dx = (radius + 16) * Math.cos(angle);
                    const dy = (radius + 16) * Math.sin(angle);
                    g.drawCircle(dx, dy, 3);
                }
                g.endFill();
            }

            // Glow effect if hovered or leader
            if (hovered || isLeader) {
                g.beginFill(isFaulty ? 0xff0000 : isLeader ? 0x10b981 : 0x3b82f6, 0.3);
                g.drawCircle(0, 0, radius + 12);
                g.endFill();
            }

            // Main circle
            g.beginFill(isFaulty ? 0xef4444 : isLeader ? 0x10b981 : 0x3b82f6);
            g.lineStyle(3, 0xffffff);
            g.drawCircle(0, 0, radius);
            g.endFill();
        };
    }, [isLeader, isFaulty, hovered, status, prepareCount, commitCount]);

    const textStyle = useMemo(() => new TextStyle({
        fill: '#ffffff',
        fontSize: 16,
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
            onpointerenter={() => onHover(node.id)}
            onpointerleave={() => onHover(null)}
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
