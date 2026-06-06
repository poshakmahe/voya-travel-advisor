import type { Answers } from "@/lib/store";
import { estimateNights, buildupTotal } from "@/lib/trip";
import { travelerCount, needsAccessible, hasYoungKids } from "@/lib/branching";

/* ============================================================
   A lightweight, deterministic "trip designer".
   Not a real recommendation engine — it turns the captured
   profile into a plausible, tailored sample plan. Known cities
   get signature highlights; anywhere else uses generic templates
   with the destination name woven in.
   ============================================================ */

export type Slot = { time: "Morning" | "Afternoon" | "Evening"; title: string; tag?: string };
export type Day = { n: number; theme: string; slots: Slot[] };
export type Stay = { name: string; kind: string; note?: string; perNight: number };
export type FoodPick = { name: string; note: string };
export type BudgetLine = { label: string; amount: number };
export type Budget = {
  lines: BudgetLine[];
  total: number;
  basisNote: string;
  verdict?: string;
} | null;

export type Plan = {
  city: string;
  nights: number;
  days: Day[];
  extraDays: number;
  stay: Stay;
  food: FoodPick[];
  budget: Budget;
  pax: number;
  notes: string[]; // adaptive callouts (accessibility, kids, …)
};

type Signature = {
  neighborhood: string;
  mornings: string[];
  afternoons: string[];
  dayTrip?: string;
  seafood?: string;
  beef?: string;
  veg?: string;
  bistro?: string;
  wineBar?: string;
};

const SIGNATURES: Record<string, Signature> = {
  lisbon: {
    neighborhood: "Príncipe Real",
    mornings: ["Wander the Alfama lanes", "Ride Tram 28 through the old town", "Belém & the Jerónimos Monastery"],
    afternoons: ["Time Out Market food crawl", "Sunset at Miradouro de Santa Catarina", "LX Factory's shops & street art"],
    dayTrip: "Day trip to Sintra's palaces & forest",
    seafood: "Cervejaria Ramiro — legendary seafood",
    beef: "A bairro churrasqueira for flame-grilled meats",
    veg: "Ao 26 — a beloved vegetable kitchen",
    bistro: "A tucked-away tasca for petiscos",
    wineBar: "By the Wine for a glass of Douro red",
  },
  kyoto: {
    neighborhood: "Higashiyama",
    mornings: ["Fushimi Inari's torii gates at dawn", "Arashiyama bamboo grove", "Kinkaku-ji, the golden pavilion"],
    afternoons: ["Tea & sweets in Gion", "Nishiki Market tasting walk", "Philosopher's Path stroll"],
    dayTrip: "Day trip to Nara's temples & deer park",
    seafood: "An intimate sushi counter in Pontocho",
    beef: "A wagyu teppanyaki dinner",
    veg: "Shojin-ryori temple cuisine",
    bistro: "A cozy izakaya crawl",
    wineBar: "A sake tasting flight in Gion",
  },
  bali: {
    neighborhood: "Ubud",
    mornings: ["Tegalalang rice terraces at sunrise", "A beach morning in Seminyak", "Temple visit at Uluwatu"],
    afternoons: ["Waterfall & jungle swim", "Balinese cooking class", "Spa & flower-bath afternoon"],
    dayTrip: "Day trip to Nusa Penida's cliffs",
    seafood: "Jimbaran Bay grilled seafood on the sand",
    beef: "A smoky satay & grill house",
    veg: "A raw & plant-based café in Ubud",
    bistro: "A warung for nasi campur",
    wineBar: "Sunset cocktails at a cliff bar",
  },
  marrakech: {
    neighborhood: "the Medina",
    mornings: ["Lose yourself in the souks", "Bahia Palace & Saadian Tombs", "Jardin Majorelle"],
    afternoons: ["Hammam & spa ritual", "Rooftop mint tea over the Medina", "A tagine cooking class"],
    dayTrip: "Day trip to the Atlas Mountains & a Berber village",
    seafood: "A coastal-style fish house",
    beef: "Mechoui slow-roasted lamb & grills",
    veg: "A garden café with vegetable mezze",
    bistro: "Dinner on a lantern-lit riad rooftop",
    wineBar: "A speakeasy-style rooftop bar",
  },
  "mexico city": {
    neighborhood: "Roma Norte",
    mornings: ["Centro Histórico & the Zócalo", "Frida Kahlo's Casa Azul", "Chapultepec park & castle"],
    afternoons: ["Coyoacán market tasting", "Xochimilco trajinera boats", "Mezcal & street-taco tour"],
    dayTrip: "Day trip to the Teotihuacán pyramids",
    seafood: "Contramar — the city's seafood institution",
    beef: "A classic taquería for al pastor & carne asada",
    veg: "A modern plant-forward kitchen in Roma",
    bistro: "A buzzy Roma Norte bistro",
    wineBar: "A mezcalería with small plates",
  },
};

