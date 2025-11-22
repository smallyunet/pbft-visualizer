import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export default function ControlPanel(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

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
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-2"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${playing ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}
              onClick={() => togglePlay()}
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10" y1="4" x2="10" y2="20"></line>
                  <line x1="14" y1="4" x2="14" y2="20"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
              {playing ? 'Pause' : 'Play'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              onClick={() => step(600)}
              title="Step Forward"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </motion.button>

            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Round</span>
              <span className="text-sm font-mono font-bold text-slate-700">{round}</span>
            </div>

            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-sm font-medium"
              onClick={() => setExpanded(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span>Config</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4 p-2 max-w-[90vw] w-[800px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configuration Panel</h3>
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Execution */}
              <div className="panel-group">
                <span className="panel-title">Execution</span>
                <div className="flex flex-wrap items-center gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => togglePlay()}>{playing ? 'Pause' : 'Play'}</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => step(600)}>Step</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => resetPhase()}>Reset phase</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => resetAll()}>Reset all</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => skipPhase()}>Skip phase</motion.button>
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
              </div>

              {/* Phase */}
              <div className="panel-group text-sm">
                <span className="panel-title">Phase</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button className={phase === 'pre-prepare' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('pre-prepare')}>Pre‑prepare</button>
                  <button className={phase === 'prepare' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('prepare')}>Prepare</button>
                  <button className={phase === 'commit' ? 'btn-primary' : 'btn-outline'} onClick={() => setPhase('commit')}>Commit</button>
                </div>
              </div>

              {/* Fault injection */}
              <div className="panel-group text-sm">
                <span className="panel-title">Fault</span>
                <div className="flex flex-wrap items-center gap-2">
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
              </div>

              {/* Boundary parameters */}
              <div className="panel-group text-sm">
                <span className="panel-title">Parameters</span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs">n = {n}, f = (n − 1) / 3 = {f}, tolerate up to {f} Byzantine nodes</div>
                </div>
              </div>

              {/* View preferences */}
              <div className="panel-group text-sm">
                <span className="panel-title">View</span>
                <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}