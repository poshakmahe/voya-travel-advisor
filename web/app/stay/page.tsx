"use client";

import { motion, AnimatePresence } from "motion/react";
import { Moon, Accessibility } from "lucide-react";
import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { STAY_OPTIONS, MIN_NIGHTS_OPTIONS, CURRENCIES, symbolFor } from "@/lib/trip";
import { isFamilyOrGroup, needsAccessible } from "@/lib/branching";
import { useTrip } from "@/lib/store";

export default function Stay() {
  const { answers, set, toggle } = useTrip();
  const sym = symbolFor(answers.currency);
  const promoteMinNights = isFamilyOrGroup(answers);

  const minNightsBlock = (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-soft">
        Minimum nights in one place
        {promoteMinNights ? (
          <span className="font-normal text-ink-soft/60"> — with your group, fewer moves means less hassle</span>
        ) : (
          <span className="font-normal text-ink-soft/60"> — how settled do you like to be?</span>
        )}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MIN_NIGHTS_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.minNights === o.key}
            onToggle={(k) => set("minNights", k)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <QuestionLayout stepKey="stay">
      {/* Promoted to the top for families & larger groups (adaptive) */}
      {promoteMinNights && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 rounded-2xl border border-coral/40 bg-coral/8 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-coral">
            <Moon className="h-4 w-4" /> First, the thing that matters most for you
          </div>
          {minNightsBlock}
        </motion.div>
      )}

      <p className="mb-2 text-sm font-semibold text-ink-soft">
        Preferred style{" "}
        <span className="font-normal text-ink-soft/60">— we may suggest better-suited options</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STAY_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.stayTypes.includes(o.key)}
            onToggle={(k) => toggle("stayTypes", k)}
          />
        ))}
      </div>

      <AnimatePresence>
        {needsAccessible(answers) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start gap-2 overflow-hidden rounded-xl border border-teal/30 bg-teal/8 px-3 py-2 text-sm text-teal-deep"
          >
            <Accessibility className="mt-0.5 h-4 w-4 shrink-0" />
            We&apos;ll prioritise step-free, lift-served stays with accessible bathrooms.
          </motion.p>
        )}
      </AnimatePresence>

      {/* per-night budget */}
      <div className="mt-7 rounded-2xl border border-tan-line/70 bg-card/50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
            Typical budget per night
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-tan-line bg-card px-3 focus-within:border-coral">
                <span className="text-ink-soft">{sym}</span>
                <input
                  value={answers.accomNightly ?? ""}
                  onChange={(e) => set("accomNightly", e.target.value)}
                  placeholder="150"
                  inputMode="numeric"
                  className="w-24 bg-transparent py-2.5 pl-1 text-ink outline-none placeholder:text-ink-soft/40"
                />
                <span className="text-sm text-ink-soft/60">/night</span>
              </div>
              <select
                value={answers.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="rounded-xl border border-tan-line bg-card px-3 py-2.5 text-ink outline-none focus:border-coral"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <button
          onClick={() => set("accomSplurge", !answers.accomSplurge)}
          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            answers.accomSplurge
              ? "border-teal bg-teal/12 text-teal-deep"
              : "border-tan-line bg-card/60 text-ink-soft"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              answers.accomSplurge ? "bg-teal" : "bg-tan-line"
            }`}
          />
          I&apos;d splurge on a special stay for a night or two
        </button>

        <AnimatePresence>
          {answers.accomSplurge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
                Up to, on those special nights
                <div className="flex w-fit items-center rounded-xl border border-tan-line bg-card px-3 focus-within:border-coral">
                  <span className="text-ink-soft">{sym}</span>
                  <input
                    value={answers.accomSplurgeMax ?? ""}
                    onChange={(e) => set("accomSplurgeMax", e.target.value)}
                    placeholder="350"
                    inputMode="numeric"
                    className="w-24 bg-transparent py-2.5 pl-1 text-ink outline-none placeholder:text-ink-soft/40"
                  />
                  <span className="text-sm text-ink-soft/60">/night</span>
                </div>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* min nights at the normal position when not promoted */}
      {!promoteMinNights && <div className="mt-7">{minNightsBlock}</div>}
    </QuestionLayout>
  );
}
