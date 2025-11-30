import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import type { Phase } from '../data/phases';

// Teaching tips that appear at key moments
const TIPS: Record<Phase, { title: string; content: string; icon: string }[]> = {
    'request': [
        {
            title: 'Client Request',
            content: 'The client sends an operation request to the Leader node. In PBFT, clients can only communicate with the leader.',
            icon: '📤',
        },
    ],
    'pre-prepare': [
        {
            title: 'Leader Proposal',
            content: 'The Leader assigns a sequence number and broadcasts a PRE-PREPARE message to all replicas.',
            icon: '📋',
        },
        {
            title: 'Why Sequence Numbers?',
            content: 'Sequence numbers ensure all nodes process requests in the same order, even if messages arrive out of order.',
            icon: '🔢',
        },
    ],
    'prepare': [
        {
            title: 'Voting Round 1',
            content: 'Each node broadcasts a PREPARE vote to every other node, including themselves.',
            icon: '✋',
        },
        {
            title: '2f+1 Threshold',
            content: 'A node needs 2f+1 matching PREPARE votes (where f is max faulty nodes). With 4 nodes and f=1, that\'s 3 votes needed.',
            icon: '🎯',
        },
    ],
    'commit': [
        {
            title: 'Voting Round 2',
            content: 'Once a node collects 2f+1 PREPARE votes, it broadcasts a COMMIT message.',
            icon: '✅',
        },
        {
            title: 'Why Two Rounds?',
            content: 'The PREPARE phase ensures at least 2f+1 nodes agree on the value. The COMMIT phase ensures this decision is durable across failures.',
            icon: '🔒',
        },
    ],
    'reply': [
        {
            title: 'Execution & Reply',
            content: 'Nodes execute the operation and send the result back to the client.',
            icon: '📬',
        },
        {
            title: 'Client Confirmation',
            content: 'The client waits for f+1 matching replies to confirm the operation succeeded.',
            icon: '✨',
        },
    ],
};

export default function TeachingTip(): React.ReactElement | null {
    const phase = usePbftStore((s) => s.phase);
    const playing = usePbftStore((s) => s.playing);
    const [tipIndex, setTipIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    const tips = TIPS[phase] ?? [];
    const currentTip = tips[tipIndex];

    // Reset tip index when phase changes
    useEffect(() => {
        setTipIndex(0);
        setDismissed(false);
    }, [phase]);

    // Auto-advance tips
    useEffect(() => {
        if (!playing || dismissed) return;

        const timer = setTimeout(() => {
            if (tipIndex < tips.length - 1) {
                setTipIndex(tipIndex + 1);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [tipIndex, playing, tips.length, dismissed]);

    if (!currentTip || dismissed) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${phase}-${tipIndex}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-4 max-w-xs"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentTip.icon}</span>
                        <h3 className="text-white font-bold text-sm">{currentTip.title}</h3>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <p className="text-slate-300 text-xs leading-relaxed">
                    {currentTip.content}
                </p>

                {/* Pagination */}
                {tips.length > 1 && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700">
                        <div className="flex gap-1">
                            {tips.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTipIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === tipIndex ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {tipIndex > 0 && (
                                <button
                                    onClick={() => setTipIndex(tipIndex - 1)}
                                    className="text-xs text-slate-400 hover:text-white px-2"
                                >
                                    ← Prev
                                </button>
                            )}
                            {tipIndex < tips.length - 1 && (
                                <button
                                    onClick={() => setTipIndex(tipIndex + 1)}
                                    className="text-xs text-blue-400 hover:text-blue-300 px-2"
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
