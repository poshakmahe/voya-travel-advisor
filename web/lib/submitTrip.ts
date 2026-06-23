import type { Answers } from "@/lib/store";
import { travelerCount } from "@/lib/branching";
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
  MIN_NIGHTS_OPTIONS,
  estimateNights,
  labelOf,
  labelsOf,
} from "@/lib/trip";

/** Public Web3Forms access key — safe to ship in client code.
 *  Submissions land in the inbox that created the key on web3forms.com. */
const WEB3FORMS_KEY = "9cf7125f-168b-442f-9b41-5c30cf01cffb";
const ENDPOINT = "https://api.web3forms.com/submit";

/** Turn the captured profile into a human-readable list of the traveler's
 *  PREFERENCES. No generated itinerary — that's deferred until real AI
 *  trip generation is integrated. */
function buildSummary(a: Answers): string {
  const L: string[] = [];
  const sym = (code: string) =>
    ({ USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "AED ", JPY: "¥", AUD: "A$" })[code] ?? "$";

  L.push(`DESTINATION: ${a.destination || "—"}`);
  L.push(`TRIP LENGTH: ${estimateNights(a)} nights`);

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
  const pax = travelerCount(a);
  if (who) L.push(`PARTY: ${who} · ${pax} traveler${pax === 1 ? "" : "s"}`);
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

  // stay preference + nightly budget + pacing
  const stays = labelsOf(STAY_OPTIONS, a.stayTypes);
  if (stays) L.push(`STAY PREFERENCE: ${stays}`);
  if (a.accomNightly)
    L.push(`NIGHTLY BUDGET: ≈ ${sym(a.currency)}${Number(a.accomNightly).toLocaleString()}/night${a.accomSplurge ? " (open to a splurge)" : ""}`);
  const pacing = labelOf(MIN_NIGHTS_OPTIONS, a.minNights);
  if (pacing) L.push(`PACE: ${pacing}`);

  // budget
  const tier = labelOf(BUDGET_OPTIONS, a.budgetTier);
  if (tier) {
    const range = [a.budgetMin, a.budgetMax]
      .filter(Boolean)
      .map((v) => `${sym(a.currency)}${Number(v).toLocaleString()}`)
      .join("–");
    const basis = a.budgetBasis === "per_person" ? "per person" : "whole trip";
    L.push(`BUDGET: ${[tier, range || null, basis].filter(Boolean).join(" · ")}`);
  }

  return L.join("\n");
}

/** POST the traveler's preferences to Web3Forms, which emails them to the
 *  configured inbox. `travelerEmail` becomes the reply-to, so the recipient
 *  can reply straight to the traveler with their hand-built itinerary. */
export async function submitTrip(a: Answers, travelerEmail: string): Promise<void> {
  const summary = buildSummary(a);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `New Voya trip — ${a.destination || "trip"}, ${estimateNights(a)} nights`,
      from_name: "Voya",
      // Web3Forms uses `email` as the reply-to address on the email it sends you
      email: travelerEmail,
      replyto: travelerEmail,
      // headline fields (show up neatly at the top of the email)
      "Traveler email": travelerEmail,
      Destination: a.destination || "—",
      Nights: estimateNights(a),
      Party: labelOf(WHO_OPTIONS, a.who) ?? "—",
      // the readable body — preferences only
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
