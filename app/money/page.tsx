import { Empty, Row, Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { fmtDay } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Money" };

export default function Money() {
  const ctx = loadCtx();
  const m = ctx.money;
  const cur = m.months.at(-1);
  const prev = m.months.at(-2);
  const job = ctx.jobs.find((j) => j.id === "money-sync")?.last;
  const cats = cur ? Object.entries(cur.byCategory).sort((a, b) => b[1] - a[1]) : [];
  const max = cats[0]?.[1] ?? 1;
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-9">
        <h1 className="display text-[36px] leading-none">Money</h1>
        {!cur ? (
          <div className="rounded-[10px] border border-rule bg-paper-2 px-5 py-5">
            <div className="eyebrow">This month</div>
            <div className="display mt-2 text-[24px]">Waiting for the money pull.</div>
            <p className="mt-2 text-[14px] text-ink-2">The SimpleFIN job in mc-money runs daily{job?.summary ? ` (${job.summary.toLowerCase()})` : ""}. Once it writes <span className="mono">data/money.json</span>, this shows spend against last month, income, categories as hatched bars, and recent charges with the rule that categorised each one.</p>
          </div>
        ) : (
          <>
            <div className="rounded-[10px] bg-accent px-5 py-5 text-accent-ink">
              <div className="eyebrow text-accent-ink/70">{cur.month}</div>
              <div className="display mt-2 text-[36px] leading-none">${cur.spent.toLocaleString()} spent</div>
              <div className="mt-2 text-[14px] text-accent-ink/70">{prev ? `Last month ${prev.spent.toLocaleString()} · ` : ""}Income ${cur.income.toLocaleString()}</div>
            </div>
            <Section title="Categories">
              {cats.map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 py-2">
                  <span className="w-32 shrink-0 text-[14px]">{k}</span>
                  <span className="hatch h-3 text-accent" style={{ width: `${(v / max) * 100}%` }} />
                  <span className="mono ml-auto text-[13px]">${v.toLocaleString()}</span>
                </div>
              ))}
            </Section>
          </>
        )}
        <Section title="Recent charges">
          {!m.recent?.length && <Empty>Charges list here with merchant, amount and category.</Empty>}
          {m.recent?.map((r, i) => (
            <Row key={i} title={r.merchant} sub={r.category} right={`$${r.amount.toFixed(2)} · ${fmtDay(new Date(r.date))}`} />
          ))}
        </Section>
      </div>
      <aside className="flex flex-col gap-9 lg:pt-[52px]">
        <Section title="Rules">
          <Empty>Each new merchant gets researched once and a rule written; the rule, not a guess, sets the category. Rules show here when the first one exists.</Empty>
        </Section>
      </aside>
    </div>
  );
}
