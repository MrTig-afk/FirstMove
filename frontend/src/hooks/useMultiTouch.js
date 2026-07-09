import { useState, useRef, useCallback, useEffect } from 'react'

export const STATES = {
  IDLE: 'IDLE',
  WAITING: 'WAITING',
  COUNTDOWN: 'COUNTDOWN',
  CHOSEN: 'CHOSEN',
  CARD_DRAW: 'CARD_DRAW',
}

const HOLD_MS = 300
const COUNTDOWN_MS = 3000

/**
 * Cryptographically unbiased array pick using rejection sampling.
 *
 * Why rejection sampling:
 *   crypto.getRandomValues gives a uniform Uint32 (0–4294967295).
 *   Naively doing buf[0] % n introduces modulo bias whenever n doesn't
 *   divide 2^32 evenly (e.g. n=3: values 0,1 are ~1.4 in a billion more
 *   likely than 2). Rejection sampling discards values in the remainder
 *   region so the surviving values map to indices with equal probability.
 *   For n=2 there is no bias (2^32 % 2 === 0), but we use the same path
 *   everywhere for consistency.
 *
 * Selection rules:
 *   - 2 players: pure random from the full pool — same person can win
 *     back-to-back. No exclusion applied.
 *   - 3+ players: previous winner's touch ID is removed from the pool
 *     before picking, preventing immediate back-to-back repeats. The
 *     exclusion persists across rounds (lastWinnerIdRef is not reset on
 *     reset()) so the guard also covers the first pick of a new round.
 */
function cryptoPick(pool) {
  const n = pool.length
  // Largest multiple of n that fits in a Uint32, eliminating the biased tail
  const limit = Math.floor(0x100000000 / n) * n
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return pool[buf[0] % n]
}

export function useMultiTouch(onChosen) {
  const [fingers, setFingers] = useState(new Map())
  const [phase, setPhase] = useState(STATES.IDLE)
  const [chosenId, setChosenId] = useState(null)
  const [countdown, setCountdown] = useState(3)

  const holdTimer = useRef(null)
  const countdownTimer = useRef(null)
  const tickTimer = useRef(null)
  const fingersRef = useRef(fingers)
  const phaseRef = useRef(phase)
  const chosenIdRef = useRef(null)
  // ID of the last picked finger. Not reset between rounds so the 3+ exclusion
  // also prevents back-to-back at the start of the next round.
  const lastWinnerIdRef = useRef(null)
  fingersRef.current = fingers
  phaseRef.current = phase

  const clearTimers = useCallback(() => {
    clearTimeout(holdTimer.current)
    holdTimer.current = null
    clearTimeout(countdownTimer.current)
    countdownTimer.current = null
    clearInterval(tickTimer.current)
    tickTimer.current = null
  }, [])

  const startCountdown = useCallback(() => {
    setPhase(STATES.COUNTDOWN)
    setCountdown(3)

    tickTimer.current = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1))
    }, 1000)

    countdownTimer.current = setTimeout(() => {
      clearInterval(tickTimer.current)
      tickTimer.current = null
      const ids = [...fingersRef.current.keys()]
      if (ids.length < 2) {
        setPhase(STATES.WAITING)
        return
      }

      let winner
      if (ids.length === 2) {
        // 2 players: pure random, no exclusion — back-to-back is allowed
        winner = cryptoPick(ids)
      } else {
        // 3+ players: exclude previous winner to prevent immediate repeat
        const pool = lastWinnerIdRef.current !== null
          ? ids.filter(id => id !== lastWinnerIdRef.current)
          : ids
        // Safety fallback: if pool somehow emptied, use full list
        winner = cryptoPick(pool.length > 0 ? pool : ids)
      }

      lastWinnerIdRef.current = winner
      chosenIdRef.current = winner
      setChosenId(winner)
      setFingers(prev => {
        const next = new Map(prev)
        for (const [id, f] of next) {
          next.set(id, { ...f, state: id === winner ? 'chosen' : 'eliminated' })
        }
        return next
      })
      setPhase(STATES.CHOSEN)
      onChosen?.(winner, ids.indexOf(winner))
    }, COUNTDOWN_MS)
  }, [onChosen])

  const onStart = useCallback((e) => {
    e.preventDefault()
    if (phaseRef.current === STATES.CHOSEN) {
      const chosen = fingersRef.current.get(chosenIdRef.current)
      if (chosen) {
        for (const t of e.changedTouches) {
          const dx = t.clientX - chosen.x
          const dy = t.clientY - chosen.y
          if (Math.sqrt(dx * dx + dy * dy) < 70) {
            setPhase(STATES.CARD_DRAW)
            return
          }
        }
      }
      return
    }
    if (phaseRef.current === STATES.CARD_DRAW) return
    setFingers(prev => {
      const next = new Map(prev)
      for (const t of e.changedTouches) {
        next.set(t.identifier, { x: t.clientX, y: t.clientY, state: 'waiting' })
      }
      return next
    })
  }, [])

  const onEnd = useCallback((e) => {
    if (phaseRef.current === STATES.CHOSEN || phaseRef.current === STATES.CARD_DRAW) return
    setFingers(prev => {
      const next = new Map(prev)
      for (const t of e.changedTouches) {
        next.delete(t.identifier)
      }
      return next
    })
  }, [])

  const onMove = useCallback((e) => {
    if (phaseRef.current === STATES.CHOSEN || phaseRef.current === STATES.CARD_DRAW) return
    setFingers(prev => {
      const next = new Map(prev)
      for (const t of e.changedTouches) {
        if (next.has(t.identifier)) {
          next.set(t.identifier, { ...next.get(t.identifier), x: t.clientX, y: t.clientY })
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (phase === STATES.CHOSEN || phase === STATES.CARD_DRAW) return

    const count = fingers.size

    // 0 fingers → always IDLE, cancel any pending timers
    if (count === 0) {
      if (phase === STATES.COUNTDOWN) {
        clearTimers()
        setCountdown(3)
      }
      if (phase !== STATES.IDLE) setPhase(STATES.IDLE)
      if (holdTimer.current) {
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
      return
    }

    // Any finger present → leave IDLE and enter WAITING
    if (phase === STATES.IDLE) {
      setPhase(STATES.WAITING)
      return
    }

    // Countdown running but finger count dropped below 2 → abort, back to WAITING
    if (phase === STATES.COUNTDOWN && count < 2) {
      clearTimers()
      setPhase(STATES.WAITING)
      setCountdown(3)
      return
    }

    if (phase === STATES.WAITING) {
      if (count >= 2 && holdTimer.current === null) {
        // 2+ fingers held: start the brief hold timer, then fire countdown
        holdTimer.current = setTimeout(() => {
          holdTimer.current = null
          if (fingersRef.current.size >= 2) startCountdown()
        }, HOLD_MS)
      } else if (count < 2 && holdTimer.current !== null) {
        // Dropped back to 1 finger: cancel hold so countdown doesn't fire
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
    }
  }, [fingers, phase, clearTimers, startCountdown])

  const reset = useCallback(() => {
    clearTimers()
    setFingers(new Map())
    setPhase(STATES.IDLE)
    setChosenId(null)
    setCountdown(3)
    // lastWinnerIdRef intentionally preserved across resets for 3+ exclusion
  }, [clearTimers])

  const attach = useCallback((el) => {
    if (!el) return
    el.addEventListener('touchstart', onStart, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchmove', onMove)
    }
  }, [onStart, onEnd, onMove])

  return {
    fingers,
    phase,
    chosenId,
    countdown,
    attach,
    reset,
  }
}
