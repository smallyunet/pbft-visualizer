// Centralized color definitions to ensure consistency between Tailwind and Pixi.js
// These values match the Tailwind CSS palette and custom config.

export const COLORS = {
    // Node Colors
    node: {
        idle: 0x475569,      // slate-600
        leader: 0x16a34a,    // green-600
        faulty: 0xdc2626,    // red-600
        client: 0x334155,    // slate-700
        clientBorder: 0x94a3b8, // slate-400
    },
    
    // Node Strokes (Brighter versions)
    stroke: {
        idle: 0x94a3b8,      // slate-400
        leader: 0x34d399,    // emerald-400
        faulty: 0xf87171,    // red-400
        normal: 0x94a3b8,    // slate-400
    },

    // Status/Phase Colors
    status: {
        proposed: 0x38bdf8,  // sky-400
        prepared: 0xc084fc,  // purple-400
        committed: 0xfacc15, // yellow-400
        reply: 0x4ade80,     // green-400
        viewChange: 0xf97316, // orange-500
    },

    // Message Colors
    message: {
        request: 0x94a3b8,    // slate-400
        prePrepare: 0x38bdf8, // sky-400
        prepare: 0xc084fc,    // purple-400
        commit: 0xfacc15,     // yellow-400
        reply: 0x4ade80,      // green-400
    },

    // UI Elements
    ui: {
        text: 0xffffff,
        label: 0xcbd5e1,      // slate-300
        bubbleBg: 0xffffff,
        bubbleText: 0x0f172a, // slate-900
        bubbleBorder: 0xcbd5e1, // slate-300
        voteSlotBg: 0x334155, // slate-700
        voteSlotThreshold: 0xffffff,
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
