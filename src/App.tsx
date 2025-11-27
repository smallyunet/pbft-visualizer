import React, { useEffect, useMemo } from 'react';
import { usePbftStore } from './store/pbftStore';
import type { PbftState, RenderedMessage } from './store/pbftStore';
import { shallow } from 'zustand/shallow';
import { radialPositions, clientPosition } from './utils/layout';
import Node from './components/Node';
import ClientNode from './components/ClientNode';
import MessageArrow from './components/MessageArrow';
import CanvasStage from './components/CanvasStage';
import PixiNode from './components/PixiNode';
import PixiMessage from './components/PixiMessage';
import ControlPanel from './components/ControlPanel';
import ExplanationBox from './components/ExplanationBox';
import LogPanel from './components/LogPanel';
import Legend from './components/Legend';
import ConsensusProgress from './components/ConsensusProgress';
import { STEP_MS } from './data/phases';


export default function App(): React.ReactElement {
	const { nodes, client, timeline, playing, step, speed, showHistory, recentWindowMs, layoutScale, fontScale, sceneKey, hoveredNodeId, setHoveredNodeId } = usePbftStore(
		(s: PbftState) => ({
			nodes: s.nodes,
			client: s.client,
			timeline: s.timeline,
			playing: s.playing,
			step: s.step,
			speed: s.speed,
			showHistory: s.showHistory,
			recentWindowMs: s.recentWindowMs,
			layoutScale: s.layoutScale,
			fontScale: s.fontScale,
			sceneKey: s.sceneKey,
			hoveredNodeId: s.hoveredNodeId,
			setHoveredNodeId: s.setHoveredNodeId,
		}),
		shallow
	);
	const phase = usePbftStore((s) => s.phase);


	// Timer loop: advance simulated clock faster when speed is higher.
	useEffect(() => {
		if (!playing) return;
		const tickMs = 16; // ~60fps for smooth animation
		const id = setInterval(() => step(tickMs * speed), tickMs);
		return () => clearInterval(id);
	}, [playing, speed, step]);


	const size = { w: 1600, h: 900 };
	const center = { x: size.w / 2, y: size.h / 2 };

	// Layout Calculations
	const r = Math.round(280 * layoutScale);
	const positions = useMemo(() => radialPositions(nodes.length, center.x, center.y, r), [nodes.length, center.x, center.y, r]);
	const clientPos = useMemo(() => clientPosition(center.x, center.y, r), [center.x, center.y, r]);

	// Helper to get position for a node index (-1 is client)
	const getPos = (id: number) => {
		if (id === -1) return clientPos;
		return positions[id];
	};

	return (
		<div className="min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900" style={{ fontSize: `${fontScale * 16}px` }}>
			{/* Main Canvas Area - Full Screen */}
			<div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<CanvasStage width={size.w} height={size.h} className="w-full h-full max-w-[100vw] max-h-[100vh]">
					{/* Edges/messages */}
					{timeline.map((m) => {
						// Only show active messages or recent ones
						// We rely on PixiMessage to hide itself if it's not in the window, 
						// but we can filter out very old ones here if needed. 
						// Since timeline is pruned by store, we can just map it.

						const durationSec = Math.max(0.4, Math.min(1.2, (STEP_MS / 1000) / speed * 0.9));

						return (
							<PixiMessage
								key={m.id}
								from={getPos(m.from)}
								to={getPos(m.to)}
								kind={m.kind}
								conflicting={m.conflicting}
								startAt={m.at}
								duration={durationSec}
							/>
						);
					})}

					{/* Nodes */}
					{nodes.map((n, i) => (
						<PixiNode
							key={`${sceneKey}-${n.id}`}
							node={n}
							x={positions[i].x}
							y={positions[i].y}
							hovered={hoveredNodeId === n.id}
							onHover={setHoveredNodeId}
						/>
					))}

					{/* Client Node */}
					<PixiNode
						key="client"
						node={{ id: -1, role: 'replica', state: 'normal' }} // Mock node for client
						x={clientPos.x}
						y={clientPos.y}
						hovered={false}
						onHover={() => { }}
					/>
				</CanvasStage>
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
