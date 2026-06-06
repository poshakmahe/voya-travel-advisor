# AI Travel Advisor — Question Framework Design

**Date:** 2026-06-05
**Status:** Draft for review
**Scope:** Defines the question framework + conditional logic that builds a traveler's profile. This is the foundation the web app is later built on. (App architecture is a separate, later spec.)

---

## 1. Goals & Principles

- **Serve everyone, adapt depth.** Same framework works for DIY travelers, affluent/bespoke travelers, and B2B travel agents. Depth scales to interest.
- **Minimal core, progressive deepening.** Ask the fewest questions needed for a credible plan, then invite the user to go deeper per category.
- **Destination-first (v1).** A destination is required upfront; everything else tailors the trip to it.
- **Structured answers.** Every answer maps to clean tags/values the recommendation engine can consume. No weighting in v1 (simple structured).
- **Derive, don't over-ask.** Logistics/style attributes are inferred from other answers, not asked directly.

### Future extension (documented, not built in v1)
- **"Inspire me" / no-destination discovery mode.** A Branch B where the user has no destination; the system asks discovery questions (region, climate, vibe) and suggests where to go. Out of scope for v1 but the framework should not preclude it.

---

## 2. The 3-Layer Progressive Model

Every category is organized into three layers:

- **L0 — Core (always asked):** minimum for a credible plan. ~8–10 questions total.
- **L1 — Refine (offered):** "Want better matches? Tell us more about X." Per-category deepeners.
- **L2 — Connoisseur (optional):** nuance for power users/agents.

After the L0 set, the user is offered each category's L1 expansion. L2 is surfaced only on explicit "go deeper" or for agent/pro mode.

### Question object shape

Each question is defined as:

```
{
  id:        "string",            // stable identifier
  category:  "string",
  layer:     0 | 1 | 2,
  text:      "string",            // user-facing prompt
  type:      "single" | "multi" | "value",  // value = numeric/date/place input
  options:   [{ value, label }],  // for single/multi
  tags:      ["tag:path"],        // attributes this question sets
  showIf:    "rule | null",       // branching condition to display
  notes:     "string"
}
```

---

## 3. Category Map (summary)

| # | Category | L0 | L1 | L2 |
|---|----------|----|----|----|
| 1 | Destination & trip basics | Destination, purpose | Single vs multi-city, areas | Bucket-list |
| 2 | Timing | When, duration | Date flexibility | Crowd/weather windows |
| 3 | Travel party (incl. primary traveler) | Who, size, primary age, gender(opt) | Kids' ages, group age mix, special needs | Per-person dealbreakers |
| 4 | Trip personality | Setting, pace, top interests | — | Niche interests |
| 5 | Food & dining | Diet | Meat types, adventurousness, dining style | Cuisines, drink |
| 6 | Experiences | — | Live arts, unique/local, adventure, wellness | Specific bookables |
| 7 | Nightlife | Intensity | Type | Scene/genre |
| 8 | Accommodation | Type, per-night budget, min nights/stay | Brand pref, location priority, amenities | Brand/loyalty |
| 9 | Budget | Total budget, includes-flights | Splurge vs save | — |
| — | Derived (not asked) | — | transport, spontaneity, intensity, guided-vs-independent, sustainability | — |

---

## 4. Full Question Bank

### Category 1 — Destination & trip basics

**Q1.1 — Destination** · L0 · `value (place)` · required
> "Where are you going?"
- Place input (city / region / country, autocomplete).
- Tags: `destination`
- Gates: required before any other question. Currency/locale defaults derived from destination.

**Q1.2 — Trip purpose** · L0 · `multi` (pick up to 2)
> "What's this trip mostly about?"
- Relax & unwind `purpose:relax`
- Adventure & active `purpose:adventure`
- Culture & sightseeing `purpose:culture`
- Romance / couple time `purpose:romance`
- Family time `purpose:family`
- Celebration `purpose:celebration`
- Food & drink `purpose:food`
- Nature & outdoors `purpose:nature`

