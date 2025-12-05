import React from 'react';
import { useTick } from '@pixi/react';
import { usePbftStore } from '../store/pbftStore';

export default function SimulationTicker() {
    const playing = usePbftStore((s) => s.playing);
    const speed = usePbftStore((s) => s.speed);
    const step = usePbftStore((s) => s.step);

    useTick((delta) => {
        if (playing) {
            // delta is in frames (1 = 60fps). Convert to ms.
            // 1 frame at 60fps is approx 16.66ms.
            // Pixi's delta is a scalar (1.0 = expected frame time).
            // We want to advance time by actual elapsed time or fixed step?
            // The store's step function takes ms.
            // Let's assume 16.66ms per delta unit for simplicity, or just use a fixed step
            // to ensure determinism, but useTick is tied to frame rate.
            // Better: step(16.66 * delta * speed)
            
            step(16.66 * delta * speed);
        }
    });

    return null;
}
