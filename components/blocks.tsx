import Link from "next/link";
import type { Block, Edition, Item, Job, Work, GarminData, MoneyData } from "@/lib/types";
import { asks, dayKey, daysUntil, dueDate, fmtDay, fmtLong, fmtTime, isSettled, relative, TZ, upcomingExams } from "@/lib/data";
import { Course, Empty, Row, Section } from "./ui";

export interface Ctx {
  now: Date;
  items: Item[];
  work: Work[];
  jobs: Job[];
  garmin: GarminData;
  money: MoneyData;
  edition: Edition;
}

const modeLabel: Record<Edition["mode"], string> = { "exam-week": "Exam week", "deadline-day": "Deadline day", steady: "Steady day", weekend: "Weekend" };

export function Masthead({ ctx }: { ctx: Ctx }) {
  const weather = ctx.jobs.find((j) => j.id === "weather")?.last;
  const exams = upcomingExams(ctx.items, ctx.now);
  const next = exams[0];
  const d = next ? daysUntil(dueDate(next)!, ctx.now) : null;
  const line = next ? (d === 0 ? `${next.course} exam today` : d === 1 ? `${next.course} exam tomorrow` : `${next.course} exam in ${d} days`) : "No exams on the calendar";
  return (
    <div className="flex flex-col gap-2 pb-2">
      <div className="eyebrow">
        Edition {ctx.edition.number} · {modeLabel[ctx.edition.mode]}
      </div>
      <h1 className="display text-[40px] leading-[1.05] sm:text-[56px]">{fmtLong(ctx.now)}</h1>
      <p className="max-w-[64ch] text-[16px] text-ink-2">
        {line}
        {weather?.status === "ok" && weather.summary ? ` · ${weather.summary.replace(/^Oxford: /, "")}` : ""}
      </p>
    </div>
  );
}

export function ExamCard({ ctx, itemId, accent }: { ctx: Ctx; itemId: string; accent?: boolean }) {
  const ex = ctx.items.find((i) => i.id === itemId);
  if (!ex) return null;
  const due = dueDate(ex)!;
  const d = daysUntil(due, ctx.now);
  const when = d === 0 ? "Today" : d === 1 ? "Tomorrow" : fmtDay(due);
  const room = ex.room && ex.room !== "Not stated" ? ex.room : null;
  const cls = accent ? "bg-accent text-accent-ink" : "border border-rule bg-paper-2";
  const sub = accent ? "text-accent-ink/70" : "text-ink-2";
  return (
    <div className={`rounded-[10px] px-5 py-5 ${cls}`}>
      <div className="flex items-baseline justify-between gap-4">
        <div className={`eyebrow ${accent ? "text-accent-ink/70" : ""}`}>{ex.course} · {ex.title}</div>
        <div className="mono text-[13px]">{when} {fmtTime(due)}</div>
      </div>
      <div className="display mt-2 text-[30px] leading-tight sm:text-[36px]">
        {d === 0 ? "Exam day." : d === 1 ? "Exam tomorrow." : `${d} days to the exam.`}
      </div>
      <div className={`mt-3 flex flex-col gap-1 text-[14px] ${sub}`}>
        {room ? <span>Room: {room}</span> : ex.roomNote ? <span>{ex.roomNote}</span> : null}
        {ex.rules && <span>{ex.rules}</span>}
        {ex.scopeNote && <span>{ex.scopeNote}</span>}
      </div>
      {ex.guide?.url && (
        <a href={ex.guide.url} target="_blank" rel="noopener" className={`mt-4 inline-block rounded-md px-3 py-1.5 text-[13px] font-medium no-underline ${accent ? "bg-accent-ink text-accent" : "bg-ink text-paper"}`}>
          Open {ex.guide.label} ↗
        </a>
      )}
    </div>
  );
}