**Q1.3 — Trip structure** · L1 · `single`
> "One base or multiple stops?"
- One place, day trips from there `structure:single_base`
- A few stops `structure:multi_stop`
- Open to a route / road trip `structure:route`

**Q1.4 — Specific areas** · L1 · `value (free/multi)` · showIf: `structure != single_base OR user opts in`
> "Any specific neighborhoods or areas you want to be near?"
- Tags: `areas[]`

**Q1.5 — Bucket-list** · L2 · `value (free/multi)`
> "Any must-see spots or experiences already on your list?"
- Tags: `bucket_list[]`

---

### Category 2 — Timing

**Q2.1 — When** · L0 · `single` → conditional input
> "When do you want to go?"
- Specific dates `when:dates` → date-range picker
- A specific month `when:month` → month picker
- A season `when:season` → Spring/Summer/Fall/Winter
- Flexible / not sure yet `when:flexible`
- Tags: `when_type`, `travel_dates | travel_month | travel_season`

**Q2.2 — Duration** · L0 · `single` · showIf: `when_type != dates with both ends` (else auto-computed)
> "How long is the trip?"
- Weekend (2–3 nights) `duration:weekend`
- Short (4–6) `duration:short`
- A week (7–9) `duration:week`
- Two weeks (10–16) `duration:two_weeks`
- Extended (17+) `duration:extended`

**Q2.3 — Date flexibility** · L1 · `single` · showIf: `when_type in {dates, month}`
> "How flexible are your dates?"
- Fixed `flex:fixed`
- ± a few days `flex:few_days`
- ± a week `flex:week`
- Very flexible `flex:high`
- Note: enables cheaper-fare / off-peak optimization.

**Q2.4 — Crowd/weather window** · L2 · `single` · showIf: `when_type in {month, season, flexible}`
> "Any preference on crowds or weather?"
- Avoid peak crowds `window:low_crowd`
- Best weather even if busy `window:best_weather`
- Cheapest / off-season `window:off_season`
- No preference `window:any`

---

### Category 3 — Travel party (incl. primary traveler)

**Q3.1 — Who** · L0 · `single` · gate
> "Who's traveling?"
- Solo `party:solo`
- Couple `party:couple`
- Family with kids `party:family_kids`
- Family, adults only `party:family_adults`
- Friends group `party:friends`
- Other group `party:group`

**Q3.2 — Party size** · L0 · `single` · showIf: `party != solo`
> "How many travelers in total?"
- 2 / 3–4 / 5–6 / 7+ `party_size:n`

**Q3.3 — Primary traveler age** · L0 · `single`
> "Your age range?"
- 18–24 / 25–34 / 35–44 / 45–54 / 55–64 / 65+ `primary_age:band`

**Q3.4 — Primary gender** · L0 · `single` · optional
> "Gender? (optional)"
- Female / Male / Non-binary / Prefer not to say `primary_gender:*`

**Q3.5 — Kids' ages** · L1 · `multi` · showIf: `party == family_kids`
> "Ages of the children?"
- Infants (0–2) / Toddlers (3–5) / Kids (6–12) / Teens (13–17) `kids_ages:*`
- Unlocks: kid-friendly experiences, family amenities, surfaces min-nights at L0 (see §6).

**Q3.6 — Group age mix** · L1 · `multi` · showIf: `party in {friends, group, family_adults}`
> "What's the age mix of the group?"
- 18–24 / 25–34 / 35–44 / 45–54 / 55–64 / 65+ `group_ages:*`

**Q3.7 — Special needs** · L1 · `multi`
> "Anything we should plan around?"
- Mobility / wheelchair access `needs:mobility`
- Medical considerations `needs:medical`
- Pet traveling with you `needs:pet`
- Stroller / young-child logistics `needs:stroller`
- None `needs:none`
- (Dietary handled in Category 5.)

