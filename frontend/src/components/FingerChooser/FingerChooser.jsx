import React, { useRef, useEffect } from 'react'
import { useMultiTouch, STATES } from '../../hooks/useMultiTouch'

const ACCENT_COLORS = ['#ecb2ff', '#00eefc', '#e7006e', '#FFD700', '#FF6B35', '#4169E1', '#ffb1c3']

export default function FingerChooser({ packAccent, onCardDraw, onBack }) {
  const zoneRef = useRef(null)

  const { fingers, phase, countdown, attach, reset } = useMultiTouch()

  useEffect(() => {
    if (!zoneRef.current) return
    return attach(zoneRef.current)
  }, [attach])

  useEffect(() => {
    if (phase === STATES.CHOSEN) {
      try { if ('vibrate' in navigator) navigator.vibrate(400) } catch {}
    }
  }, [phase])

  useEffect(() => {
    if (phase === STATES.CARD_DRAW) {
      onCardDraw?.()
      reset()
    }
  }, [phase, onCardDraw, reset])

  const fingerList = [...fingers.entries()]
  const accent = packAccent ?? '#ecb2ff'

  const statusText = (() => {
    if (phase === STATES.WAITING) {
      return fingers.size < 2
        ? 'Add at least one more player'
        : `${fingers.size} fingers — hold still…`
    }
    if (phase === STATES.CHOSEN) return 'Tap the glowing dot to draw'
    if (phase === STATES.CARD_DRAW) return 'Drawing…'
    return ''
  })()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-floor)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        position: 'relative',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingLeft: 'var(--safe-margin)',
        paddingRight: 'var(--safe-margin)',
        paddingBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 30,
        minHeight: '64px',
      }}>
        <button
          onClick={() => { reset(); onBack?.() }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--on-surface-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            cursor: 'pointer',
            minHeight: '56px',
            minWidth: '56px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Back
        </button>
        {statusText ? (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            color: 'var(--on-surface)',
            margin: 0,
            fontSize: '16px',
          }}>
            {statusText}
          </p>
        ) : null}
      </div>

      {/* Touch zone */}
      <div
        ref={zoneRef}
        className="finger-zone"
        style={{ flex: 1, position: 'relative' }}
      >
        {/* IDLE — big centred instruction */}
        {phase === STATES.IDLE && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            gap: '20px',
            padding: '0 32px',
          }}>
            <span style={{
              fontSize: 'clamp(72px, 22vw, 110px)',
              opacity: 0.12,
              lineHeight: 1,
            }}>
              ✋
            </span>
            <p style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: 'clamp(20px, 5.5vw, 26px)',
              color: 'var(--on-surface)',
              textAlign: 'center',
              opacity: 0.7,
              margin: 0,
              lineHeight: 1.3,
            }}>
              Everyone place a finger on the screen
            </p>
          </div>
        )}

        {/* Finger dots */}
        {fingerList.map(([id, f], idx) => {
          const isChosen = f.state === 'chosen'
          const isElim = f.state === 'eliminated'

          if (isElim) return null

          const color = isChosen ? accent : ACCENT_COLORS[idx % ACCENT_COLORS.length]
          const size = isChosen ? '140px' : '90px'

          return (
            <div
              key={id}
              style={{
                position: 'fixed',
                left: f.x,
                top: f.y,
                transform: 'translate(-50%, -50%)',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `${color}55`,
                border: `${isChosen ? '4px' : '2.5px'} solid ${color}`,
                boxShadow: isChosen
                  ? `0 0 60px ${color}, 0 0 120px ${color}88, inset 0 0 30px ${color}44`
                  : `0 0 24px ${color}99, 0 0 48px ${color}44`,
                transition: 'all 0.25s ease',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isChosen ? 20 : 10,
              }}
            >
              {isChosen && (
                <span style={{
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 900,
                  fontSize: '15px',
                  color,
                  letterSpacing: '0.05em',
                }}>
                  YOU
                </span>
              )}
            </div>
          )
        })}

        {/* Countdown — fixed to true screen centre */}
        {phase === STATES.COUNTDOWN && (
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 5,
          }}>
            <span style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 900,
              fontSize: 'clamp(120px, 35vw, 180px)',
              color: accent,
              lineHeight: 1,
              animation: 'pulse 1s ease-in-out infinite',
            }}>
              {Math.max(0, countdown)}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
