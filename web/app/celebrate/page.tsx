"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useTrip } from "@/lib/store";

export default function Celebrate() {
  const { answers } = useTrip();
  const place = answers.destination || "your destination";
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <span className="text-xs font-medium text-ink-soft/70">All set</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* a single, quiet seal — one soft expanding ring */}
        <div className="relative grid place-items-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
            className="absolute h-24 w-24 rounded-full border border-coral/40"
          />
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
            className="grid h-24 w-24 place-items-center rounded-full bg-teal-deep text-paper"
          >
            <Check className="h-10 w-10" strokeWidth={2.5} />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="display mt-9 text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
        >
          We&apos;ve got your trip.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
          className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft"
        >
          We&apos;re shaping {place} around everything you told us — the places to stay,
          the food, the pace, the evenings. Give us a moment to craft it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-2 text-sm text-ink-soft/70"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
          Matching stays, food &amp; experiences to your profile…
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-6"
      >
        <Link
          href="/trip"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 py-4 text-lg font-semibold text-paper transition-colors hover:bg-coral-deep"
        >
          Reveal my trip
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </main>
  );
}
