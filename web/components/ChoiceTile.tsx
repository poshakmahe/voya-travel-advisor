"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Choice } from "@/lib/trip";

export function ChoiceTile({
  choice,
  selected,
  onToggle,
  index = 0,
}: {
  choice: Choice;
  selected: boolean;
  onToggle: (key: string) => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(choice.key)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.025 * index, duration: 0.35, ease: "easeOut" }}
      whileTap={{ scale: 0.985 }}
      className={`group relative flex items-start gap-3 rounded-2xl border bg-card/70 p-4 text-left transition-all duration-200 ${
        selected
          ? "border-coral/70 bg-card shadow-[0_10px_24px_-18px_rgba(43,32,23,0.5)]"
          : "border-tan-line/70 hover:border-coral/40 hover:bg-card"
      }`}
    >
      <span className="text-2xl leading-none">{choice.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight text-ink">{choice.label}</span>
        {choice.hint && (
          <span className="mt-0.5 block text-sm text-ink-soft/70">{choice.hint}</span>
        )}
      </span>
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
          selected
            ? "border-coral bg-coral text-paper"
            : "border-tan-line bg-transparent text-transparent group-hover:border-coral/40"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
    </motion.button>
  );
}
