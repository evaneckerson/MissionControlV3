import { Asks } from "@/components/blocks";
import { Course, Empty, Row, Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { dayKey, daysUntil, dueDate, fmtDay, fmtTime, isSettled } from "@/lib/data";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Week" };

export default function Week() {
  const ctx = loadCtx();
  const rows = ctx.items
    .filter((i) => !isSettled(i))
    .map((i) => ({ i, d: dueDate(i) }))
    .filter((x): x is { i: Item; d: Date } => !!x.d && daysUntil(x.d, ctx.now) >= 0 && daysUntil(x.d, ctx.now) < 14)
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const groups = new Map<string, typeof rows>();
  for (const r of rows) groups.set(dayKey(r.d), [...(groups.get(dayKey(r.d)) ?? []), r]);
  const settledRecently = ctx.items.filter((i) => i.state === "submitted" || i.settled === "done").map((i) => ({ i, d: dueDate(i) })).filter((x): x is { i: Item; d: Date } => !!x.d && daysUntil(x.d, ctx.now) > -10).sort((a, b) => b.d.getTime() - a.d.getTime()).slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-9">
        <h1 className="display text-[36px] leading-none">Next fourteen days</h1>
        <Section title="Dated" aside={`${rows.length} items`}>
          {rows.length === 0 && <Empty>Nothing dated in the next two weeks.</Empty>}
          {[...groups.entries()].map(([k, rs]) => {
            const d = daysUntil(rs[0].d, ctx.now);
            return (
              <div key={k}>
                <div className="mono pt-4 text-[12px] text-ink-2">{d === 0 ? "Today" : d === 1 ? "Tomorrow" : fmtDay(rs[0].d)}</div>
                {rs.map(({ i, d: due }) => (
                  <Row
                    key={i.id}
                    href={i.link}
                    external={!!i.link}
                    title={<>{i.kind === "exam" ? "Exam · " : i.kind === "quiz" ? "Quiz · " : i.kind === "decision" ? "Decide · " : ""}{i.title}</>}
                    sub={<><Course id={i.course} />{i.note ? ` · ${i.note}` : ""}{i.kind === "exam" && i.room && i.room !== "Not stated" ? ` · ${i.room}` : ""}</>}
                    right={fmtTime(due)}
                    tone={i.kind === "exam" ? "critical" : i.state === "late-open" ? "warn" : undefined}
                  />
                ))}
              </div>
            );
          })}
        </Section>
      </div>
      <aside className="flex flex-col gap-9 lg:pt-[52px]">
        <Asks ctx={ctx} all />
        <Section title="Recently done">
          {settledRecently.length === 0 && <Empty>Nothing settled lately.</Empty>}
          {settledRecently.map(({ i, d }) => (
            <Row key={i.id} title={i.title} sub={<Course id={i.course} />} right={fmtDay(d)} tone="good" />
          ))}
        </Section>
      </aside>
    </div>
  );
}