const genericMornings = (city: string) => [
  `Explore ${city}'s historic center on foot`,
  `${city}'s landmark sights & main square`,
  `A scenic viewpoint over ${city}`,
];
const genericAfternoons = (city: string) => [
  `A local food-market crawl`,
  `${city}'s best museum & galleries`,
  `Browse the boutiques & backstreets`,
];

function sig(city: string): Signature {
  const key = city.trim().toLowerCase();
  if (SIGNATURES[key]) return SIGNATURES[key];
  return {
    neighborhood: "a central neighborhood",
    mornings: genericMornings(city || "town"),
    afternoons: genericAfternoons(city || "town"),
    dayTrip: `A day trip to the countryside near ${city || "town"}`,
  };
}

function eveningFor(answers: Answers, s: Signature, city: string): string {
  if (hasYoungKids(answers)) return `An early, easy family dinner`;
  const n = answers.nights;
  if (n.includes("late")) return `A late night out in ${city}`;
  if (n.includes("lively")) return `Drinks in ${city}'s liveliest quarter`;
  if (n.includes("relaxed")) return s.wineBar ?? `Wine & small plates at a local bar`;
  return `A quiet dinner near your stay`;
}

function foodPicks(answers: Answers, s: Signature): FoodPick[] {
  const picks: FoodPick[] = [];
  const diet = answers.diet;
  if (diet.includes("vegan") || diet.includes("vegetarian")) {
    if (s.veg) picks.push({ name: s.veg, note: "plant-based, matched to your diet" });
  } else {
    if (answers.meats.includes("seafood") || diet.includes("pescatarian")) {
      if (s.seafood) picks.push({ name: s.seafood, note: "for the seafood lover in you" });
    }
    if (answers.meats.includes("beef") && s.beef) {
      picks.push({ name: s.beef, note: "because you love a good cut" });
    }
  }
  if (s.bistro) picks.push({ name: s.bistro, note: "a local favourite for an easy night" });
  return picks.slice(0, 3);
}

function recommendStay(answers: Answers, s: Signature): Stay {
  const picked = answers.stayTypes[0];
  const pax = travelerCount(answers);
  const perNight = Number(answers.accomNightly) || Number(answers.costHotel) || tierDefaults(answers).stay;

  // soft preference: big group / family → suggest more space even if a hotel was picked
  if ((answers.who === "family" || pax >= 4) && (picked === "hotel" || picked === "boutique" || !picked)) {
    const note = `You leaned ${picked ?? "hotel"}, but with ${pax} of you we'd suggest an apartment — more room and a kitchen, for less per head.`;
    return {
      name: `A 2-bedroom apartment in ${s.neighborhood}`,
      kind: "Apartment",
      note: needsAccessible(answers)
        ? `${note} Step-free access prioritised.`
        : note,
      perNight,
    };
  }
  const kindLabel: Record<string, string> = {
    hotel: "Hotel",
    boutique: "Boutique hotel",
    resort: "Resort",
    apartment: "Apartment",
    bnb: "B&B",
    villa: "Villa",
  };
  const kind = kindLabel[picked] ?? "Boutique hotel";
  const notes: string[] = [];
  if (answers.accomSplurge)
    notes.push("With a night or two set aside for a special splurge stay, as you wanted.");
  if (needsAccessible(answers))
    notes.push("Step-free access and a lift, prioritised throughout.");
  return {
    name: `A ${kind.toLowerCase()} in ${s.neighborhood}`,
    kind,
    note: notes.join(" ") || undefined,
    perNight,
  };
}

