export type ItemKind = "exam" | "assignment" | "quiz" | "decision" | "todo" | "draft" | "exam-grade";

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  course?: string | null;
  due?: string | null; // ISO or YYYY-MM-DD
  end?: string | null; // exams: end time
  state?: string; // assignment: open | submitted | late-open | missed | graded
  settled?: "done" | "dismissed";
  note?: string;
  link?: string;
  room?: string;
  roomNote?: string;
  rules?: string;
  scopeNote?: string;
  guide?: { label: string; url: string } | null;
  points?: number | null;
  who?: string;
  src?: string;
  by?: string;
  createdAt?: string;
  seenAt?: string;
  lateOk?: boolean | null;
}

export interface Work {
  id: string;
  title: string;
  url?: string;
  type: "page" | "chat" | "doc";
  kind?: string | null; // guide | solutions | plan | doc | study | explainer
  course?: string | null;
  area?: string;
  at: string;
  by?: string;
}

export interface JobRun {
  at: string;
  status: "ok" | "partial" | "failed" | "skipped";
  summary?: string;
}

export interface Job {
  id: string;
  last?: JobRun;
  history?: JobRun[];
}

export interface GarminDay {
  date: string; // YYYY-MM-DD
  sleepScore?: number;
  sleepHours?: number;
  bodyBattery?: number; // at wake
  hrvStatus?: "balanced" | "unbalanced" | "low" | "poor" | string;
  hrvMs?: number;
  restingHr?: number;
  stressAvg?: number;
  readiness?: number;
  steps?: number;
}

export interface GarminData {
  synced: string | null;
  days: GarminDay[];
}

export interface MoneyMonth {
  month: string; // YYYY-MM
  spent: number;
  income: number;
  byCategory: Record<string, number>;
}

export interface MoneyData {
  synced: string | null;
  through: string | null;
  months: MoneyMonth[];
  recent?: { date: string; merchant: string; amount: number; category?: string }[];
}

export interface Course {
  id: string;
  name: string;
  short: string;
}

export type EditionMode = "exam-week" | "deadline-day" | "steady" | "weekend";

export type Block =
  | { type: "masthead" }
  | { type: "headline"; text: string; sub?: string }
  | { type: "exam"; itemId: string; accent?: boolean }
  | { type: "asks"; limit?: number }
  | { type: "agenda"; days?: number }
  | { type: "activity"; hours?: number; course?: string | null }
  | { type: "body"; accent?: boolean }
  | { type: "money" }
  | { type: "material"; course: string; limit?: number }
  | { type: "jobs-strip" };

export interface Edition {
  composedAt: string;
  mode: EditionMode;
  number: number;
  main: Block[];
  rail: Block[];
}
