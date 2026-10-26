// Composes data/edition.json for this morning from the rules in PRODUCT.md.
// A Claude job can overwrite the file with its own composition; the app only renders.
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");
const read = (f, fb) => { try { return JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")); } catch { return fb; } };
const items = read("items.json", []);
const clock = read("clock.json", {});
const now = clock.now ? new Date(clock.now) : new Date();
const TZ = "America/Chicago";
const key = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const daysUntil = (iso) => {
  const d = new Date(iso.length === 10 ? iso + "T23:59:00-05:00" : iso);
  return Math.round((new Date(key(d)).getTime() - new Date(key(now)).getTime()) / 86400000);
};
const settled = (i) => i.settled || i.state === "submitted" || i.state === "graded";
const open = items.filter((i) => !settled(i));

const exams = open.filter((i) => i.kind === "exam" && (i.due || i.end)).map((i) => ({ i, d: daysUntil(i.due || i.end) })).filter((x) => x.d >= 0).sort((a, b) => a.d - b.d);
const dueToday = open.filter((i) => (i.kind === "assignment" || i.kind === "quiz") && i.due && daysUntil(i.due) === 0);
const weekday = new Date(now.toLocaleString("en-US", { timeZone: TZ })).getDay();
const weekend = weekday === 0 || weekday === 6;

let mode = "steady", main, rail;
if (exams.length && exams[0].d <= 3) {
  mode = "exam-week";
  const ex = exams[0].i;
  main = [{ type: "masthead" }, { type: "exam", itemId: ex.id, accent: true }, { type: "asks", limit: 3 }, { type: "material", course: ex.course, limit: 6 }, { type: "agenda", days: 3 }];
  rail = [{ type: "body" }, { type: "activity", hours: 48 }, { type: "money" }];
} else if (dueToday.length) {
  mode = "deadline-day";
  main = [{ type: "masthead" }, { type: "agenda", days: 1 }, { type: "asks", limit: 3 }, { type: "activity", hours: 48 }];
  rail = [{ type: "body", accent: true }, { type: "money" }];
} else if (weekend) {
  mode = "weekend";
  main = [{ type: "masthead" }, { type: "activity", hours: 72 }, { type: "agenda", days: 7 }];
  rail = [{ type: "body", accent: true }, { type: "asks", limit: 2 }, { type: "money" }];
} else {
  main = [{ type: "masthead" }, { type: "asks", limit: 3 }, { type: "agenda", days: 2 }, { type: "activity", hours: 48 }];
  rail = [{ type: "body", accent: true }, { type: "money" }];
}
main.push({ type: "jobs-strip" });

const prev = read("edition.json", null);
const edition = { composedAt: now.toISOString(), mode, number: prev && key(new Date(prev.composedAt)) === key(now) ? prev.number : (prev?.number ?? 0) + 1, main, rail };
fs.writeFileSync(path.join(DATA, "edition.json"), JSON.stringify(edition, null, 1));
console.log(`Edition ${edition.number}: ${mode}`);
