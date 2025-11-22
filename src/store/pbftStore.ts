import { create } from 'zustand';
import type { Phase, Message, Scene } from '../data/phases';
import { prePrepareScene, prepareScene, commitScene, requestScene, replyScene, NODES, F } from '../data/phases';

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
	// Global font scale (affects rem-based sizes via root font size)
	fontScale: number;
	setFontScale: (s: number) => void;
	// View preference utilities
	resetViewPrefs: () => void;
	// Key to force-remount scene layers (edges/nodes) on hard resets to avoid lingering SVGs
	sceneKey: number;
	startNextRound: () => void;
	toggleFaulty: (id: number) => void;
};

function sceneOf(p: Phase): Scene {
	if (p === 'request') return requestScene;
	if (p === 'pre-prepare') return prePrepareScene;
	if (p === 'prepare') return prepareScene;
	if (p === 'commit') return commitScene;
	return replyScene;
}

// Persist selected UI preferences to localStorage for better UX across reloads
type ViewPrefs = {
	showHistory: boolean;
	recentWindowMs: number;
	layoutScale: number;
	focusCurrentPhase: boolean;
	showLabels: boolean;
	fontScale: number;
	speed: number;
	autoAdvance: boolean;
	phaseDelayMs: number;
};

const PERSIST_KEY = 'pbft:viewPrefs:v1';

function loadPrefs(): Partial<ViewPrefs> {
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

function savePrefs(s: Pick<PbftState, keyof ViewPrefs>): void {
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
		};
		window.localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
	} catch {
		// Ignore persistence failures silently; UX-only enhancement.
	}
}

