import React from 'react';
import { motion } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export default function ControlPanel(): React.ReactElement {
  const { phase, setPhase, resetPhase, resetAll, skipPhase, playing, togglePlay, step, speed, setSpeed, nodes, toggleFaulty, n, f, autoAdvance, setAutoAdvance, phaseDelayMs, setPhaseDelay, round, value, showHistory, setShowHistory, recentWindowMs, setRecentWindowMs, layoutScale, setLayoutScale, focusCurrentPhase, setFocusCurrentPhase, showLabels, setShowLabels, fontScale, setFontScale, resetViewPrefs } = usePbftStore(
    (s) => ({
      phase: s.phase,
      setPhase: s.setPhase,
      resetPhase: s.resetPhase,
      resetAll: s.resetAll,
      skipPhase: s.skipPhase,
      playing: s.playing,
      togglePlay: s.togglePlay,
      step: s.step,
      speed: s.speed,
      setSpeed: s.setSpeed,
      nodes: s.nodes,
      toggleFaulty: s.toggleFaulty,
      n: s.n,
      f: s.f,
      autoAdvance: s.autoAdvance,
      setAutoAdvance: s.setAutoAdvance,
      phaseDelayMs: s.phaseDelayMs,
      setPhaseDelay: s.setPhaseDelay,
      round: s.round,
      value: s.value,
      showHistory: s.showHistory,
      setShowHistory: s.setShowHistory,
      recentWindowMs: s.recentWindowMs,
      setRecentWindowMs: s.setRecentWindowMs,
      layoutScale: s.layoutScale,
      setLayoutScale: s.setLayoutScale,
      focusCurrentPhase: s.focusCurrentPhase,
      setFocusCurrentPhase: s.setFocusCurrentPhase,
      showLabels: s.showLabels,
      setShowLabels: s.setShowLabels,
      fontScale: s.fontScale,
      setFontScale: s.setFontScale,
      resetViewPrefs: s.resetViewPrefs,
    }),
    shallow
  );


  return (
    <div className="flex flex-wrap gap-3">
      {/* Execution */}
      <div className="panel-group">
        <span className="panel-title">Execution</span>
        <button className="btn-primary" onClick={() => togglePlay()}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn-outline" onClick={() => step(600)}>Step</button>
        <button className="btn-outline" onClick={() => resetPhase()}>Reset phase</button>
        <button className="btn-outline" onClick={() => resetAll()}>Reset all</button>
        <button className="btn-outline" onClick={() => skipPhase()}>Skip phase</button>
        <div className="flex items-center gap-1 text-[12px] ml-1">
          <span>Speed:</span>
          <select className="px-2 py-1 rounded bg-slate-100" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
        <label className="flex items-center gap-1 text-xs select-none">
          <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} /> Auto‑advance
        </label>
        {autoAdvance && (
          <div className="flex items-center gap-1 text-[12px]">
            <span>Phase pause:</span>
            <select className="px-2 py-1 rounded bg-slate-100" value={phaseDelayMs} onChange={(e) => setPhaseDelay(parseInt(e.target.value, 10))}>
              <option value={1000}>1.0s</option>
              <option value={2000}>2.0s</option>
              <option value={3000}>3.0s</option>
              <option value={5000}>5.0s</option>
            </select>
          </div>
        )}
        <div className="text-[12px] font-mono flex items-center gap-1 ml-2">
          <span>Value:</span>
          <motion.span
            key={value}
            initial={{ scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="value-badge"
          >
            {value}
          </motion.span>
          <span>Round={round}</span>
        </div>
      </div>

      {/* Phase */}
  <div className="panel-group text-sm">
        <span className="panel-title">Phase</span>
        <button className={phase === 'pre-prepare' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('pre-prepare')}>Pre‑prepare</button>
        <button className={phase === 'prepare' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('prepare')}>Prepare</button>
        <button className={phase === 'commit' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('commit')}>Commit</button>
      </div>

      {/* Fault injection */}
  <div className="panel-group text-sm">
        <span className="panel-title">Fault</span>
        {nodes.map((n) => (
          <button
            key={n.id}
            className={n.state === 'faulty' ? 'btn-danger' : 'btn-outline'}
            onClick={() => toggleFaulty(n.id)}
          >
            {n.role === 'leader' ? 'Leader' : `N${n.id}`}
          </button>
        ))}
      </div>

      {/* Boundary parameters */}
  <div className="panel-group text-sm">
        <span className="panel-title">Parameters</span>
        <div className="text-xs">n = {n}, f = (n − 1) / 3 = {f}, tolerate up to {f} Byzantine nodes</div>
      </div>

      {/* View preferences */}
  <div className="panel-group text-sm">
        <span className="panel-title">View</span>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} /> Show all history
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={focusCurrentPhase} onChange={(e) => setFocusCurrentPhase(e.target.checked)} /> Focus current phase
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Show labels
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span>Font scale:</span>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.05}
            value={fontScale}
            onChange={(e) => setFontScale(parseFloat(e.target.value))}
          />
          <span className="font-mono">{fontScale.toFixed(2)}x</span>
        </div>
        <div>
          <button className="btn-outline" onClick={() => resetViewPrefs()}>Reset view</button>
        </div>
        {!showHistory && (
          <div className="flex items-center gap-1 text-[12px]">
            <span>Recent window:</span>
            <select
              className="px-2 py-1 rounded bg-slate-100"
              value={recentWindowMs}
              onChange={(e) => setRecentWindowMs(parseInt(e.target.value, 10))}
            >
              <option value={800}>0.8s</option>
              <option value={1600}>1.6s</option>
              <option value={2400}>2.4s</option>
              <option value={3600}>3.6s</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px]">
          <span>Layout scale:</span>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.05}
            value={layoutScale}
            onChange={(e) => setLayoutScale(parseFloat(e.target.value))}
          />
          <span className="font-mono">{layoutScale.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}