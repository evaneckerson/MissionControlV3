# Mission Control v2

Before any UI work read, in this order: PRODUCT.md, DESIGN.md, lib/catalog.ts. The "Never" lists in both files are hard rules.

- Use only the components in `components/`; if one is missing, add it to the catalog first, then use it.
- All colors come from the tokens in `app/globals.css`. No hex values in components.
- After any visual change: `npm run build`, then `node scripts/shots.mjs`, and look at `shots/*.png` (desktop and phone, light and dark) before showing Evan.
- Data lives in `data/*.json`. Never hardcode example rows into components; empty states are designed in the component.
- Health numbers (data/garmin.json) never appear in commit messages, chat, or logs.
- Commit messages: imperative, one line, what changed for the reader.
