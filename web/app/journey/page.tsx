"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Check, ArrowRight, Sparkles } from "lucide-react";
import { Brand } from "@/components/Brand";
import { META } from "@/lib/trip";
import { applicableFlow } from "@/lib/branching";
import { useTrip } from "@/lib/store";

export default function Journey() {
  const { answers } = useTrip();
  const flow = applicableFlow(answers);
  const tailoredOut = 9 - flow.length;

  const isAnswered = (key: string): boolean => {
    switch (key) {
      case "where":
        return !!answers.destination;
      case "when":
        return !!answers.when;
      case "who":
        return !!answers.who;
      case "vibe":
        return answers.vibe.length > 0;
      case "food":
        return answers.diet.length > 0;
      case "experiences":
        return answers.experiences.length > 0;
      case "nights":
        return answers.nights.length > 0;
      case "stay":
        return answers.stayTypes.length > 0;
      case "budget":
        return !!answers.budgetTier;
      default:
        return false;
    }
  };

  const doneCount = flow.filter(isAnswered).length;
  const next = flow.find((k) => !isAnswered(k)) ?? null;
  const pathFor = (key: string) => (key === "where" ? "/" : `/${key}`);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <span className="text-xs font-medium text-ink-soft/70">
          {doneCount} of {flow.length} answered
        </span>
      </header>

      <div className="mt-9">
        <div className="flex items-center gap-2 text-ink-soft">
          <MapPin className="h-4 w-4 text-coral" />
          <span className="text-sm font-medium">{answers.destination || "Your destination"}</span>
        </div>
        <h1 className="display mt-2 text-4xl font-semibold tracking-tight text-ink">
          Your trip, so far
        </h1>
        <p className="mt-2 text-ink-soft">
          Pick up where you left off, or revisit anything you&apos;ve answered.
        </p>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-tan/35">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round((doneCount / flow.length) * 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-coral/80"
        />
      </div>

      {tailoredOut > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-teal/30 bg-teal/8 px-3 py-2 text-sm text-teal-deep">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          Tailored to you — we set aside the nightlife step for your family trip. Want it?{" "}
          <Link href="/nights" className="font-semibold underline">
            Add evenings
          </Link>
        </p>
      )}

      <div className="mt-7 space-y-2.5">
        {flow.map((key, i) => {
          const meta = META[key];
          const Icon = meta.icon;
          const done = isAnswered(key);
          const isNext = key === next;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35 }}
            >
              <Link
                href={pathFor(key)}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                  isNext
                    ? "border-coral/70 bg-card card-shadow"
                    : "border-tan-line/70 bg-card/60 hover:border-coral/40"
                }`}
              >
                {done ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -14 }}
                    animate={{ scale: 1, rotate: -4 }}
                    transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.05 * i }}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-teal/40 bg-teal/12 text-teal-deep"
                  >
                    <Check className="h-5 w-5" strokeWidth={2.8} />
                  </motion.span>
                ) : (
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      isNext ? "bg-coral text-paper" : "bg-tan/25 text-ink-soft/60"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{meta.label}</p>
                  <p className="truncate text-sm text-ink-soft/70">{meta.eyebrow}</p>
                </div>
                {isNext ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-coral">
                    Continue <ArrowRight className="h-4 w-4" />
                  </span>
                ) : done ? (
                  <span className="text-sm font-medium text-ink-soft/60">Answered</span>
                ) : (
                  <span className="text-sm text-ink-soft/40">Upcoming</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
