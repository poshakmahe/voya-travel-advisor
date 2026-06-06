"use client";

import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { VIBE_OPTIONS } from "@/lib/trip";
import { useTrip } from "@/lib/store";

export default function Vibe() {
  const { answers, toggle } = useTrip();
  const selected = answers.vibe;

  return (
    <QuestionLayout
      stepKey="vibe"
      hint={selected.length ? `${selected.length} selected` : "Pick at least one"}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {VIBE_OPTIONS.map((opt, i) => (
          <ChoiceTile
            key={opt.key}
            choice={opt}
            index={i}
            selected={selected.includes(opt.key)}
            onToggle={(k) => toggle("vibe", k)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}
