"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useTrip } from "@/lib/store";
import { applicableFlow, hasYoungKids } from "@/lib/branching";
import {
  META,
  labelOf,
  labelsOf,
  ADVENTURE_LABELS,
  WHEN_OPTIONS,
  DURATION_OPTIONS,
  SEASON_OPTIONS,
  WHO_OPTIONS,
  NEEDS_OPTIONS,
  VIBE_OPTIONS,
  FOOD_OPTIONS,
  MEAT_OPTIONS,
  EXPERIENCE_OPTIONS,
  NIGHTS_OPTIONS,
  STAY_OPTIONS,
  MIN_NIGHTS_OPTIONS,
  BUDGET_OPTIONS,
  symbolFor,
  fmtMoney,
  buildupTotal,
  type StepKey,
} from "@/lib/trip";

type Row = { key: StepKey; icon: LucideIcon; label: string; value: string | null; href: string };

const join = (...parts: (string | undefined | null | false)[]) =>
  parts.filter(Boolean).join(" · ") || null;

export default function Summary() {
  const { answers } = useTrip();
  const sym = symbolFor(answers.currency);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const whenValue = (() => {
    if (answers.when === "dates" && answers.startDate && answers.endDate)
      return `${fmtDate(answers.startDate)} – ${fmtDate(answers.endDate)}`;
    if (answers.when === "month" && answers.monthValue)
      return new Date(answers.monthValue + "-01").toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    if (answers.when === "season" && answers.season)
      return labelOf(SEASON_OPTIONS, answers.season) ?? null;
    return labelOf(WHEN_OPTIONS, answers.when) ?? null;
  })();

  const whoValue = (() => {
    if (!answers.who) return null;
    const named = answers.travelers
      .filter((t) => t.name.trim())
      .map((t) => (t.age.trim() ? `${t.name} (${t.age})` : t.name));
    const party = labelOf(WHO_OPTIONS, answers.who);
    const needs = labelsOf(NEEDS_OPTIONS, answers.needs.filter((n) => n !== "none"));
    return join(party, named.length ? named.join(", ") : null, needs || null);
  })();

  const nightsValue = hasYoungKids(answers)
    ? "Easy family evenings (planned for you)"
    : labelsOf(NIGHTS_OPTIONS, answers.nights) || null;

  const budgetValue = (() => {
    if (!answers.budgetTier) return null;
    if (answers.budgetTier === "luxury") return "Luxury · cost no object";
    const tier = labelOf(BUDGET_OPTIONS, answers.budgetTier);
    let amount: string | null = null;
    if (answers.budgetMode === "build") {
      const total = buildupTotal(answers);
      if (total > 0) amount = `≈ ${fmtMoney(total, answers.currency)}`;
    } else if (answers.budgetMin || answers.budgetMax) {
      amount = [answers.budgetMin, answers.budgetMax]
        .filter(Boolean)
        .map((v) => `${sym}${Number(v).toLocaleString()}`)
        .join("–");
    }
    return join(
      tier,
      amount,
      answers.budgetBasis === "per_person" ? "per person" : "whole trip",
      // flights are an explicit line item in build mode, so only flag for totals
      answers.budgetMode === "total" && (answers.inclFlights ? "flights in" : "flights extra")
    );
  })();

  const rows: Row[] = [
    { key: "where", icon: META.where.icon, label: "Where", value: answers.destination || null, href: "/" },
    { key: "when", icon: META.when.icon, label: "When", value: join(whenValue, !(answers.when === "dates") && labelOf(DURATION_OPTIONS, answers.duration)), href: "/when" },
    { key: "who", icon: META.who.icon, label: "Who", value: whoValue, href: "/who" },
    { key: "vibe", icon: META.vibe.icon, label: "Vibe", value: labelsOf(VIBE_OPTIONS, answers.vibe) || null, href: "/vibe" },
    { key: "food", icon: META.food.icon, label: "Food", value: join(labelsOf(FOOD_OPTIONS, answers.diet), labelsOf(MEAT_OPTIONS, answers.meats), answers.adventure && ADVENTURE_LABELS[answers.adventure]), href: "/food" },
    { key: "experiences", icon: META.experiences.icon, label: "Experiences", value: labelsOf(EXPERIENCE_OPTIONS, answers.experiences) || null, href: "/experiences" },
    { key: "nights", icon: META.nights.icon, label: "Evenings", value: nightsValue, href: "/nights" },
    {
      key: "stay",
      icon: META.stay.icon,
      label: "Stay",
      value: join(
        labelsOf(STAY_OPTIONS, answers.stayTypes),
        answers.accomNightly && `≈ ${sym}${Number(answers.accomNightly).toLocaleString()}/night`,
        answers.accomSplurge && "open to a splurge",
        labelOf(MIN_NIGHTS_OPTIONS, answers.minNights)
      ),
      href: "/stay",
    },
    { key: "budget", icon: META.budget.icon, label: "Budget", value: budgetValue, href: "/budget" },
  ];

  // progress is measured against the steps that actually apply
  const flow = applicableFlow(answers);
  const answered = rows.filter((r) => flow.includes(r.key) && r.value).length;
  const percent = Math.round((answered / flow.length) * 100);
  const complete = answered === flow.length;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <span className="text-xs font-medium text-ink-soft/70">
          {complete ? "Profile complete" : `${answered} of ${flow.length} answered`}
        </span>
      </header>

      <div className="mt-9">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
          Traveler profile
        </p>
        <h1 className="display mt-1 text-4xl font-semibold tracking-tight text-ink">
          How you travel
        </h1>
        <p className="mt-2 text-ink-soft">
          Here&apos;s the picture you&apos;ve painted. Edit anything, or let us design the trip.
        </p>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-tan/35">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full bg-coral/80"
        />
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-tan-line bg-card card-shadow">
        {rows.map((row, i) => {
          const Icon = row.icon;
          const filled = !!row.value;
          return (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35 }}
              className={`flex items-center gap-4 px-4 py-3.5 ${
                i !== 0 ? "border-t border-tan-line/60" : ""
              } ${filled ? "" : "opacity-70"}`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  filled ? "bg-teal/12 text-teal-deep" : "bg-tan/30 text-ink-soft/50"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/60">
                  {row.label}
                </p>
                <p className={`truncate font-semibold ${filled ? "text-ink" : "text-ink-soft/50"}`}>
                  {row.value ?? "Not set yet"}
                </p>
              </div>
              <Link
                href={row.href}
                className="rounded-full px-3 py-1 text-xs font-semibold text-ink-soft/70 transition-colors hover:text-coral"
              >
                {filled ? "Edit" : "Add"}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <Link
          href="/celebrate"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 py-4 text-lg font-semibold text-paper transition-colors hover:bg-coral-deep"
        >
          {answers.destination ? `Design my ${answers.destination} trip` : "Design my trip"}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  );
}
