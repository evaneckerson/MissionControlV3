import fs from "node:fs";
import path from "node:path";
import type { Course, Edition, GarminData, Item, Job, MoneyData, Work } from "./types";

const DATA = path.join(process.cwd(), "data");

function read<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export const getItems = () => read<Item[]>("items.json", []);
export const getWork = () => read<Work[]>("work.json", []);
export const getJobs = () => read<Job[]>("jobs.json", []);
export const getGarmin = () => read<GarminData>("garmin.json", { synced: null, days: [] });
export const getMoney = () => read<MoneyData>("money.json", { synced: null, through: null, months: [] });
export const getCourses = () => read<{ courses: Course[] }>("courses.json", { courses: [] }).courses;
export const getEdition = () => read<Edition | null>("edition.json", null);

/** "Now" for the page. Jobs write `data/clock.json` in tests; otherwise real time in Central. */
export function now(): Date {
  const fixed = read<{ now?: string }>("clock.json", {}).now;
  return fixed ? new Date(fixed) : new Date();
}

export const TZ = "America/Chicago";

export function isSettled(i: Item) {
  return !!i.settled || i.state === "submitted" || i.state === "graded";
}

export function dueDate(i: Item): Date | null {
  const d = i.due ?? i.end ?? null;
  if (!d) return null;
  const dt = new Date(d.length === 10 ? d + "T23:59:00-05:00" : d);
  return isNaN(dt.getTime()) ? null : dt;
}

export function daysUntil(d: Date, from: Date): number {
  const a = new Date(from.toLocaleDateString("en-US", { timeZone: TZ }));
  const b = new Date(d.toLocaleDateString("en-US", { timeZone: TZ }));
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(" ", " ");
}
export function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
}
export function fmtLong(d: Date) {
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
}
export function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}
export function relative(iso: string, from: Date) {
  const ms = from.getTime() - new Date(iso).getTime();
  const h = Math.round(ms / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

/** Things waiting on Evan: open decisions, drafts, overdue or due-soon work. */
export function asks(items: Item[], from: Date) {
  const open = items.filter((i) => !isSettled(i));
  const score = (i: Item) => {
    const d = dueDate(i);
    const days = d ? daysUntil(d, from) : 99;
    if (i.kind === "decision") return days <= 1 ? 0 : 2;
    if (i.kind === "draft") return 1;
    if ((i.kind === "assignment" || i.kind === "quiz") && days < 0 && i.state !== "missed") return 0;
    if ((i.kind === "assignment" || i.kind === "quiz") && days <= 1) return 1;
    if (i.kind === "todo") return 3;
    return 4;
  };
  return open
    .filter((i) => i.kind !== "exam" && i.kind !== "exam-grade")
    .map((i) => ({ i, s: score(i) }))
    .filter((x) => x.s < 4)
    .sort((a, b) => a.s - b.s || (dueDate(a.i)?.getTime() ?? 9e15) - (dueDate(b.i)?.getTime() ?? 9e15))
    .map((x) => x.i);
}

export function upcomingExams(items: Item[], from: Date) {
  return items
    .filter((i) => i.kind === "exam" && dueDate(i) && daysUntil(dueDate(i)!, from) >= 0)
    .sort((a, b) => dueDate(a)!.getTime() - dueDate(b)!.getTime());
}