function askRight(i: Item, from: Date) {
  const d = dueDate(i);
  if (!d) return i.createdAt ? relative(i.createdAt, from) : "";
  const days = daysUntil(d, from);
  if (days < 0) return `${-days}d overdue`;
  if (days === 0) return `today ${fmtTime(d)}`;
  if (days === 1) return "tomorrow";
  return fmtDay(d);
}
function askTone(i: Item, from: Date): "critical" | "warn" | undefined {
  const d = dueDate(i);
  if (!d) return undefined;
  const days = daysUntil(d, from);
  return days < 0 ? "critical" : days <= 1 ? "warn" : undefined;
}
const kindWord: Record<string, string> = { decision: "Decide", draft: "Send", assignment: "Submit", quiz: "Take", todo: "Do" };

export function Asks({ ctx, limit = 3, all = false }: { ctx: Ctx; limit?: number; all?: boolean }) {
  const list = asks(ctx.items, ctx.now);
  const shown = all ? list : list.slice(0, limit);
  const more = list.length - shown.length;
  return (
    <Section title="Needs you" aside={list.length ? `${list.length} open` : undefined}>
      {shown.length === 0 && <Empty>Nothing is waiting on you.</Empty>}
      {shown.map((i) => (
        <Row
          key={i.id}
          href={i.link}
          external
          title={<><span className="text-ink-2">{kindWord[i.kind] ?? "Look"} · </span>{i.title}{i.who ? <span className="text-ink-2"> · {i.who}</span> : null}</>}
          sub={<>{i.course ? <Course id={i.course} /> : null}{i.course && i.note ? " · " : ""}{i.note}</>}
          right={askRight(i, ctx.now)}
          tone={askTone(i, ctx.now)}
        />
      ))}
      {more > 0 && (
        <Link href="/week" className="pt-2 text-[13px] text-ink-2 no-underline hover:text-ink">
          {more} more on Week →
        </Link>
      )}
    </Section>
  );
}

export function Agenda({ ctx, days = 2 }: { ctx: Ctx; days?: number }) {
  const rows = ctx.items
    .filter((i) => !isSettled(i) && i.kind !== "decision" && i.kind !== "draft" && i.kind !== "todo")
    .map((i) => ({ i, d: dueDate(i) }))
    .filter((x): x is { i: Item; d: Date } => !!x.d && daysUntil(x.d, ctx.now) >= 0 && daysUntil(x.d, ctx.now) < days)
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = dayKey(r.d);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const title = days === 1 ? "Today" : days <= 3 ? "Next days" : "This week";
  return (
    <Section title={title}>
      {rows.length === 0 && <Empty>Nothing due in the next {days === 1 ? "day" : `${days} days`}.</Empty>}
      {[...groups.entries()].map(([k, rs]) => (
        <div key={k}>
          <div className="mono pt-3 text-[12px] text-ink-2">{daysUntil(rs[0].d, ctx.now) === 0 ? "Today" : daysUntil(rs[0].d, ctx.now) === 1 ? "Tomorrow" : fmtDay(rs[0].d)}</div>
          {rs.map(({ i, d }) => (
            <Row key={i.id} title={i.title} sub={<><Course id={i.course} />{i.kind === "exam" && i.room && i.room !== "Not stated" ? ` · ${i.room}` : ""}{i.kind !== "exam" && i.points ? ` · ${i.points} pts` : ""}</>} right={fmtTime(d)} tone={i.kind === "exam" ? "critical" : undefined} />
          ))}
        </div>
      ))}
    </Section>
  );
}

const kindLabel: Record<string, string> = { guide: "Study guide", solutions: "Solutions", plan: "Plan", doc: "Doc", study: "Study notes", explainer: "Explainer" };

