import React, { useEffect, useMemo } from 'react';
import { usePbftStore } from './store/pbftStore';
import type { PbftState, RenderedMessage } from './store/pbftStore';
import { shallow } from 'zustand/shallow';
import { radialPositions, clientPosition, linearPositions, clientPositionLinear, verticalPositions, clientPositionVertical, hierarchyPositions, clientPositionHierarchy } from './utils/layout';
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
import { AnimatePresence, motion } from 'framer-motion';


export default function App(): React.ReactElement {
	const { nodes, client, timeline, playing, step, speed, showHistory, recentWindowMs, layoutScale, fontScale, sceneKey, hoveredNodeId, setHoveredNodeId, nodeStats, phaseAdvanceDueAt, t, viewMode, hoveredMessage } = usePbftStore(
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
			nodeStats: s.nodeStats,
			phaseAdvanceDueAt: s.phaseAdvanceDueAt,
			t: s.t,
			viewMode: s.viewMode,
			hoveredMessage: s.hoveredMessage,
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
	const positions = useMemo(() => {
		if (viewMode === 'linear') {
			return linearPositions(nodes.length, center.x, center.y, r * 0.8);
		}
		if (viewMode === 'vertical') {
			return verticalPositions(nodes.length, center.x, center.y, r * 0.6);
		}
		if (viewMode === 'hierarchy') {
			return hierarchyPositions(nodes, center.x, center.y, size.w * 0.6, size.h * 0.6);
		}
		return radialPositions(nodes.length, center.x, center.y, r);
	}, [nodes, center.x, center.y, r, viewMode, size.w, size.h]);

	const clientPos = useMemo(() => {
		if (viewMode === 'linear') {
			return clientPositionLinear(center.x, center.y, r * 0.8, nodes.length);
		}
		if (viewMode === 'vertical') {
			return clientPositionVertical(center.x, center.y, r * 0.6, nodes.length);
		}
		if (viewMode === 'hierarchy') {
			return clientPositionHierarchy(center.x, center.y, size.h * 0.6);
		}
		return clientPosition(center.x, center.y, r);
	}, [center.x, center.y, r, viewMode, nodes.length, size.h]);

	// Helper to get position for a node index (-1 is client)
	const getPos = (id: number) => {
		if (id === -1) return clientPos;
		return positions[id];
	};

	// Mouse position for tooltip
	const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePos({ x: e.clientX, y: e.clientY });
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

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
								message={m}
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
							status={nodeStats[i]?.status}
							prepareCount={nodeStats[i]?.prepare}
							commitCount={nodeStats[i]?.commit}
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

			{/* Message Tooltip */}
			<AnimatePresence>
				{hoveredMessage && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="fixed z-50 pointer-events-none bg-slate-900/90 backdrop-blur text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-mono"
						style={{
							left: mousePos.x + 15,
							top: mousePos.y + 15,
						}}
					>
						<div className="font-bold text-blue-400 mb-1 uppercase">{hoveredMessage.kind}</div>
						<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
							<span className="text-slate-400">From:</span>
							<span>{hoveredMessage.from === -1 ? 'Client' : `Node ${hoveredMessage.from}`}</span>
							<span className="text-slate-400">To:</span>
							<span>{hoveredMessage.to === -1 ? 'Client' : `Node ${hoveredMessage.to}`}</span>
							<span className="text-slate-400">Payload:</span>
							<span className="text-amber-300">{hoveredMessage.payload}</span>
							{hoveredMessage.conflicting && (
								<div className="col-span-2 text-red-400 font-bold mt-1">⚠ CONFLICT DETECTED</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Title Overlay (Top Left) */}
			<div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10 pointer-events-none">
				<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">
					PBFT Visualizer
				</h1>
				<div className="flex items-center gap-2 sm:gap-3 mt-2">
					<span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700 shadow-sm">
						Phase: {phase}
					</span>
					<span className="text-xs sm:text-sm text-slate-500 font-medium">Round {usePbftStore.getState().round}</span>
				</div>
			</div>

			{/* Phase Transition Indicator */}
			{phaseAdvanceDueAt && (
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
					<div className="bg-slate-900/80 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold text-lg animate-pulse shadow-2xl border border-white/10 flex items-center gap-3">
						<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Next Phase in {Math.max(0, ((phaseAdvanceDueAt - t) / 1000)).toFixed(1)}s...</span>
					</div>
				</div>
			)}

			{/* Right Sidebar (Collapsible/Floating) - Information */}
			<div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-72 sm:w-80 flex flex-col gap-3 sm:gap-4 max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 pointer-events-auto scrollbar-thin">
				<ExplanationBox />
				<ConsensusProgress />
				<Legend />
				<LogPanel />
			</div>

			{/* Bottom Left Floating Control Dock */}
			<div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-20 pointer-events-auto">
				<div className="bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 rounded-2xl p-1.5 sm:p-2 flex items-center gap-2 transition-all duration-300 hover:bg-white/95 hover:shadow-3xl">
					<ControlPanel />
				</div>
			</div>

			{/* Footer Info */}
			<div className="absolute bottom-2 right-4 z-0 text-[9px] sm:text-[10px] text-slate-400/80 pointer-events-none">
				Built with React & Framer Motion
			</div>
		</div>
	);
}
