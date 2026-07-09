import re
import traceback

from fastapi import APIRouter, Depends, HTTPException, Request

from security import limiter, verify_api_key, get_client_ip
from services.notify import (
    notify_active_player,
    notify_cold_start,
    notify_daily_alive,
    notify_error,
    notify_security,
)
from services.packs_service import get_all_packs

_PACK_ID_RE = re.compile(r'^[a-z0-9_-]{1,50}$')

router = APIRouter(prefix="/api", dependencies=[Depends(verify_api_key)])
_started = False


@router.get("/health")
@limiter.limit("10/minute")
async def health(request: Request):
    global _started
    if not _started:
        _started = True
        await notify_cold_start()
    await notify_daily_alive()
    return {"status": "ok"}


@router.get("/packs")
@limiter.limit("60/minute;500/day")
async def list_packs(request: Request, mode: str = "party"):
    try:
        await notify_active_player(get_client_ip(request))
        return await get_all_packs(mode=mode)
    except Exception:
        await notify_error("GET /packs failed 🚨", traceback.format_exc()[:500])
        raise HTTPException(status_code=500, detail="Internal error")


@router.get("/packs/{pack_id}")
@limiter.limit("60/minute;500/day")
async def get_pack(request: Request, pack_id: str):
    if not _PACK_ID_RE.match(pack_id):
        await notify_security(
            "Suspicious pack_id 🔒",
            f"pack_id={pack_id}",
            get_client_ip(request),
        )
        raise HTTPException(status_code=400, detail="Invalid pack id")
    packs = await get_all_packs()
    pack = next((p for p in packs if p["id"] == pack_id), None)
    if not pack:
        await notify_security(
            "Pack not found probe? 🔒",
            f"pack_id={pack_id}",
            get_client_ip(request),
        )
        raise HTTPException(status_code=404, detail="Not found")
    return pack