export function Activity({ ctx, hours = 48, course = null }: { ctx: Ctx; hours?: number; course?: string | null }) {
  const since = ctx.now.getTime() - hours * 3600000;
  let rows = ctx.work.filter((w) => new Date(w.at).getTime() >= since);
  if (course) rows = rows.filter((w) => w.course === course);
  rows = rows.slice(0, 8);
  return (
    <Section title="Claude did" aside={`last ${hours}h`}>
      {rows.length === 0 && <Empty>Nothing new from Claude in the last {hours} hours. <Link href="/library" className="underline">Library</Link> has everything.</Empty>}
      {rows.map((w) => (
        <Row key={w.id} href={w.url} external title={w.title} sub={<>{w.kind ? kindLabel[w.kind] ?? w.kind : w.type === "chat" ? "Chat" : "Page"}{w.course ? <> · <Course id={w.course} /></> : null}</>} right={relative(w.at, ctx.now)} />
      ))}
      {rows.length > 0 && (
        <Link href="/library" className="pt-2 text-[13px] text-ink-2 no-underline hover:text-ink">All of it on Library →</Link>
      )}
    </Section>
  );
}

export function Material({ ctx, course, limit = 6 }: { ctx: Ctx; course: string; limit?: number }) {
  const rows = ctx.work.filter((w) => w.course === course).slice(0, limit);
  if (rows.length === 0) return null;
  return (
    <Section title={`${course} material`}>
      {rows.map((w) => (
        <Row key={w.id} href={w.url} external title={w.title} sub={w.kind ? kindLabel[w.kind] ?? w.kind : undefined} right={fmtDay(new Date(w.at))} />
      ))}
    </Section>
  );
}

function readinessLine(d: GarminData["days"][number]) {
  const bb = d.bodyBattery ?? d.readiness;
  if (bb == null) return "Synced, but no readiness yet.";
  if (bb >= 75) return "Rested. Train hard if you want to.";
  if (bb >= 50) return "Decent. A normal day; keep the big lift light.";
  if (bb >= 30) return "Low battery. Walk, don't push.";
  return "Run down. Sleep is the task today.";
}

export function BodyCard({ ctx, accent, full = false }: { ctx: Ctx; accent?: boolean; full?: boolean }) {
  const g = ctx.garmin;
  const today = g.days.at(-1);
  const cls = accent ? "bg-accent text-accent-ink" : "border border-rule bg-paper-2";
  const sub = accent ? "text-accent-ink/70" : "text-ink-2";
  if (!today) {
    return (
      <div className={`rounded-[10px] px-5 py-5 ${cls}`}>
        <div className={`eyebrow ${accent ? "text-accent-ink/70" : ""}`}>Body</div>
        <div className="display mt-2 text-[24px] leading-tight">Waiting for the watch.</div>
        <p className={`mt-2 text-[14px] ${sub}`}>Once the Garmin pull runs, this shows a readiness line, Body Battery, sleep, HRV status and resting heart rate, with a seven-day strip.</p>
        <Link href="/body" className={`mt-3 inline-block text-[13px] underline ${sub}`}>How to connect it →</Link>
      </div>
    );
  }
  const stats: [string, string][] = [
    ["Body Battery", today.bodyBattery != null ? String(today.bodyBattery) : "–"],
    ["Sleep", today.sleepScore != null ? `${today.sleepScore}${today.sleepHours ? ` · ${today.sleepHours.toFixed(1)}h` : ""}` : "–"],
    ["HRV", today.hrvStatus ?? (today.hrvMs ? `${today.hrvMs} ms` : "–")],
    ["Resting HR", today.restingHr != null ? `${today.restingHr}` : "–"],
  ];
  return (
    <div className={`rounded-[10px] px-5 py-5 ${cls}`}>
      <div className="flex items-baseline justify-between">
        <div className={`eyebrow ${accent ? "text-accent-ink/70" : ""}`}>Body</div>
        <div className={`mono text-[12px] ${sub}`}>{g.synced ? `synced ${relative(g.synced, ctx.now)}` : ""}</div>
      </div>
      <div className="display mt-2 text-[24px] leading-tight sm:text-[28px]">{readinessLine(today)}</div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt className={`text-[12px] ${sub}`}>{k}</dt>
            <dd className="mono text-[20px] leading-none">{v}</dd>
          </div>
        ))}
      </dl>
      {full && <WeekStrip days={g.days} accent={accent} />}
      {!full && <Link href="/body" className={`mt-4 inline-block text-[13px] underline ${sub}`}>Seven days →</Link>}
    </div>
  );
}

