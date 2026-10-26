import { Course as CourseTag, Empty, Row, Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { daysUntil, dueDate, fmtDay, fmtTime, getCourses, isSettled } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses" };

export default function Courses() {
  const ctx = loadCtx();
  const courses = getCourses();
  return (
    <div className="flex flex-col gap-10">
      <h1 className="display text-[36px] leading-none">Courses</h1>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        {courses.map((c) => {
          const open = ctx.items.filter((i) => i.course === c.id && !isSettled(i) && dueDate(i)).sort((a, b) => dueDate(a)!.getTime() - dueDate(b)!.getTime());
          const exam = open.find((i) => i.kind === "exam");
          const work = open.filter((i) => i.kind !== "exam").slice(0, 5);
          const material = ctx.work.filter((w) => w.course === c.id).slice(0, 4);
          const d = exam ? daysUntil(dueDate(exam)!, ctx.now) : null;
          return (
            <section key={c.id} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between border-b border-rule pb-2">
                <h2 className="display text-[24px]">{c.name}</h2>
                <CourseTag id={c.id} />
              </div>
              {exam ? (
                <p className={`text-[14px] ${d !== null && d <= 3 ? "text-critical" : "text-ink-2"}`}>
                  {exam.title} · {d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}, {fmtDay(dueDate(exam)!)} {fmtTime(dueDate(exam)!)}
                  {exam.room && exam.room !== "Not stated" ? ` · ${exam.room}` : ""}
                </p>
              ) : (
                <p className="text-[14px] text-ink-2">No exam on the calendar.</p>
              )}
              <Section title="Open">
                {work.length === 0 && <Empty>Nothing open.</Empty>}
                {work.map((i) => (
                  <Row key={i.id} title={i.title} sub={i.points ? `${i.points} pts` : undefined} right={fmtDay(dueDate(i)!)} tone={daysUntil(dueDate(i)!, ctx.now) < 0 ? "critical" : undefined} />
                ))}
              </Section>
              <Section title="Claude made">
                {material.length === 0 && <Empty>Nothing yet for this course.</Empty>}
                {material.map((w) => (
                  <Row key={w.id} href={w.url} external title={w.title} right={fmtDay(new Date(w.at))} />
                ))}
              </Section>
            </section>
          );
        })}
      </div>
    </div>
  );
}
