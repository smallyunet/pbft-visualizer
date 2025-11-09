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
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-4 h-52 overflow-auto text-sm transition-all duration-300 hover:shadow-xl" ref={ref}>
      {logs.length === 0 && <div className="text-slate-400 italic">Logs will appear here…</div>}
      {logs.map((l, i) => (
        <div key={i} className="font-mono py-1 border-b border-slate-100 last:border-0 animate-fade-in">
          <span className="text-slate-400 font-semibold">{(l.t / 1000).toFixed(1)}s</span> <span className="text-slate-700">{l.text}</span>
        </div>
      ))}
    </div>
  );
}