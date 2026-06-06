"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Brand } from "@/components/Brand";
import { META, type StepKey } from "@/lib/trip";
import { position } from "@/lib/branching";
import { useTrip } from "@/lib/store";

export function QuestionLayout({
  stepKey,
  children,
  continueLabel = "Continue",
  continueHref,
  hint,
}: {
  stepKey: StepKey;
  children: React.ReactNode;
  continueLabel?: string;
  continueHref?: string;
  hint?: string;
}) {
  const { answers } = useTrip();
  const meta = META[stepKey];
  const pos = position(stepKey, answers);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      {/* quiet progress */}
      <div className="flex items-center gap-4">
        <Brand />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-medium tabular-nums text-ink-soft/70">
            Stop {pos.index + 1} of {pos.total}
          </span>
        </div>
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-tan/35">
        <motion.div
          key={stepKey}
          initial={{ width: 0 }}
          animate={{ width: `${pos.percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-coral/80"
        />
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
          {meta.eyebrow}
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="display mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
        >
          {meta.title}
        </motion.h1>
        <p className="mt-2 max-w-lg text-ink-soft">{meta.subtitle}</p>
      </div>

      <div className="mt-7">{children}</div>

      <div className="mt-auto flex items-center gap-3 pt-10">
        {pos.prevPath && (
          <Link
            href={pos.prevPath}
            className="inline-flex items-center gap-2 rounded-xl border border-tan-line px-5 py-3.5 font-medium text-ink-soft transition-colors hover:border-ink-soft/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        )}
        <Link
          href={continueHref ?? pos.nextPath}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-coral px-6 py-3.5 text-lg font-semibold text-paper transition-colors hover:bg-coral-deep"
        >
          {continueLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {hint && <p className="mt-3 text-center text-sm text-ink-soft/60">{hint}</p>}
    </main>
  );
}
