# FirstMove

A social card game PWA for groups. Everyone places a finger on the screen, the app picks someone, and they draw a prompt from the deck.

**[Play it here](https://first-move-one.vercel.app/)**

## What It Does

- **Finger picker** — everyone puts a finger down and FirstMove randomly chooses who goes next.
- **Deck-based prompts** — pick a category, draw a card, and keep the round moving.
- **Party / Uni modes** — a toggle pill on the home screen switches between party decks and university-themed decks.
- **Deck mixing** — select two or more decks and play a combined shuffled session; the card header shows which deck each prompt came from.
- **Complete, skip, or redraw** — a 10-second timer keeps the round moving; redraw shuffles the current card back into the deck.
- **Shareable game recap** — session stats (completed, skipped, most-picked finger) via the native share sheet, with clipboard fallback.
- **Built for phones** — installable PWA made for quick group play straight from the browser.

### Decks

**🔥 Party mode**

| | Name | Description |
|---|---|---|
| 🌊 | **Icebreakers** | Get the conversation started |
| 🔍 | **Truth** | No filter. Just honesty |
| 🔥 | **Dares** | Put yourself out there |
| 💛 | **Compliments** | Say the thing you've been meaning to say |
| 💋 | **Dirty** | For the brave ones |
| 🌌 | **Deep** | Go somewhere real |
| 🎉 | **Party** | Everyone plays together |

**🎓 Uni mode**

| | Name | Description |
|---|---|---|
| ⚡ | **Debate** | Pick a side and argue it for 30 seconds |
| 🎒 | **Freshers** | First-year confessions and stories |
| 🌶️ | **Hot Takes** | Defend the opinion — even if you don't believe it |
| 🤔 | **Would You Rather** | Pick one. No dodging |

---

## Tech Stack

| | Layer | Technology |
|---|---|---|
| <img src="https://cdn.simpleicons.org/react/61DAFB" width="20"/> | Frontend | React 19, Vite 8, Tailwind CSS v4 |
| <img src="https://cdn.simpleicons.org/pwa/5A0FC8" width="20"/> | PWA | vite-plugin-pwa, Workbox |
| <img src="https://cdn.simpleicons.org/fastapi/009688" width="20"/> | Backend | FastAPI (Python), Mangum (ASGI → serverless) |
| <img src="https://cdn.simpleicons.org/postgresql/4169E1" width="20"/> | Database | Neon (PostgreSQL), asyncpg |
| <img src="https://cdn.simpleicons.org/vercel/ffffff" width="20"/> | Hosting | Vercel (static + Python serverless functions) |

---

## Architecture

```
deck JSONs  →  seed script  →  Neon Postgres  →  FastAPI /api/packs  →  React
(private)      (private)       (packs, cards)    (1h in-memory cache)
```

- The FastAPI app is wrapped with **Mangum** and deployed as a single Vercel Python serverless function; `vercel.json` rewrites `/api/*` to it.
- `/api/packs?mode=party|university` returns each pack with its full metadata (`name`, `description`, `accent`, `icon`, `mode`) and cards. Responses are cached in-memory for 1 hour per warm lambda instance.
- API-key auth, per-IP rate limiting (slowapi), strict CSP/security headers, and CORS locked to the deployed origin.
- Ops alerts via **ntfy** on a single private topic: errors (500s, DB failures, slow queries), security probes (bad API keys, 404s, malformed ids — per-IP cooldown), cold-start and daily-alive pings, and a once-per-device-per-day "player active" signal.

## Content as data

Deck content is the single source of truth — **all** display metadata (name, icon, accent color) flows from the JSON through the database to the UI. The `content/` folder and seeding script are not in this repo (the decks are the product — they stay private); the schema below shows the shape. Adding or editing a deck requires **zero frontend changes**:

1. Edit or add a deck JSON (kept privately)
2. Re-run the seed script to upsert it into Postgres

Prod picks up the change when the API cache expires (up to 1 hour) or on the next cold start.

Pack schema:

```json
{
  "id": "icebreakers",
  "name": "Icebreakers",
  "description": "Get the conversation started.",
  "accent": "#00eefc",
  "icon": "🌊",
  "mode": "party",
  "cards": [
    { "id": "ice_01", "type": "challenge", "text": "…", "flavour": "…" }
  ]
}
```

Card `type` is `"challenge"` for normal prompts; `"hard_pass"` cards are filtered out of playable decks.

## Engineering details

- **Fair finger picker** — `crypto.getRandomValues` with rejection sampling to eliminate modulo bias; with 3+ players the previous winner is excluded from the pool to prevent back-to-back picks.
- **2-finger minimum** — the countdown only starts when at least 2 players have a finger down.
- **10-second card timer** — countdown badge coloured to match the active deck, goes red at ≤3s, auto-skips on expiry with a toast.
- **Session reset on close** — all session state fully resets on background/close so the next open starts fresh.
- **Deck mixing** — mixed sessions tag each card with its origin deck's name/icon/accent so the card header stays accurate per draw.
- **Haptic on finger reveal** — 400ms vibration when the chosen finger is revealed (Android; iOS doesn't support the Vibration API).

## Run locally

**Backend** (from `api/`):

```bash
pip install -r requirements.txt
# .env: DATABASE_URL=<neon url>, API_KEY=<key>, DEV_MODE=true
# ops alerts (optional): NTFY_TOPIC=<private topic name>
uvicorn index:app --reload
```

**Frontend** (from `frontend/`):

```bash
npm install
# .env.local: VITE_API_URL=http://localhost:8000, VITE_API_KEY=<key>
npm run dev
```

**Seed the database**: the deck JSONs and seed script live outside this repo — the app reads whatever `packs`/`cards` rows exist in Postgres, so any seeding method that matches the schema above works.
