import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.environ["DATABASE_URL"],
            min_size=1,
            max_size=5,
            ssl="require",
        )
    return _pool
