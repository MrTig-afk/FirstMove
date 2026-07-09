import { useState, useEffect, useCallback } from 'react'
import { fetchPacks } from '../services/api'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SESSION_KEY = `firstmove_session_${Date.now()}`

export function useCardDeck(mode = 'party') {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPack, setCurrentPack] = useState(null)
  const [deck, setDeck] = useState([])
  const [deckIndex, setDeckIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    skipped: 0,
    pickCounts: {},
  })

  useEffect(() => {
    setLoading(true)
    fetchPacks(mode)
      .then(data => { setPacks(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [mode])

  useEffect(() => {
    if (sessionStats.completed > 0 || sessionStats.skipped > 0) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionStats))
    }
  }, [sessionStats])

  const selectPack = useCallback((pack) => {
    setCurrentPack(pack)
    setDeck(shuffle(pack.cards.filter(c => c.type !== 'hard_pass')))
    setDeckIndex(0)
  }, [])

  const currentCard = deck[deckIndex] ?? null
  const remaining = deck.length - deckIndex

  const draw = useCallback(() => {
    setDeckIndex(i => Math.min(i + 1, deck.length))
  }, [deck.length])

  const complete = useCallback((fingerIndex) => {
    setSessionStats(s => ({
      ...s,
      completed: s.completed + 1,
      pickCounts: {
        ...s.pickCounts,
        [fingerIndex]: (s.pickCounts[fingerIndex] ?? 0) + 1,
      },
    }))
    draw()
  }, [draw])

  const skip = useCallback(() => {
    setSessionStats(s => ({ ...s, skipped: s.skipped + 1 }))
    draw()
  }, [draw])

  const newCard = useCallback(() => {
    draw()
  }, [draw])

  const reset = useCallback(() => {
    if (currentPack) {
      setDeck(shuffle(currentPack.cards.filter(c => c.type !== 'hard_pass')))
      setDeckIndex(0)
    }
    setSessionStats({ completed: 0, skipped: 0, pickCounts: {} })
  }, [currentPack])

  const redraw = useCallback(() => {
    setDeck(d => {
      const card = d[deckIndex]
      const before = d.slice(0, deckIndex)
      const rest = d.slice(deckIndex + 1)
      if (rest.length === 0) return d
      const insertAt = Math.floor(Math.random() * rest.length) + 1
      return [...before, ...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]
    })
  }, [deckIndex])

  const selectMixedPacks = useCallback((packsList) => {
    const allCards = packsList.flatMap(p =>
      p.cards
        .filter(c => c.type !== 'hard_pass')
        .map(c => ({ ...c, id: `${p.id}_${c.id}`, packId: p.id, packName: p.name, packIcon: p.icon, packAccent: p.accent }))
    )
    setCurrentPack({ id: 'mix', name: 'Mix', icon: '🔀', accent: '#ecb2ff', cards: allCards })
    setDeck(shuffle(allCards))
    setDeckIndex(0)
  }, [])

  const isDeckExhausted = deck.length > 0 && deckIndex >= deck.length

  return {
    packs,
    loading,
    error,
    currentPack,
    selectPack,
    selectMixedPacks,
    currentCard,
    deckIndex,
    remaining,
    complete,
    skip,
    newCard,
    redraw,
    reset,
    sessionStats,
    isDeckExhausted,
  }
}