**Q3.8 — Per-person dealbreakers** · L2 · `value (free/multi)`
> "Any per-person must-haves or absolute no-gos?"
- Tags: `dealbreakers[]`

---

### Category 4 — Trip personality

**Q4.1 — Setting** · L0 · `multi`
> "What kind of setting draws you?"
- Beach & coast `setting:beach`
- Mountains & nature `setting:mountains`
- City & urban `setting:city`
- Countryside / rural `setting:rural`
- A mix `setting:mix`

**Q4.2 — Pace** · L0 · `single`
> "What pace suits you?"
- Packed — see it all `pace:packed`
- Balanced `pace:balanced`
- Relaxed — slow travel `pace:relaxed`

**Q4.3 — Top interests** · L0 · `multi` (pick up to ~5)
> "What attracts you most when you travel?"
- Museums & history `interest:history`
- Art & architecture `interest:art`
- Hiking & trails `interest:hiking`
- Forest & nature walks `interest:nature_walk`
- Beaches & water `interest:water`
- Food & markets `interest:food`
- Local culture & people `interest:culture`
- Nightlife `interest:nightlife`
- Shopping `interest:shopping`
- Wellness & spa `interest:wellness`
- Photography & scenery `interest:scenery`
- Adventure sports `interest:adventure`
- Wildlife `interest:wildlife`
- Note: top interests are the main feedstock for derived attributes (§7) and pre-seed nightlife/experiences answers.

**Q4.4 — Niche interests** · L2 · `value (free/multi)`
> "Any niche passions to build around (e.g., jazz, surfing, birding, wine)?"
- Tags: `niche_interests[]`

---

### Category 5 — Food & dining

**Q5.1 — Diet** · L0 · `multi`
> "Any dietary preferences or restrictions?"
- No restrictions `diet:none`
- Vegetarian `diet:vegetarian`
- Vegan `diet:vegan`
- Pescatarian `diet:pescatarian`
- Halal `diet:halal`
- Kosher `diet:kosher`
- Gluten-free `diet:gf`
- Allergies (specify) `diet:allergy` → free text

**Q5.2 — Meat types** · L1 · `multi` · showIf: `diet not in {vegetarian, vegan}`
> "Which meats do you enjoy?"
- Beef / Pork / Poultry / Lamb / Seafood / Game / Any `meat:*`

**Q5.3 — Food adventurousness** · L1 · `single`
> "How adventurous are you with food?"
- Stick to familiar `food_adventure:low`
- Somewhat open `food_adventure:medium`
- Love trying anything local `food_adventure:high`

**Q5.4 — Dining style** · L1 · `multi`
> "What dining do you gravitate to?"
- Street food & casual `dining:street`
- Local mid-range `dining:local`
- Fine dining `dining:fine`
- A mix `dining:mix`

**Q5.5 — Cuisines & drink** · L2 · `value (free/multi)`
> "Favorite cuisines, or interest in wine / cocktails / coffee?"
- Tags: `cuisines[]`, `drink_interest[]`

---

### Category 6 — Experiences

**Q6.1 — Experience types** · L1 · `multi` (pre-seeded from Q4.3)
> "Any experiences you specifically love?"
- Live theater & drama `exp:theater`
- Music & concerts `exp:music`
- Festivals & events `exp:festival`
- Cooking classes & workshops `exp:workshop`
- Guided local tours `exp:guided_tour`
- Off-beat / unique local experiences `exp:offbeat`
- Wellness & spa retreats `exp:wellness`
- Adventure activities (diving, skiing…) `exp:adventure`

**Q6.2 — Specific bookables** · L2 · `value (free/multi)`
> "Anything specific you'd want us to book (a show, a class, an excursion)?"
- Tags: `bookables[]`

---

### Category 7 — Nightlife

**Q7.1 — Nightlife intensity** · L0 · `single` · gate
> "What's your ideal evening?"
- Quiet — dinner, then rest `nightlife:quiet`
- Relaxed drinks / lounges `nightlife:relaxed`
- Lively bars `nightlife:bars`
- Clubs & late nights `nightlife:clubs`
- A mix `nightlife:mix`

