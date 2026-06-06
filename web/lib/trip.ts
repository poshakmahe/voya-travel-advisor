import {
  Compass,
  CalendarHeart,
  Users,
  Mountain,
  UtensilsCrossed,
  Sparkles,
  Moon,
  BedDouble,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/* ---------------- Flow definition ---------------- */

export type StepKey =
  | "where"
  | "when"
  | "who"
  | "vibe"
  | "food"
  | "experiences"
  | "nights"
  | "stay"
  | "budget";

export type StepMeta = {
  key: StepKey;
  label: string; // short label for the journey map
  icon: LucideIcon;
  eyebrow: string; // small kicker on the question screen
  title: string;
  subtitle: string;
};

/** Order of the questionnaire. Drives progress + prev/next navigation. */
export const FLOW: StepKey[] = [
  "where",
  "when",
  "who",
  "vibe",
  "food",
  "experiences",
  "nights",
  "stay",
  "budget",
];

export const META: Record<StepKey, StepMeta> = {
  where: {
    key: "where",
    label: "Where",
    icon: Compass,
    eyebrow: "Destination",
    title: "Where are we headed?",
    subtitle: "Start with the place. Everything else shapes around it.",
  },
  when: {
    key: "when",
    label: "When",
    icon: CalendarHeart,
    eyebrow: "Timing",
    title: "When would you go?",
    subtitle: "A date, a month, or just a season — whatever you know.",
  },
  who: {
    key: "who",
    label: "Who",
    icon: Users,
    eyebrow: "Travel party",
    title: "Who's coming along?",
    subtitle: "This shapes everything from room types to pace.",
  },
  vibe: {
    key: "vibe",
    label: "Vibe",
    icon: Mountain,
    eyebrow: "Trip personality",
    title: "What draws you in?",
    subtitle: "Choose the settings that pull at you — pick a few.",
  },
  food: {
    key: "food",
    label: "Food",
    icon: UtensilsCrossed,
    eyebrow: "Food & dining",
    title: "How do you like to eat?",
    subtitle: "We'll plan around any restrictions and your appetite for the new.",
  },
  experiences: {
    key: "experiences",
    label: "Experiences",
    icon: Sparkles,
    eyebrow: "Experiences",
    title: "What makes a trip memorable?",
    subtitle: "The moments you'd travel for. Optional — pick any that resonate.",
  },
  nights: {
    key: "nights",
    label: "Evenings",
    icon: Moon,
    eyebrow: "Evenings & nightlife",
    title: "How do your evenings go?",
    subtitle: "From an early dinner to a late night out.",
  },
  stay: {
    key: "stay",
    label: "Stay",
    icon: BedDouble,
    eyebrow: "Where you'll stay",
    title: "What kind of stay suits you?",
    subtitle: "A preference, not a rule — we'll suggest what fits best.",
  },
  budget: {
    key: "budget",
    label: "Budget",
    icon: Wallet,
    eyebrow: "Budget",
    title: "What's the budget?",
    subtitle: "A range is fine. It helps us pitch trips you'd actually book.",
  },
};

export type FlowPosition = {
  index: number;
  total: number;
  percent: number;
  prevPath: string | null;
  nextPath: string;
};

const pathFor = (key: StepKey) => (key === "where" ? "/" : `/${key}`);

/** Compute progress + navigation for a given step. */
export function getPosition(key: StepKey): FlowPosition {
  const index = FLOW.indexOf(key);
  const total = FLOW.length;
  const prev = index > 0 ? FLOW[index - 1] : null;
  const next = index < total - 1 ? FLOW[index + 1] : null;
  return {
    index,
    total,
    percent: Math.round(((index + 1) / total) * 100),
    prevPath: prev ? pathFor(prev) : null,
    nextPath: next ? pathFor(next) : "/summary",
  };
}

/* ---------------- Option sets ---------------- */

export type Choice = { key: string; label: string; emoji: string; hint?: string };

export const VIBE_OPTIONS: Choice[] = [
  { key: "beach", label: "Beach & coast", emoji: "🏖️", hint: "Sand, sea, slow days" },
  { key: "mountains", label: "Mountains", emoji: "⛰️", hint: "Peaks & fresh air" },
  { key: "city", label: "City & urban", emoji: "🏙️", hint: "Streets & skylines" },
  { key: "nature", label: "Nature walks", emoji: "🌲", hint: "Forests & trails" },
  { key: "food", label: "Food & markets", emoji: "🍴", hint: "Eat your way through" },
  { key: "culture", label: "Local culture", emoji: "🎭", hint: "People & traditions" },
  { key: "art", label: "Art & history", emoji: "🏛️", hint: "Museums & ruins" },
  { key: "wellness", label: "Wellness", emoji: "🧖", hint: "Spa & reset" },
  { key: "adventure", label: "Adventure", emoji: "🪂", hint: "Heart-rate stuff" },
];

export const WHEN_OPTIONS: Choice[] = [
  { key: "dates", label: "Specific dates", emoji: "📅", hint: "I know the days" },
  { key: "month", label: "A month", emoji: "🗓️", hint: "Roughly when" },
  { key: "season", label: "A season", emoji: "🍂", hint: "Spring, summer…" },
  { key: "flexible", label: "Flexible", emoji: "✨", hint: "Surprise me" },
];

export const DURATION_OPTIONS: Choice[] = [
  { key: "weekend", label: "Weekend", emoji: "⚡", hint: "2–3 nights" },
  { key: "short", label: "Short break", emoji: "☕", hint: "4–6 nights" },
  { key: "week", label: "A week", emoji: "🌤️", hint: "7–9 nights" },
  { key: "long", label: "Two weeks +", emoji: "🧳", hint: "10+ nights" },
];

export const WHO_OPTIONS: Choice[] = [
  { key: "solo", label: "Solo", emoji: "🧍", hint: "Just me" },
  { key: "couple", label: "Couple", emoji: "💞", hint: "Two of us" },
  { key: "family", label: "Family with kids", emoji: "👨‍👩‍👧", hint: "Little ones along" },
  { key: "friends", label: "Friends", emoji: "🎉", hint: "The crew" },
];

export const FOOD_OPTIONS: Choice[] = [
  { key: "none", label: "No restrictions", emoji: "🍽️", hint: "I eat it all" },
  { key: "vegetarian", label: "Vegetarian", emoji: "🥗", hint: "No meat" },
  { key: "vegan", label: "Vegan", emoji: "🌱", hint: "Plant-based" },
  { key: "pescatarian", label: "Pescatarian", emoji: "🐟", hint: "Fish, no meat" },
  { key: "halal", label: "Halal", emoji: "🕌", hint: "Halal only" },
  { key: "glutenfree", label: "Gluten-free", emoji: "🌾", hint: "No gluten" },
];

export const EXPERIENCE_OPTIONS: Choice[] = [
  { key: "theater", label: "Theater & live arts", emoji: "🎭" },
  { key: "music", label: "Music & concerts", emoji: "🎶" },
  { key: "cooking", label: "Cooking & workshops", emoji: "👩‍🍳" },
  { key: "tours", label: "Guided local tours", emoji: "🧭" },
  { key: "offbeat", label: "Off-beat & unique", emoji: "🗝️" },
  { key: "adventure", label: "Adventure activities", emoji: "🤿" },
];

export const NIGHTS_OPTIONS: Choice[] = [
  { key: "quiet", label: "Quiet", emoji: "🌙", hint: "Dinner, then rest" },
  { key: "relaxed", label: "Relaxed drinks", emoji: "🍷", hint: "Lounges & wine" },
  { key: "lively", label: "Lively bars", emoji: "🍸", hint: "Out and about" },
  { key: "late", label: "Late nights", emoji: "🪩", hint: "Clubs till late" },
];

export const STAY_OPTIONS: Choice[] = [
  { key: "hotel", label: "Hotel", emoji: "🏨", hint: "Classic & easy" },
  { key: "boutique", label: "Boutique", emoji: "🛎️", hint: "Small & characterful" },
  { key: "resort", label: "Resort", emoji: "🌴", hint: "All in one place" },
  { key: "apartment", label: "Apartment", emoji: "🏠", hint: "Space & a kitchen" },
  { key: "bnb", label: "B&B / guesthouse", emoji: "🥐", hint: "Homely & local" },
  { key: "villa", label: "Villa", emoji: "🏡", hint: "Private, for groups" },
];

export const MIN_NIGHTS_OPTIONS: Choice[] = [
  { key: "1", label: "Move freely", emoji: "🚆", hint: "A night here, a night there" },
  { key: "2", label: "At least 2", emoji: "📍", hint: "Settle a little" },
  { key: "3", label: "At least 3", emoji: "🧺", hint: "Unpack properly" },
  { key: "base", label: "One base", emoji: "🏠", hint: "Stay put all trip" },
];

export const BUDGET_OPTIONS: Choice[] = [
  { key: "budget", label: "Budget", emoji: "🪙", hint: "Smart & simple" },
  { key: "mid", label: "Mid-range", emoji: "💶", hint: "Comfortable" },
  { key: "premium", label: "Premium", emoji: "💎", hint: "Treat ourselves" },
  { key: "luxury", label: "Luxury", emoji: "👑", hint: "The very best" },
];

export const MEAT_OPTIONS: Choice[] = [
  { key: "beef", label: "Beef", emoji: "🥩" },
  { key: "poultry", label: "Chicken & poultry", emoji: "🍗" },
  { key: "pork", label: "Pork", emoji: "🥓" },
  { key: "lamb", label: "Lamb", emoji: "🍖" },
  { key: "seafood", label: "Seafood", emoji: "🦐" },
  { key: "game", label: "Game", emoji: "🦌" },
];

export const NEEDS_OPTIONS: Choice[] = [
  { key: "mobility", label: "Step-free / accessible", emoji: "♿", hint: "Mind the stairs & hills" },
  { key: "stroller", label: "Stroller-friendly", emoji: "🍼", hint: "Easy with little ones" },
  { key: "pet", label: "Travelling with a pet", emoji: "🐾", hint: "Pet comes too" },
  { key: "none", label: "Nothing special", emoji: "👍", hint: "All good" },
];

export const SEASON_OPTIONS: Choice[] = [
  { key: "spring", label: "Spring", emoji: "🌸" },
  { key: "summer", label: "Summer", emoji: "☀️" },
  { key: "autumn", label: "Autumn", emoji: "🍂" },
  { key: "winter", label: "Winter", emoji: "❄️" },
];

export const ADVENTURE_LABELS: Record<string, string> = {
  low: "sticks to familiar food",
  mid: "somewhat open",
  high: "loves anything local",
};

/* ---------------- Currency ---------------- */

export type Currency = { code: string; symbol: string };

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "AED", symbol: "د.إ" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
];

