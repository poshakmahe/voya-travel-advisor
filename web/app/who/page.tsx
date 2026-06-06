"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, X, UserRound, Baby } from "lucide-react";
import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { WHO_OPTIONS, NEEDS_OPTIONS, partySizing } from "@/lib/trip";
import { hasYoungKids } from "@/lib/branching";
import { useTrip, type Traveler } from "@/lib/store";

const inputClass =
  "rounded-xl border border-tan-line bg-card px-3 py-2.5 text-ink outline-none focus:border-coral placeholder:text-ink-soft/40";

export default function Who() {
  const { answers, set } = useTrip();
  const cfg = answers.who ? partySizing[answers.who] : null;

  const displayCount = cfg
    ? cfg.fixed
      ? cfg.seed
      : Math.max(answers.travelers.length, cfg.seed)
    : 0;

  const rows: Traveler[] = Array.from(
    { length: displayCount },
    (_, i) => answers.travelers[i] ?? { name: "", age: "" }
  );

  const updateRow = (i: number, patch: Partial<Traveler>) => {
    const full = [...rows];
    full[i] = { ...full[i], ...patch };
    set("travelers", full);
  };
  const addRow = () => set("travelers", [...rows, { name: "", age: "" }]);
  const removeRow = (i: number) =>
    set("travelers", rows.filter((_, idx) => idx !== i));

  const hasValid = rows.some((t) => t.name.trim() && t.age.trim());

  // accessibility / needs — "Nothing special" is exclusive
  const toggleNeed = (key: string) => {
    if (key === "none") {
      set("needs", answers.needs.includes("none") ? [] : ["none"]);
      return;
    }
    const without = answers.needs.filter((n) => n !== "none");
    set(
      "needs",
      without.includes(key) ? without.filter((n) => n !== key) : [...without, key]
    );
  };

  return (
    <QuestionLayout
      stepKey="who"
      hint={
        answers.who && !hasValid
          ? "Add at least one name and age to continue"
          : undefined
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WHO_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.who === o.key}
            onToggle={(k) => set("who", k)}
          />
        ))}
      </div>

      <AnimatePresence>
        {answers.who && cfg && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-7">
            <p className="mb-1 text-sm font-semibold text-ink-soft">
              Who exactly?{" "}
              <span className="font-normal text-ink-soft/60">
                — names optional, so we can address everyone properly
              </span>
            </p>

            <div className="mt-3 space-y-2.5">
              {rows.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tan/25 text-ink-soft/60">
                    {t.age.trim() && Number(t.age) < 13 ? (
                      <Baby className="h-5 w-5" strokeWidth={2.2} />
                    ) : (
                      <UserRound className="h-5 w-5" strokeWidth={2.2} />
                    )}
                  </span>
                  <input
                    value={t.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder={i === 0 ? "Name" : "Name (optional)"}
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    value={t.age}
                    onChange={(e) => updateRow(i, { age: e.target.value })}
                    placeholder="Age"
                    inputMode="numeric"
                    className={`${inputClass} w-20`}
                  />
                  {!cfg.fixed && rows.length > cfg.min && (
                    <button
                      onClick={() => removeRow(i)}
                      aria-label="Remove traveler"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft/50 transition-colors hover:bg-coral/10 hover:text-coral"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!cfg.fixed && (
              <button
                onClick={addRow}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-tan-line px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-coral hover:text-coral"
              >
                <Plus className="h-4 w-4" /> Add traveler
              </button>
            )}

            {/* adaptive branch cue */}
            <AnimatePresence>
              {hasYoungKids(answers) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-start gap-2 overflow-hidden rounded-xl border border-teal/30 bg-teal/8 px-3 py-2 text-sm text-teal-deep"
                >
                  <Baby className="mt-0.5 h-4 w-4 shrink-0" />
                  Travelling with little ones — we&apos;ll plan easy evenings and skip the nightlife
                  step. You can still add it anytime.
                </motion.p>
              )}
            </AnimatePresence>

            {/* special needs */}
            <p className="mb-2 mt-7 text-sm font-semibold text-ink-soft">
              Anything we should plan around?
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NEEDS_OPTIONS.map((o, i) => (
                <ChoiceTile
                  key={o.key}
                  choice={o}
                  index={i}
                  selected={answers.needs.includes(o.key)}
                  onToggle={toggleNeed}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </QuestionLayout>
  );
}
