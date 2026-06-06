"use client";

import { QuestionLayout } from "@/components/QuestionLayout";
import { ChoiceTile } from "@/components/ChoiceTile";
import { EXPERIENCE_OPTIONS } from "@/lib/trip";
import { useTrip } from "@/lib/store";

export default function Experiences() {
  const { answers, toggle } = useTrip();

  return (
    <QuestionLayout stepKey="experiences" hint="Optional — skip anytime">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXPERIENCE_OPTIONS.map((o, i) => (
          <ChoiceTile
            key={o.key}
            choice={o}
            index={i}
            selected={answers.experiences.includes(o.key)}
            onToggle={(k) => toggle("experiences", k)}
          />
        ))}
      </div>
    </QuestionLayout>
  );
}