**Q7.2 — Nightlife type** · L1 · `multi` · showIf: `nightlife != quiet`
> "What kind of nightlife?"
- Cocktail bars `night_type:cocktail`
- Pubs / casual `night_type:pub`
- Live music venues `night_type:live_music`
- Dance clubs `night_type:club`
- Rooftop / scenic `night_type:rooftop`
- Cultural night events `night_type:cultural`

**Q7.3 — Scene / genre** · L2 · `value (free/multi)`
> "Any specific scene or music genre?"
- Tags: `night_scene[]`

---

### Category 8 — Accommodation

**Q8.1 — Accommodation type** · L0 · `multi`
> "What kind of place do you want to stay in?"
- Hotel `accom:hotel`
- Boutique hotel `accom:boutique`
- Resort `accom:resort`
- Apartment / vacation rental `accom:apartment`
- B&B / guesthouse `accom:bnb`
- Hostel `accom:hostel`
- Villa `accom:villa`
- No preference — recommend for me `accom:any`
- Note: this is a *preference*, not a hard filter. The engine may recommend e.g. a B&B or villa for families/large groups even if not selected (see §6).

**Q8.2 — Per-night budget** · L0 · `single` · currency from destination
> "Budget per night for your stay?"
- Bands (localized), e.g. `<$75 / $75–150 / $150–300 / $300–600 / $600+` `accom_budget_night:band`

**Q8.3 — Minimum nights per stay** · L0 (surfaced) / L1 (default) · `single`
> "Minimum nights you'd want in one place before moving on?"
- Happy to move daily `min_nights:1`
- At least 2 `min_nights:2`
- At least 3 `min_nights:3`
- One base for the whole trip `min_nights:single_base`
- **Surfacing rule:** promoted to L0 when `party in {family_kids, group}` OR `party_size >= 5` — frequent moves are painful for families/large groups. Otherwise asked at L1.

**Q8.4 — Branded vs independent** · L1 · `single`
> "Branded chains or independent/local stays?"
- Prefer known brands `brand:branded`
- Prefer independent / local character `brand:independent`
- No preference `brand:any`

**Q8.5 — Location priority** · L1 · `single`
> "What matters most for location?"
- Central / walkable to sights `location:central`
- Near nightlife `location:nightlife`
- Quiet / scenic `location:quiet`
- Near beach / nature `location:nature`
- Best value, further out is fine `location:value`
- Near transport hub `location:transport`

**Q8.6 — Amenities** · L1 · `multi`
> "Any must-have amenities?"
- Pool `amenity:pool`
- Kitchen / kitchenette `amenity:kitchen`
- Free breakfast `amenity:breakfast`
- Gym `amenity:gym`
- Spa `amenity:spa`
- Parking `amenity:parking`
- Family / connecting rooms `amenity:family_rooms`
- Pet-friendly `amenity:pet`
- Strong wifi / workspace `amenity:workspace`

**Q8.7 — Brand / loyalty** · L2 · `value (free/multi)`
> "Any preferred brands or loyalty programs?"
- Tags: `loyalty[]`

---

### Category 9 — Budget

**Q9.1 — Total budget** · L0 · `single + toggle` · currency from destination
> "What's your total budget?"
- Basis toggle: Per person `budget_basis:per_person` / Total `budget_basis:total`
- Tier or amount: Budget / Mid-range / Premium / Luxury bands, or exact figure `total_budget`, `currency`

**Q9.2 — Includes flights?** · L0 · `single`
> "Does that budget include flights?"
- Yes `budget_incl_flights:yes`
- No, that's separate `budget_incl_flights:no`
- N/A (no flights / driving) `budget_incl_flights:na`

**Q9.3 — Splurge vs save** · L1 · `multi` (two-sided)
> "Where do you like to splurge, and where do you save?"
- Splurge on: hotels / food / experiences / comfort & flights `splurge:*`
- Save on: hotels / food / experiences / comfort & flights `save:*`

