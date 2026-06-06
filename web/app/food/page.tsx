"use client";

import { motion, AnimatePresence } from "motion/react";
import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { FOOD_OPTIONS, MEAT_OPTIONS } from "@/lib/trip";
import { useTrip } from "@/lib/store";

const ADVENTURE = [
  { key: "low", label: "Stick to familiar" },
  { key: "mid", label: "Somewhat open" },
  { key: "high", label: "Anything local" },
];

export default function Food() {
  const { answers, set, toggle } = useTrip();

  // "No restrictions" is exclusive with the rest.
  const toggleDiet = (key: string) => {
    if (key === "none") {
      set("diet", answers.diet.includes("none") ? [] : ["none"]);
      return;
    }
    const without = answers.diet.filter((d) => d !== "none");
    set("diet", without.includes(key) ? without.filter((d) => d !== key) : [...without, key]);
  };

  // Per spec branching: skip meats for vegetarian / vegan.
  const eatsMeat =
    !answers.diet.includes("vegetarian") && !answers.diet.includes("vegan");

  return (
    <QuestionLayout stepKey="food">
      <p className="mb-2 text-sm font-semibold text-ink-soft">Any dietary needs?</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FOOD_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.diet.includes(o.key)}
            onToggle={toggleDiet}
          />
        ))}
      </div>

      <AnimatePresence>
        {eatsMeat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mb-2 mt-7 text-sm font-semibold text-ink-soft">
              Favourite meats?{" "}
              <span className="font-normal text-ink-soft/60">
                — so we can point you to the best spots for them
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MEAT_OPTIONS.map((o, i) => (
                <ChoiceTile
                  key={o.key}
                  choice={o}
                  index={i}
                  selected={answers.meats.includes(o.key)}
                  onToggle={(k) => toggle("meats", k)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mb-3 mt-7 text-sm font-semibold text-ink-soft">How adventurous?</p>
      <div className="flex flex-wrap gap-2">
        {ADVENTURE.map((a) => (
          <button
            key={a.key}
            onClick={() => set("adventure", a.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              answers.adventure === a.key
                ? "border-coral bg-coral text-paper"
                : "border-tan-line bg-card/60 text-ink hover:border-coral/40"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </QuestionLayout>
  );
}
