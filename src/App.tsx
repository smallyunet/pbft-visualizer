import React, { useEffect, useMemo } from 'react';
import { usePbftStore } from './store/pbftStore';
import type { PbftState, RenderedMessage } from './store/pbftStore';
import { shallow } from 'zustand/shallow';
import { radialPositions, clientPosition } from './utils/layout';
import Node from './components/Node';
import ClientNode from './components/ClientNode';
import MessageArrow from './components/MessageArrow';
import ControlPanel from './components/ControlPanel';
import ExplanationBox from './components/ExplanationBox';
import LogPanel from './components/LogPanel';
import Legend from './components/Legend';
import ConsensusProgress from './components/ConsensusProgress';
import { STEP_MS } from './data/phases';


export default function App(): React.ReactElement {
	const { nodes, client, timeline, playing, step, speed, showHistory, recentWindowMs, t, layoutScale, fontScale, sceneKey } = usePbftStore(
		(s: PbftState) => ({
			nodes: s.nodes,
			client: s.client,
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
	useEffect(() => {
		if (!playing) return;
		const tickMs = 200; // real time interval
		const id = setInterval(() => step(tickMs * speed), tickMs);
		return () => clearInterval(id);
	}, [playing, speed, step]);


	const size = { w: 1600, h: 900 };
	const center = { x: size.w / 2, y: size.h / 2 };

	// Layout Calculations
	const r = Math.round(340 * layoutScale);
	const positions = useMemo(() => radialPositions(nodes.length, center.x, center.y, r), [nodes.length, center.x, center.y, r]);
	const clientPos = useMemo(() => clientPosition(center.x, center.y, r), [center.x, center.y, r]);

	const visibleTimeline = useMemo(
		() => {
			if (showHistory) return timeline;
			// Only show messages already "occurred" (m.at <= t) and still within recent window.
			return timeline.filter((m: RenderedMessage) => m.at <= t && (t - m.at) <= recentWindowMs);
		},
		[timeline, showHistory, t, recentWindowMs]
	);

	// Helper to get position for a node index (-1 is client)
	const getPos = (id: number) => {
		if (id === -1) return clientPos;
		return positions[id];
	};

	return (
		<div className="min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900" style={{ fontSize: `${fontScale * 16}px` }}>
			{/* Main Canvas Area - Full Screen */}
			<div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
				<svg viewBox={`0 0 ${size.w} ${size.h}`} className="w-full h-full max-w-[100vw] max-h-[100vh]" preserveAspectRatio="xMidYMid meet">
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
					<rect x={0} y={0} width={size.w} height={size.h} className="fill-transparent" />

					{/* Edges/messages (remount on sceneKey change) */}
					<g key={`edges-${sceneKey}`}>
						{visibleTimeline.map((m) => {
							const age = t - m.at; // ms
							const alpha = showHistory ? 1 : Math.max(0, 1 - age / recentWindowMs);
							return (
								<MessageArrow
									key={m.id}
									id={m.id}
									from={getPos(m.from)}
									to={getPos(m.to)}
									fromId={m.from === -1 ? undefined : m.from}
									toId={m.to === -1 ? undefined : m.to}
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

					{/* Client Node */}
					<ClientNode x={clientPos.x} y={clientPos.y} active={client.active} />

				</svg>
			</div>

			{/* Title Overlay (Top Left) */}
			<div className="absolute top-6 left-8 z-10 pointer-events-none">
				<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">PBFT Visualizer</h1>
				<div className="flex items-center gap-3 mt-2">
					<span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700">Phase: {phase}</span>
					<span className="text-sm text-slate-500 font-medium">Round {usePbftStore.getState().round}</span>
				</div>
			</div>

			{/* Right Sidebar (Collapsible/Floating) - Information */}
			<div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 pointer-events-auto">
				<ExplanationBox />
				<ConsensusProgress />
				<Legend />
				<LogPanel />
			</div>

			{/* Bottom Left Floating Control Dock */}
			<div className="absolute bottom-8 left-8 z-20 pointer-events-auto">
				<div className="bg-white/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 rounded-2xl p-2 flex items-center gap-2 transition-all hover:scale-105 hover:shadow-3xl">
					<ControlPanel />
				</div>
			</div>

			{/* Footer Info */}
			<div className="absolute bottom-2 right-4 z-0 text-[10px] text-slate-400 pointer-events-none">
				Built with React & Framer Motion
			</div>
		</div>
	);
}
