import React, { useEffect, useRef } from 'react';
import { usePbftStore } from '../store/pbftStore';


export default function LogPanel(): React.ReactElement {
  const logs = usePbftStore((s) => s.logs);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Auto-scroll to bottom for teaching flow
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [logs]);
  return (
  <div className="bg-white rounded-xl shadow p-3 h-48 overflow-auto text-sm" ref={ref}>
      {logs.length === 0 && <div className="text-slate-400">Logs will appear here…</div>}
      {logs.map((l, i) => (
        <div key={i} className="font-mono">
          <span className="text-slate-400">{(l.t / 1000).toFixed(1)}s</span> {l.text}
        </div>
      ))}
    </div>
  );
}