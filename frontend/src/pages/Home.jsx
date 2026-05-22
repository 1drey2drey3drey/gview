import { useEffect, useState } from 'react'
import GameCard from '../components/GameCard'
import './Home.css'

export default function Home() {
  const [games, setGames]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searching, setSearching] = useState(false)

  // Carrega jogos populares da RAWG ao montar
  useEffect(() => {
    fetch('/api/rawg/games?page_size=20&ordering=-rating')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const list = (json.data || []).map(g => ({
          title:       g.name,
          slug:        String(g.rawgId),
          coverUrl:    g.coverUrl,
          genre:       g.genres ? g.genres.join(', ') : '',
          studioName:  g.rating ? `★ ${g.rating.toFixed(1)}` : '',
          demoUrl:     null,
          status:      'AVAILABLE',
        }))
        setGames(list)
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false))
  }, [])

  // Busca por nome
  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true)
    fetch(`/api/rawg/search?q=${encodeURIComponent(search.trim())}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const list = (json.data || []).map(g => ({
          title:      g.name,
          slug:       String(g.rawgId),
          coverUrl:   g.coverUrl,
          genre:      g.genres ? g.genres.join(', ') : '',
          studioName: g.rating ? `★ ${g.rating.toFixed(1)}` : '',
          demoUrl:    null,
          status:     'AVAILABLE',
        }))
        setGames(list)
      })
      .catch(() => {})
      .finally(() => setSearching(false))
  }

  const clearSearch = () => {
    setSearch('')
    setLoading(true)
    fetch('/api/rawg/games?page_size=20&ordering=-rating')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const list = (json.data || []).map(g => ({
          title:      g.name,
          slug:       String(g.rawgId),
          coverUrl:   g.coverUrl,
          genre:      g.genres ? g.genres.join(', ') : '',
          studioName: g.rating ? `★ ${g.rating.toFixed(1)}` : '',
          demoUrl:    null,
          status:     'AVAILABLE',
        }))
        setGames(list)
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false))
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <p className="hero-eyebrow">plataforma de demos indie</p>
          <h1 className="hero-title">jogue demos antes<br/>de todo mundo</h1>
          <p className="hero-sub">Descubra jogos independentes, avalie e adicione aos favoritos.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar jogos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={searching}>
              {searching ? '…' : 'Buscar'}
            </button>
            {search && (
              <button type="button" className="btn btn-ghost" onClick={clearSearch}>
                Limpar
              </button>
            )}
          </form>
        </div>
      </section>

      <div className="container sections">
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem 0' }}>Carregando catálogo…</p>
        ) : (
          <section className="game-section">
            <h2 className="section-title">
              {search ? `Resultados para "${search}"` : 'Jogos Populares'}
            </h2>
            {games.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum jogo encontrado.</p>
            ) : (
              <div className="game-grid">
                {games.map(game => <GameCard key={game.slug} game={game} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
