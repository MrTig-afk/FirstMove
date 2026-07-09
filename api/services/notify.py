import httpx
import os
import sys
import time
from datetime import datetime, timezone

NTFY = "https://ntfy.sh"
TOPIC = os.getenv("NTFY_TOPIC", "")

if not TOPIC:
    print("WARNING: NTFY_TOPIC not set — alerts will be silently dropped", file=sys.stderr)

_first_request_today = {"date": None}
_active_today = {"date": None, "ips": set()}
_security_cooldown: dict[str, float] = {}
_COOLDOWN_SECONDS = 60
_MAX_COOLDOWN_ENTRIES = 1000
_MAX_ACTIVE_ENTRIES = 10000


async def notify_error(title: str, body: str, priority: str = "high"):
    await _post(title, body, priority)


async def notify_security(title: str, body: str, ip: str = ""):
    now = time.monotonic()
    last = _security_cooldown.get(ip, 0)
    if now - last < _COOLDOWN_SECONDS:
        return
    if len(_security_cooldown) >= _MAX_COOLDOWN_ENTRIES:
        _security_cooldown.clear()
    _security_cooldown[ip] = now
    await _post(title, f"{body}\nIP: {ip}", "default")


async def notify_cold_start():
    await _post("Cold start", "FirstMove serverless function woke up", "low")


async def notify_daily_alive():
    today = datetime.now(timezone.utc).date().isoformat()
    if _first_request_today["date"] != today:
        _first_request_today["date"] = today
        await _post("Daily alive", f"FirstMove active — {today}", "low")


async def notify_active_player(ip: str):
    today = datetime.now(timezone.utc).date().isoformat()
    if _active_today["date"] != today:
        _active_today["date"] = today
        _active_today["ips"] = set()
    if ip in _active_today["ips"] or len(_active_today["ips"]) >= _MAX_ACTIVE_ENTRIES:
        return
    _active_today["ips"].add(ip)
    n = len(_active_today["ips"])
    await _post("Player active 👋", f"{n} player{'s' if n != 1 else ''} today", "low")


# ntfy JSON publish endpoint — HTTP headers are latin-1 only, so emoji-bearing
# titles must go in the JSON body, not a Title header.
_PRIORITY = {"low": 2, "default": 3, "high": 4}

# One-line plain-English explainer appended to each alert, keyed by title.
_EXPLAIN = {
    "500 error 🚨": "Something crashed while handling a request — details above.",
    "DB failure 🚨": "A database query failed — Neon may be down or unreachable.",
    "Slow DB query ⚠️": "The database responded slowly — usually a cold Neon wake-up; fine if rare.",
    "GET /packs failed 🚨": "Deck loading broke — players are seeing the 'Couldn't load decks' screen.",
    "Wrong API key 🔒": "Someone called the API with a bad key — likely a bot or someone poking around.",
    "404 hit 🔒": "Someone requested an API path that doesn't exist — usually internet scanners.",
    "Suspicious pack_id 🔒": "Someone sent a malformed deck id — likely probing for vulnerabilities.",
    "Pack not found probe? 🔒": "Someone requested a deck id that doesn't exist — could be a probe or a stale client.",
    "Cold start": "The server booted fresh after being idle — someone used the app after a quiet spell.",
    "Daily alive": "First request of the day — the app got used today.",
    "Player active 👋": "A device opened the app for the first time today — count = today's unique players.",
}


async def _post(title: str, body: str, priority: str):
    if not TOPIC:
        return
    explain = _EXPLAIN.get(title)
    if explain:
        body = f"{body}\n\nℹ️ {explain}"
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            await c.post(
                NTFY,
                json={
                    "topic": TOPIC,
                    "title": title,
                    "message": body,
                    "priority": _PRIORITY.get(priority, 3),
                },
            )
    except Exception:
        pass
