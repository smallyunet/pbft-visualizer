import type { Phase, Message } from '../data/phases';

export type NodeUi = {
    id: number;
    role: 'leader' | 'replica';
    state: 'normal' | 'faulty';
};

export type LogEntry = { t: number; text: string };

// Message stored on the timeline with emission time for rendering filters
export type RenderedMessage = Message & { at: number };

export type PbftState = {
    // Simulation clock and phase
    t: number;
    phaseStart: number; // absolute time when current phase started (keeps global clock monotonic)
    phase: Phase;
    playing: boolean;
    speed: number; // 0.5, 1, 2
    autoAdvance: boolean; // automatically move to next phase
    phaseDelayMs: number; // extra pause between phases
    phaseAdvanceDueAt: number | null; // scheduled time to move to next phase

    // Round/value lifecycle
    view: number; // current view number
    leaderId: number; // view % n
    round: number; // 1-based round index
    value: number; // accumulated result value
    nextIncrement: number; // current round proposes to add this delta at commit
    expectedPayload: string; // placeholder replacement for 'v' in messages, e.g. '+1'

    // Derived per-node consensus stats for teaching overlays
    nodeStats: Array<{
        prepare: number;
        commit: number;
        proposed: boolean;
        status: 'idle' | 'proposed' | 'prepared' | 'committed';
    }>;

    // Teaching UI state
    explanation: string;
    logs: LogEntry[];
    timeline: RenderedMessage[];
    nodes: NodeUi[];
    client: { x: number; y: number; active: boolean };

    // Parameters (n = 3f + 1)
    n: number;
    f: number;

    // Actions
    setPhase: (p: Phase) => void;
    resetPhase: () => void;
    togglePlay: () => void;
    step: (ms?: number) => void;
    setSpeed: (s: number) => void;
    setAutoAdvance: (on: boolean) => void;
    setPhaseDelay: (ms: number) => void;
    // Session controls
    resetAll: () => void;
    skipPhase: () => void;
    // Rendering preferences
    showHistory: boolean;
    recentWindowMs: number;
    setShowHistory: (on: boolean) => void;
    setRecentWindowMs: (ms: number) => void;
    layoutScale: number; // affects node spacing
    setLayoutScale: (s: number) => void;
    // Visual clarity preferences
    focusCurrentPhase: boolean; // dim non-current-phase messages
    setFocusCurrentPhase: (on: boolean) => void;
    showLabels: boolean; // show payload labels on edges without hover
    setShowLabels: (on: boolean) => void;
    hoveredNodeId: number | null; // globally hovered node to highlight incident edges
    setHoveredNodeId: (id: number | null) => void;
    hoveredMessage: RenderedMessage | null;
    setHoveredMessage: (m: RenderedMessage | null) => void;
    // Global font scale (affects rem-based sizes via root font size)
    fontScale: number;
    setFontScale: (s: number) => void;
    // View mode: radial (default), linear (horizontal), vertical (stack), or hierarchy (tree)
    viewMode: 'radial' | 'linear' | 'vertical' | 'hierarchy';
    setViewMode: (m: 'radial' | 'linear' | 'vertical' | 'hierarchy') => void;
    // View preference utilities
    resetViewPrefs: () => void;
    // Key to force-remount scene layers (edges/nodes) on hard resets to avoid lingering SVGs
    sceneKey: number;
    startNextRound: () => void;
    toggleFaulty: (id: number) => void;

    // v0.0.2 Features
    manualMode: boolean; // if true, next round waits for user trigger
    jitter: number; // max random delay (ms) added to message delivery
    setManualMode: (m: boolean) => void;
    setJitter: (j: number) => void;
    triggerRequest: () => void;
    rotateLeader: () => void;
    dropMessage: (messageId: string) => void;
};

// Persist selected UI preferences to localStorage for better UX across reloads
export type ViewPrefs = {
    showHistory: boolean;
    recentWindowMs: number;
    layoutScale: number;
    focusCurrentPhase: boolean;
    showLabels: boolean;
    fontScale: number;
    speed: number;
    autoAdvance: boolean;
    phaseDelayMs: number;
    viewMode: 'radial' | 'linear' | 'vertical' | 'hierarchy';
    manualMode: boolean;
    jitter: number;
    view: number;
    leaderId: number;
};
