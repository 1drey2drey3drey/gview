import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './AdminPanel.css'

const STATUS_LABEL = { PENDING: 'pendente', APPROVED: 'aprovado', REJECTED: 'rejeitado' }
const STATUS_CLASS = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' }

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('submissions')
  const [submissions, setSubmissions] = useState([])
  const [games, setGames] = useState([])
  const [gameJams, setGameJams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawgId, setRawgId] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Jam form
  const [showJamForm, setShowJamForm] = useState(false)
  const [jamForm, setJamForm] = useState({ title: '', description: '', theme: '', startDate: '', endDate: '' })

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/login')
  }, [isAdmin, authLoading])

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (tab === 'submissions') {
        const r = await apiFetch('/api/submissions')
        const json = await r.json()
        setSubmissions(Array.isArray(json) ? json : (json.data || []))
      } else if (tab === 'games') {
        const r = await fetch('/api/games')
        const json = await r.json()
        setGames(Array.isArray(json) ? json : (json.data || []))
      } else if (tab === 'gamejams') {
        const r = await fetch('/api/gamejams')
        const json = await r.json()
        setGameJams(Array.isArray(json) ? json : [])
      }
    } catch {
      setError('Erro ao carregar dados.')
    }
    setLoading(false)
  }

  const handleStatus = async (id, status) => {
    try {
      await apiFetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, reviewStatus: status } : s))
    } catch { alert('Erro ao atualizar status.') }
  }

  const handleDeleteGame = async (id) => {
    if (!confirm('Remover este jogo do catálogo?')) return
    await apiFetch(`/api/games/${id}`, { method: 'DELETE' })
    setGames(prev => prev.filter(g => g.id !== id))
  }

  const handleImportRAWG = async () => {
    if (!rawgId) return
    setImportMsg('Importando...')
    try {
      const res = await apiFetch(`/api/rawg/import/${rawgId}`, { method: 'POST' })
      if (res.ok) {
        setImportMsg('✅ Jogo importado com sucesso!')
        setRawgId('')
        fetchData()
      } else {
        const err = await res.json()
        setImportMsg('❌ ' + (err.error || 'Erro desconhecido'))
      }
    } catch { setImportMsg('❌ Erro de conexão.') }
  }

  const handleSearchRAWG = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setImportMsg('')
    try {
      const res = await apiFetch(`/api/rawg/search?q=${encodeURIComponent(searchQuery)}`)
      const json = await res.json()
      if (res.ok) {
        setSearchResults(json.data || [])
        if ((json.data || []).length === 0) {
          setImportMsg('Nenhum jogo encontrado na RAWG.')
        }
      } else {
        setImportMsg('❌ ' + (json.error || 'Erro ao pesquisar'))
      }
    } catch {
      setImportMsg('❌ Erro de conexão ao pesquisar.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleImportFromSearch = async (id) => {
    setImportMsg('Importando...')
    try {
      const res = await apiFetch(`/api/rawg/import/${id}`, { method: 'POST' })
      if (res.ok) {
        setImportMsg('✅ Jogo importado com sucesso!')
        setSearchResults(prev => prev.filter(g => g.rawgId !== id))
        fetchData()
      } else {
        const err = await res.json()
        setImportMsg('❌ ' + (err.error || 'Erro desconhecido'))
      }
    } catch { setImportMsg('❌ Erro de conexão ao importar.') }
  }

  const handleCreateJam = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/gamejams', {
        method: 'POST',
        body: JSON.stringify({ ...jamForm, creatorId: user.id })
      })
      setShowJamForm(false)
      setJamForm({ title: '', description: '', theme: '', startDate: '', endDate: '' })
      fetchData()
    } catch { alert('Erro ao criar Game Jam.') }
  }

  const handleDeleteJam = async (id) => {
    if (!confirm('Excluir esta Game Jam?')) return
    await apiFetch(`/api/gamejams/${id}`, { method: 'DELETE' })
    setGameJams(prev => prev.filter(j => j.id !== id))
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie jogos, submissões e eventos da plataforma Gview.</p>
          </div>
          <span className="admin-role-badge">🛡️ Admin</span>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'submissions' ? 'active' : ''}`} onClick={() => setTab('submissions')}>
            Submissões {submissions.length > 0 && <span className="tab-count">{submissions.length}</span>}
          </button>
          <button className={`admin-tab ${tab === 'games' ? 'active' : ''}`} onClick={() => setTab('games')}>Jogos</button>
          <button className={`admin-tab ${tab === 'gamejams' ? 'active' : ''}`} onClick={() => setTab('gamejams')}>Game Jams</button>
        </div>
      </div>

      {loading && <p className="admin-msg">Carregando…</p>}
      {error && <p className="admin-msg admin-error">{error}</p>}

      {/* ─── Submissions Tab ─── */}
      {!loading && !error && tab === 'submissions' && (
        <div className="submissions-list">
          {submissions.length === 0 && <p className="admin-msg">Nenhuma submissão recebida.</p>}
          {submissions.map(s => (
            <div key={s.id} className="submission-card">
              <div className="submission-top">
                <div>
                  <h2 className="submission-title">{s.gameTitle}</h2>
                  <p className="submission-meta">{s.studioName && <span>{s.studioName} · </span>}{s.contactEmail}{s.contactRole && <span> · {s.contactRole}</span>}</p>
                </div>
                <span className={`badge ${STATUS_CLASS[s.reviewStatus] || 'badge-pending'}`}>
                  {STATUS_LABEL[s.reviewStatus] || s.reviewStatus}
                </span>
              </div>
              {s.description && <p className="submission-desc">{s.description}</p>}
              <div className="submission-details">
                {s.targetPlatforms && <span>Plataformas: {s.targetPlatforms}</span>}
                {s.launchDateRange && <span>Previsão: {s.launchDateRange}</span>}
                {s.demoLink && <a href={s.demoLink} target="_blank" rel="noreferrer">ver demo ↗</a>}
              </div>
              {s.reviewStatus === 'PENDING' && (
                <div className="submission-actions">
                  <button className="btn-approve" onClick={() => handleStatus(s.id, 'APPROVED')}>✓ Aprovar</button>
                  <button className="btn-reject" onClick={() => handleStatus(s.id, 'REJECTED')}>✕ Rejeitar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Games Tab ─── */}
      {!loading && !error && tab === 'games' && (
        <div className="admin-games">
          <div className="admin-rawg-import">
            <h3>Importar da RAWG API</h3>
            <p className="admin-rawg-hint">Insira o ID de um jogo na RAWG para importar ou faça uma pesquisa pelo nome abaixo.</p>
            
            <div className="rawg-input-row" style={{ marginBottom: '1.5rem' }}>
              <input type="text" placeholder="ID do Jogo (ex: 3498)" value={rawgId} onChange={e => setRawgId(e.target.value)} className="rawg-input" />
              <button className="btn btn-primary" onClick={handleImportRAWG}>Importar por ID</button>
            </div>

            <div className="rawg-search-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Pesquisar e Importar</h4>
              <div className="rawg-input-row">
                <input 
                  type="text" 
                  placeholder="Pesquisar jogo na RAWG (ex: Hollow Knight)" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSearchRAWG()} 
                  className="rawg-input" 
                />
                <button className="btn btn-secondary" onClick={handleSearchRAWG} disabled={searchLoading}>
                  {searchLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="rawg-search-results" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.map(game => (
                    <div key={game.rawgId} className="admin-game-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={game.coverUrl || 'https://via.placeholder.com/60x80?text=Capa'} alt="" className="admin-game-thumb" style={{ width: '40px', height: '53px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{game.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Lançamento: {game.released || 'N/A'} | Nota: {game.rating || 'N/A'} (ID: {game.rawgId})
                          </span>
                        </div>
                      </div>
                      <button className="btn-approve" onClick={() => handleImportFromSearch(game.rawgId)}>
                        Importar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {importMsg && <p className="rawg-msg" style={{ marginTop: '1rem' }}>{importMsg}</p>}
          </div>

          <h3 className="admin-subtitle">Jogos Cadastrados</h3>
          <div className="admin-games-list">
            {games.length === 0 && <p className="admin-msg">Nenhum jogo no catálogo.</p>}
            {games.map(g => (
              <div key={g.id} className="admin-game-row">
                <img src={g.coverUrl || `https://picsum.photos/seed/${g.slug}/60/80`} alt="" className="admin-game-thumb" />
                <div className="admin-game-info">
                  <strong>{g.title}</strong>
                  <span>{g.genre} · {g.studioName}</span>
                </div>
                <span className={`badge ${g.status === 'FEATURED' ? 'badge-accent' : g.status === 'COMING_SOON' ? 'badge-coming' : ''}`}>{g.status}</span>
                <button className="btn-reject" onClick={() => handleDeleteGame(g.id)}>Excluir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Game Jams Tab ─── */}
      {!loading && !error && tab === 'gamejams' && (
        <div className="admin-jams">
          <div className="admin-jams-header">
            <h3 className="admin-subtitle">Game Jams</h3>
            <button className="btn btn-primary" onClick={() => setShowJamForm(!showJamForm)}>
              {showJamForm ? '✕ Cancelar' : '+ Criar Game Jam'}
            </button>
          </div>

          {showJamForm && (
            <form className="jam-form" onSubmit={handleCreateJam}>
              <div className="jam-form-grid">
                <div className="auth-field"><label>Título</label><input required value={jamForm.title} onChange={e => setJamForm({...jamForm, title: e.target.value})} /></div>
                <div className="auth-field"><label>Tema</label><input value={jamForm.theme} onChange={e => setJamForm({...jamForm, theme: e.target.value})} placeholder="Opcional" /></div>
                <div className="auth-field"><label>Início</label><input type="datetime-local" required value={jamForm.startDate} onChange={e => setJamForm({...jamForm, startDate: e.target.value})} /></div>
                <div className="auth-field"><label>Término</label><input type="datetime-local" required value={jamForm.endDate} onChange={e => setJamForm({...jamForm, endDate: e.target.value})} /></div>
              </div>
              <div className="auth-field"><label>Descrição</label><textarea required rows={3} value={jamForm.description} onChange={e => setJamForm({...jamForm, description: e.target.value})} /></div>
              <button type="submit" className="btn btn-primary">Criar Jam</button>
            </form>
          )}

          <div className="submissions-list">
            {gameJams.length === 0 && <p className="admin-msg">Nenhuma Game Jam cadastrada.</p>}
            {gameJams.map(jam => (
              <div key={jam.id} className="submission-card">
                <div className="submission-top">
                  <div>
                    <h2 className="submission-title">{jam.title}</h2>
                    <p className="submission-meta">
                      {new Date(jam.startDate).toLocaleDateString()} — {new Date(jam.endDate).toLocaleDateString()}
                      {jam.theme && <span> · Tema: {jam.theme}</span>}
                    </p>
                  </div>
                  <div className="admin-jam-actions">
                    <span className="badge">{jam.status}</span>
                    <button className="btn-reject" onClick={() => handleDeleteJam(jam.id)}>Excluir</button>
                  </div>
                </div>
                {jam.description && <p className="submission-desc">{jam.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
