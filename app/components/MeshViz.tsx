"use client";

import { useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────
type NodeStatus = "ONLINE" | "SYNCING" | "OFFLINE";

interface MeshNode {
  id: number;
  position: [number, number, number];
  status: NodeStatus;
  label: string;
  lastSync: number;
  pingPhase: number;
  pingStartedAt: number;
}

interface Projected {
  x: number;
  y: number;
  z: number;
}

interface VizState {
  angleY: number;
  angleX: number;
  zoom: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragStartAngleX: number;
  dragStartAngleY: number;
  hoveredNodeId: number | null;
  selectedNodeId: number | null;
  mouseX: number;
  mouseY: number;
  mouseOnCanvas: boolean;
  mouseMoved: boolean;
  radarAngle: number;
  time: number;
  orbitDot1: number;
  orbitDot2: number;
  nodes: MeshNode[];
  canvasW: number;
  canvasH: number;
}

// ─── Utilities ───────────────────────────────────────────

function fibSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = phi * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return pts;
}

function projectPoint(
  bx: number,
  by: number,
  bz: number,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number,
  scale: number,
  cx: number,
  cy: number
): Projected {
  const x = bx * cosY + bz * sinY;
  const z1 = -bx * sinY + bz * cosY;
  const y2 = by * cosX - z1 * sinX;
  const z2 = by * sinX + z1 * cosX;
  const p = 3 / (3 + z2);
  return { x: cx + x * scale * p, y: cy + y2 * scale * p, z: z2 };
}

function formatTimeSince(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${diff.toFixed(1)}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

function padId(n: number): string {
  return String(n).padStart(3, "0");
}

// ─── Draw Functions ──────────────────────────────────────

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number,
  scale: number,
  cx: number,
  cy: number
) {
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";

  const SEGMENTS = 50;

  // Latitude lines
  const latitudes = [-0.6, -0.3, 0, 0.3, 0.6];
  for (const h of latitudes) {
    const r = Math.sqrt(1 - h * h);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2;
      const px = r * Math.cos(theta);
      const pz = r * Math.sin(theta);
      const pt = projectPoint(px, h, pz, cosY, sinY, cosX, sinX, scale, cx, cy);
      if (pt.z > 0.3) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(pt.x, pt.y);
        started = true;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();
  }

  // Longitude lines
  for (let l = 0; l < 8; l++) {
    const phi = (l / 8) * Math.PI * 2;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= SEGMENTS; i++) {
      const alpha = (i / SEGMENTS) * Math.PI - Math.PI / 2;
      const px = Math.cos(alpha) * Math.cos(phi);
      const py = Math.sin(alpha);
      const pz = Math.cos(alpha) * Math.sin(phi);
      const pt = projectPoint(px, py, pz, cosY, sinY, cosX, sinX, scale, cx, cy);
      if (pt.z > 0.3) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(pt.x, pt.y);
        started = true;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();
  }
}

function drawRadarSweep(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  // Fading trail
  const trailLen = Math.PI / 3;
  const trailSegments = 20;
  for (let i = 0; i < trailSegments; i++) {
    const frac = i / trailSegments;
    const a1 = angle - trailLen * (1 - frac);
    const a2 = angle - trailLen * (1 - (i + 1) / trailSegments);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, a1, a2);
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.12 * frac})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Sweep line
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.35)";
  ctx.lineWidth = 1;
  ctx.save();
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();
}

