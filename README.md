# FirstMove

A social card game for groups, played on one phone. Everyone places a finger on the screen, the app picks someone, and they draw a prompt from the deck.

**[Play it here](https://first-move-one.vercel.app/)**

No download, no signup. Open the link on a phone and play.

## How to play

1. Open the app and pick a deck (or several: selecting two or more decks shuffles them together).
2. Everyone puts a finger on the screen. With at least 2 fingers down, a countdown starts.
3. The app randomly picks one finger. That player draws a card.
4. Read the prompt out loud and do it. You have 10 seconds to decide: complete it, skip it, or redraw.
5. Keep going. At the end you get a game recap (cards completed, skipped, and the most-picked player) that you can share.

**Tip:** for the best experience, add FirstMove to your home screen. In your phone browser, choose "Add to Home Screen" and it installs like a regular app and works full-screen.

Playing with coursemates? Switch the toggle on the home screen from Party to Uni for university-themed decks.

## Decks

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
| 🌶️ | **Hot Takes** | Defend the opinion, even if you don't believe it |
| 🤔 | **Would You Rather** | Pick one. No dodging |

---

## For developers

FirstMove is a portfolio project. The card decks themselves are private and are not in this repo: the app reads them from a database, and this repo contains only the code.

**Stack:** React 19 + Vite 8 + Tailwind v4 PWA frontend, FastAPI (Python) backend running as a Vercel serverless function, Neon Postgres for deck storage.

```
deck JSONs  ->  seed script  ->  Neon Postgres  ->  FastAPI /api/packs  ->  React
 (private)      (private)       (packs, cards)     (1h in-memory cache)
```

The API uses key auth, per-IP rate limiting, strict security headers, and CORS locked to the deployed origin. Decks are fully data-driven: name, icon, and accent color all flow from the database to the UI, so adding a deck requires zero frontend changes.

### Run it locally

You will need your own Neon (or any Postgres) database with `packs` and `cards` tables matching the schema below, seeded with your own content.

Backend, from `api/`:

```bash
pip install -r requirements.txt
# .env: DATABASE_URL=<postgres url>, API_KEY=<any string>, DEV_MODE=true
uvicorn index:app --reload
```

Frontend, from `frontend/`:

```bash
npm install
# .env.local: VITE_API_URL=http://localhost:8000, VITE_API_KEY=<same string>
npm run dev
```

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
    { "id": "ice_01", "type": "challenge", "text": "...", "flavour": "..." }
  ]
}
```
