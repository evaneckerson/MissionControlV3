import { BodyCard } from "@/components/blocks";
import { Empty, Row, Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { fmtDay } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Body" };

export default function Body() {
  const ctx = loadCtx();
  const g = ctx.garmin;
  const job = ctx.jobs.find((j) => j.id === "garmin-sync")?.last;
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-9">
        <h1 className="display text-[36px] leading-none">Body</h1>
        <BodyCard ctx={ctx} accent full />
        <Section title="Last fourteen days">
          {g.days.length === 0 && <Empty>Days appear here once the Garmin pull has run: date, Body Battery at wake, sleep score and hours, HRV status, resting heart rate.</Empty>}
          {[...g.days].reverse().slice(0, 14).map((d) => (
            <Row key={d.date} title={fmtDay(new Date(d.date + "T12:00:00"))} sub={<>{d.sleepScore != null ? `Sleep ${d.sleepScore}` : ""}{d.sleepHours ? ` · ${d.sleepHours.toFixed(1)}h` : ""}{d.hrvStatus ? ` · HRV ${d.hrvStatus}` : ""}{d.restingHr ? ` · RHR ${d.restingHr}` : ""}</>} right={d.bodyBattery != null ? `BB ${d.bodyBattery}` : "–"} />
          ))}
        </Section>
      </div>
      <aside className="flex flex-col gap-9 lg:pt-[52px]">
        <Section title="Source">
          <div className="flex flex-col gap-2 py-2 text-[14px] text-ink-2">
            <p>Garmin Connect, pulled by the Garmin job and written to <span className="mono">data/garmin.json</span>. Numbers never leave this file.</p>
            {job && <p className={job.status === "ok" ? "text-good" : job.status === "failed" ? "text-critical" : "text-warn"}>Last run: {job.summary}</p>}
            <p>Plan: run the pull from home (the desktop build), since Garmin blocks cloud logins. Details in the playbook.</p>
          </div>
        </Section>
      </aside>
    </div>
  );
}
