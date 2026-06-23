import type { Answers } from "@/lib/store";
import type { Plan } from "@/lib/plan";
import {
  WHO_OPTIONS,
  VIBE_OPTIONS,
  FOOD_OPTIONS,
  MEAT_OPTIONS,
  EXPERIENCE_OPTIONS,
  NIGHTS_OPTIONS,
  STAY_OPTIONS,
  NEEDS_OPTIONS,
  WHEN_OPTIONS,
  SEASON_OPTIONS,
  BUDGET_OPTIONS,
  labelOf,
  labelsOf,
  fmtMoney,
} from "@/lib/trip";

/** Public Web3Forms access key — safe to ship in client code.
 *  Submissions land in the inbox that created the key on web3forms.com. */
const WEB3FORMS_KEY = "9cf7125f-168b-442f-9b41-5c30cf01cffb";
const ENDPOINT = "https://api.web3forms.com/submit";

/** Turn the captured profile + built plan into a human-readable email body. */
function buildSummary(a: Answers, plan: Plan): string {
  const L: string[] = [];
  const cur = a.currency;

  L.push(`DESTINATION: ${a.destination || "—"}`);
  L.push(`TRIP LENGTH: ${plan.nights} nights`);

  // when
  const whenKind = labelOf(WHEN_OPTIONS, a.when);
  let whenDetail = "";
  if (a.when === "dates" && a.startDate)
    whenDetail = ` (${a.startDate}${a.endDate ? ` → ${a.endDate}` : ""})`;
  else if (a.when === "month" && a.monthValue) whenDetail = ` (${a.monthValue})`;
  else if (a.when === "season") whenDetail = ` (${labelOf(SEASON_OPTIONS, a.season) ?? ""})`;
  if (whenKind) L.push(`WHEN: ${whenKind}${whenDetail}`);

  // who + travelers
  const who = labelOf(WHO_OPTIONS, a.who);
  if (who) L.push(`PARTY: ${who} · ${plan.pax} traveler${plan.pax === 1 ? "" : "s"}`);
  const people = a.travelers
    .filter((t) => t.name.trim() || t.age.trim())
    .map((t) => `${t.name.trim() || "—"}${t.age.trim() ? ` (age ${t.age.trim()})` : ""}`)
    .join(", ");
  if (people) L.push(`TRAVELERS: ${people}`);

  const needs = labelsOf(NEEDS_OPTIONS, a.needs.filter((n) => n !== "none"));
  if (needs) L.push(`SPECIAL NEEDS: ${needs}`);

  // preferences
  const vibes = labelsOf(VIBE_OPTIONS, a.vibe);
  if (vibes) L.push(`VIBE: ${vibes}`);

  const diet = labelsOf(FOOD_OPTIONS, a.diet);
  if (diet) L.push(`DIET: ${diet}`);
  const meats = labelsOf(MEAT_OPTIONS, a.meats);
  if (meats) L.push(`EATS: ${meats}`);

  const exp = labelsOf(EXPERIENCE_OPTIONS, a.experiences);
  if (exp) L.push(`EXPERIENCES: ${exp}`);

  const evenings = labelsOf(NIGHTS_OPTIONS, a.nights);
  if (evenings) L.push(`EVENINGS: ${evenings}`);

  const stays = labelsOf(STAY_OPTIONS, a.stayTypes);
  if (stays) L.push(`STAY PREFERENCE: ${stays}`);

  const budget = labelOf(BUDGET_OPTIONS, a.budgetTier);
  if (budget) L.push(`BUDGET TIER: ${budget}`);

  // ---- the generated plan ----
  L.push("");
  L.push("──────── GENERATED PLAN ────────");
  L.push(`Stay: ${plan.stay.name} (${plan.stay.kind}) — ≈ ${fmtMoney(plan.stay.perNight, cur)}/night`);

  if (plan.food.length) {
    L.push("");
    L.push("Food picks:");
    plan.food.forEach((f) => L.push(`  • ${f.name} — ${f.note}`));
  }

  L.push("");
  L.push("Itinerary:");
  plan.days.forEach((d) => {
    L.push(`  Day ${d.n} — ${d.theme}`);
    d.slots.forEach((s) => L.push(`    ${s.time}: ${s.title}`));
  });
  if (plan.extraDays > 0) L.push(`  + ${plan.extraDays} more day(s) to fill out`);

  if (plan.budget) {
    L.push("");
    L.push(`Estimated total: ${fmtMoney(plan.budget.total, cur)} (${plan.budget.basisNote})`);
  } else {
    L.push("");
    L.push("Budget: luxury — tally intentionally omitted");
  }

  if (plan.notes.length) {
    L.push("");
    L.push("Adaptive notes:");
    plan.notes.forEach((n) => L.push(`  • ${n}`));
  }

  return L.join("\n");
}

/** POST the trip to Web3Forms, which emails it to the configured inbox.
 *  `travelerEmail` becomes the reply-to, so the recipient can reply
 *  straight to the traveler with their full itinerary. */
export async function submitTrip(a: Answers, plan: Plan, travelerEmail: string): Promise<void> {
  const summary = buildSummary(a, plan);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `New Voya trip — ${plan.city}, ${plan.nights} nights`,
      from_name: "Voya",
      // Web3Forms uses `email` as the reply-to address on the email it sends you
      email: travelerEmail,
      replyto: travelerEmail,
      // headline fields (show up neatly at the top of the email)
      "Traveler email": travelerEmail,
      Destination: a.destination || "—",
      Nights: plan.nights,
      Party: labelOf(WHO_OPTIONS, a.who) ?? "—",
      // the readable body
      message: summary,
      // full machine-readable profile, for consuming later
      profile_json: JSON.stringify(a),
    }),
  });

  const data = await res.json().catch(() => ({ success: false }));
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Submit failed (${res.status})`);
  }
}
