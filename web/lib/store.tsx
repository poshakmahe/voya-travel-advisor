"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Traveler = { name: string; age: string };

export type Answers = {
  destination: string;

  // timing
  when?: string; // dates | month | season | flexible
  startDate?: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd
  monthValue?: string; // yyyy-mm
  season?: string; // spring | summer | autumn | winter
  duration?: string;

  // party
  who?: string;
  travelers: Traveler[];
  needs: string[]; // accessibility / special needs

  // personality
  vibe: string[];

  // food
  diet: string[];
  meats: string[];
  adventure?: string;

  experiences: string[];
  nights: string[];

  // stay
  stayTypes: string[];
  minNights?: string;
  accomNightly?: string; // typical per-night amount
  accomSplurge: boolean; // open to a pricier stay for a night or two
  accomSplurgeMax?: string;

  // budget
  currency: string; // ISO code
  budgetTier?: string; // budget | mid | premium | luxury
  budgetMode: "total" | "build";
  budgetMin?: string;
  budgetMax?: string;
  budgetBasis: "total" | "per_person";
  inclFlights: boolean;
  costFlights?: string;
  costHotel?: string;
  costExp?: string;
  costFood?: string;
  costExtras?: string;
};

const DEFAULTS: Answers = {
  destination: "",
  travelers: [],
  needs: [],
  vibe: [],
  diet: [],
  meats: [],
  experiences: [],
  nights: [],
  stayTypes: [],
  accomSplurge: false,
  currency: "USD",
  budgetMode: "total",
  budgetBasis: "total",
  inclFlights: false,
};

type ArrayKey = "vibe" | "diet" | "meats" | "experiences" | "nights" | "stayTypes" | "needs";

type TripCtx = {
  answers: Answers;
  loaded: boolean;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  toggle: (key: ArrayKey, value: string) => void;
  reset: () => void;
};

const Ctx = createContext<TripCtx | null>(null);
const STORAGE_KEY = "voya-answers-v2";

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Answers>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers, loaded]);

  const set: TripCtx["set"] = (key, value) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const toggle: TripCtx["toggle"] = (key, value) =>
    setAnswers((a) => {
      const arr = a[key];
      return {
        ...a,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });

  const reset = () => setAnswers(DEFAULTS);

  return (
    <Ctx.Provider value={{ answers, loaded, set, toggle, reset }}>{children}</Ctx.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTrip must be used within <TripProvider>");
  return ctx;
}
