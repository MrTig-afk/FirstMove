from pydantic import BaseModel
from typing import Optional, List


class Card(BaseModel):
    id: str
    pack_id: str
    type: str
    text: str
    flavour: Optional[str] = None


class Pack(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    accent: str
    icon: Optional[str] = None
    mode: str = "party"
    cards: List[Card] = []
