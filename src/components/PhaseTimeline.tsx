import React from 'react';
import { motion } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import type { Phase } from '../data/phases';

const PHASES: Phase[] = ['request', 'pre-prepare', 'prepare', 'commit', 'reply'];

const PHASE_INFO: Record<Phase, { label: string; description: string; color: string }> = {
    'request': {
        label: 'Request',
        description: 'Client sends operation to Leader',
        color: 'bg-slate-500',
    },
    'pre-prepare': {
        label: 'Pre-Prepare',
        description: 'Leader assigns sequence number and broadcasts proposal',
        color: 'bg-sky-500',
    },
    'prepare': {
        label: 'Prepare',
        description: 'All nodes broadcast PREPARE votes, need 2f+1',
        color: 'bg-purple-500',
    },
    'commit': {
        label: 'Commit',
        description: 'Nodes broadcast COMMIT votes, need 2f+1 to finalize',
        color: 'bg-amber-500',
    },
    'reply': {
        label: 'Reply',
        description: 'Nodes send result back to Client',
        color: 'bg-emerald-500',
    },
};

export default function PhaseTimeline(): React.ReactElement {
    const phase = usePbftStore((s) => s.phase);
    const round = usePbftStore((s) => s.round);
    const currentIndex = PHASES.indexOf(phase);

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-3 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">PBFT Flow</div>
                <div className="text-[10px] text-slate-400">Round {round}</div>
            </div>

            <div className="relative">
                {/* Progress line background */}
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200" />

                {/* Progress line filled */}
                <motion.div
                    className="absolute left-2.5 top-2.5 w-0.5 bg-blue-500"
                    initial={{ height: 0 }}
                    animate={{ height: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Phase steps */}
                <div className="space-y-1.5">
                    {PHASES.map((p, idx) => {
                        const info = PHASE_INFO[p];
                        const isActive = p === phase;
                        const isPast = idx < currentIndex;
                        const isFuture = idx > currentIndex;

                        return (
                            <div key={p} className="relative flex items-center gap-2 pl-0.5">
                                {/* Dot indicator */}
                                <motion.div
                                    className={`
                                        relative z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px]
                                        ${isActive ? `${info.color} border-white shadow-md` : ''}
                                        ${isPast ? 'bg-blue-500 border-blue-500' : ''}
                                        ${isFuture ? 'bg-white border-slate-300' : ''}
                                    `}
                                    animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    {isPast && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </motion.div>

                                {/* Phase label */}
                                <span className={`text-xs ${isActive ? 'text-slate-900 font-semibold' : isFuture ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {info.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
