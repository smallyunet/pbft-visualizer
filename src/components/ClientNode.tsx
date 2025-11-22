import React from 'react';
import { motion } from 'framer-motion';

export type ClientNodeProps = {
    x: number;
    y: number;
    active: boolean;
};

export default function ClientNode({ x, y, active }: ClientNodeProps) {
    return (
        <g transform={`translate(${x}, ${y})`}>
            <title>Client Node</title>
            <motion.circle
                r={36}
                className="fill-slate-800 stroke-slate-600 stroke-[4px]"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
            {/* User Icon */}
            <g transform="translate(-16, -16) scale(1.3)">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <text x={0} y={54} textAnchor="middle" className="fill-slate-700 font-bold text-sm select-none">
                CLIENT
            </text>
        </g>
    );
}
