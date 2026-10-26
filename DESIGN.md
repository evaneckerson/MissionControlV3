# DESIGN.md — Mission Control

Mission Control is a daily paper for one reader. It is read once in the morning, glanced at during the day, and never "managed". Every screen answers one of three questions: what needs me, what Claude did, what is coming.

## References (decided Oct 26, 2026)

Kept, and what each one contributes:

| Reference | Take from it |
| --- | --- |
| Dia, "The Tuesday Brief" | The home screen is a document, not a grid. "Your day" is a short list with times. One sticker-style action, not a toolbar. |
| Attio Home | Greeting plus today's agenda first; the ask box is the only input on the page. |
| Linear | Density without noise. Claude's work is an activity feed: actor, verb, object, time. Hairline rules, no cards inside cards. |
| Athlytic and Garmin Connect | Body is one sentence in words, then four small numbers. A ring only where there is a score out of 100. |
| Fernwood Fit (Apple HIG) | Today / This week / Recent segmentation; mono times right-aligned; light and dark given equal care. |
| FinGuard | One accent card per screen at most; hatched fills instead of gradients; transactions as a plain table. |
| Flighty | Status written as plain sentences ("Exam moved to Brevard 134"), never as a badge alone. |

Excluded, and why:

- Any left sidebar. Reads as Claude's own window (rejected Oct 20).
- SaaS stat-tile grids with a chart in the middle (Command OS, Nexila). Generic; the first version looked like this.
- Sci-fi control rooms (OrbitTrack, Digital Twin, F1 telemetry). Fun to look at, tiring to live in.
- Glass, gradients, glow (Zecco, PulseIQ, Rize hero). Dates fast; hard in dark mode.
- Mascots and illustration (Family, Gentler Streak, FocusFlow). Personality comes from type and copy instead.
- The exam-guide look (rejected Oct 19). Those pages are for studying; this page is for deciding.
- Brutalist RAGE. Right spirit, too loud at 7 AM.

## Tokens

Color. Paper and ink, with Ole Miss navy as the one accent and red reserved for exams and failures.

| Token | Light | Dark |
| --- | --- | --- |
| --paper | #f7f7f4 | #0f1114 |
| --paper-2 (raised) | #ffffff | #161a20 |
| --ink | #15171a | #e9e8e3 |
| --ink-2 (secondary) | #5f6368 | #9aa0a6 |
| --rule | #dadbd6 | #262b33 |
| --accent (navy) | #14213d | #9db4ff |
| --accent-ink (text on accent) | #ffffff | #0f1114 |
| --good | #1f7a4d | #5fc48e |
| --warn | #9a6700 | #e3b341 |
| --critical (exam, failure) | #b3261e | #ff7b72 |

Type. Three roles, no more.

- Display: Newsreader (Google Fonts), optical size on, weights 400 and 500. Masthead date, page titles, the readiness sentence. Never below 22px.
- Text: Geist, 400 and 500. Body 15px/1.5 on desktop, 16px on phone. Running text max 64ch.
- Data: Geist Mono, 400 and 500. Times, counts, money, course codes. Always `font-variant-numeric: tabular-nums`.
- Eyebrows: Geist 12px, uppercase, letter-spacing 0.08em, --ink-2.

Space. 4px base. Section gap 40px desktop / 28px phone. Row padding 12px. Gutter max(16px, safe-area).

Shape. Radius 6px on controls, 10px on the single accent card, 999px on pills. Borders are 1px --rule. No shadows except the sticky bar's 1px bottom rule.

Motion. 150ms ease-out on hover and tab changes. Content never animates in; the page is complete on first paint. Respect prefers-reduced-motion.

## Layout rules

1. Top bar, not sidebar: wordmark, horizontal tabs, sync dot. Sticky.
2. Home is composed from `data/edition.json` (see PRODUCT.md). Blocks stack in one column up to 720px, then the secondary blocks move to a 320px right rail.
3. "Needs you" never shows more than three items. The rest live on Week.
4. Every list row: left text, right mono time or count. Nothing else in the row.
5. One accent surface per screen. On Home it is the readiness or exam card, whichever the edition chose.
6. Empty states say what will appear and which job fills it. No spinners.

## Never

- Sidebar navigation, nested cards, card grids of equal tiles.
- Gradients, glass blur, glows, drop shadows on cards.
- Purple-to-blue anything; Inter as the text face; emoji as section markers.
- Badges as the only status; write the sentence.
- Popups, toasts, confirmations. The page never asks the reader to click OK.
- Marking things done in the page. Done-ness comes from the data (Blackboard, email, Claude).
- Health numbers in chat or logs; they live in `data/garmin.json` only.
