import { Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { relative } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jobs" };

const dot: Record<string, string> = { ok: "bg-good", partial: "bg-warn", failed: "bg-critical", skipped: "bg-rule" };

export default function Jobs() {
  const ctx = loadCtx();
  const jobs = [...ctx.jobs].sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <h1 className="display text-[36px] leading-none">Jobs</h1>
        <p className="max-w-[64ch] text-ink-2">Every scheduled pull and its last fourteen runs. A failed job means a section of Today is stale, not wrong.</p>
      </div>
      <Section title="Scheduled" aside={`${jobs.length} jobs`}>
        {jobs.map((j) => (
          <div key={j.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-rule py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot[j.last?.status ?? "skipped"]}`} aria-hidden />
              <span className="mono text-[13px]">{j.id}</span>
            </div>
            <div className="col-span-2 text-[14px] text-ink-2 sm:col-span-1">{j.last?.summary ?? "No run yet"}</div>
            <div className="flex items-center gap-3 sm:justify-end">
              <span className="flex gap-0.5" aria-label="Recent runs">
                {(j.history ?? []).slice(-14).map((r, i) => (
                  <span key={i} className={`inline-block h-3 w-1.5 rounded-sm ${dot[r.status] ?? "bg-rule"}`} title={`${r.at}: ${r.status}`} />
                ))}
              </span>
              <span className="mono text-[12px] text-ink-2">{j.last ? relative(j.last.at, ctx.now) : ""}</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
