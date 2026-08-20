import { useState, useEffect, useCallback } from 'react'
import { track } from '@vercel/analytics'
import Home from './components/Home/Home'
import CardCategories from './components/CardCategories/CardCategories'
import FingerChooser from './components/FingerChooser/FingerChooser'
import CardReveal from './components/CardReveal/CardReveal'
import GameSummary from './components/GameSummary/GameSummary'
import { useCardDeck } from './hooks/useCardDeck'

const SCREENS = {
  HOME: 'HOME',
  CATEGORIES: 'CATEGORIES',
  CHOOSER: 'CHOOSER',
  CARD: 'CARD',
  SUMMARY: 'SUMMARY',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME)
  const [mode, setMode] = useState('party')
  const [isMixMode, setIsMixMode] = useState(false)
  const [cardKey, setCardKey] = useState(0)

  const {
    packs, loading, error,
    currentPack, selectPack, selectMixedPacks,
    currentCard, remaining,
    complete, skip, redraw,
    reset, sessionStats, isDeckExhausted,
  } = useCardDeck(mode)

  const resetSession = useCallback(() => {
    setIsMixMode(false)
    setCardKey(0)
    setMode('party')
    setScreen(SCREENS.HOME)
    reset()
  }, [reset])

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'hidden') resetSession() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', resetSession)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', resetSession)
    }
  }, [resetSession])

  const showRedraw = remaining > 1

  const handleSelectPack = (pack) => {
    selectPack(pack)
    track('pack_selected', { pack: pack.name })
    setScreen(SCREENS.CHOOSER)
  }

  const handleMixStart = (packsList) => {
    track('mix_started', { packs: packsList.map(p => p.id).join(',') })
    selectMixedPacks(packsList)
    setIsMixMode(true)
    setScreen(SCREENS.CHOOSER)
  }

  const handleCardDraw = () => {
    setScreen(SCREENS.CARD)
  }

  const handleComplete = () => {
    track('card_completed', { pack: currentPack?.name })
    complete(0)
    if (isDeckExhausted) {
      setScreen(SCREENS.SUMMARY)
    } else {
      setScreen(SCREENS.CHOOSER)
    }
  }

  const handleNewCard = () => {
    track('card_skipped', { pack: currentPack?.name })
    setCardKey(k => k + 1)
    skip()
    if (isDeckExhausted) {
      setScreen(SCREENS.SUMMARY)
    } else {
      setScreen(SCREENS.CARD)
    }
  }

  const handleRedraw = () => {
    setCardKey(k => k + 1)
    redraw()
  }

  const handleEndGame = () => {
    setScreen(SCREENS.SUMMARY)
  }

  const handlePlayAgain = () => {
    track('game_replayed', { pack: currentPack?.name })
    reset()
    setScreen(SCREENS.CHOOSER)
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg-floor)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', color: 'var(--tertiary)' }}>
            Couldn't load decks
          </p>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--on-surface-dim)', fontSize: '14px' }}>
            Check your connection and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {screen === SCREENS.HOME && (
        <Home
          packs={packs}
          loading={loading}
          mode={mode}
          onModeChange={setMode}
          onStart={() => { track('game_started'); setScreen(SCREENS.CATEGORIES) }}
        />
      )}

      {screen === SCREENS.CATEGORIES && (
        <CardCategories
          packs={packs}
          onSelect={handleSelectPack}
          onMixStart={handleMixStart}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}

      {screen === SCREENS.CHOOSER && (
        <FingerChooser
          packAccent={currentPack?.accent}
          onCardDraw={handleCardDraw}
          onBack={() => setScreen(SCREENS.CATEGORIES)}
        />
      )}

      {screen === SCREENS.CARD && (
        <CardReveal
          key={cardKey}
          card={currentCard}
          pack={currentPack}
          onComplete={handleComplete}
          onNewCard={handleNewCard}
          onRedraw={handleRedraw}
          onEndGame={handleEndGame}
          onBack={() => setScreen(SCREENS.CHOOSER)}
          showRedraw={showRedraw}
        />
      )}

      {screen === SCREENS.SUMMARY && (
        <GameSummary
          sessionStats={sessionStats}
          pack={currentPack}
          isMixMode={isMixMode}
          onPlayAgain={handlePlayAgain}
          onHome={() => { reset(); setIsMixMode(false); setScreen(SCREENS.HOME) }}
        />
      )}
    </>
  )
}
