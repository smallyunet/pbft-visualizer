import { create } from 'zustand';
import type { Phase, Message } from '../data/phases';
import { NODES, F } from '../data/phases';
import type { PbftState, NodeUi, RenderedMessage } from './types';
export type { PbftState, NodeUi, RenderedMessage };
import { loadPrefs, savePrefs } from './persistence';
import { sceneOf, label, computeNodeStats } from './utils';

export const usePbftStore = create<PbftState>((set, get) => {
	const initialPhase: Phase = 'request';
	const initScene = sceneOf(initialPhase);
	const pref = loadPrefs();

	return {
		t: 0,
		phaseStart: 0,
		phase: initialPhase,
		playing: false,
		speed: pref.speed ?? 0.5,
		autoAdvance: pref.autoAdvance ?? true,
		phaseDelayMs: pref.phaseDelayMs ?? 2000,
		phaseAdvanceDueAt: null,

		view: pref.view ?? 0,
		leaderId: pref.leaderId ?? 0,
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
		hoveredMessage: null,
		fontScale: pref.fontScale ?? 1.2,
		viewMode: pref.viewMode ?? 'radial',
		sceneKey: 0,
		manualMode: pref.manualMode ?? false,
		jitter: pref.jitter ?? 0,

		setManualMode: (m) => {
			set({ manualMode: m });
			savePrefs(get());
		},
		setJitter: (j) => {
			set({ jitter: j });
			savePrefs(get());
		},
		triggerRequest: () => {
			// User clicks "Send Request" -> startNextRound().
			get().startNextRound();
		},

		rotateLeader: () => {
			const { view, n } = get();
			const nextView = view + 1;
			const nextLeader = nextView % n;
			set((s) => ({
				view: nextView,
				leaderId: nextLeader,
				logs: [...s.logs, { t: s.t, text: `!!! VIEW CHANGE: View ${nextView}, New Leader n${nextLeader}` }],
				nodes: s.nodes.map((n) => ({
					...n,
					role: n.id === nextLeader ? 'leader' : 'replica',
				})),
				nodeStats: computeNodeStats({ ...get(), leaderId: nextLeader }),
			}));
			savePrefs(get());
		},

		dropMessage: (messageId) => {
			const { timeline, logs, t } = get();
			const filtered = timeline.filter((m) => m.id !== messageId);
			if (filtered.length !== timeline.length) {
				set({
					timeline: filtered,
					logs: [...logs, { t, text: `--- Message ${messageId} dropped by user` }],
					nodeStats: computeNodeStats({ ...get(), timeline: filtered }),
				});
			}
		},

		setPhase: (p) => {
			const { leaderId } = get();
			const scene = sceneOf(p, leaderId);
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
			const { phase, leaderId } = get();
			const scene = sceneOf(phase, leaderId);
			const now = get().t;
			set({ phaseStart: now, t: now, timeline: [], playing: false, explanation: scene.steps[0]?.narration ?? '', logs: [], phaseAdvanceDueAt: null, sceneKey: get().sceneKey + 1, hoveredNodeId: null, nodeStats: [] });
		},

		// Reset everything to round 1 and initial phase, preserving node fault selections for experimentation
		resetAll: () => {
			const { leaderId } = get();
			const scene = sceneOf('request', leaderId);
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
				const { leaderId } = get();
				const ns = sceneOf('pre-prepare', leaderId);
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
				const { leaderId } = get();
				const ns = sceneOf('prepare', leaderId);
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
				const { leaderId } = get();
				const ns = sceneOf('commit', leaderId);
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
				const { leaderId } = get();
				const ns = sceneOf('reply', leaderId);
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
			const { t, phase, autoAdvance, phaseAdvanceDueAt, phaseDelayMs, expectedPayload, phaseStart, leaderId } = get();
			const next = t + ms;
			const scene = sceneOf(phase, leaderId);
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
					// Add network jitter to delivery time
					const deliveryTime = next + Math.random() * get().jitter;

					if (fromNode?.state === 'faulty') {
						// Different payload to illustrate Byzantine divergence.
						return { ...m, conflicting: true, payload: `${basePayload}*`, at: deliveryTime } as RenderedMessage;
					}
					return { ...m, payload: basePayload, at: deliveryTime } as RenderedMessage;
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
						if (get().manualMode) {
							// In manual mode, we do NOT auto-start the next round.
							// Just clear the due time so we remain in "Waiting" state effectively.
							// But we need to make sure we don't spam logs.
							if (get().phaseAdvanceDueAt !== null) {
								set((s) => ({
									phaseAdvanceDueAt: null, // Clear timer
									logs: [...s.logs, { t: next, text: `... Waiting for Client Request (Manual Mode)` }],
								}));
							}
						} else {
							get().startNextRound();
						}
					}
				} else if (phaseAdvanceDueAt == null) {
					// Schedule the phase change after a pause
					const due = next + phaseDelayMs;
					set((s) => ({
						phaseAdvanceDueAt: due,
						logs: [...s.logs, { t: next, text: `... Waiting ${(phaseDelayMs / 1000).toFixed(1)}s before next phase (${np})` }],
					}));
				} else if (next >= phaseAdvanceDueAt) {
					const { leaderId } = get();
					const ns = sceneOf(np, leaderId);
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
		setHoveredMessage: (m) => set({ hoveredMessage: m }),
		setFontScale: (fs) => {
			set({ fontScale: Math.max(0.8, Math.min(1.6, fs)) });
			savePrefs(get());
		},
		setViewMode: (m) => {
			set({ viewMode: m });
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
				viewMode: 'radial',
				manualMode: false,
				jitter: 0,
				view: 0,
				leaderId: 0,
			});
			savePrefs(get());
		},

		startNextRound: () => {
			const { nextIncrement, round, t, leaderId } = get();
			const newIncrement = nextIncrement + 1;
			const newRound = round + 1;
			const newExpected = `+${newIncrement}`;
			const scene = sceneOf('request', leaderId);
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
