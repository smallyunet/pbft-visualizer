import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePbftStore } from '../store/pbftStore';
import { shallow } from 'zustand/shallow';


export default function ControlPanel(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const { phase, resetPhase, resetAll, playing, togglePlay, step, speed, setSpeed, nodes, toggleFaulty, n, f, autoAdvance, setAutoAdvance, round, resetViewPrefs, viewMode, setViewMode, manualMode, setManualMode, jitter, setJitter, triggerRequest, view, rotateLeader, showHistory, setShowHistory, focusCurrentPhase, setFocusCurrentPhase } = usePbftStore(
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
      view: s.view,
      rotateLeader: s.rotateLeader,
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
            className="flex items-center gap-3 px-3 py-1.5"
          >
            {manualMode && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-400/50"
                onClick={() => triggerRequest()}
                title="Send Client Request"
                aria-label="Send Client Request"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span className="hidden sm:inline">Request</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-500 ${playing ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.2)]'}`}
              onClick={() => togglePlay()}
              aria-label={playing ? "Pause Simulation" : "Play Simulation"}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10" y1="4" x2="10" y2="20"></line>
                  <line x1="14" y1="4" x2="14" y2="20"></line>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
              <span className="hidden sm:inline">{playing ? 'Pause' : 'Play'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300"
              onClick={() => step(600)}
              title="Step Forward"
              aria-label="Step Forward"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </motion.button>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter opacity-60">Round</span>
              <span className="text-sm font-black text-white italic">{round}</span>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300 text-xs font-black tracking-widest uppercase"
              onClick={() => setExpanded(true)}
              aria-label="Open Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
            className="flex flex-col gap-6 p-6 max-w-[95vw] w-[850px] bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-4xl text-slate-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Protocol Configuration</h3>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all duration-300"
                aria-label="Close Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Simulation Group */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold transition-all text-white" onClick={() => resetAll()}>Reset System</button>
                  <button className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold transition-all text-white" onClick={() => resetPhase()}>Reset Phase</button>
                  <button className="col-span-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold transition-all text-amber-400" onClick={() => rotateLeader()}>Rotate Primary Node</button>
                </div>

                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between group">
                    <label htmlFor="speed-select" className="text-xs font-bold text-slate-400">Simulation Speed</label>
                    <select id="speed-select" className="bg-slate-800/50 border border-white/5 rounded-lg px-2 py-1 text-xs font-bold text-white outline-none" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
                      <option value={0.5}>0.5x Slow</option>
                      <option value={1}>1.0x Normal</option>
                      <option value={2}>2.0x Fast</option>
                      <option value={4}>4.0x Ultra</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter" id="auto-step-label">Auto-step Phases</span>
                    <label className="relative inline-flex items-center cursor-pointer" aria-labelledby="auto-step-label">
                      <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Fault Tolerance Group */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nodes & Faults</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nodes.map((n) => (
                    <button
                      key={n.id}
                      className={`px-3 py-3 rounded-xl text-xs font-black transition-all border shrink-0 ${n.state === 'faulty' ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'}`}
                      onClick={() => toggleFaulty(n.id)}
                    >
                      {n.role === 'leader' ? 'LEADER' : `N${n.id}`}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium capitalize">
                    System can tolerate up to <span className="text-indigo-400 font-black">f={f}</span> faulty nodes given <span className="text-indigo-400 font-black">n={n}</span> total nodes.
                  </p>
                </div>
              </div>

              {/* Environment Settings */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Environment</span>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                      <label htmlFor="jitter-range">Network Jitter</label>
                      <span className="text-indigo-400 font-black">{jitter}ms</span>
                    </div>
                    <input
                      id="jitter-range"
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={jitter}
                      onChange={(e) => setJitter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400">Layout Topology</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['radial', 'linear', 'vertical', 'hierarchy'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode as any)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border transition-all ${viewMode === mode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer group">
                      <input type="checkbox" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} className="accent-indigo-500" />
                      <span className="group-hover:text-white transition-colors">History</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer group">
                      <input type="checkbox" checked={focusCurrentPhase} onChange={(e) => setFocusCurrentPhase(e.target.checked)} className="accent-indigo-500" />
                      <span className="group-hover:text-white transition-colors">Phase Focus</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-2 pt-4 border-t border-white/5 flex justify-end">
              <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5" onClick={() => resetViewPrefs()}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Reset View Defaults
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}