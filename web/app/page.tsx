"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Search, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useTrip } from "@/lib/store";

const SUGGESTIONS = [
  { city: "Lisbon", flag: "🇵🇹" },
  { city: "Kyoto", flag: "🇯🇵" },
  { city: "Bali", flag: "🇮🇩" },
  { city: "Marrakech", flag: "🇲🇦" },
  { city: "Mexico City", flag: "🇲🇽" },
];

export default function Welcome() {
  const { answers, set } = useTrip();
  const value = answers.destination;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-tan-line bg-card/70 px-3 py-1 text-xs font-medium text-ink-soft">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          A trip designed around you
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          {/* left: the ask */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal-deep"
            >
              <MapPin className="h-4 w-4" /> Let&apos;s start with the where
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-6xl"
            >
              Where are
              <br />
              we <span className="text-coral italic">headed?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft"
            >
              Tell us the destination and we&apos;ll turn a few playful questions
              into a trip that feels unmistakably <em>yours</em>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 rounded-2xl border-2 border-tan-line bg-card p-2 pl-4 tile-shadow focus-within:border-coral">
                <Search className="h-5 w-5 shrink-0 text-ink-soft" />
                <input
                  value={value}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="Try “Lisbon” or “a Greek island”…"
                  className="w-full bg-transparent py-2 text-lg text-ink outline-none placeholder:text-ink-soft/50"
                />
                <Link
                  href="/when"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-coral px-4 py-2.5 font-semibold text-paper transition-colors hover:bg-coral-deep"
                >
                  Begin
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-soft/70">Popular:</span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.city}
                    onClick={() => set("destination", s.city)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-tan-line bg-card/60 px-3 py-1 text-sm text-ink transition-colors hover:border-coral hover:text-coral"
                  >
                    <span>{s.flag}</span>
                    {s.city}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* right: passport visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.15, type: "spring", stiffness: 120 }}
            className="relative mx-auto w-full max-w-xs"
          >
            <div className="rounded-3xl border-2 border-tan-line bg-teal-deep p-6 text-paper card-shadow">
              <div className="flex items-center justify-between text-paper/70">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                  Passport
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Voya
                </span>
              </div>
              <div className="my-8 text-center">
                <div className="text-6xl">🌍</div>
                <p className="display mt-3 text-2xl">Your next chapter</p>
                <p className="mt-1 text-sm text-paper/60">9 stops to a perfect trip</p>
              </div>
              <div className="flex items-center justify-between border-t border-paper/15 pt-4">
                {["🏖️", "⛰️", "🍷", "🎭"].map((e, i) => (
                  <span
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-paper/30 text-lg"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute -right-3 -top-3 grid h-14 w-14 -rotate-12 place-items-center rounded-full border-2 border-coral bg-paper text-center text-[9px] font-bold uppercase leading-tight text-coral">
              Let&apos;s
              <br />
              go
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="text-center text-sm text-ink-soft/60">
        Takes 2 minutes · go deeper anytime for sharper matches
      </footer>
    </main>
  );
}
