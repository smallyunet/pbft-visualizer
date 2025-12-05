import React, { useEffect, useRef } from 'react';
import { usePbftStore } from '../store/pbftStore';


export default function LogPanel(): React.ReactElement {
  const logs = usePbftStore((s) => s.logs);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Auto-scroll to bottom for teaching flow
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [logs]);
  return (
  <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 p-4 h-48 sm:h-52 overflow-auto text-xs sm:text-sm transition-all duration-300 hover:shadow-blue-900/20 animate-slide-in-right" ref={ref}>
      {logs.length === 0 && <div className="text-slate-500 italic text-center py-8">Logs will appear here…</div>}
      {logs.map((l, i) => (
        <div key={i} className="font-mono py-1.5 border-b border-slate-800/50 last:border-0 animate-fade-in hover:bg-slate-800/50 transition-colors">
          <span className="text-slate-500 font-semibold">{(l.t / 1000).toFixed(1)}s</span> <span className="text-slate-300">{l.text}</span>
        </div>
      ))}
    </div>
  );
}