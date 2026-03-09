"use client";

import { useEffect, useRef } from "react";

/** Fibonacci sphere: evenly distributed points on a unit sphere. */
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

export default function MeshViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NODE_COUNT = 150;
    const EDGE_DIST = 0.52;
    const PULSE_COUNT = 25;

    const base = fibSphere(NODE_COUNT);
    const active = base.map(() => Math.random() < 0.15);

    // Precompute edges between nearby nodes
    const edges: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = base[i][0] - base[j][0];
        const dy = base[i][1] - base[j][1];
        const dz = base[i][2] - base[j][2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < EDGE_DIST) {
          edges.push([i, j]);
        }
      }
    }

    // Sync pulses that travel along edges
    const pulses = Array.from({ length: PULSE_COUNT }, () => ({
      edge: Math.floor(Math.random() * edges.length),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
    }));

    let angle = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Mouse influence on rotation speed
      let speedMul = 1;
      if (mouseRef.current.active) {
        const mx = (mouseRef.current.x / w - 0.5) * 2;
        speedMul = 1 + mx * 0.5;
      }

      angle += 0.002 * speedMul;
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const tilt = 0.3;
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      const scale = Math.min(w, h) * 0.38;
      const cx = w / 2;
      const cy = h / 2;

      // Project all points
      const proj: { x: number; y: number; z: number }[] = [];
      for (const [bx, by, bz] of base) {
        let x = bx * cosY + bz * sinY;
        let z = -bx * sinY + bz * cosY;
        let y = by;
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2;
        z = z2;
        const p = 3 / (3 + z);
        proj.push({ x: cx + x * scale * p, y: cy + y * scale * p, z });
      }

      // Edges
      for (const [i, j] of edges) {
        const a = proj[i];
        const b = proj[j];
        const avgZ = (a.z + b.z) / 2;
        const alpha = 0.02 + (1 - avgZ) * 0.04;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Pulses
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
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34,197,94,0.9)";
        ctx.fill();
      }

      // Nodes
      ctx.shadowBlur = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const p = proj[i];
        const depth = (1 - p.z) / 2;
        const r = 1 + depth * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        if (active[i]) {
          ctx.fillStyle = `rgba(34,197,94,${(0.4 + depth * 0.6).toFixed(2)})`;
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${(0.1 + depth * 0.4).toFixed(2)})`;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current.active = false;
      }}
    />
  );
}
