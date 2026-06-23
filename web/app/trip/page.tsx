"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sunrise,
  Sun,
  Moon,
  BedDouble,
  UtensilsCrossed,
  Wallet,
  Sparkles,
  CalendarHeart,
  Users,
  MapPin,
  ArrowRight,
  Check,
  Loader2,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { useTrip } from "@/lib/store";
import { buildPlan } from "@/lib/plan";
import { submitTrip } from "@/lib/submitTrip";
import { fmtMoney, labelsOf, VIBE_OPTIONS } from "@/lib/trip";

const TIME_ICON: Record<string, LucideIcon> = {
  Morning: Sunrise,
  Afternoon: Sun,
  Evening: Moon,
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-coral" strokeWidth={2.3} />
        <h2 className="display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type SaveState = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Trip() {
  const { answers } = useTrip();
  const plan = buildPlan(answers);
  const vibes = labelsOf(VIBE_OPTIONS, answers.vibe);
  const firstName = answers.travelers.find((t) => t.name.trim())?.name.trim().split(" ")[0];

  const [email, setEmail] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const emailValid = EMAIL_RE.test(email.trim());

  async function handleSave() {
    if (!emailValid || state === "sending") return;
    setState("sending");
    setError(null);
    try {
      await submitTrip(answers, plan, email.trim());
      setState("sent");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <Link
          href="/summary"
          className="inline-flex items-center gap-1.5 rounded-full border border-tan-line bg-card/70 px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:text-coral"
        >
          <Pencil className="h-3.5 w-3.5" /> Tweak profile
        </Link>
      </header>

      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 overflow-hidden rounded-3xl border border-tan-line bg-teal-deep p-7 text-paper card-shadow"
      >
        <p className="flex items-center gap-1.5 text-sm text-paper/70">
          <MapPin className="h-4 w-4" />
          {firstName ? `Designed for ${firstName} & co.` : "Designed for you"}
        </p>
        <h1 className="display mt-2 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Your {plan.nights}-night
          <br />
          {plan.city} trip
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-sm">
            <CalendarHeart className="h-4 w-4" /> {plan.nights} nights
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-sm">
            <Users className="h-4 w-4" /> {plan.pax} {plan.pax === 1 ? "traveler" : "travelers"}
          </span>
          {vibes && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4" /> {vibes}
            </span>
          )}
        </div>
      </motion.div>

      {/* adaptive callouts — only appear when an answer triggered them */}
      {plan.notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {plan.notes.map((note, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + 0.05 * i }}
              className="flex items-start gap-2 rounded-xl border border-teal/30 bg-teal/8 px-3 py-2 text-sm text-teal-deep"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              {note}
            </motion.p>
          ))}
        </div>
      )}

      {/* itinerary */}
      <Section icon={CalendarHeart} title="Your day-by-day">
        <div className="space-y-3">
          {plan.days.map((day, i) => (
            <motion.div
              key={day.n}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className="rounded-2xl border border-tan-line bg-card/70 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-coral text-sm font-bold text-paper">
                  {day.n}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft/60">
                  Day {day.n}
                </span>
              </div>
              <div className="space-y-2.5">
                {day.slots.map((slot) => {
                  const Icon = TIME_ICON[slot.time];
                  return (
                    <div key={slot.time} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-tan/25 text-ink-soft">
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft/50">
                          {slot.time}
                        </p>
                        <p className="font-medium text-ink">{slot.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
          {plan.extraDays > 0 && (
            <p className="px-1 text-sm text-ink-soft/70">
              + {plan.extraDays} more {plan.extraDays === 1 ? "day" : "days"} we&apos;ll fill out
              once you&apos;re happy with the shape of this.
            </p>
          )}
        </div>
      </Section>

      {/* stay */}
      <Section icon={BedDouble} title="Where you'll stay">
        <div className="rounded-2xl border border-tan-line bg-card/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{plan.stay.name}</p>
              <p className="text-sm text-ink-soft/70">{plan.stay.kind}</p>
            </div>
            <span className="shrink-0 rounded-full bg-teal/12 px-3 py-1 text-sm font-semibold text-teal-deep">
              ≈ {fmtMoney(plan.stay.perNight, answers.currency)}/night
            </span>
          </div>
          {plan.stay.note && (
            <p className="mt-3 rounded-xl bg-paper-2/50 p-3 text-sm text-ink-soft">
              💡 {plan.stay.note}
            </p>
          )}
        </div>
      </Section>

      {/* food */}
      {plan.food.length > 0 && (
        <Section icon={UtensilsCrossed} title="Food you'll love">
          <div className="space-y-2">
            {plan.food.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 rounded-2xl border border-tan-line bg-card/70 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-coral/12 text-coral">
                  <UtensilsCrossed className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{f.name}</p>
                  <p className="text-sm text-ink-soft/70">{f.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* budget — hidden entirely for luxury */}
      {plan.budget ? (
        <Section icon={Wallet} title="What it adds up to">
          <div className="rounded-2xl border border-tan-line bg-card/70 p-5">
            <div className="space-y-2.5">
              {plan.budget.lines.map((line) => (
                <div key={line.label} className="flex items-center justify-between text-ink-soft">
                  <span>{line.label}</span>
                  <span className="tabular-nums text-ink">
                    {fmtMoney(line.amount, answers.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-tan-line/70 pt-4">
              <span className="font-semibold text-ink">Estimated total</span>
              <span className="display text-2xl font-semibold text-ink">
                {fmtMoney(plan.budget.total, answers.currency)}
              </span>
            </div>
            <p className="mt-1 text-right text-xs text-ink-soft/60">{plan.budget.basisNote}</p>
            {plan.budget.verdict && (
              <p className="mt-3 rounded-xl bg-teal/10 p-3 text-sm font-medium text-teal-deep">
                {plan.budget.verdict}
              </p>
            )}
          </div>
        </Section>
      ) : (
        <Section icon={Sparkles} title="Crafted without compromise">
          <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <p className="text-ink-soft">
              You&apos;re travelling for the experience, not the price tag — so we&apos;ve focused on
              the very best, and left the budget tally out of it.
            </p>
          </div>
        </Section>
      )}

      {state === "sent" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex items-start gap-3 rounded-2xl border border-teal/40 bg-teal/10 p-5"
        >
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-paper">
            <Check className="h-5 w-5" strokeWidth={2.6} />
          </span>
          <div>
            <p className="font-semibold text-teal-deep">Sent — your trip is on its way to us.</p>
            <p className="mt-1 text-sm text-ink-soft">
              We&apos;ve got your preferences. We&apos;ll be in touch at{" "}
              <span className="font-medium text-ink">{email.trim()}</span> with a full,
              hand-built itinerary. Keep an eye on your inbox.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="mt-10 rounded-2xl border border-tan-line bg-card/70 p-5">
          <label htmlFor="trip-email" className="block font-semibold text-ink">
            Want the full, hand-built version?
          </label>
          <p className="mt-1 text-sm text-ink-soft/80">
            Drop your email and we&apos;ll send a detailed, finished itinerary tailored to
            everything you picked.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              id="trip-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 rounded-xl border border-tan-line bg-paper px-4 py-3.5 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-coral"
            />
            <button
              onClick={handleSave}
              disabled={!emailValid || state === "sending"}
              className="group flex items-center justify-center gap-2 rounded-xl bg-coral px-6 py-3.5 font-semibold text-paper transition-colors hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "sending" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Send me my trip
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
          {state === "error" && (
            <p className="mt-3 text-sm font-medium text-coral-deep">{error}</p>
          )}
          <div className="mt-4 border-t border-tan-line/70 pt-4">
            <Link
              href="/summary"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-coral"
            >
              <Pencil className="h-4 w-4" /> Adjust my answers first
            </Link>
          </div>
        </div>
      )}
      <p className="mt-3 pb-2 text-center text-sm text-ink-soft/50">
        A starting point — every piece is yours to tweak.
      </p>
    </main>
  );
}
