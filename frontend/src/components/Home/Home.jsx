const SOCIALS = [
  {
    href: 'https://github.com/MrTig-afk',
    label: 'GitHub',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/in/kaushikn2002/',
    label: 'LinkedIn',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/kaushik_n__/',
    label: 'Instagram',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
]

export default function Home({ packs, loading, mode, onModeChange, onStart }) {
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
      {/* Mode pill — fixed top right */}
      <div style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '3px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
            {[
              { label: '🔥 Party', value: 'party' },
              { label: '🎓 Uni', value: 'university' },
            ].map(({ label, value }) => (
              <button
                key={value}
                onTouchEnd={() => onModeChange(value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  background: mode === value ? 'var(--primary)' : 'transparent',
                  color: mode === value ? '#0A0A0C' : 'var(--on-surface-dim)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: mode === value ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: mode === value ? '0 0 12px var(--primary-glow)66' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
      </div>

      {/* Logo + tagline */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 900,
              fontSize: 'clamp(40px, 12vw, 56px)',
              color: 'var(--primary)',
              margin: 0,
              lineHeight: 1,
              textShadow: '0 0 40px var(--primary-glow)',
              letterSpacing: '-0.02em',
              userSelect: 'none',
            }}
          >
            FirstMove
          </h1>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(16px, 4.5vw, 20px)',
          color: 'var(--on-surface-dim)',
          margin: '10px 0 0',
          letterSpacing: '0.04em',
        }}>
          Choose. Draw. Play.
        </p>
      </div>

      {/* CTA buttons — thumb zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onStart}
          disabled={loading || packs.length === 0}
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            fontFamily: 'var(--font-headline)',
            fontWeight: 800,
            fontSize: '18px',
            color: '#0A0A0C',
            cursor: loading ? 'default' : 'pointer',
            minHeight: '60px',
            boxShadow: '0 0 32px var(--primary-glow)55',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
          onTouchStart={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
          onTouchEnd={e => e.currentTarget.style.opacity = loading ? '0.5' : '1'}
        >
          {loading ? 'Loading decks…' : 'Start Game'}
        </button>

        <a
          href="https://forms.gle/PuPGm8ckcWERTroZ7"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '16px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--on-surface-dim)',
            textDecoration: 'none',
            minHeight: '56px',
            lineHeight: '24px',
            transition: 'opacity 0.15s',
          }}
          onTouchStart={e => e.currentTarget.style.opacity = '0.5'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          Give Feedback
        </a>

        {/* Social links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          paddingBottom: '4px',
        }}>
          {SOCIALS.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--on-surface-dim)',
                textDecoration: 'none',
                transition: 'color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
              onTouchStart={e => {
                e.currentTarget.style.color = 'var(--primary)'
                e.currentTarget.style.boxShadow = '0 0 16px var(--primary-glow)'
                e.currentTarget.style.background = 'rgba(189,0,255,0.08)'
              }}
              onTouchEnd={e => {
                e.currentTarget.style.color = 'var(--on-surface-dim)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