function drawOrbitalRings(
  ctx: CanvasRenderingContext2D,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number,
  scale: number,
  cx: number,
  cy: number,
  dot1Angle: number,
  dot2Angle: number
) {
  const rings = [
    { tiltX: 0.5, tiltZ: 0.35, radiusMul: 1.15, dotAngle: dot1Angle, speed: 1 },
    { tiltX: 1.05, tiltZ: -0.7, radiusMul: 1.22, dotAngle: dot2Angle, speed: -1 },
  ];

  for (const ring of rings) {
    const SEGS = 90;
    const cosTX = Math.cos(ring.tiltX);
    const sinTX = Math.sin(ring.tiltX);
    const cosTZ = Math.cos(ring.tiltZ);
    const sinTZ = Math.sin(ring.tiltZ);

    ctx.beginPath();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "rgba(34, 197, 94, 0.08)";
    ctx.lineWidth = 0.8;

    let dotProj: Projected | null = null;
    let started = false;

    for (let i = 0; i <= SEGS; i++) {
      const theta = (i / SEGS) * Math.PI * 2;
      // Circle in XZ plane
      let rx = Math.cos(theta) * ring.radiusMul;
      let ry = 0;
      let rz = Math.sin(theta) * ring.radiusMul;

      // Tilt around X
      const ry2 = ry * cosTX - rz * sinTX;
      const rz2 = ry * sinTX + rz * cosTX;
      ry = ry2;
      rz = rz2;

      // Tilt around Z
      const rx2 = rx * cosTZ - ry * sinTZ;
      const ry3 = rx * sinTZ + ry * cosTZ;
      rx = rx2;
      ry = ry3;

      const pt = projectPoint(rx, ry, rz, cosY, sinY, cosX, sinX, scale, cx, cy);

      if (!started) {
        ctx.moveTo(pt.x, pt.y);
        started = true;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }

      // Check if this is the dot position
      const dotTheta =
        ((ring.dotAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const segTheta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (
        dotProj === null &&
        Math.abs(segTheta - dotTheta) < (Math.PI * 2) / SEGS
      ) {
        dotProj = pt;
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw satellite dot
    if (dotProj) {
      ctx.beginPath();
      ctx.arc(dotProj.x, dotProj.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.save();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  edges: [number, number][],
  proj: Projected[],
  hoveredId: number | null,
  selectedId: number | null
) {
  for (const [i, j] of edges) {
    const a = proj[i];
    const b = proj[j];
    const avgZ = (a.z + b.z) / 2;

    const isHighlighted =
      i === hoveredId || j === hoveredId || i === selectedId || j === selectedId;

    if (isHighlighted) {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
      ctx.lineWidth = 0.8;
    } else if (avgZ < 0) {
      // Front-facing: green tint
      const alpha = 0.02 + (1 - avgZ) * 0.03;
      ctx.strokeStyle = `rgba(34, 197, 94, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.5;
    } else {
      const alpha = 0.01 + (1 - avgZ) * 0.02;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawPulses(
  ctx: CanvasRenderingContext2D,
  pulses: { edge: number; t: number; speed: number }[],
  edges: [number, number][],
  proj: Projected[],
  nodes: MeshNode[]
) {
  for (const pulse of pulses) {
    pulse.t += pulse.speed;
    if (pulse.t > 1) {
      pulse.t = 0;
      pulse.edge = Math.floor(Math.random() * edges.length);
    }
    const [i, j] = edges[pulse.edge];
    const a = proj[i];
    const b = proj[j];
    const px = a.x + (b.x - a.x) * pulse.t;
    const py = a.y + (b.y - a.y) * pulse.t;

    const isSyncing =
      nodes[i].status === "SYNCING" || nodes[j].status === "SYNCING";

    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = isSyncing
      ? "rgba(245, 158, 11, 0.9)"
      : "rgba(34, 197, 94, 0.9)";
    ctx.fill();
  }
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  nodes: MeshNode[],
  proj: Projected[],
  time: number
) {
  for (let i = 0; i < nodes.length; i++) {
    const p = proj[i];
    const node = nodes[i];
    const depth = (1 - p.z) / 2;
    let r = 1 + depth * 1.5;

    ctx.beginPath();

    if (node.status === "SYNCING") {
      r += Math.sin(time * 0.08) * 0.8;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${(0.5 + depth * 0.5).toFixed(2)})`;
      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    } else if (node.status === "ONLINE") {
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${(0.4 + depth * 0.6).toFixed(2)})`;
      ctx.save();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    } else {
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.08 + depth * 0.15).toFixed(2)})`;
      ctx.fill();
    }
  }
}

function drawReticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  phase: number,
  color: string,
  alpha: number
) {
  const s = size;
  const cornerLen = s * 0.4;
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = 1;

  // Top-left bracket
  ctx.beginPath();
  ctx.moveTo(x - s, y - s + cornerLen);
  ctx.lineTo(x - s, y - s);
  ctx.lineTo(x - s + cornerLen, y - s);
  ctx.stroke();

  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(x + s - cornerLen, y - s);
  ctx.lineTo(x + s, y - s);
  ctx.lineTo(x + s, y - s + cornerLen);
  ctx.stroke();

  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(x - s, y + s - cornerLen);
  ctx.lineTo(x - s, y + s);
  ctx.lineTo(x - s + cornerLen, y + s);
  ctx.stroke();

  // Bottom-right bracket
  ctx.beginPath();
  ctx.moveTo(x + s - cornerLen, y + s);
  ctx.lineTo(x + s, y + s);
  ctx.lineTo(x + s, y + s - cornerLen);
  ctx.stroke();

  // Animated crosshair
  const crossLen = s * 0.25 * (0.5 + 0.5 * Math.sin(phase));
  ctx.beginPath();
  ctx.moveTo(x - crossLen, y);
  ctx.lineTo(x + crossLen, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - crossLen);
  ctx.lineTo(x, y + crossLen);
  ctx.stroke();
}

function drawReticles(
  ctx: CanvasRenderingContext2D,
  nodes: MeshNode[],
  proj: Projected[],
  hoveredId: number | null,
  selectedId: number | null,
  time: number
) {
  // Small reticles on front-facing active nodes
  for (let i = 0; i < nodes.length; i++) {
    if (proj[i].z > 0.2) continue;
    if (i === hoveredId || i === selectedId) continue;
    if (nodes[i].status === "ONLINE") {
      drawReticle(ctx, proj[i].x, proj[i].y, 7, time * 0.03, "34,197,94", 0.15);
    } else if (nodes[i].status === "SYNCING") {
      drawReticle(ctx, proj[i].x, proj[i].y, 7, time * 0.06, "245,158,11", 0.2);
    }
  }

  // Hovered node
  if (hoveredId !== null) {
    const color =
      nodes[hoveredId].status === "SYNCING" ? "245,158,11" : "34,197,94";
    drawReticle(ctx, proj[hoveredId].x, proj[hoveredId].y, 16, time * 0.08, color, 0.7);
  }

  // Selected node
  if (selectedId !== null && selectedId !== hoveredId) {
    const color =
      nodes[selectedId].status === "SYNCING" ? "245,158,11" : "34,197,94";
    drawReticle(ctx, proj[selectedId].x, proj[selectedId].y, 18, 0, color, 0.9);
  }
}

function drawPings(
  ctx: CanvasRenderingContext2D,
  nodes: MeshNode[],
  proj: Projected[]
) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.pingPhase <= 0 || node.pingPhase >= 1) continue;
    if (proj[i].z > 0.3) continue;

    const color =
      node.status === "SYNCING" ? "245, 158, 11" : "34, 197, 94";

    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = node.pingPhase - ring * 0.15;
      if (ringPhase < 0 || ringPhase > 1) continue;
      const radius = ringPhase * 35;
      const alpha = (1 - ringPhase) * 0.3;
      ctx.beginPath();
      ctx.arc(proj[i].x, proj[i].y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawHUDLabel(
  ctx: CanvasRenderingContext2D,
  node: MeshNode,
  px: number,
  py: number,
  canvasW: number,
  canvasH: number
) {
  const lines = [
    `${node.label} // ${node.status}`,
    `XYZ [${node.position[0].toFixed(2)}, ${node.position[1].toFixed(2)}, ${node.position[2].toFixed(2)}]`,
    `SYNC: ${formatTimeSince(node.lastSync)}`,
  ];

  const boxWidth = 195;
  const boxHeight = lines.length * 15 + 12;

  // Position: offset to the right, or left if near edge
  let startX = px + 28;
  let startY = py - 20;
  if (px > canvasW * 0.6) startX = px - boxWidth - 28;
  if (py > canvasH - boxHeight - 20) startY = py - boxHeight - 10;

  // Leader line
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(startX < px ? startX + boxWidth : startX, startY + boxHeight / 2);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(startX - 4, startY - 4, boxWidth, boxHeight);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(startX - 4, startY - 4, boxWidth, boxHeight);

  // Corner ticks on box
  const bx = startX - 4;
  const by = startY - 4;
  const bw = boxWidth;
  const bh = boxHeight;
  const tk = 5;
  ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
  ctx.lineWidth = 1;
  // TL
  ctx.beginPath();
  ctx.moveTo(bx, by + tk);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + tk, by);
  ctx.stroke();
  // TR
  ctx.beginPath();
  ctx.moveTo(bx + bw - tk, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + tk);
  ctx.stroke();
  // BL
  ctx.beginPath();
  ctx.moveTo(bx, bh + by - tk);
  ctx.lineTo(bx, bh + by);
  ctx.lineTo(bx + tk, bh + by);
  ctx.stroke();
  // BR
  ctx.beginPath();
  ctx.moveTo(bx + bw - tk, bh + by);
  ctx.lineTo(bx + bw, bh + by);
  ctx.lineTo(bx + bw, bh + by - tk);
  ctx.stroke();

  // Text
  ctx.font = '10px "Space Mono", monospace';
  const statusColor =
    node.status === "SYNCING"
      ? "#f59e0b"
      : node.status === "ONLINE"
        ? "#22c55e"
        : "#71717a";
  ctx.fillStyle = statusColor;
  ctx.fillText(lines[0], startX + 4, startY + 11);
  ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
  for (let i = 1; i < lines.length; i++) {
    ctx.fillText(lines[i], startX + 4, startY + 11 + i * 15);
  }
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const len = 25;
  const pad = 15;
  ctx.strokeStyle = "rgba(34, 197, 94, 0.12)";
  ctx.lineWidth = 1;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + len);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + len, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, h - pad - len);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + len, h - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - len);
  ctx.stroke();
}

function drawScanLine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  const scanY = ((time * 0.4) % (h + 40)) - 20;
  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(w, scanY);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.03)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Component ───────────────────────────────────────────