export const usePbftStore = create<PbftState>((set, get) => {
	const initialPhase: Phase = 'request';
	const initScene = sceneOf(initialPhase);
	const pref = loadPrefs();

	return {
		t: 0,
		phaseStart: 0,
		phase: initialPhase,
		playing: false,
		speed: pref.speed ?? 1,
		autoAdvance: pref.autoAdvance ?? true,
		phaseDelayMs: pref.phaseDelayMs ?? 2000,
		phaseAdvanceDueAt: null,

		round: 1,
		value: 0,
		nextIncrement: 1,
		expectedPayload: '+1',

		nodeStats: [],

		explanation: initScene.steps[0]?.narration ?? 'Leader proposes a value v (PRE-PREPARE).',
		logs: [],
		timeline: [],
		nodes: Array.from({ length: NODES }, (_, i) => ({
			id: i,
			role: i === 0 ? 'leader' : 'replica',
			state: 'normal',
		})),
		client: { x: 100, y: 100, active: true },

		n: NODES,
		f: F,

		// Rendering preferences (with persisted defaults)
		showHistory: pref.showHistory ?? false,
		recentWindowMs: pref.recentWindowMs ?? 1200,
		layoutScale: pref.layoutScale ?? 1.4,
		focusCurrentPhase: pref.focusCurrentPhase ?? true,
		showLabels: pref.showLabels ?? false,
		hoveredNodeId: null,
		fontScale: pref.fontScale ?? 1.2,
		sceneKey: 0,

		setPhase: (p) => {
			const scene = sceneOf(p);
			set({
				phase: p,
				phaseStart: get().t,
				// Keep global clock monotonic; reuse timeline so past edges fade smoothly.
				playing: false,
				explanation: scene.steps[0]?.narration ?? '',
				phaseAdvanceDueAt: null,
				nodeStats: [],
			});
		},

		resetPhase: () => {
			const { phase } = get();
			const scene = sceneOf(phase);
			const now = get().t;
			set({ phaseStart: now, t: now, timeline: [], playing: false, explanation: scene.steps[0]?.narration ?? '', logs: [], phaseAdvanceDueAt: null, sceneKey: get().sceneKey + 1, hoveredNodeId: null, nodeStats: [] });
		},

		// Reset everything to round 1 and initial phase, preserving node fault selections for experimentation
		resetAll: () => {
			const scene = sceneOf('request');
			set({
				t: 0,
				phaseStart: 0,
				phase: 'request',
				playing: false,
				timeline: [],
				logs: [],
				phaseAdvanceDueAt: null,
				round: 1,
				value: 0,
				nextIncrement: 1,
				expectedPayload: '+1',
				explanation: scene.steps[0]?.narration ?? '',
				nodeStats: [],
				hoveredNodeId: null,
				sceneKey: get().sceneKey + 1,
			});
		},

		// Immediately move to the next phase (or finish round when already in commit)
		skipPhase: () => {
			const { phase, value, nextIncrement, round } = get();
			if (phase === 'request') {
				const ns = sceneOf('pre-prepare');
				const now = get().t;
				set((s) => ({
					phase: 'pre-prepare',
					phaseStart: now,
					t: now,
					explanation: ns.steps[0]?.narration ?? '',
					logs: [...s.logs, { t: s.t, text: '--> Phase: pre-prepare (skipped)' }],
					phaseAdvanceDueAt: null,
					nodeStats: [],
				}));
				return;
			}
			if (phase === 'pre-prepare') {
				const ns = sceneOf('prepare');
				const now = get().t;
				set((s) => ({
					phase: 'prepare',
					phaseStart: now,
					t: now,
					explanation: ns.steps[0]?.narration ?? '',
					logs: [...s.logs, { t: s.t, text: '--> Phase: prepare (skipped)' }],
					phaseAdvanceDueAt: null,
					nodeStats: [],
				}));
				return;
			}
			if (phase === 'prepare') {
				const ns = sceneOf('commit');
				const now = get().t;
				set((s) => ({
					phase: 'commit',
					phaseStart: now,
					t: now,
					explanation: ns.steps[0]?.narration ?? '',
					logs: [...s.logs, { t: s.t, text: '--> Phase: commit (skipped)' }],
					phaseAdvanceDueAt: null,
					nodeStats: [],
				}));
				return;
			}
			if (phase === 'commit') {
				const ns = sceneOf('reply');
				const now = get().t;
				set((s) => ({
					phase: 'reply',
					phaseStart: now,
					t: now,
					explanation: ns.steps[0]?.narration ?? '',
					logs: [...s.logs, { t: s.t, text: '--> Phase: reply (skipped)' }],
					phaseAdvanceDueAt: null,
					nodeStats: [],
				}));
				return;
			}
			// phase === 'reply': end the round immediately
			const newValue = value + nextIncrement;
			set((s) => ({
				value: newValue,
				logs: [
					...s.logs,
					{ t: s.t, text: `✓ Round ${round} committed (skipped). Result value = ${newValue}` },
				],
			}));
			get().startNextRound();
		},

		togglePlay: () => set((s) => ({ playing: !s.playing })),

		step: (ms = 300) => {
			const { t, phase, autoAdvance, phaseAdvanceDueAt, phaseDelayMs, expectedPayload, phaseStart } = get();
			const next = t + ms;
			const scene = sceneOf(phase);
			const windowStart = t - phaseStart;
			const windowEnd = next - phaseStart;

			// Gather newly due messages based on timeline clock
			const due: Message[] = [];
			scene.steps.forEach((step) => {
				// Include steps whose atMs falls within (t, next] inclusive of next
				if (windowStart <= step.atMs && windowEnd >= step.atMs) {
					due.push(...step.messages);
					if (step.narration) {
						set((s) => ({ explanation: step.narration!, logs: [...s.logs, { t: next, text: step.narration! }] }));
					}
				}
			});

			if (due.length) {
				// If a node is faulty, mark its outgoing messages as conflicting to visualize misbehavior
				const nodes = get().nodes;
				const annotated = due.map((m) => {
					const fromNode = m.from >= 0 ? nodes[m.from] : undefined;
					const basePayload = m.payload === 'v' ? expectedPayload : m.payload;
					if (fromNode?.state === 'faulty') {
						// Different payload to illustrate Byzantine divergence.
						return { ...m, conflicting: true, payload: `${basePayload}*`, at: next } as RenderedMessage;
					}
					return { ...m, payload: basePayload, at: next } as RenderedMessage;
				});

				// Group logs by kind to reduce noise.
				const groups: Record<string, Message[]> = {};
				annotated.forEach((m) => {
					groups[m.kind] = groups[m.kind] ? [...groups[m.kind], m] : [m];
				});
				const summarised = Object.entries(groups).map(([kind, msgs]) => {
					const list = msgs.map((m) => `n${m.from}->n${m.to}${m.conflicting ? '(!)' : ''}`).join(', ');
					return { t: next, text: `${label(kind as Message['kind'])} ${list}` };
				});
				set((s) => ({
					timeline: [...s.timeline, ...annotated],
					logs: [...s.logs, ...summarised],
				}));

				// Update derived node stats after adding messages
				set((s) => ({ nodeStats: computeNodeStats({ ...s, timeline: [...s.timeline, ...annotated] }) }));
			}

			set({ t: next });

			// Prune very old messages even if showHistory is on (hard cap) to avoid unbounded memory growth.
			// Keep at most last 500 messages and drop those older than 30s.
			set((s) => {
				const HARD_LIMIT = 500;
				const MAX_AGE_MS = 30000;
				let tl = s.timeline;
				if (tl.length > HARD_LIMIT || (tl.length && next - tl[0].at > MAX_AGE_MS)) {
					const pruned = tl.filter((m) => next - m.at <= MAX_AGE_MS).slice(-HARD_LIMIT);
					return { timeline: pruned } as Partial<PbftState>;
				}
				return {};
			});

			// Prune logs similarly to prevent unbounded growth (keep last 1000 within 30s).
			set((s) => {
				const HARD_LIMIT = 1000;
				const MAX_AGE_MS = 30000;
				const pruned = s.logs.filter((l) => next - l.t <= MAX_AGE_MS).slice(-HARD_LIMIT);
				if (pruned.length !== s.logs.length) {
					return { logs: pruned } as Partial<PbftState>;
				}
				return {};
			});

			// Auto-advance to next phase once we've passed the last scheduled step, after an optional pause
			const lastAt = scene.steps.reduce((max, s) => (s.atMs > max ? s.atMs : max), 0);
			if (get().playing && autoAdvance && windowEnd > lastAt) {
				const np = phase === 'request' ? 'pre-prepare' : phase === 'pre-prepare' ? 'prepare' : phase === 'prepare' ? 'commit' : phase === 'commit' ? 'reply' : undefined;
				if (!np) {
					// End of round (reply complete): update result and schedule next round
					if (phaseAdvanceDueAt == null) {
						const { value, nextIncrement, round } = get();
						const newValue = value + nextIncrement;
						const due = next + phaseDelayMs;
						set((s) => ({
							value: newValue,
							logs: [
								...s.logs,
								{ t: next, text: `✓ Round ${round} committed. Result value = ${newValue}` },
								{ t: next, text: `... Waiting ${(phaseDelayMs / 1000).toFixed(1)}s before next round` },
							],
							phaseAdvanceDueAt: due,
						}));
					} else if (next >= phaseAdvanceDueAt) {
						get().startNextRound();
					}
				} else if (phaseAdvanceDueAt == null) {
					// Schedule the phase change after a pause
					const due = next + phaseDelayMs;
					set((s) => ({
						phaseAdvanceDueAt: due,
						logs: [...s.logs, { t: next, text: `... Waiting ${(phaseDelayMs / 1000).toFixed(1)}s before next phase (${np})` }],
					}));
				} else if (next >= phaseAdvanceDueAt) {
					const ns = sceneOf(np);
					set((s) => ({
						phase: np,
						phaseStart: next,
						t: next,
						// Keep timeline so previous phase arrows can fade out smoothly; stats recomputed below.
						explanation: ns.steps[0]?.narration ?? '',
						logs: [...s.logs, { t: next, text: `--> Phase: ${np}` }],
						phaseAdvanceDueAt: null,
						nodeStats: computeNodeStats({ ...s, timeline: s.timeline, phase: np }),
					}));
				}
			}
		},

		setSpeed: (s) => set({ speed: s }),
		setAutoAdvance: (on) => {
			set({ autoAdvance: on, phaseAdvanceDueAt: on ? get().phaseAdvanceDueAt : null });
			savePrefs(get());
		},
		setPhaseDelay: (ms) => {
			set({ phaseDelayMs: ms });
			savePrefs(get());
		},
		setShowHistory: (on) => {
			set({ showHistory: on });
			savePrefs(get());
		},
		setRecentWindowMs: (ms) => {
			set({ recentWindowMs: ms });
			savePrefs(get());
		},
		setLayoutScale: (scl) => {
			set({ layoutScale: scl });
			savePrefs(get());
		},
		setFocusCurrentPhase: (on) => {
			set({ focusCurrentPhase: on });
			savePrefs(get());
		},
		setShowLabels: (on) => {
			set({ showLabels: on });
			savePrefs(get());
		},
		setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
		setFontScale: (fs) => {
			set({ fontScale: Math.max(0.8, Math.min(1.6, fs)) });
			savePrefs(get());
		},

		resetViewPrefs: () => {
			set({
				showHistory: false,
				recentWindowMs: 1600,
				layoutScale: 1.3,
				focusCurrentPhase: true,
				showLabels: false,
				fontScale: 1.0,
				speed: 1,
				autoAdvance: true,
				phaseDelayMs: 2000,
			});
			savePrefs(get());
		},

		startNextRound: () => {
			const { nextIncrement, round, t } = get();
			const newIncrement = nextIncrement + 1;
			const newRound = round + 1;
			const newExpected = `+${newIncrement}`;
			const scene = sceneOf('request');
			set((s) => ({
				round: newRound,
				nextIncrement: newIncrement,
				expectedPayload: newExpected,
				phase: 'request',
				phaseStart: t,
				t,
				// Keep timeline so last round fades out; new payload prevents stale messages from affecting stats.
				explanation: scene.steps[0]?.narration ?? '',
				logs: [...s.logs, { t: s.t, text: `==> Round ${newRound} start. Proposed delta ${newExpected}` }],
				phaseAdvanceDueAt: null,
				nodeStats: [],
			}));
		},

		toggleFaulty: (id) => {
			const { nodes, timeline, logs, t } = get();
			const nextNodes: NodeUi[] = nodes.map((n) => (n.id === id ? { ...n, state: n.state === 'normal' ? 'faulty' : 'normal' } : n));
			const toggled = nextNodes.find((n) => n.id === id)!;

			// Retroactively mark existing messages from this node as conflicting if node just became faulty.
			let nextTimeline = timeline;
			if (toggled.state === 'faulty') {
				const current = get().expectedPayload;
				nextTimeline = timeline.map((m) => {
					if (m.from === id && !m.conflicting) {
						const base = m.payload === 'v' ? current : m.payload;
						return { ...m, conflicting: true, payload: `${base}*` };
					}
					return m;
				});
			} else {
				// If node returns to normal, keep existing conflicts (historical) unchanged.
			}

			set({
				nodes: nextNodes,
				timeline: nextTimeline,
				logs: [
					...logs,
					{ t, text: `*** Node n${id} ${toggled.state === 'faulty' ? 'became FAULTY' : 'returned to NORMAL'}` },
				],
				nodeStats: computeNodeStats({ ...get(), timeline: nextTimeline }),
			});
		},
	};
});

