import { useState } from 'react'

function buildShareText(sessionStats, pack, isMixMode) {
  const { completed = 0, skipped = 0 } = sessionStats ?? {}
  const total = completed + skipped
  const name = isMixMode ? 'Mix Session' : (pack?.name ?? 'Session')
  return `🃏 FirstMove — ${name}\n✅ ${completed} completed · ⏭️ ${skipped} skipped · ${total} total\nPlay at first-move-one.vercel.app`
}

export default function GameSummary({ sessionStats, pack, isMixMode, onPlayAgain, onHome }) {
  const { completed = 0, skipped = 0, pickCounts = {} } = sessionStats ?? {}
  const total = completed + skipped
  const [copyDone, setCopyDone] = useState(false)

  const mostPickedIndex = Object.entries(pickCounts).sort((a, b) => b[1] - a[1])[0]
  const accent = pack?.accent ?? '#ecb2ff'

  const handleShare = async () => {
    const text = buildShareText(sessionStats, pack, isMixMode)
    if (navigator.share) {
      try { await navigator.share({ title: 'FirstMove Recap', text }) } catch { /* user cancelled share */ }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopyDone(true)
        setTimeout(() => setCopyDone(false), 2000)
      } catch { /* clipboard is best-effort */ }
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-floor)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--safe-margin)',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)',
      paddingBottom: 'calc(var(--thumb-zone) + 40px)',
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontWeight: 900,
          fontSize: 'clamp(28px, 8vw, 36px)',
          color: 'var(--on-surface)',
          margin: '0 0 4px',
        }}>
          Game Summary
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--on-surface-dim)',
          margin: '0 0 32px',
          fontSize: '14px',
        }}>
          {isMixMode ? 'Mix Session' : (pack?.name ?? 'Session')} · {total} card{total !== 1 ? 's' : ''}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <StatCard label="Completed" value={completed} accent={accent} />
          <StatCard label="Skipped" value={skipped} accent="var(--on-surface-dim)" />
        </div>

        {/* Most picked */}
        {mostPickedIndex && (
          <div className="glass-card" style={{
            padding: '20px',
            border: `1px solid color-mix(in srgb, ${accent} 27%, transparent)`,
            marginBottom: '24px',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}>
              Most Chosen Finger
            </p>
            <p style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 800,
              fontSize: '28px',
              color: accent,
              margin: 0,
            }}>
              #{Number(mostPickedIndex[0]) + 1}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--on-surface-dim)',
              margin: '4px 0 0',
            }}>
              Chosen {mostPickedIndex[1]} time{mostPickedIndex[1] !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onPlayAgain}
          style={{
            background: accent,
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            fontFamily: 'var(--font-headline)',
            fontWeight: 800,
            fontSize: '18px',
            color: '#0A0A0C',
            cursor: 'pointer',
            minHeight: '60px',
            boxShadow: `0 0 28px color-mix(in srgb, ${accent} 27%, transparent)`,
            transition: 'opacity 0.15s',
          }}
          onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          Play Again
        </button>

        <button
          onClick={handleShare}
          style={{
            background: 'var(--bg-container)',
            border: '1px solid var(--outline)',
            borderRadius: '16px',
            padding: '18px',
            fontFamily: 'var(--font-headline)',
            fontWeight: 700,
            fontSize: '15px',
            color: copyDone ? 'var(--primary)' : 'var(--on-surface)',
            cursor: 'pointer',
            minHeight: '56px',
            transition: 'opacity 0.15s, color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          {copyDone ? 'Copied! ✓' : '📊 Share Recap'}
        </button>

        <button
          onClick={onHome}
          style={{
            background: 'var(--bg-container)',
            border: '1px solid var(--outline)',
            borderRadius: '16px',
            padding: '18px',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: 'var(--on-surface)',
            cursor: 'pointer',
            minHeight: '56px',
            transition: 'opacity 0.15s',
          }}
          onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="glass-card" style={{ padding: '20px 16px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--on-surface-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 6px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-headline)',
        fontWeight: 900,
        fontSize: '36px',
        color: accent,
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}