export function WeekStrip({ days, accent }: { days: GarminData["days"]; accent?: boolean }) {
  const last = days.slice(-7);
  const max = 100;
  return (
    <div className="mt-5 flex items-end gap-1.5" aria-label="Body Battery, last seven days">
      {last.map((d) => {
        const v = d.bodyBattery ?? d.readiness ?? 0;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className={`w-full rounded-sm ${accent ? "bg-accent-ink/80" : "bg-accent"}`} style={{ height: `${Math.max(4, (v / max) * 56)}px` }} title={`${d.date}: ${v}`} />
            <div className={`mono text-[10px] ${accent ? "text-accent-ink/70" : "text-ink-2"}`}>{new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow", timeZone: TZ })}</div>
          </div>
        );
      })}
    </div>
  );
}

export function MoneyCard({ ctx }: { ctx: Ctx }) {
  const m = ctx.money;
  const cur = m.months.at(-1);
  const prev = m.months.at(-2);
  const job = ctx.jobs.find((j) => j.id === "money-sync")?.last;
  return (
    <Section title="Money" aside={m.through ? `through ${fmtDay(new Date(m.through))}` : job?.summary ? job.summary.split(" · ")[0] : undefined}>
      {!cur ? (
        <Empty>The money pull runs in mc-money and hasn&apos;t written here yet. When it does: this month&apos;s spend against last month, income, and the three biggest categories. <Link href="/money" className="underline">Details</Link>.</Empty>
      ) : (
        <div className="flex flex-col gap-1 py-2">
          <div className="flex items-baseline justify-between"><span>Spent this month</span><span className="mono text-[18px]">${cur.spent.toLocaleString()}</span></div>
          {prev && <div className="flex items-baseline justify-between text-[13px] text-ink-2"><span>Last month at this point</span><span className="mono">${prev.spent.toLocaleString()}</span></div>}
          <Link href="/money" className="pt-2 text-[13px] text-ink-2 no-underline hover:text-ink">Categories and charges →</Link>
        </div>
      )}
    </Section>
  );
}

export function JobsStrip({ ctx }: { ctx: Ctx }) {
  const jobs = ctx.jobs.filter((j) => j.last).sort((a, b) => (a.last!.status === "failed" ? -1 : 1) - (b.last!.status === "failed" ? -1 : 1));
  const failed = jobs.filter((j) => j.last!.status === "failed");
  const partial = jobs.filter((j) => j.last!.status === "partial");
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule pt-3 text-[12.5px] text-ink-2">
      <span className="eyebrow">Jobs</span>
      <span>{jobs.length - failed.length - partial.length} ran clean</span>
      {partial.length > 0 && <span className="text-warn">{partial.length} partial</span>}
      {failed.length > 0 && <span className="text-critical">{failed.length} failed: {failed.map((j) => j.id).join(", ")}</span>}
      <Link href="/jobs" className="ml-auto no-underline hover:text-ink">Details →</Link>
    </div>
  );
}

export function renderBlock(b: Block, ctx: Ctx, i: number) {
  switch (b.type) {
    case "masthead": return <Masthead key={i} ctx={ctx} />;
    case "headline": return <h2 key={i} className="display text-[28px]">{b.text}</h2>;
    case "exam": return <ExamCard key={i} ctx={ctx} itemId={b.itemId} accent={b.accent} />;
    case "asks": return <Asks key={i} ctx={ctx} limit={b.limit} />;
    case "agenda": return <Agenda key={i} ctx={ctx} days={b.days} />;
    case "activity": return <Activity key={i} ctx={ctx} hours={b.hours} course={b.course ?? null} />;
    case "body": return <BodyCard key={i} ctx={ctx} accent={b.accent} />;
    case "money": return <MoneyCard key={i} ctx={ctx} />;
    case "material": return <Material key={i} ctx={ctx} course={b.course} limit={b.limit} />;
    case "jobs-strip": return <JobsStrip key={i} ctx={ctx} />;
  }
}
