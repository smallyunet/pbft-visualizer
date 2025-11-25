import React, { useEffect, useState } from 'react';
import { Stage } from '@pixi/react';
import { Application } from 'pixi.js';

interface CanvasStageProps {
    children: React.ReactNode;
    width: number;
    height: number;
    className?: string;
}

export default function CanvasStage({ children, width, height, className }: CanvasStageProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Stage
            width={width}
            height={height}
            options={{
                backgroundAlpha: 0,
                antialias: true,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            }}
            className={className}
        >
            {children}
        </Stage>
    );
}
