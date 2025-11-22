// Compute radial positions for nodes so the layout is deterministic and scalable.
export type Point = { x: number; y: number };


export function radialPositions(count: number, cx: number, cy: number, r: number): Point[] {
  // Place the leader at angle -90° (top), others clockwise.
  const start = -Math.PI / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = start + (2 * Math.PI * i) / count;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

export function clientPosition(cx: number, cy: number, r: number): Point {
  // Place client to the left of the ring
  return { x: cx - r * 1.8, y: cy };
}


export function pathBetween(a: Point, b: Point, jitter: number = 0): string {
  // Slight curvature for aesthetics and message readability.
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const norm = Math.hypot(dx, dy) || 1;
  const nx = -dy / norm; // perpendicular unit vector
  const ny = dx / norm;
  // curvature radius in px with a tiny deterministic jitter to reduce visual overlap among many parallel edges
  const curve = 100 + jitter;
  const c1x = mx + nx * curve;
  const c1y = my + ny * curve;
  return `M ${a.x} ${a.y} Q ${c1x} ${c1y} ${b.x} ${b.y}`;
}