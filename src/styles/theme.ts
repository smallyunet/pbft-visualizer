// Centralized color definitions to ensure consistency between Tailwind and Pixi.js
// These values match the Tailwind CSS palette and custom config.

export const COLORS = {
    // Node Colors
    node: {
        idle: 0x1e293b,      // slate-800
        leader: 0x10b981,    // emerald-500
        faulty: 0xef4444,    // red-500
        client: 0x6366f1,    // indigo-500
        clientBorder: 0x818cf8, // indigo-400
    },
    
    // Node Strokes (Brighter versions)
    stroke: {
        idle: 0x334155,      // slate-700
        leader: 0x34d399,    // emerald-400
        faulty: 0xf87171,    // red-400
        normal: 0x475569,    // slate-600
    },

    // Status/Phase Colors
    status: {
        proposed: 0x0ea5e9,  // sky-500
        prepared: 0x8b5cf6,  // violet-500
        committed: 0xf59e0b, // amber-500
        reply: 0x10b981,     // emerald-500
        viewChange: 0xf97316, // orange-500
    },

    // Message Colors
    message: {
        request: 0x6366f1,    // indigo-500
        prePrepare: 0x0ea5e9, // sky-500
        prepare: 0x8b5cf6,    // violet-500
        commit: 0xf59e0b,     // amber-500
        reply: 0x10b981,      // emerald-500
    },

    // UI Elements
    ui: {
        text: 0xffffff,
        label: 0x94a3b8,      // slate-400
        bubbleBg: 0x0f172a,   // slate-900 (darker)
        bubbleText: 0xffffff, // white text on dark bubble
        bubbleBorder: 0x1e293b, // slate-800
        voteSlotBg: 0x0f172a,   // slate-900
        voteSlotThreshold: 0x334155, // slate-700
    }
};

// Helper to get color by status string
export const getStatusColor = (status: string, isFaulty: boolean = false) => {
    if (isFaulty) return COLORS.node.faulty;
    switch (status) {
        case 'proposed': return COLORS.status.proposed;
        case 'prepared': return COLORS.status.prepared;
        case 'committed': return COLORS.status.committed;
        case 'reply': return COLORS.status.reply;
        default: return COLORS.node.idle;
    }
};

export const getMessageColor = (kind: string) => {
    switch (kind) {
        case 'request': return COLORS.message.request;
        case 'pre-prepare': return COLORS.message.prePrepare;
        case 'prepare': return COLORS.message.prepare;
        case 'commit': return COLORS.message.commit;
        case 'reply': return COLORS.message.reply;
        default: return 0x64748b;
    }
};
