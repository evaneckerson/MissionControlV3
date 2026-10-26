import Link from "next/link";
import { Course, Empty, Row, Section } from "@/components/ui";
import { loadCtx } from "@/lib/ctx";
import { fmtDay } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Library" };

const kinds: [string, string][] = [["guide", "Study guides"], ["solutions", "Solutions"], ["plan", "Plans"], ["study", "Study notes"], ["explainer", "Explainers"], ["doc", "Docs"], ["chat", "Chats"]];

export default async function Library({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const ctx = loadCtx();
  const { course } = await searchParams;
  const all = ctx.work.filter((w) => !course || w.course === course);
  const courses = [...new Set(ctx.work.map((w) => w.course).filter(Boolean))] as string[];
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="display text-[36px] leading-none">Library</h1>
        <p className="max-w-[64ch] text-ink-2">Everything Claude has made for you, {ctx.work.length} pieces, newest first.</p>
        <div className="flex flex-wrap gap-1.5 text-[13px]">
          <Link href="/library" className={`rounded-full border px-3 py-1 no-underline ${!course ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:text-ink"}`}>All</Link>
          {courses.sort().map((c) => (
            <Link key={c} href={`/library?course=${encodeURIComponent(c)}`} className={`mono rounded-full border px-3 py-1 no-underline ${course === c ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:text-ink"}`}>{c}</Link>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-9 md:grid-cols-2">
        {kinds.map(([k, label]) => {
          const rows = all.filter((w) => (k === "chat" ? w.type === "chat" : w.kind === k));
          if (rows.length === 0) return null;
          return (
            <Section key={k} title={label} aside={String(rows.length)}>
              {rows.slice(0, 12).map((w) => (
                <Row key={w.id} href={w.url} external title={w.title} sub={<Course id={w.course} />} right={fmtDay(new Date(w.at))} />
              ))}
            </Section>
          );
        })}
        {all.length === 0 && <Empty>Nothing filed yet.</Empty>}
      </div>
    </div>
  );
}
