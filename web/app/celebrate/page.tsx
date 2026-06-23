"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useTrip } from "@/lib/store";

export default function Celebrate() {
  const { answers, reset } = useTrip();
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
          We&apos;ve got everything you told us about {place}, down to the stays, the food, the
          pace, and the evenings. We&apos;ll hand-craft a full itinerary and send it to your inbox.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-2 text-sm text-ink-soft/70"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
          On its way — keep an eye on your email.
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-6 text-center"
      >
        <Link
          href="/"
          onClick={() => reset()}
          className="text-sm font-medium text-ink-soft/70 transition-colors hover:text-coral"
        >
          Plan another trip
        </Link>
      </motion.div>
    </main>
  );
}
