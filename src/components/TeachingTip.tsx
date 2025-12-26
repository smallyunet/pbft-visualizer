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

    // Auto-advance tips - reduced from 5s to 3s for better UX
    useEffect(() => {
        if (!playing || dismissed) return;

        const timer = setTimeout(() => {
            if (tipIndex < tips.length - 1) {
                setTipIndex(tipIndex + 1);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [tipIndex, playing, tips.length, dismissed]);

    if (!currentTip || dismissed) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${phase}-${tipIndex}`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring", damping: 25 }}
                className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] shadow-4xl border border-white/10 p-6 max-w-xs relative overflow-hidden group/tip"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />

                {/* Header */}
                <div className="relative flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover/tip:scale-110 transition-transform duration-500">
                            {currentTip.icon}
                        </div>
                        <h3 className="text-white font-black text-sm tracking-tight italic uppercase">{currentTip.title}</h3>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all duration-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <p className="relative text-slate-400 text-[13px] leading-relaxed font-medium">
                    {currentTip.content}
                </p>

                {/* Pagination */}
                {tips.length > 1 && (
                    <div className="relative flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <div className="flex gap-1.5">
                            {tips.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTipIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === tipIndex ? 'bg-indigo-400 w-4 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-slate-700 hover:bg-slate-600'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {tipIndex > 0 && (
                                <button
                                    onClick={() => setTipIndex(tipIndex - 1)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                >
                                    Prev
                                </button>
                            )}
                            {tipIndex < tips.length - 1 && (
                                <button
                                    onClick={() => setTipIndex(tipIndex + 1)}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
