import type { Ctx } from "@/components/blocks";
import { getEdition, getGarmin, getItems, getJobs, getMoney, getWork, now } from "./data";
import type { Edition } from "./types";

const fallback: Edition = {
  composedAt: new Date(0).toISOString(),
  mode: "steady",
  number: 0,
  main: [{ type: "masthead" }, { type: "asks", limit: 3 }, { type: "agenda", days: 2 }, { type: "activity", hours: 48 }, { type: "jobs-strip" }],
  rail: [{ type: "body", accent: true }, { type: "money" }],
};

export function loadCtx(): Ctx {
  return { now: now(), items: getItems(), work: getWork(), jobs: getJobs(), garmin: getGarmin(), money: getMoney(), edition: getEdition() ?? fallback };
}
