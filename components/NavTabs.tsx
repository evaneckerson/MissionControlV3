"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/", "Today"],
  ["/week", "Week"],
  ["/courses", "Courses"],
  ["/library", "Library"],
  ["/body", "Body"],
  ["/money", "Money"],
] as const;

export default function NavTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Sections" className="-mb-px flex h-10 min-w-0 items-stretch gap-1 overflow-x-auto [scrollbar-width:none] sm:h-12">
      {tabs.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center border-b-2 px-2.5 text-[14px] no-underline first:pl-0 sm:first:pl-2.5 ${active ? "border-ink font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
