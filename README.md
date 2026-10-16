FreeSun

## Crew Board (`dashboard.html`)

A bento-grid dashboard for the Free Sun balloon crew: crew roster, history, flight schedule and log,
Chatfield launch weather, crew chat and the Bacon Tracker. Built with vanilla TypeScript Web Components
in `src/dashboard/`, separate from the React club app.

```sh
npm run dev               # open http://localhost:5173/dashboard.html
npm run build             # builds both pages into dist/
npm run build:artifact    # single self-contained HTML for publishing as a claude.ai Artifact
```

Data sources (each tile shows a Live / Snapshot / Example chip):

| Tile | Live source | Fallback |
| --- | --- | --- |
| Weather | Open-Meteo, Chatfield State Park | bundled snapshot |
| Crew, fleet, schedule, log | club Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), read-only | bundled snapshot |
| History | Chatfield Balloon Port history + club site | static |
| Crew chat | none yet: WhatsApp has no group-read API | example messages; set `invite-url` on `<fs-chat>` to link the group |
| Bacon | link to the Bacon Tracker artifact | bundled snapshot |
