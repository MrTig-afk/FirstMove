import React, { useState, useEffect, useRef } from 'react'

const TIMER_TOTAL = 10

export default function CardReveal({ card, pack, onComplete, onNewCard, onRedraw, onEndGame, onBack, showRedraw }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL)
  const [toast, setToast] = useState(null) // null | 'skipped'
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const expiryFiredRef = useRef(false)

  // Countdown tick
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  // Timer expiry — auto-skip to the next card
  useEffect(() => {
    if (timeLeft !== 0 || expiryFiredRef.current) return
    expiryFiredRef.current = true
    setToast('skipped')
    const id = setTimeout(onNewCard, 1500)
    return () => clearTimeout(id)
  }, [timeLeft, onNewCard])

  if (!card) return null

  // Mix-mode cards carry their origin deck's display data; normal cards fall through to the pack
  const label = card.packName ?? pack?.name ?? ''
  const icon = card.packIcon ?? pack?.icon ?? '🃏'
  const accent = card.packAccent ?? pack?.accent ?? '#ecb2ff'
  const isHardPass = card.type === 'hard_pass'

  const timerExpired = timeLeft <= 0
  const buttonsDisabled = toast !== null || showEndConfirm
  const skipAllowed = !buttonsDisabled && !timerExpired

  const timerColor = timeLeft <= 3 ? 'var(--tertiary)' : accent
  const timerGlow = timeLeft <= 3 ? '0 0 16px var(--tertiary)' : `0 0 12px ${accent}`

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-floor)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--safe-margin)',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      paddingBottom: 'calc(var(--thumb-zone) + 16px)',
    }}>

      {/* Back + timer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--on-surface-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            cursor: 'pointer',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          ← Back
        </button>

        {/* Countdown badge */}
        <div style={{
          fontFamily: 'var(--font-headline)',
          fontWeight: 900,
          fontSize: '22px',
          color: timerColor,
          boxShadow: timerGlow,
          background: `color-mix(in srgb, ${timerColor} 8%, transparent)`,
          border: `1.5px solid ${timerColor}`,
          borderRadius: '12px',
          padding: '4px 14px',
          minWidth: '52px',
          textAlign: 'center',
          transition: 'color 0.3s, border-color 0.3s, box-shadow 0.3s',
          lineHeight: '32px',
        }}>
          {timerExpired ? '0s' : `${timeLeft}s`}
        </div>
      </div>

      {/* Card wrapper — badge + card centred as one unit */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: '16px',
        minHeight: 0,
      }}>
        {/* Category badge sits inside the wrapper so it travels with the card */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: `color-mix(in srgb, ${accent} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
          borderRadius: '100px',
          padding: '4px 12px',
          alignSelf: 'flex-start',
          marginBottom: '8px',
          minHeight: '26px',
        }}>
          <span style={{ fontSize: '14px' }}>{icon}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {label}
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            border: `1.5px solid ${isHardPass ? 'var(--outline)' : accent}`,
            boxShadow: isHardPass ? 'none' : `0 0 40px color-mix(in srgb, ${accent} 30%, transparent)`,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-headline)',
            fontWeight: 800,
            fontSize: 'clamp(20px, 5.5vw, 26px)',
            color: isHardPass ? 'var(--on-surface-dim)' : 'var(--on-surface)',
            margin: 0,
            lineHeight: 1.35,
          }}>
            {card.text}
          </p>

          {card.flavour && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--on-surface-dim)',
              fontStyle: 'italic',
              margin: 0,
              paddingTop: '8px',
              borderTop: '1px solid var(--outline)',
            }}>
              {card.flavour}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {toast && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 16px)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              animation: 'toast-fade 1.5s ease-in-out forwards',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '100px',
              padding: '10px 20px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--on-surface)',
              whiteSpace: 'nowrap',
            }}>
              Time's up — skipped ⏱️
            </div>
          </div>
        )}

        {!isHardPass && (
          <button
            onClick={!buttonsDisabled ? onComplete : undefined}
            disabled={buttonsDisabled}
            style={{
              background: accent,
              border: 'none',
              borderRadius: '14px',
              padding: '18px',
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: '16px',
              color: '#0A0A0C',
              cursor: buttonsDisabled ? 'default' : 'pointer',
              minHeight: '56px',
              boxShadow: `0 0 24px color-mix(in srgb, ${accent} 40%, transparent)`,
              transition: 'opacity 0.15s',
              opacity: buttonsDisabled ? 0.4 : 1,
            }}
            onTouchStart={e => { if (!buttonsDisabled) e.currentTarget.style.opacity = '0.85' }}
            onTouchEnd={e => { if (!buttonsDisabled) e.currentTarget.style.opacity = '1' }}
          >
            Complete ✓
          </button>
        )}

        {/* Redraw — shown whenever more than one card remains */}
        {showRedraw && !isHardPass && (
          <button
            onClick={!buttonsDisabled ? onRedraw : undefined}
            disabled={buttonsDisabled}
            style={{
              background: 'var(--bg-container)',
              border: '1px solid var(--outline)',
              borderRadius: '14px',
              padding: '16px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--on-surface-dim)',
              cursor: buttonsDisabled ? 'default' : 'pointer',
              minHeight: '56px',
              transition: 'opacity 0.3s',
              opacity: buttonsDisabled ? 0.3 : 1,
            }}
            onTouchStart={e => { if (!buttonsDisabled) e.currentTarget.style.opacity = '0.7' }}
            onTouchEnd={e => { if (!buttonsDisabled) e.currentTarget.style.opacity = '1' }}
          >
            Redraw
          </button>
        )}

        <button
          onClick={skipAllowed ? onNewCard : undefined}
          disabled={!skipAllowed}
          style={{
            background: 'var(--bg-container)',
            border: '1px solid var(--outline)',
            borderRadius: '14px',
            padding: '16px',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--on-surface-dim)',
            cursor: skipAllowed ? 'pointer' : 'default',
            minHeight: '56px',
            transition: 'opacity 0.3s',
            opacity: skipAllowed ? 1 : 0.3,
            pointerEvents: skipAllowed ? 'auto' : 'none',
          }}
          onTouchStart={e => { if (skipAllowed) e.currentTarget.style.opacity = '0.7' }}
          onTouchEnd={e => { if (skipAllowed) e.currentTarget.style.opacity = '1' }}
        >
          {isHardPass ? 'Next card →' : 'Skip'}
        </button>

        {!showEndConfirm ? (
          <button
            onClick={() => setShowEndConfirm(true)}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-dim)',
              cursor: 'pointer',
              minHeight: '40px',
              opacity: 0.45,
              transition: 'opacity 0.2s',
              letterSpacing: '0.04em',
            }}
            onTouchStart={e => e.currentTarget.style.opacity = '0.8'}
            onTouchEnd={e => e.currentTarget.style.opacity = '0.45'}
          >
            End Game
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onEndGame}
              style={{
                flex: 1,
                background: 'rgba(231,0,110,0.15)',
                border: '1px solid var(--tertiary)',
                borderRadius: '12px',
                padding: '12px',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--tertiary)',
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'opacity 0.15s',
              }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              End →
            </button>
            <button
              onClick={() => setShowEndConfirm(false)}
              style={{
                flex: 1,
                background: 'var(--bg-container)',
                border: '1px solid var(--outline)',
                borderRadius: '12px',
                padding: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--on-surface-dim)',
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'opacity 0.15s',
              }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
