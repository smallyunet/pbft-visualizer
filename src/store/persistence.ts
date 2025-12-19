import type { ViewPrefs, PbftState } from './types';

const PERSIST_KEY = 'pbft:viewPrefs:v1';

export function loadPrefs(): Partial<ViewPrefs> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(PERSIST_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Partial<ViewPrefs>;
        return parsed ?? {};
    } catch {
        return {};
    }
}

export function savePrefs(s: Pick<PbftState, keyof ViewPrefs>): void {
    if (typeof window === 'undefined') return;
    try {
        const payload: ViewPrefs = {
            showHistory: s.showHistory,
            recentWindowMs: s.recentWindowMs,
            layoutScale: s.layoutScale,
            focusCurrentPhase: s.focusCurrentPhase,
            showLabels: s.showLabels,
            fontScale: s.fontScale,
            speed: s.speed,
            autoAdvance: s.autoAdvance,
            phaseDelayMs: s.phaseDelayMs,
            viewMode: s.viewMode,
            manualMode: s.manualMode,
            jitter: s.jitter,
            view: s.view,
            leaderId: s.leaderId,
        };
        window.localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
    } catch {
        // Ignore persistence failures silently; UX-only enhancement.
    }
}
