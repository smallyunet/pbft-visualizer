import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export default function ControlPanel(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const { phase, setPhase, resetPhase, resetAll, skipPhase, playing, togglePlay, step, speed, setSpeed, nodes, toggleFaulty, n, f, autoAdvance, setAutoAdvance, phaseDelayMs, setPhaseDelay, round, value, showHistory, setShowHistory, recentWindowMs, setRecentWindowMs, layoutScale, setLayoutScale, focusCurrentPhase, setFocusCurrentPhase, showLabels, setShowLabels, fontScale, setFontScale, resetViewPrefs, viewMode, setViewMode, manualMode, setManualMode, jitter, setJitter, triggerRequest } = usePbftStore(
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
      viewMode: s.viewMode,
      setViewMode: s.setViewMode,
      manualMode: s.manualMode,
      setManualMode: s.setManualMode,
      jitter: s.jitter,
      setJitter: s.setJitter,
      triggerRequest: s.triggerRequest,
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
            {manualMode && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 border border-emerald-500/50"
                onClick={() => triggerRequest()}
                title="Send Client Request"
              >
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span className="hidden sm:inline">Send Req</span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${playing ? 'bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 border border-blue-500/50'}`}
              onClick={() => togglePlay()}
            >
              {playing ? (
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10" y1="4" x2="10" y2="20"></line>
                  <line x1="14" y1="4" x2="14" y2="20"></line>
                </svg>
              ) : (
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
              <span className="hidden sm:inline">{playing ? 'Pause' : 'Play'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200"
              onClick={() => step(600)}
              title="Step Forward"
            >
              <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </motion.button>

            <div className="h-4 sm:h-5 w-px bg-slate-200 mx-0.5 sm:mx-1"></div>

            <div className="flex flex-col leading-none">
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Round</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-700">{round}</span>
            </div>

            <div className="h-4 sm:h-5 w-px bg-slate-200 mx-0.5 sm:mx-1"></div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all duration-200 text-xs sm:text-sm font-medium"
              onClick={() => setExpanded(true)}
            >
              <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="hidden sm:inline">Config</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4 p-2 max-w-[90vw] w-[800px] text-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Configuration Panel</h3>
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
              {/* Simulation */}
              <div className="panel-group">
                <span className="panel-title">Simulation</span>
                <div className="flex flex-wrap items-center gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => resetAll()}>Reset All</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn-outline" onClick={() => resetPhase()}>Reset Phase</motion.button>

                  <div className="w-px h-4 bg-slate-200 mx-1"></div>

                  <label className="flex items-center gap-1 text-xs select-none cursor-pointer">
                    <input type="checkbox" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} />
                    Manual Req
                  </label>

                  <div className="flex items-center gap-1 text-[12px] ml-2">
                    <span>Jitter:</span>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={jitter}
                      onChange={(e) => setJitter(parseInt(e.target.value))}
                      className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      title={`${jitter}ms`}
                    />
                    <span className="w-8 text-right font-mono text-[10px] text-slate-500">{jitter}ms</span>
                  </div>

                  <div className="w-px h-4 bg-slate-200 mx-1"></div>

                  <div className="flex items-center gap-1 text-[12px]">
                    <span>Speed:</span>
                    <select className="px-2 py-1 rounded bg-slate-100 text-slate-700" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={4}>4x</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1 text-xs select-none cursor-pointer ml-2">
                    <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
                    Auto‑advance
                  </label>
                </div>
              </div>

              {/* Fault Injection */}
              <div className="panel-group text-sm">
                <span className="panel-title">Fault Injection</span>
                <div className="flex flex-wrap items-center gap-2">
                  {nodes.map((n) => (
                    <button
                      key={n.id}
                      className={n.state === 'faulty' ? 'btn-danger' : 'btn-outline'}
                      onClick={() => toggleFaulty(n.id)}
                      title="Toggle Faulty State"
                    >
                      {n.role === 'leader' ? 'Leader' : `N${n.id}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Settings */}
              <div className="panel-group text-sm">
                <span className="panel-title">View Settings</span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <span>Mode:</span>
                    <select
                      className="px-2 py-1 rounded bg-slate-100 text-slate-700"
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value as 'radial' | 'linear' | 'vertical' | 'hierarchy')}
                    >
                      <option value="radial">Radial</option>
                      <option value="linear">Linear</option>
                      <option value="vertical">Vertical</option>
                      <option value="hierarchy">Hierarchy</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="checkbox" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} /> History
                    </label>
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="checkbox" checked={focusCurrentPhase} onChange={(e) => setFocusCurrentPhase(e.target.checked)} /> Focus
                    </label>
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Labels
                    </label>
                  </div>

                  <button className="text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2 ml-1" onClick={() => resetViewPrefs()}>Reset</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}