---

## 5. Branching & Gates (summary)

| Trigger | Effect |
|---------|--------|
| `Q1.1 destination` empty | Block all subsequent questions (required) |
| `party == family_kids` | Show Q3.5 (kids' ages); enable family amenities & experiences; promote Q8.3 to L0 |
| `party in {friends, group, family_adults}` | Show Q3.6 (group age mix) |
| `party == solo` | Skip Q3.2 (party size) |
| `party_size >= 5` OR family/group | Promote Q8.3 (min nights/stay) to L0 |
| `diet in {vegetarian, vegan}` | Skip Q5.2 (meat types) |
| `nightlife == quiet` | Skip Q7.2 (nightlife type) |
| `when_type == dates` (both ends) | Auto-compute duration, skip Q2.2 |
| `when_type in {month, season, flexible}` | Enable Q2.3 flexibility & Q2.4 window |
| `needs:mobility` | Filter for accessible accommodation & experiences |
| `interest:nightlife` selected in Q4.3 | Pre-seed Q7.1 toward non-quiet |
| `structure != single_base` | Show Q1.4 (specific areas) |

---

## 6. Recommendation Hints (preference vs. filter)

Some answers are **hard filters** (must be respected); others are **soft preferences** (the engine may override with a better-suited suggestion and explain why).

- **Hard filters:** diet restrictions, accessibility needs, total budget ceiling, dates, destination.
- **Soft preferences:** accommodation type, branded-vs-independent, setting mix, nightlife type.
  - Example: family of 5 selects "Hotel" but the engine recommends a 2-bedroom apartment or villa for space/value, with rationale.

---

## 7. Derived Attributes (computed, never asked)

The tool infers these from other answers instead of asking. v1 mapping:

| Derived attribute | Inferred from |
|-------------------|---------------|
| Transport mode (walk / transit / rental car / private) | `setting`, `structure`, `interest:*`, `accom budget`, `party_size`, `needs:mobility` |
| Planned vs. spontaneous | `pace`, `purpose`, `party`, agent vs. DIY |
| Physical intensity | `interest:hiking/adventure/water`, `pace`, `kids_ages`, `primary_age`, `needs:mobility` |
| Guided vs. independent | `food_adventure`, `interest:culture`, `party`, `experiences` |
| Sustainability lean | `brand`, `setting:nature`, `interest:wildlife/nature_walk` |
| "Instagrammability" / scenery weight | `interest:scenery/art`, `purpose:romance` |

These can be surfaced for confirmation later but are not part of the question flow.

---

## 8. Output: Traveler Profile object

The questionnaire produces a single structured profile, e.g.:

```json
{
  "destination": "Lisbon, Portugal",
  "currency": "EUR",
  "purpose": ["culture", "food"],
  "when": { "type": "month", "value": "2026-09" },
  "duration": "week",
  "party": { "type": "couple", "size": 2, "primary_age": "35-44" },
  "setting": ["city", "beach"],
  "pace": "balanced",
  "interests": ["history", "food", "scenery"],
  "diet": ["pescatarian"],
  "nightlife": "relaxed",
  "accommodation": { "type": ["boutique"], "budget_night_band": "150-300",
                     "min_nights": "single_base", "location": "central" },
  "budget": { "basis": "total", "amount": 4000, "incl_flights": false },
  "derived": { "transport": "walk+transit", "intensity": "moderate" },
  "completeness": { "L0": true, "L1": ["food","accommodation"], "L2": [] }
}
```

`completeness` tracks how deep the user went, so the engine knows how much it's inferring vs. confirmed.

---

## 9. Out of scope (this spec)

- Web app architecture, UI, and the unified entry-to-answers experience (separate spec).
- The recommendation/matching engine itself.
- "Inspire me" no-destination discovery mode (future extension, §1).
- Booking, payments, itinerary generation.