const NODE_COUNT = 150;
const EDGE_DIST = 0.52;
const PULSE_COUNT = 35;

export default function MeshViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<VizState>({
    angleY: 0,
    angleX: 0.3,
    zoom: 1,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartAngleX: 0.3,
    dragStartAngleY: 0,
    hoveredNodeId: null,
    selectedNodeId: null,
    mouseX: 0,
    mouseY: 0,
    mouseOnCanvas: false,
    mouseMoved: false,
    radarAngle: 0,
    time: 0,
    orbitDot1: 0,
    orbitDot2: Math.PI,
    nodes: [],
    canvasW: 0,
    canvasH: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    // ── Initialize nodes ──
    const basePositions = fibSphere(NODE_COUNT);
    const now = Date.now();
    state.nodes = basePositions.map((pos, i) => {
      const rand = Math.random();
      let status: NodeStatus = "OFFLINE";
      if (rand < 0.15) status = "ONLINE";
      else if (rand < 0.2) status = "SYNCING";
      return {
        id: i,
        position: pos,
        status,
        label: `NODE_${padId(i + 1)}`,
        lastSync: now - Math.random() * 30000,
        pingPhase: 0,
        pingStartedAt: 0,
      };
    });

    // ── Precompute edges ──
    const edges: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = basePositions[i][0] - basePositions[j][0];
        const dy = basePositions[i][1] - basePositions[j][1];
        const dz = basePositions[i][2] - basePositions[j][2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < EDGE_DIST) {
          edges.push([i, j]);
        }
      }
    }

    // ── Sync pulses ──
    const pulses = Array.from({ length: PULSE_COUNT }, () => ({
      edge: Math.floor(Math.random() * edges.length),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
    }));

    // ── Pre-allocate projection array ──
    const proj: Projected[] = new Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) proj[i] = { x: 0, y: 0, z: 0 };

    // ── Event handlers ──
    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.dragStartAngleY = state.angleY;
      state.dragStartAngleX = state.angleX;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;
      state.mouseOnCanvas = true;
      state.mouseMoved = true;

      if (state.isDragging) {
        const dx = e.clientX - state.dragStartX;
        const dy = e.clientY - state.dragStartY;
        state.angleY = state.dragStartAngleY + dx * 0.005;
        state.angleX = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, state.dragStartAngleX + dy * 0.005)
        );
      }
    };

    const onMouseUp = () => {
      state.isDragging = false;
    };

    const onClick = () => {
      if (state.hoveredNodeId !== null) {
        state.selectedNodeId = state.hoveredNodeId;
      } else {
        state.selectedNodeId = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.zoom = Math.max(0.5, Math.min(2.0, state.zoom - e.deltaY * 0.001));
    };

    const onMouseLeave = () => {
      state.mouseOnCanvas = false;
      state.isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mouseleave", onMouseLeave);

    // ── Draw loop ──
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (w !== state.canvasW || h !== state.canvasH) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        state.canvasW = w;
        state.canvasH = h;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ── Update timers ──
      state.time += 1;
      if (!state.isDragging) {
        state.angleY += 0.002;
      }
      state.radarAngle += 0.01;
      state.orbitDot1 += 0.008;
      state.orbitDot2 -= 0.012;

      // ── Node state transitions ──
      for (const node of state.nodes) {
        const rand = Math.random();
        if (node.status === "ONLINE" && rand < 0.0008) {
          node.status = "SYNCING";
          node.pingPhase = 0.01;
          node.pingStartedAt = Date.now();
        } else if (node.status === "SYNCING" && rand < 0.003) {
          node.status = "ONLINE";
          node.lastSync = Date.now();
        } else if (node.status === "OFFLINE" && rand < 0.0002) {
          node.status = "SYNCING";
          node.pingPhase = 0.01;
          node.pingStartedAt = Date.now();
        }

        // Advance pings
        if (node.pingPhase > 0 && node.pingPhase < 1) {
          node.pingPhase += 0.008;
          if (node.pingPhase >= 1) node.pingPhase = 0;
        }
      }

      // ── Projection ──
      const cosY = Math.cos(state.angleY);
      const sinY = Math.sin(state.angleY);
      const cosX = Math.cos(state.angleX);
      const sinX = Math.sin(state.angleX);
      const scale = Math.min(w, h) * 0.38 * state.zoom;
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < NODE_COUNT; i++) {
        const [bx, by, bz] = state.nodes[i].position;
        const pt = projectPoint(bx, by, bz, cosY, sinY, cosX, sinX, scale, cx, cy);
        proj[i].x = pt.x;
        proj[i].y = pt.y;
        proj[i].z = pt.z;
      }

      // ── Hover detection ──
      if (state.mouseMoved && state.mouseOnCanvas && !state.isDragging) {
        state.mouseMoved = false;
        let closestDist = 20 / state.zoom;
        let closestId: number | null = null;
        for (let i = 0; i < NODE_COUNT; i++) {
          if (proj[i].z > 0.3) continue;
          const dx = proj[i].x - state.mouseX;
          const dy = proj[i].y - state.mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = i;
          }
        }
        state.hoveredNodeId = closestId;
      }

      // ── Render passes ──
      drawGridLines(ctx, cosY, sinY, cosX, sinX, scale, cx, cy);
      drawRadarSweep(ctx, cx, cy, scale * 1.12, state.radarAngle);
      drawEdges(ctx, edges, proj, state.hoveredNodeId, state.selectedNodeId);
      drawPulses(ctx, pulses, edges, proj, state.nodes);
      drawOrbitalRings(
        ctx,
        cosY,
        sinY,
        cosX,
        sinX,
        scale,
        cx,
        cy,
        state.orbitDot1,
        state.orbitDot2
      );
      drawNodes(ctx, state.nodes, proj, state.time);
      drawReticles(
        ctx,
        state.nodes,
        proj,
        state.hoveredNodeId,
        state.selectedNodeId,
        state.time
      );
      drawPings(ctx, state.nodes, proj);

      if (state.hoveredNodeId !== null) {
        const hId = state.hoveredNodeId;
        drawHUDLabel(ctx, state.nodes[hId], proj[hId].x, proj[hId].y, w, h);
      }
      if (
        state.selectedNodeId !== null &&
        state.selectedNodeId !== state.hoveredNodeId
      ) {
        const sId = state.selectedNodeId;
        drawHUDLabel(ctx, state.nodes[sId], proj[sId].x, proj[sId].y, w, h);
      }

      drawCornerBrackets(ctx, w, h);
      drawScanLine(ctx, w, h, state.time);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: "crosshair" }}
    />
  );
}
