import React, { useEffect, useMemo, useState } from 'react';
import { usePbftStore } from './store/pbftStore';
import type { PbftState } from './store/pbftStore';
import { shallow } from 'zustand/shallow';
import { radialPositions, clientPosition, linearPositions, clientPositionLinear, verticalPositions, clientPositionVertical, hierarchyPositions, clientPositionHierarchy } from './utils/layout';
import CanvasStage from './components/CanvasStage';
import PixiNode from './components/PixiNode';
import PixiMessage from './components/PixiMessage';
import ControlPanel from './components/ControlPanel';
import Legend from './components/Legend';
import ConsensusProgress from './components/ConsensusProgress';
import PhaseTimeline from './components/PhaseTimeline';
import TeachingTip from './components/TeachingTip';
import SimulationTicker from './components/SimulationTicker';
import CentralStatus from './components/CentralStatus';
import { STEP_MS } from './data/phases';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';


export default function App(): React.ReactElement {
	const { nodes, timeline, playing, step, speed, layoutScale, fontScale, sceneKey, hoveredNodeId, setHoveredNodeId, nodeStats, viewMode, hoveredMessage, round } = usePbftStore(
		(s: PbftState) => ({
			nodes: s.nodes,
			timeline: s.timeline,
			playing: s.playing,
			step: s.step,
			speed: s.speed,
			layoutScale: s.layoutScale,
			fontScale: s.fontScale,
			sceneKey: s.sceneKey,
			hoveredNodeId: s.hoveredNodeId,
			setHoveredNodeId: s.setHoveredNodeId,
			nodeStats: s.nodeStats,
			viewMode: s.viewMode,
			hoveredMessage: s.hoveredMessage,
			round: s.round,
		}),
		shallow
	);
	const phase = usePbftStore((s) => s.phase);


	// Timer loop removed in favor of SimulationTicker inside CanvasStage


	const shouldReduceMotion = useReducedMotion();

	const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

	useEffect(() => {
		const handleResize = () => {
			setSize({ w: window.innerWidth, h: window.innerHeight });
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const center = { x: size.w / 2, y: size.h / 2 };

	// Layout Calculations
	const r = Math.round(200 * layoutScale);
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
		<div className="min-h-screen bg-slate-950 overflow-hidden font-sans text-slate-200 selection:bg-indigo-500/30" style={{ fontSize: `${fontScale * 16}px` }}>
			{/* Main Canvas Area - Full Screen */}
			<div className="absolute inset-0 z-0 flex items-center justify-center bg-[#020617]">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.2),_transparent_70%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(79,70,229,0.1),_transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(147,51,234,0.1),_transparent_50%)]" />
				<CanvasStage width={size.w} height={size.h} className="w-full h-full max-w-[100vw] max-h-[100vh]">
					<SimulationTicker />

					{/* Edges/messages */}
					{timeline.map((m) => {
						// Calculate animation duration based on STEP_MS and speed
						// Clamp between 0.5s and 3.0s for smooth visibility
						const baseDuration = (STEP_MS / 1000) / speed;
						// If reduced motion is preferred, make message travel almost instant (0.05s) to avoid motion sickness
						// whilst still showing the flow logically.
						const durationSec = shouldReduceMotion ? 0.05 : Math.max(0.5, Math.min(3.0, baseDuration * 0.9));

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
						node={{ id: -1, role: 'replica', state: 'normal' }}
						x={clientPos.x}
						y={clientPos.y}
						hovered={hoveredNodeId === -1}
						onHover={setHoveredNodeId}
					/>

					{/* Central Status Announcer - Rendered last to be on top */}
					<CentralStatus x={center.x} y={center.y} />
				</CanvasStage>
			</div>

			{/* Message Tooltip */}
			<AnimatePresence>
				{hoveredMessage && (
					<motion.div
						initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
						className="fixed z-50 pointer-events-none bg-slate-900/40 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs font-mono"
						style={{
							left: mousePos.x + 15,
							top: mousePos.y + 15,
						}}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl" />
						<div className="relative font-bold text-indigo-400 mb-2 tracking-widest uppercase flex items-center gap-2">
							<div className="w-1 h-3 bg-indigo-500 rounded-full" />
							{hoveredMessage.kind}
						</div>
						<div className="relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mt-2">
							<span className="text-slate-500 font-semibold">Source</span>
							<span className="text-slate-300">{hoveredMessage.from === -1 ? 'Client' : `Node ${hoveredMessage.from}`}</span>
							<span className="text-slate-500 font-semibold">Target</span>
							<span className="text-slate-300">{hoveredMessage.to === -1 ? 'Client' : `Node ${hoveredMessage.to}`}</span>
							<span className="text-slate-500 font-semibold">Payload</span>
							<span className="text-amber-400 font-medium">{hoveredMessage.payload}</span>
							{hoveredMessage.conflicting && (
								<div className="col-span-2 text-red-400 font-bold mt-2 flex items-center gap-1">
									<span className="text-lg">⚠</span> CONFLICT DETECTED
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Node Tooltip */}
			<AnimatePresence>
				{hoveredNodeId !== null && hoveredNodeId !== -1 && nodeStats[hoveredNodeId] && (
					<motion.div
						initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.95 }}
						className="fixed z-50 pointer-events-none bg-slate-900/40 backdrop-blur-xl text-white p-5 rounded-3xl shadow-3xl border border-white/10 text-xs min-w-[200px]"
						style={{
							left: mousePos.x + 20,
							top: mousePos.y + 20,
						}}
					>
						<div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl" />
						<div className="relative flex items-center justify-between mb-4 border-b border-white/5 pb-3">
							<div className="flex items-center gap-3">
								<div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${!shouldReduceMotion && 'animate-pulse'} ${nodes[hoveredNodeId].role === 'leader' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-indigo-400 shadow-indigo-400/50'}`} />
								<span className="font-bold text-base tracking-tight italic">
									{nodes[hoveredNodeId].role === 'leader' ? 'LEADER' : `REPLICA ${hoveredNodeId}`}
								</span>
							</div>
							{nodes[hoveredNodeId].state === 'faulty' && (
								<span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-black border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">FAULTY</span>
							)}
						</div>

						<div className="relative space-y-4">
							<div className="group">
								<div className="flex justify-between text-[10px] uppercase text-slate-400 font-black mb-1.5 tracking-tighter">
									<span>Prepare Quorum</span>
									<span className="text-slate-200">{nodeStats[hoveredNodeId].prepare} <span className="text-slate-600">/</span> {2 * usePbftStore.getState().f + 1}</span>
								</div>
								<div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
									<div
										className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(139,92,246,0.3)]"
										style={{ width: `${Math.min(100, (nodeStats[hoveredNodeId].prepare / (2 * usePbftStore.getState().f + 1)) * 100)}%` }}
									/>
								</div>
							</div>

							<div className="group">
								<div className="flex justify-between text-[10px] uppercase text-slate-400 font-black mb-1.5 tracking-tighter">
									<span>Commit Quorum</span>
									<span className="text-slate-200">{nodeStats[hoveredNodeId].commit} <span className="text-slate-600">/</span> {2 * usePbftStore.getState().f + 1}</span>
								</div>
								<div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
									<div
										className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(245,158,11,0.3)]"
										style={{ width: `${Math.min(100, (nodeStats[hoveredNodeId].commit / (2 * usePbftStore.getState().f + 1)) * 100)}%` }}
									/>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Title Overlay (Top Left) */}
			<div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-10 pointer-events-none">
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-indigo-200 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.3)] italic uppercase">
					PBFT Visualizer
				</h1>
				<div className="flex items-center gap-3 mt-4">
					<span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.1)]">
						Phase: {phase}
					</span>
					<div className="w-1 h-1 rounded-full bg-slate-700" />
					<span className="text-xs sm:text-sm text-slate-500 font-black tracking-widest uppercase italic opacity-80 underline decoration-indigo-500/30 underline-offset-4">Round {round}</span>
				</div>
			</div>



			{/* Right Sidebar - Simplified */}
			<div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-64 sm:w-72 flex flex-col gap-2 sm:gap-3 max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 pointer-events-auto scrollbar-thin">
				<PhaseTimeline />
				<ConsensusProgress />
				<Legend />
			</div>

			{/* Teaching Tip - Left side, below title */}
			<div className="absolute top-24 left-4 sm:top-28 sm:left-8 z-20 pointer-events-auto">
				<TeachingTip />
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
