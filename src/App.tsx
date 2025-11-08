import React, { useEffect, useMemo } from 'react';
import { usePbftStore } from './store/pbftStore';
import { radialPositions } from './utils/layout';
import Node from './components/Node';
import MessageArrow from './components/MessageArrow';
import ControlPanel from './components/ControlPanel';
import ExplanationBox from './components/ExplanationBox';
import LogPanel from './components/LogPanel';
import Legend from './components/Legend';
import ConsensusProgress from './components/ConsensusProgress';
import { STEP_MS } from './data/phases';


export default function App() {
const { nodes, timeline, playing, step, speed, showHistory, recentWindowMs, t, layoutScale } = usePbftStore();


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
const positions = useMemo(() => radialPositions(nodes.length, center.x, center.y, Math.round(220 * layoutScale)), [nodes.length, layoutScale]);
const visibleTimeline = useMemo(
	() => (showHistory ? timeline : timeline.filter((m) => t - m.at <= recentWindowMs)),
	[timeline, showHistory, t, recentWindowMs]
);


return (
<div className="min-h-screen p-6">
<div className="max-w-6xl mx-auto flex flex-col gap-4">
<header className="flex items-end justify-between gap-4">
<div>
<h1 className="text-2xl font-semibold">PBFT Visualizer</h1>
<div className="text-slate-500">Interactive, teaching‑oriented animation of Pre‑prepare → Prepare → Commit</div>
</div>
<ControlPanel />
</header>


<main className="grid grid-cols-3 gap-4">
<section className="col-span-2 bg-white rounded-xl shadow p-3">
<svg viewBox={`0 0 ${size.w} ${size.h}`} className="w-full h-[680px]">
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
 {/* Radial background gradient definition */}
 <radialGradient id="vizRadial" cx="50%" cy="50%" r="70%">
 	<stop offset="0%" stopColor="#f8fafc" />
 	<stop offset="65%" stopColor="#eef2f6" />
 	<stop offset="100%" stopColor="#e2e8f0" />
 </radialGradient>
</defs>

{/* Background shape */}
<rect x={0} y={0} width={size.w} height={size.h} rx={28} className="viz-bg" />


{/* Edges/messages */}
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


{/* Nodes on top of arrows */}
{nodes.map((n, i) => (
<Node key={n.id} node={n} x={positions[i].x} y={positions[i].y} />
))}
</svg>
</section>


<aside className="col-span-1 flex flex-col gap-4">
	<ExplanationBox />
		<Legend />
		<ConsensusProgress />
	<LogPanel />
</aside>
</main>


<footer className="text-center text-xs text-slate-500 pt-2">
Built with React, SVG, Framer Motion, and Zustand. Educational use permitted.
</footer>
</div>
</div>
);
}