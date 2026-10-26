import Link from "next/link";
import { getJobs, now, relative } from "@/lib/data";
import NavTabs from "./NavTabs";

export default function TopBar() {
  const jobs = getJobs();
  const t = now();
  const failed = jobs.filter((j) => j.last?.status === "failed").length;
  const latest = jobs.map((j) => j.last?.at).filter(Boolean).sort().at(-1);
  const tone = failed === 0 ? "bg-good" : failed <= 2 ? "bg-warn" : "bg-critical";
  return (
    <header className="sticky z-10 -mx-[max(16px,env(safe-area-inset-left,0px))] border-b border-rule bg-paper px-[max(16px,env(safe-area-inset-left,0px))]" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto grid max-w-[1120px] grid-cols-[1fr_auto] items-center gap-x-4 sm:flex sm:h-12">
        <Link href="/" className="display h-11 shrink-0 self-center text-[19px] leading-[44px] no-underline sm:h-auto sm:leading-none">
          Mission Control
        </Link>
        <Link href="/jobs" className="flex shrink-0 items-center gap-2 text-[12px] text-ink-2 no-underline hover:text-ink sm:order-last sm:ml-auto" title={failed ? `${failed} jobs failed` : "All jobs ran"}>
          <span className={`inline-block h-2 w-2 rounded-full ${tone}`} aria-hidden />
          <span className="mono">{latest ? `synced ${relative(latest, t)}` : "no runs yet"}</span>
        </Link>
        <div className="col-span-2 -mx-[max(16px,env(safe-area-inset-left,0px))] px-[max(16px,env(safe-area-inset-left,0px))] sm:col-span-1 sm:mx-0 sm:px-0">
          <NavTabs />
        </div>
      </div>
    </header>
  );
}
