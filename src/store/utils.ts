import type { Phase, Message, Scene, SceneStep } from '../data/phases';
import { prePrepareScene, prepareScene, commitScene, requestScene, replyScene, NODES } from '../data/phases';
import type { PbftState, RenderedMessage } from './types';

export function sceneOf(p: Phase, leaderId: number = 0): Scene {
    let baseScene: Scene;
    if (p === 'request') baseScene = requestScene;
    else if (p === 'pre-prepare') baseScene = prePrepareScene;
    else if (p === 'prepare') baseScene = prepareScene;
    else if (p === 'commit') baseScene = commitScene;
    else baseScene = replyScene;

    if (leaderId === 0) return baseScene;

    // Map node IDs: i -> (i + leaderId) % NODES
    return {
        ...baseScene,
        steps: baseScene.steps.map((step: SceneStep) => ({
            ...step,
            messages: step.messages.map((m: Message) => ({
                ...m,
                from: m.from >= 0 ? (m.from + leaderId) % NODES : m.from,
                to: m.to >= 0 ? (m.to + leaderId) % NODES : m.to,
            }))
        }))
    };
}

export function label(k: Message['kind']): string {
    if (k === 'request') return '[REQUEST]';
    if (k === 'pre-prepare') return '[PRE-PREPARE]';
    if (k === 'prepare') return '[PREPARE]';
    if (k === 'commit') return '[COMMIT]';
    return '[REPLY]';
}

export function desc(m: Message): string {
    const tag = m.conflicting ? ' (conflict)' : '';
    return `n${m.from} -> n${m.to} payload=${m.payload}${tag}`;
}

export function computeNodeStats(s: Pick<PbftState, 'timeline' | 'expectedPayload' | 'phase' | 'f' | 'n' | 'leaderId'>): Array<{ prepare: number; commit: number; proposed: boolean; status: 'idle' | 'proposed' | 'prepared' | 'committed' }> {
    const needed = 2 * s.f + 1;
    type Stat = { prepare: number; commit: number; proposed: boolean; status: 'idle' | 'proposed' | 'prepared' | 'committed' };
    const stats: Stat[] = Array.from({ length: s.n }, () => ({ prepare: 0, commit: 0, proposed: false, status: 'idle' }));
    // Each node counts its own PREPARE/COMMIT vote once it broadcasts (PBFT counts local vote).
    const selfPrepare = new Set<number>();
    const selfCommit = new Set<number>();
    // Leader originates the value so it is already "proposed" even without a self-addressed PRE-PREPARE.
    if (stats.length > s.leaderId) stats[s.leaderId].proposed = true;
    const ok = s.expectedPayload;
    s.timeline.forEach((m) => {
        const to = m.to;
        if (to == null || to < 0 || to >= s.n) return;
        if (m.kind === 'pre-prepare' && !m.conflicting && (m.payload === ok)) stats[to].proposed = true;
        if (m.kind === 'prepare' && !m.conflicting && m.payload === ok) {
            stats[to].prepare += 1;
            if (m.from >= 0 && m.from < s.n) {
                selfPrepare.add(m.from);
                stats[m.from].proposed = true;
            }
        }
        if (m.kind === 'commit' && !m.conflicting && m.payload === ok) {
            stats[to].commit += 1;
            if (m.from >= 0 && m.from < s.n) selfCommit.add(m.from);
        }
    });
    selfPrepare.forEach((id) => { stats[id].prepare += 1; });
    selfCommit.forEach((id) => { stats[id].commit += 1; });
    for (let i = 0; i < stats.length; i++) {
        const st = stats[i];
        if (s.phase === 'reply') st.status = 'committed';
        else if (s.phase === 'commit') st.status = st.commit >= needed ? 'committed' : st.prepare >= needed ? 'prepared' : st.proposed ? 'proposed' : 'idle';
        else if (s.phase === 'prepare') st.status = st.prepare >= needed ? 'prepared' : st.proposed ? 'proposed' : 'idle';
        else st.status = st.proposed ? 'proposed' : 'idle';
    }
    return stats;
}
