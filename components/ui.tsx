import Link from "next/link";
import type { ReactNode } from "react";

export function Section({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
        <h2 className="eyebrow">{title}</h2>
        {aside && <span className="mono text-[12px] text-ink-2">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** One list row: text left, mono value right. The only row shape in the app. */
export function Row({ href, title, sub, right, tone, external }: { href?: string; title: ReactNode; sub?: ReactNode; right?: ReactNode; tone?: "critical" | "warn" | "good"; external?: boolean }) {
  const toneCls = tone === "critical" ? "text-critical" : tone === "warn" ? "text-warn" : tone === "good" ? "text-good" : "text-ink-2";
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-snug">{title}</div>
        {sub && <div className="mt-0.5 truncate text-[13px] text-ink-2">{sub}</div>}
      </div>
      {right !== undefined && <div className={`mono shrink-0 pl-3 text-right text-[13px] ${toneCls}`}>{right}</div>}
    </>
  );
  const cls = "flex items-start gap-2 border-b border-rule py-3 last:border-b-0 no-underline";
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener" className={`${cls} hover:bg-paper-2`}>{inner}</a>
    ) : (
      <Link href={href} className={`${cls} hover:bg-paper-2`}>{inner}</Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-3 text-[14px] text-ink-2">{children}</p>;
}

export function Course({ id }: { id?: string | null }) {
  if (!id) return null;
  return <span className="mono text-[12px] text-ink-2">{id}</span>;
}
