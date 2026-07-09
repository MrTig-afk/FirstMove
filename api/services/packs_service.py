import time
import traceback
from datetime import datetime, timedelta, timezone

from db import get_pool
from services.notify import notify_error

_cache = {"data": None, "expires_at": None}
CACHE_TTL = 3600


async def get_all_packs(mode: str = "party"):
    now = datetime.now(timezone.utc)
    if _cache["data"] and _cache["expires_at"] > now:
        result = _cache["data"]
    else:
        try:
            t0 = time.monotonic()
            pool = await get_pool()
            async with pool.acquire() as conn:
                packs = await conn.fetch(
                    "SELECT id, name, description, accent, icon, mode, created_at FROM packs ORDER BY created_at"
                )
                cards = await conn.fetch(
                    "SELECT id, pack_id, type, text, flavour FROM cards ORDER BY pack_id, id"
                )
            elapsed = time.monotonic() - t0
            if elapsed > 2:
                await notify_error(
                    "Slow DB query ⚠️",
                    f"get_all_packs took {elapsed:.1f}s",
                    priority="default",
                )
            card_map = {}
            for c in cards:
                card_map.setdefault(c["pack_id"], []).append(dict(c))
            result = [{**dict(p), "cards": card_map.get(p["id"], [])} for p in packs]
            _cache["data"] = result
            _cache["expires_at"] = now + timedelta(seconds=CACHE_TTL)
        except Exception:
            await notify_error("DB failure 🚨", traceback.format_exc()[:500])
            raise
    return [p for p in result if p.get("mode", "party") == mode]
