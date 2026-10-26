# Mission Control v2

A daily paper for one reader. What needs Evan, what Claude did, what is coming.

Read `PRODUCT.md` (what it is for) and `DESIGN.md` (how it looks, and why) before changing anything.

## Run it

```
npm install
node scripts/compose-edition.mjs   # writes data/edition.json for this morning
npm run dev                        # http://localhost:3000
```

Check before showing anyone: `npm run build && node scripts/shots.mjs`, then look at `shots/`.

## Deploy (free, private)

1. Import this repo at vercel.com/new (Hobby plan). Framework: Next.js, no settings needed.
2. In the project: Settings → Deployment Protection → turn on Vercel Authentication for all deployments. Only your Vercel login can open it.
3. On the phone: open the URL in Safari, Share → Add to Home Screen. It runs as its own app.

Or put it on the always-on server behind Cloudflare Access.

## Data

Everything the page shows is a JSON file in `data/`, written by jobs, read at request time:

| File | Written by | Holds |
| --- | --- | --- |
| `items.json` | Board refresh, Gmail → Calendar | exams, assignments, quizzes, decisions, drafts, todos |
| `work.json` | Site curator | everything Claude made, with links |
| `jobs.json` | every job | last run and 14-run history |
| `garmin.json` | Garmin pull (home PC) | per-day sleep, Body Battery, HRV, resting HR |
| `money.json` | SimpleFIN pull (mc-money) | months, categories, recent charges |
| `edition.json` | `scripts/compose-edition.mjs` or a Claude job | the block order for Today |
| `clock.json` | tests only | `{ "now": "ISO" }` to freeze time |

Shapes are in `lib/types.ts`. Jobs commit to this repo; Vercel redeploys on push.

## The edition

Today is composed, not fixed. `edition.json` lists blocks from the catalog in `components/blocks.tsx` (`masthead`, `exam`, `asks`, `agenda`, `activity`, `body`, `money`, `material`, `jobs-strip`) for the main column and the rail. The compose script picks a mode (exam-week, deadline-day, steady, weekend) from the data; a Claude job can write a different composition and the page will render it.