export const symbolFor = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";

export const fmtMoney = (amount: number, code: string) =>
  `${symbolFor(code)}${Math.round(amount).toLocaleString()}`;

/* ---------------- Party sizing ---------------- */

/** Default + minimum number of traveler rows for a party type. */
export const partySizing: Record<string, { seed: number; min: number; fixed: boolean }> = {
  solo: { seed: 1, min: 1, fixed: true },
  couple: { seed: 2, min: 2, fixed: true },
  family: { seed: 3, min: 1, fixed: false },
  friends: { seed: 2, min: 1, fixed: false },
};

/* ---------------- Budget estimation ---------------- */

const DURATION_NIGHTS: Record<string, number> = {
  weekend: 3,
  short: 5,
  week: 8,
  long: 12,
};

/** Best-effort nights count from explicit dates, else the duration band. */
export function estimateNights(a: {
  startDate?: string;
  endDate?: string;
  duration?: string;
}): number {
  if (a.startDate && a.endDate) {
    const start = new Date(a.startDate).getTime();
    const end = new Date(a.endDate).getTime();
    const nights = Math.round((end - start) / 86_400_000);
    if (nights > 0) return nights;
  }
  return a.duration ? DURATION_NIGHTS[a.duration] ?? 7 : 7;
}

/** Sum a built-up budget: flights + nights*hotel + days*(exp+food+extras). */
export function buildupTotal(a: {
  costFlights?: string;
  costHotel?: string;
  costExp?: string;
  costFood?: string;
  costExtras?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
}): number {
  const n = (v?: string) => (v ? Number(v) || 0 : 0);
  const nights = estimateNights(a);
  const days = nights + 1;
  return (
    n(a.costFlights) +
    nights * n(a.costHotel) +
    days * (n(a.costExp) + n(a.costFood) + n(a.costExtras))
  );
}

/* ---------------- Label helpers ---------------- */

export const labelOf = (options: Choice[], key?: string) =>
  options.find((o) => o.key === key)?.label;

export const labelsOf = (options: Choice[], keys: string[]) =>
  keys.map((k) => labelOf(options, k)).filter(Boolean).join(" · ");