function tierDefaults(answers: Answers) {
  const t = answers.budgetTier;
  const table: Record<string, { flight: number; stay: number; food: number; exp: number; extra: number }> = {
    budget: { flight: 300, stay: 80, food: 35, exp: 25, extra: 15 },
    mid: { flight: 650, stay: 150, food: 60, exp: 45, extra: 25 },
    premium: { flight: 1200, stay: 320, food: 110, exp: 90, extra: 50 },
  };
  return table[t ?? "mid"] ?? table.mid;
}

function buildBudget(answers: Answers, nights: number): Budget {
  if (answers.budgetTier === "luxury") return null; // cost isn't the point

  const pax = travelerCount(answers);
  const days = nights + 1;
  const d = tierDefaults(answers);
  const n = (v?: string) => (v ? Number(v) || 0 : 0);

  const flights = n(answers.costFlights) || d.flight * pax;
  const stayNightly = n(answers.accomNightly) || n(answers.costHotel) || d.stay;
  const stay = nights * stayNightly;
  const food = days * (n(answers.costFood) || d.food) * pax;
  const experiences = days * (n(answers.costExp) || d.exp) * pax;
  const extras = days * (n(answers.costExtras) || d.extra) * pax;

  const lines: BudgetLine[] = [
    { label: "Flights", amount: flights },
    { label: `Stay · ${nights} nights`, amount: stay },
    { label: "Food & drink", amount: food },
    { label: "Experiences", amount: experiences },
    { label: "Getting around & extras", amount: extras },
  ];
  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  // compare against what they told us
  let stated = 0;
  if (answers.budgetMode === "build") stated = buildupTotal(answers);
  else stated = n(answers.budgetMax) || n(answers.budgetMin);
  if (stated && answers.budgetBasis === "per_person") stated *= pax;

  let verdict: string | undefined;
  if (stated) {
    const diff = total - stated;
    if (diff <= 0) verdict = "Comfortably within the budget you set.";
    else if (diff / stated < 0.12) verdict = "Right around the budget you set.";
    else verdict = "A touch above your range — we can trim where you'd like.";
  }

  return {
    lines,
    total,
    basisNote: `Estimated for ${pax} ${pax === 1 ? "traveler" : "travelers"}, ${nights} nights`,
    verdict,
  };
}

export function buildPlan(answers: Answers): Plan {
  const city = answers.destination || "your destination";
  const s = sig(city);
  const nights = estimateNights(answers);
  const pax = travelerCount(answers);

  // themes the traveler cares about, in priority of their selections
  const interests = answers.vibe.length ? answers.vibe : ["city", "food", "culture"];

  const MAX_DAYS = 5;
  const dayCount = Math.min(nights + 1, MAX_DAYS);
  const days: Day[] = [];

  for (let i = 0; i < dayCount; i++) {
    const theme = interests[i % interests.length];
    const morning = s.mornings[i % s.mornings.length];
    const afternoonPool = s.afternoons;
    let afternoon = afternoonPool[i % afternoonPool.length];

    // weave in their specific interests / experiences
    if (theme === "food" || interests.includes("food")) {
      if (i === 1) afternoon = s.afternoons.find((a) => /market|food/i.test(a)) ?? afternoon;
    }
    if (answers.experiences.includes("cooking") && i === 2) {
      afternoon = `A hands-on cooking class`;
    }
    if (answers.experiences.includes("adventure") && interests.includes("adventure") && i === 1) {
      afternoon = `An adventure activity — the local specialty`;
    }

    const slots: Slot[] = [
      { time: "Morning", title: i === 3 && s.dayTrip ? s.dayTrip : morning, tag: theme },
      { time: "Afternoon", title: afternoon },
      { time: "Evening", title: eveningFor(answers, s, city) },
    ];
    days.push({ n: i + 1, theme, slots });
  }

  const notes: string[] = [];
  if (needsAccessible(answers))
    notes.push("Routes chosen to be step-free where we can — we've flagged the hilly bits.");
  if (hasYoungKids(answers))
    notes.push("Paced for little ones: earlier evenings, downtime built in, kid-friendly stops.");
  if (answers.needs.includes("pet"))
    notes.push("Pet-friendly stays and outdoor spots favoured.");

  return {
    city,
    nights,
    days,
    extraDays: Math.max(0, nights + 1 - dayCount),
    stay: recommendStay(answers, s),
    food: foodPicks(answers, s),
    budget: buildBudget(answers, nights),
    pax,
    notes,
  };
}
