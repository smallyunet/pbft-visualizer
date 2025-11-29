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

export function linearPositions(count: number, cx: number, cy: number, spacing: number): Point[] {
  // Center the group of nodes (0 to count-1) around cx
  // Shift slightly right to account for client on the left
  const totalWidth = (count - 1) * spacing;
  const startX = cx - totalWidth / 2 + spacing * 0.5; 
  
  return Array.from({ length: count }, (_, i) => {
    return { x: startX + i * spacing, y: cy };
  });
}

export function clientPositionLinear(cx: number, cy: number, spacing: number, count: number): Point {
    const totalWidth = (count - 1) * spacing;
    const startX = cx - totalWidth / 2 + spacing * 0.5;
    return { x: startX - spacing * 1.2, y: cy };
}

export function verticalPositions(count: number, cx: number, cy: number, spacing: number): Point[] {
  // Stack nodes vertically centered at cx
  const totalHeight = (count - 1) * spacing;
  const startY = cy - totalHeight / 2 + spacing * 0.5;
  return Array.from({ length: count }, (_, i) => {
    return { x: cx, y: startY + i * spacing };
  });
}

export function clientPositionVertical(cx: number, cy: number, spacing: number, count: number): Point {
  const totalHeight = (count - 1) * spacing;
  const startY = cy - totalHeight / 2 + spacing * 0.5;
  // Place client above the first node
  return { x: cx, y: startY - spacing * 1.2 };
}

// Minimal interface for nodes to avoid circular dependency
type LayoutNode = { id: number; role: 'leader' | 'replica' };

export function hierarchyPositions(nodes: LayoutNode[], cx: number, cy: number, width: number, height: number): Point[] {
  // Hierarchy: Leader at top-center (below client), Replicas in a row below
  const leaderIndex = nodes.findIndex(n => n.role === 'leader');
  const replicas = nodes.filter(n => n.role !== 'leader');
  
  const positions = new Array(nodes.length).fill({ x: 0, y: 0 });
  
  // Place Leader
  if (leaderIndex !== -1) {
    positions[leaderIndex] = { x: cx, y: cy - height * 0.3 };
  }
  
  // Place Replicas in a row at the bottom
  const rowY = cy + height * 0.3;
  const spacing = width / (replicas.length + 1);
  const startX = cx - (width / 2) + spacing;
  
  let rIdx = 0;
  nodes.forEach((n, i) => {
    if (n.role !== 'leader') {
      positions[i] = { x: startX + rIdx * spacing - (spacing * 0.5 * (replicas.length - 1)) + (width * 0.15), y: rowY };
      // Simplified centering:
      // Center the row of replicas
      const rowWidth = (replicas.length - 1) * 180; // fixed spacing
      const rStartX = cx - rowWidth / 2;
      positions[i] = { x: rStartX + rIdx * 180, y: rowY };
      rIdx++;
    }
  });
  
  return positions;
}

export function clientPositionHierarchy(cx: number, cy: number, height: number): Point {
  // Client at the very top
  return { x: cx, y: cy - height * 0.6 };
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