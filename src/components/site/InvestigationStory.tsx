"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGES = [
  { n: "01", title: "Case Intake", desc: "Structured intake captures scope, authorization and objectives before any technical work begins." },
  { n: "02", title: "Risk Assessment", desc: "Initial assessment identifies data sources, sensitivities and evidentiary risk factors." },
  { n: "03", title: "Evidence Preservation", desc: "Digital evidence is preserved using forensically sound acquisition and hashing procedures." },
  { n: "04", title: "Forensic Examination", desc: "Preserved evidence is examined using structured, repeatable forensic methodology." },
  { n: "05", title: "Intelligence Correlation", desc: "Individual artifacts are correlated into a coherent investigative picture." },
  { n: "06", title: "Analytical Findings", desc: "Correlated intelligence is translated into clear, defensible analytical findings." },
  { n: "07", title: "Reporting", desc: "Findings are documented in a structured, technically accurate report." },
  { n: "08", title: "Secure Delivery", desc: "Final deliverables are shared with authorized recipients through secure channels." },
];

/**
 * Sanitizes a scroll-progress input range for `useTransform`.
 *
 * `useScroll().scrollYProgress` is normalized to [0, 1], and Framer Motion
 * forwards these mappings to the browser as Web Animations API keyframe
 * offsets. The WAAPI spec requires every offset to sit within [0, 1] AND to be
 * monotonically non-decreasing; violating either throws:
 *
 *   TypeError: Failed to execute 'animate' on 'Element':
 *              Offsets must be monotonically non-decreasing.
 *
 * Per-stage ranges are derived from `index / STAGES.length` with a +/- lead-in
 * offset, which produced negative values for the first stage (e.g. -0.05) and
 * >1 values for the last stage (e.g. 1.05). This helper clamps each point into
 * [0, 1] while carrying the previous value forward so the sequence can never
 * decrease, keeping the original easing shape intact for every interior stage.
 */
function toMonotonicRange(points: number[]): number[] {
  let previous = 0;
  return points.map((point) => {
    // Math.max(previous, point) clamps negatives to 0 and guarantees the
    // sequence never decreases; Math.min(1, ...) caps the upper bound.
    const value = Math.min(1, Math.max(previous, point));
    previous = value;
    return value;
  });
}

function StageRow({
  stage,
  index,
  progress,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / STAGES.length;
  const end = (index + 1) / STAGES.length;

  // All three ranges are sanitized so no invalid WAAPI offset is ever emitted.
  // Output values are unchanged, so the visual behavior is preserved.
  const opacity = useTransform(
    progress,
    toMonotonicRange([start - 0.05, start + 0.05, end - 0.05, end + 0.05]),
    [0.25, 1, 1, 0.25]
  );
  const x = useTransform(progress, toMonotonicRange([start - 0.05, start + 0.1]), [24, 0]);
  const lineScale = useTransform(progress, toMonotonicRange([start, end]), [0, 1]);

  return (
    <motion.div style={{ opacity }} className="relative flex gap-6 py-7">
      <div className="flex flex-col items-center">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-shield-cyan/40 bg-shield-navy-900 text-sm font-mono text-shield-cyan">
          {stage.n}
        </div>
        {index < STAGES.length - 1 && (
          <div className="relative mt-1 h-full w-px flex-1 bg-shield-line">
            <motion.div
              style={{ scaleY: lineScale }}
              className="absolute inset-0 origin-top bg-shield-cyan/70"
            />
          </div>
        )}
      </div>
      <motion.div style={{ x }} className="pb-2">
        <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-shield-text-muted">{stage.desc}</p>
      </motion.div>
    </motion.div>
  );
}

function CorrelationNode({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const angle = (index / total) * Math.PI * 2;
  const r = 120;
  const x = 150 + Math.cos(angle) * r;
  const y = 150 + Math.sin(angle) * r;
  // Same class of defect as StageRow: `index / total - 0.1` is negative for the
  // first node, which is an invalid WAAPI keyframe offset.
  const opacity = useTransform(
    progress,
    toMonotonicRange([index / total - 0.1, index / total + 0.05]),
    [0.15, 1]
  );

  return (
    <g>
      <motion.line x1="150" y1="150" x2={x} y2={y} stroke="rgba(53,224,255,0.4)" strokeWidth="1" style={{ opacity }} />
      <motion.circle cx={x} cy={y} r="5" fill="#35e0ff" style={{ opacity }} />
    </g>
  );
}

function CorrelationVisual({ progress }: { progress: MotionValue<number> }) {
  const nodes = Array.from({ length: 8 }, (_, i) => i);
  const rotate = useTransform(progress, [0, 1], [0, 45]);

  return (
    <div className="sticky top-28 hidden h-[420px] items-center justify-center lg:flex">
      <motion.svg style={{ rotate }} viewBox="0 0 300 300" className="h-80 w-80">
        <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(53,224,255,0.12)" strokeWidth="1" />
        <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(53,224,255,0.15)" strokeWidth="1" />
        {nodes.map((i) => (
          <CorrelationNode key={i} index={i} total={nodes.length} progress={progress} />
        ))}
        <circle cx="150" cy="150" r="10" fill="#0b1119" stroke="#35e0ff" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="4" fill="#35e0ff" />
      </motion.svg>
    </div>
  );
}

export function InvestigationStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section className={cn("relative border-b border-shield-line bg-shield-navy-950 py-20")}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-shield-cyan">Methodology</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Inside a Digital Investigation</h2>
          <p className="mt-4 text-shield-text-muted">
            Every Shield engagement follows a structured, repeatable process — designed to preserve evidentiary
            integrity from intake through secure delivery. This is an illustrative overview of that process, not a
            depiction of any specific case.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            {STAGES.map((stage, i) => (
              <StageRow key={stage.n} stage={stage} index={i} progress={scrollYProgress} />
            ))}
          </div>
          <CorrelationVisual progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
