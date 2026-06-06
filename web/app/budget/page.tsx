"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { BUDGET_OPTIONS, CURRENCIES, symbolFor, fmtMoney, buildupTotal, estimateNights } from "@/lib/trip";
import { useTrip } from "@/lib/store";

export default function Budget() {
  const { answers, set } = useTrip();
  const sym = symbolFor(answers.currency);
  const isLuxury = answers.budgetTier === "luxury";
  const nights = estimateNights(answers);

  const moneyInput = (
    value: string | undefined,
    onChange: (v: string) => void,
    placeholder: string
  ) => (
    <div className="flex items-center rounded-xl border border-tan-line bg-card px-3 focus-within:border-coral">
      <span className="text-ink-soft">{sym}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="w-24 bg-transparent py-2.5 pl-1 text-ink outline-none placeholder:text-ink-soft/40"
      />
    </div>
  );

  return (
    <QuestionLayout stepKey="budget" continueLabel="See my trip profile" continueHref="/summary">
      <p className="mb-2 text-sm font-semibold text-ink-soft">What kind of spender are you?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BUDGET_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.budgetTier === o.key}
            onToggle={(k) => set("budgetTier", k)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isLuxury ? (
          <motion.div
            key="luxury"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <p className="text-ink-soft">
              <span className="font-semibold text-ink">Cost isn&apos;t the point.</span> We&apos;ll
              curate the very best — and skip the budget talk on your results.
            </p>
          </motion.div>
        ) : answers.budgetTier ? (
          <motion.div
            key="amount"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            {/* currency + mode */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={answers.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="rounded-xl border border-tan-line bg-card px-3 py-2 text-ink outline-none focus:border-coral"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="inline-flex rounded-full border border-tan-line bg-card/60 p-1">
                {(["total", "build"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => set("budgetMode", m)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      answers.budgetMode === m ? "bg-coral text-paper" : "text-ink-soft"
                    }`}
                  >
                    {m === "total" ? "Enter a total" : "Build it up"}
                  </button>
                ))}
              </div>
            </div>

            {answers.budgetMode === "total" ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink-soft">
                    Overall trip budget (a range is fine)
                  </p>
                  <div className="flex items-center gap-2">
                    {moneyInput(answers.budgetMin, (v) => set("budgetMin", v), "2,500")}
                    <span className="text-ink-soft">to</span>
                    {moneyInput(answers.budgetMax, (v) => set("budgetMax", v), "4,000")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink-soft">Per</p>
                    <div className="inline-flex rounded-full border border-tan-line bg-card/60 p-1">
                      {(["total", "per_person"] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => set("budgetBasis", b)}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            answers.budgetBasis === b ? "bg-coral text-paper" : "text-ink-soft"
                          }`}
                        >
                          {b === "total" ? "Whole trip" : "Per person"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink-soft">Flights included?</p>
                    <button
                      onClick={() => set("inclFlights", !answers.inclFlights)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        answers.inclFlights
                          ? "border-teal bg-teal/12 text-teal-deep"
                          : "border-tan-line bg-card/60 text-ink-soft"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          answers.inclFlights ? "bg-teal" : "bg-tan-line"
                        }`}
                      />
                      {answers.inclFlights ? "Yes, included" : "No, separate"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-ink-soft">
                  Build it up{" "}
                  <span className="font-normal text-ink-soft/60">
                    — rough numbers, we&apos;ll total it for ~{nights} nights
                  </span>
                </p>
                <div className="space-y-2.5">
                  {[
                    { k: "costFlights", label: "Flights (total)", ph: "600" },
                    { k: "costHotel", label: "Hotel / night", ph: answers.accomNightly || "150" },
                    { k: "costExp", label: "Experiences / day", ph: "60" },
                    { k: "costFood", label: "Food / day", ph: "70" },
                    { k: "costExtras", label: "Extras / day", ph: "30" },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink">{row.label}</span>
                      {moneyInput(
                        answers[row.k as keyof typeof answers] as string | undefined,
                        (v) => set(row.k as "costFlights", v),
                        row.ph
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-teal/10 px-4 py-3">
                  <span className="font-semibold text-teal-deep">Estimated total</span>
                  <span className="display text-xl font-semibold text-teal-deep">
                    {fmtMoney(buildupTotal(answers), answers.currency)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </QuestionLayout>
  );
}
