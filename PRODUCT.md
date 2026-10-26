# PRODUCT.md — Mission Control

One reader: Evan, BME senior at Ole Miss, graduating May 2027, using Claude across coursework, email, money and training.

## Jobs the page does

1. **What needs me.** Decisions Claude is waiting on, drafts waiting to send, assignments due or overdue. At most three on Home; everything on Week.
2. **What Claude did.** Study guides, plans, solutions and docs Claude produced, newest first, filterable by course.
3. **What is coming.** Exams with countdowns and rooms, due dates for 14 days, class changes.
4. **How I am.** One readiness sentence from the watch, four numbers, a week strip.
5. **Are the pipes working.** Which scheduled jobs ran, which failed, in one strip at the bottom of Home and a full table on Jobs.

## Never

- No sidebar, no to-do list, no week board (rejected Oct 15, Oct 20).
- No reading individual emails here; Inbox is a summary of asks, not messages (Oct 23).
- No marking complete in the page; Evan tells Claude in chat (Oct 23).
- No popups, usage notices, connector errors (Oct 21).
- Nothing that makes the morning longer (Oct 22).

## Views

| Route | Purpose | Data |
| --- | --- | --- |
| `/` Today | The edition: composed blocks for this moment | edition.json over items, work, jobs, garmin |
| `/week` | Everything dated for 14 days, grouped by day | items |
| `/courses` | Per-course: next exam, open work, Claude's material | items, work, courses |
| `/library` | Everything Claude made, by kind and course | work |
| `/body` | Garmin readiness, sleep, HRV, strain, week strip | garmin |
| `/money` | Spend this month vs last, recent charges, rules | money |
| `/jobs` | Scheduled jobs, last run, 14-run history | jobs |

## The edition (dynamic Home)

`data/edition.json` is written each morning (by the compose script today, by a Claude job later). It holds a `mode`, a headline sentence, and an ordered list of blocks drawn from the catalog in `lib/catalog.ts`. The app renders the blocks; it never decides the order itself. Modes:

- `exam-week`: an exam within 3 days. Exam card first, then study material for that course, then asks.
- `deadline-day`: something due today. Due list first, then asks.
- `steady`: asks first, then today's agenda, then Claude's work.
- `weekend`: Claude's work and the week ahead; no asks unless overdue.

## Data contract

All data is JSON under `data/`, written by jobs, read by server components. No database in v2.0; the always-on server and n8n write these files through git. Shapes are in `lib/types.ts`.
