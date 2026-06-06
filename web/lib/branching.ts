import { FLOW, type StepKey } from "@/lib/trip";
import type { Answers } from "@/lib/store";

/* ============================================================
   Adaptive branching — one place that decides how the
   questionnaire bends to earlier answers. Screens import these
   predicates so the logic stays consistent and testable.
   ============================================================ */

export function travelerCount(a: Answers): number {
  const named = a.travelers.filter((t) => t.name.trim() || t.age.trim()).length;
  if (named) return named;
  const byType: Record<string, number> = { solo: 1, couple: 2, family: 4, friends: 4 };
  return a.who ? byType[a.who] ?? 2 : 2;
}

/** Family travelling with at least one child under 13. */
export const hasYoungKids = (a: Answers) =>
  a.who === "family" &&
  a.travelers.some((t) => t.age.trim() !== "" && Number(t.age) < 13);

/** A group big enough that hopping between stays gets painful. */
export const isFamilyOrGroup = (a: Answers) =>
  a.who === "family" || a.who === "friends" || travelerCount(a) >= 5;

/** Accessibility matters for this trip. */
export const needsAccessible = (a: Answers) => a.needs.includes("mobility");

/** Whether to ask about meats (skipped for vegetarian / vegan). */
export const eatsMeat = (a: Answers) =>
  !a.diet.includes("vegetarian") && !a.diet.includes("vegan");

/* ---------------- Dynamic flow ---------------- */

/**
 * The set of steps that actually apply, given the answers.
 * Currently: families with young kids skip the standalone
 * "Evenings/nightlife" step — we default it to easy family
 * evenings and they can still add it from the journey view.
 */
export function applicableFlow(a: Answers): StepKey[] {
  return FLOW.filter((key) => {
    if (key === "nights" && hasYoungKids(a)) return false;
    return true;
  });
}

export type FlowPosition = {
  index: number;
  total: number;
  percent: number;
  prevPath: string | null;
  nextPath: string;
  skipped: boolean;
};

const pathFor = (key: StepKey) => (key === "where" ? "/" : `/${key}`);

/** Progress + prev/next for a step, aware of which steps are skipped. */
export function position(key: StepKey, a: Answers): FlowPosition {
  const flow = applicableFlow(a);
  const total = flow.length;
  const index = flow.indexOf(key);

  // Step is currently skipped but visited directly — navigate via the
  // static order so the page still works, and don't claim a progress slot.
  if (index === -1) {
    const staticIdx = FLOW.indexOf(key);
    const prev = FLOW.slice(0, staticIdx).reverse().find((k) => flow.includes(k)) ?? null;
    const next = FLOW.slice(staticIdx + 1).find((k) => flow.includes(k)) ?? null;
    return {
      index: staticIdx,
      total,
      percent: Math.round((staticIdx / FLOW.length) * 100),
      prevPath: prev ? pathFor(prev) : null,
      nextPath: next ? pathFor(next) : "/summary",
      skipped: true,
    };
  }

  const prev = index > 0 ? flow[index - 1] : null;
  const next = index < total - 1 ? flow[index + 1] : null;
  return {
    index,
    total,
    percent: Math.round(((index + 1) / total) * 100),
    prevPath: prev ? pathFor(prev) : null,
    nextPath: next ? pathFor(next) : "/summary",
    skipped: false,
  };
}
