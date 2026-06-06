"use client";

import { motion, AnimatePresence } from "motion/react";
import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { WHEN_OPTIONS, DURATION_OPTIONS, SEASON_OPTIONS } from "@/lib/trip";
import { useTrip } from "@/lib/store";

const inputClass =
  "rounded-xl border border-tan-line bg-card px-3 py-2.5 text-ink outline-none focus:border-coral";

export default function When() {
  const { answers, set } = useTrip();
  const showDuration = !(answers.when === "dates" && answers.startDate && answers.endDate);

  return (
    <QuestionLayout stepKey="when">
      <p className="mb-2 text-sm font-semibold text-ink-soft">How firm are the dates?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WHEN_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.when === o.key}
            onToggle={(k) => set("when", k)}
          />
        ))}
      </div>

      {/* contextual reveal */}
      <AnimatePresence mode="wait">
        {answers.when === "dates" && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-wrap items-end gap-4 rounded-2xl border border-tan-line/70 bg-card/50 p-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
                From
                <input
                  type="date"
                  value={answers.startDate ?? ""}
                  onChange={(e) => set("startDate", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
                To
                <input
                  type="date"
                  value={answers.endDate ?? ""}
                  min={answers.startDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </motion.div>
        )}

        {answers.when === "month" && (
          <motion.div
            key="month"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border border-tan-line/70 bg-card/50 p-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
                Which month?
                <input
                  type="month"
                  value={answers.monthValue ?? ""}
                  onChange={(e) => set("monthValue", e.target.value)}
                  className={`${inputClass} w-fit`}
                />
              </label>
            </div>
          </motion.div>
        )}

        {answers.when === "season" && (
          <motion.div
            key="season"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SEASON_OPTIONS.map((o, i) => (
                <ChoiceTile
                  key={o.key}
                  choice={o}
                  index={i}
                  selected={answers.season === o.key}
                  onToggle={(k) => set("season", k)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showDuration && (
        <>
          <p className="mb-2 mt-7 text-sm font-semibold text-ink-soft">How long away?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DURATION_OPTIONS.map((o, i) => (
              <ChoiceTile
                key={o.key}
                choice={o}
                index={i}
                selected={answers.duration === o.key}
                onToggle={(k) => set("duration", k)}
              />
            ))}
          </div>
        </>
      )}
    </QuestionLayout>
  );
}
