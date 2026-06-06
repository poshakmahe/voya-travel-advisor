"use client";

import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { NIGHTS_OPTIONS } from "@/lib/trip";
import { useTrip } from "@/lib/store";

export default function Nights() {
  const { answers, set } = useTrip();

  // "Quiet" is exclusive with the more lively options.
  const toggleNight = (key: string) => {
    if (key === "quiet") {
      set("nights", answers.nights.includes("quiet") ? [] : ["quiet"]);
      return;
    }
    const without = answers.nights.filter((n) => n !== "quiet");
    set("nights", without.includes(key) ? without.filter((n) => n !== key) : [...without, key]);
  };

  return (
    <QuestionLayout
      stepKey="nights"
      hint={answers.nights.length ? `${answers.nights.length} selected` : "Pick any that fit"}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NIGHTS_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.nights.includes(o.key)}
            onToggle={toggleNight}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}
