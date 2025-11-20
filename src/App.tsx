import React, { useEffect, useMemo } from 'react';
import { usePbftStore } from './store/pbftStore';
import type { PbftState, RenderedMessage } from './store/pbftStore';
import { shallow } from 'zustand/shallow';
import { radialPositions } from './utils/layout';
import Node from './components/Node';
import MessageArrow from './components/MessageArrow';
import ControlPanel from './components/ControlPanel';
import ExplanationBox from './components/ExplanationBox';
import LogPanel from './components/LogPanel';
import Legend from './components/Legend';
import ConsensusProgress from './components/ConsensusProgress';
import { STEP_MS } from './data/phases';


export default function App(): React.ReactElement {
		const { nodes, timeline, playing, step, speed, showHistory, recentWindowMs, t, layoutScale, fontScale, sceneKey } = usePbftStore(
		(s: PbftState) => ({
			nodes: s.nodes,
			timeline: s.timeline,
			playing: s.playing,
			step: s.step,
			speed: s.speed,
			showHistory: s.showHistory,
			recentWindowMs: s.recentWindowMs,
			t: s.t,
			layoutScale: s.layoutScale,
				fontScale: s.fontScale,
				sceneKey: s.sceneKey,
		}),
		shallow
	);
	const phase = usePbftStore((s) => s.phase);


	// Timer loop: advance simulated clock faster when speed is higher.
	// Previous logic inverted speed (higher speed advanced fewer ms). Fix: multiply.
	useEffect(() => {
		if (!playing) return;
		const tickMs = 200; // real time interval
		const id = setInterval(() => step(tickMs * speed), tickMs);
		return () => clearInterval(id);
	}, [playing, speed, step]);


	const size = { w: 980, h: 680 };
	const center = { x: size.w / 2, y: size.h / 2 };
	// Increase base radial distance to accommodate larger node visuals
	const positions = useMemo(() => radialPositions(nodes.length, center.x, center.y, Math.round(230 * layoutScale)), [nodes.length, layoutScale]);
	const visibleTimeline = useMemo(
		() => {
			if (showHistory) return timeline;
			// Only show messages already "occurred" (m.at <= t) and still within recent window.
			return timeline.filter((m: RenderedMessage) => m.at <= t && (t - m.at) <= recentWindowMs);
		},
		[timeline, showHistory, t, recentWindowMs]
	);


	return (
	<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-purple-50/40" style={{ fontSize: `${fontScale * 16}px` }}>
			<div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
				<div className="grid gap-6 lg:grid-cols-[240px_1fr]">
					<aside className="hidden lg:flex flex-col gap-4 sticky top-6 self-start">
						<div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-white/50 p-4">
							<h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PBFT<br />Visualizer</h1>
							<p className="text-slate-600 mt-2 text-sm leading-relaxed">Interactive, teaching-oriented animation of Pre‑prepare → Prepare → Commit. Use the controls to step through or auto-play.</p>
						</div>
					</aside>

					<div className="flex flex-col gap-5">
						<header className="flex flex-col gap-3 animate-fade-in">
							<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
								<div>
									<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-slate-600 ring-1 ring-white/70 shadow-sm">Teaching Mode</div>
									<h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">Practical PBFT timeline</h2>
									<div className="text-slate-600 mt-1 text-sm">Track messages, thresholds, and faulty behavior across rounds.</div>
								</div>
							</div>
							<div className="sticky top-4 z-20">
								<ControlPanel />
							</div>
						</header>


						<main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
							<section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl ring-1 ring-white/60 p-4">
								<svg viewBox={`0 0 ${size.w} ${size.h}`} className="w-full h-[640px]">
												{/* Reusable arrowhead marker */}
							<defs>
								<marker id="arrowhead" markerWidth="13" markerHeight="9" refX="13" refY="4.5" orient="auto">
									<polygon points="0 0, 13 4.5, 0 9" className="fill-slate-700" />
								</marker>
								{/* Subtle glow for leader node to improve salience */}
								<filter id="leaderGlow" x="-50%" y="-50%" width="200%" height="200%">
									<feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
									<feMerge>
										<feMergeNode in="blur" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								{/* Edge glow for emphasized current-phase edges */}
								<filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
									<feGaussianBlur stdDeviation="1.2" result="glow" />
									<feMerge>
										<feMergeNode in="glow" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								{/* Glow for conflicting (Byzantine) messages for stronger visual separation */}
								<filter id="conflictGlow" x="-60%" y="-60%" width="220%" height="220%">
									<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="cBlur" />
									<feColorMatrix in="cBlur" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" result="redGlow" />
									<feMerge>
										<feMergeNode in="redGlow" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								{/* Radial background gradient definition */}
								<radialGradient id="vizRadial" cx="50%" cy="50%" r="70%">
									<stop offset="0%" stopColor="#f8fafc" />
									<stop offset="65%" stopColor="#eef2f6" />
									<stop offset="100%" stopColor="#e2e8f0" />
								</radialGradient>
							</defs>

												{/* Background shape and subtle phase banner */}
												<rect x={0} y={0} width={size.w} height={size.h} rx={28} className="viz-bg" />
												<g>
													<rect x={0} y={0} width={size.w} height={34} className="fill-white/60" />
													<text x={size.w/2} y={22} textAnchor="middle" className="font-mono text-sm fill-slate-600">Phase: {phase.toUpperCase()}</text>
												</g>


							{/* Edges/messages (remount on sceneKey change) */}
							<g key={`edges-${sceneKey}`}>
							{visibleTimeline.map((m) => {
								const age = t - m.at; // ms
								const alpha = showHistory ? 1 : Math.max(0, 1 - age / recentWindowMs);
								return (
									<MessageArrow
										key={m.id}
										id={m.id}
										from={positions[m.from]}
										to={positions[m.to]}
										fromId={m.from}
										toId={m.to}
										kind={m.kind}
										conflicting={m.conflicting}
										payload={m.payload}
										duration={Math.max(0.4, Math.min(1.2, (STEP_MS / 1000) / speed * 0.9))}
										alpha={alpha}
									/>
								);
							})}
							</g>


							{/* Nodes on top of arrows. sceneKey forces remount on hard resets to purge lingering animation artifacts. */}
							{nodes.map((n, i) => (
								<Node key={`${sceneKey}-${n.id}`} node={n} x={positions[i].x} y={positions[i].y} />
							))}
						</svg>
					</section>


							<aside className="flex flex-col gap-4">
								<ExplanationBox />
								<ConsensusProgress />
								<Legend />
								<LogPanel />
							</aside>
						</main>


						<footer className="text-center text-xs text-slate-500 pt-1 pb-2 animate-fade-in">
							Built with React, SVG, Framer Motion, and Zustand. Focus mode dims non‑{phase.toUpperCase()} messages.
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
}
