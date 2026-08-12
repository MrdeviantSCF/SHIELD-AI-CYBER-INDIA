"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Cinematic hero visualization: an original, abstract "digital investigation
 * pipeline" rendered on canvas. Represents the flow:
 *   Digital Data -> Collection -> Evidence -> Correlation -> Analysis ->
 *   Intelligence -> Findings -> Report
 *
 * Entirely generated programmatically (no stock footage / no copyrighted
 * assets). Respects prefers-reduced-motion by rendering a single static
 * frame. Automatically pauses when off-screen or on low-power/backgrounded
 * tabs to protect mobile performance.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  stage: number;
};

type Packet = {
  progress: number; // 0..1 along the pipeline
  speed: number;
  lane: number;
  hue: number;
};

const STAGE_LABELS = [
  "DIGITAL DATA",
  "COLLECTION",
  "EVIDENCE",
  "CORRELATION",
  "ANALYSIS",
  "INTELLIGENCE",
  "FINDINGS",
  "REPORT",
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * `prefers-reduced-motion` is external browser state, so it is read through
 * useSyncExternalStore rather than mirrored into useState from an effect.
 * Subscribing directly avoids the cascading re-render that calling setState
 * synchronously inside an effect body would cause, and keeps the value
 * consistent during concurrent rendering.
 */
function subscribeToReducedMotion(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * The server cannot know the visitor's motion preference. Reporting `false`
 * keeps the server-rendered markup identical to the client's first paint for
 * the common case; if the visitor does prefer reduced motion, the subscription
 * corrects it on hydration before any animation frame is scheduled.
 */
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function HeroPipeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let running = true;
    let visible = true;

    const nodes: Node[] = [];
    const packets: Packet[] = [];
    const NUM_NODES = 46;
    const NUM_PACKETS = 28;
    const NUM_LANES = 8;

    // NOTE: these helpers are arrow functions bound to `const` rather than
    // hoisted `function` declarations. TypeScript discards the non-null
    // narrowing of `canvas`/`container`/`ctx` inside a hoisted declaration
    // (it must assume the function could be invoked before the guards above
    // ran), which previously produced dozens of TS18047 "possibly null"
    // errors. Arrow functions defined after the guards keep the narrowing and
    // also remove the hoisting hazard.
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < NUM_NODES; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.6 + 0.6,
          stage: Math.floor(Math.random() * STAGE_LABELS.length),
        });
      }
    };

    const initPackets = () => {
      packets.length = 0;
      for (let i = 0; i < NUM_PACKETS; i++) {
        packets.push({
          progress: Math.random(),
          speed: Math.random() * 0.00035 + 0.00025,
          lane: Math.floor(Math.random() * NUM_LANES),
          hue: 190 + Math.random() * 20,
        });
      }
    };

    resize();
    initNodes();
    initPackets();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "rgba(53,224,255,0.25)";
      for (let i = 0; i < NUM_LANES; i++) {
        const y = (height / (NUM_LANES + 1)) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    if (reducedMotion) {
      drawStatic();
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Faint pipeline lanes (the stages flow left -> right).
      ctx.save();
      ctx.strokeStyle = "rgba(53,224,255,0.10)";
      ctx.lineWidth = 1;
      for (let i = 0; i < NUM_LANES; i++) {
        const y = (height / (NUM_LANES + 1)) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Drifting background nodes with subtle connective lines (network / evidence graph).
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      ctx.save();
      ctx.strokeStyle = "rgba(53,224,255,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 130 * 130) {
            ctx.globalAlpha = 1 - distSq / (130 * 130);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      ctx.save();
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(200,240,255,0.55)";
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Moving data packets along the pipeline lanes — the core "investigation flow" motif.
      const laneCount = NUM_LANES;
      for (const p of packets) {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const y = (height / (laneCount + 1)) * (p.lane + 1) + Math.sin(p.progress * Math.PI * 4 + p.lane) * 6;
        const x = p.progress * width;

        const gradient = ctx.createLinearGradient(x - 40, y, x, y);
        gradient.addColorStop(0, "rgba(53,224,255,0)");
        gradient.addColorStop(1, `hsla(${p.hue}, 90%, 65%, 0.9)`);

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, x - 40), y);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, 0.95)`;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Stage markers with labels along the top.
      ctx.save();
      ctx.font = "500 10px var(--font-geist-mono), monospace";
      ctx.fillStyle = "rgba(146,163,180,0.9)";
      ctx.textBaseline = "middle";
      const segment = width / STAGE_LABELS.length;
      for (let i = 0; i < STAGE_LABELS.length; i++) {
        const x = segment * i + segment / 2;
        ctx.save();
        ctx.strokeStyle = "rgba(53,224,255,0.18)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.restore();
        ctx.textAlign = "center";
        ctx.fillText(STAGE_LABELS[i], x, 16);
      }
      ctx.restore();
    };

    let frameId: number;
    const loop = () => {
      if (!running) return;
      if (visible && document.visibilityState === "visible") {
        drawFrame();
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
