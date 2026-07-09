const BASE = import.meta.env.VITE_API_URL
const KEY = import.meta.env.VITE_API_KEY
const h = { 'Content-Type': 'application/json', 'X-API-Key': KEY }

export const fetchPacks = (mode = 'party') =>
  fetch(`${BASE}/api/packs?mode=${mode}`, { headers: h }).then(r => {
    if (!r.ok) throw new Error(r.status)
    return r.json()
  })

export const fetchPack = (id) =>
  fetch(`${BASE}/api/packs/${id}`, { headers: h }).then(r => {
    if (!r.ok) throw new Error(r.status)
    return r.json()
  })