function label(k: Message['kind']): string {
	if (k === 'request') return '[REQUEST]';
	if (k === 'pre-prepare') return '[PRE-PREPARE]';
	if (k === 'prepare') return '[PREPARE]';
	if (k === 'commit') return '[COMMIT]';
	return '[REPLY]';
}

function desc(m: Message): string {
	const tag = m.conflicting ? ' (conflict)' : '';
	return `n${m.from} -> n${m.to} payload=${m.payload}${tag}`;
}

function computeNodeStats(s: Pick<PbftState, 'timeline' | 'expectedPayload' | 'phase' | 'f' | 'n'>): Array<{ prepare: number; commit: number; proposed: boolean; status: 'idle' | 'proposed' | 'prepared' | 'committed' }> {
	const needed = 2 * s.f + 1;
	type Stat = { prepare: number; commit: number; proposed: boolean; status: 'idle' | 'proposed' | 'prepared' | 'committed' };
	const stats: Stat[] = Array.from({ length: s.n }, () => ({ prepare: 0, commit: 0, proposed: false, status: 'idle' }));
	// Each node counts its own PREPARE/COMMIT vote once it broadcasts (PBFT counts local vote).
	const selfPrepare = new Set<number>();
	const selfCommit = new Set<number>();
	// Leader originates the value so it is already "proposed" even without a self-addressed PRE-PREPARE.
	if (stats.length > 0) stats[0].proposed = true;
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
