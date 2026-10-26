import { renderBlock } from "@/components/blocks";
import { loadCtx } from "@/lib/ctx";

export const dynamic = "force-dynamic";

export default function Today() {
  const ctx = loadCtx();
  const { main, rail } = ctx.edition;
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-9">{main.map((b, i) => renderBlock(b, ctx, i))}</div>
      <aside className="flex min-w-0 flex-col gap-9 lg:pt-[92px]">{rail.map((b, i) => renderBlock(b, ctx, i))}</aside>
    </div>
  );
}
