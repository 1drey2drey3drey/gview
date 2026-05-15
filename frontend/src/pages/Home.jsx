import { useEffect, useState } from 'react'
import { mockGames } from '../services/mockData'
import GameCard from '../components/GameCard'
import './Home.css'

export default function Home() {
  const [games, setGames]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const list = Array.isArray(json) ? json : (json.data || [])
        setGames(list.length > 0 ? list : mockGames)
      })
      .catch(() => setGames(mockGames))
      .finally(() => setLoading(false))
  }, [])

  const featured   = games.filter(g => g.status === 'FEATURED')
  const available  = games.filter(g => g.status === 'AVAILABLE')
  const comingSoon = games.filter(g => g.status === 'COMING_SOON')

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <p className="hero-eyebrow">plataforma de demos indie</p>
          <h1 className="hero-title">jogue demos antes<br/>de todo mundo</h1>
          <p className="hero-sub">Descubra jogos independentes, teste demos no navegador e apoie devs antes do lançamento.</p>
        </div>
      </section>
      <div className="container sections">
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem 0' }}>Carregando catálogo…</p>
        ) : (
          <>
            <Section title="demos em destaque" games={featured} />
            <Section title="todas as demos"    games={available} />
            <Section title="demos em breve"    games={comingSoon} />
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, games }) {
  if (!games.length) return null
  return (
    <section className="game-section">
      <h2 className="section-title">{title}</h2>
      <div className="game-grid">
        {games.map(game => <GameCard key={game.id} game={game} />)}
      </div>
    </section>
  )
}
