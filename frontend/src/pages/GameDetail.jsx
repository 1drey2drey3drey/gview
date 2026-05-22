import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import { mockGames } from '../services/mockData'
import './GameDetail.css'

export default function GameDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inWishlist, setInWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    fetch(`/api/games/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setGame(data))
      .catch(() => {
        const mock = mockGames.find(g => g.slug === slug)
        setGame(mock || null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  // Check wishlist status
  useEffect(() => {
    if (!user || !game) return
    apiFetch(`/api/wishlist/${user.id}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || [])
        setInWishlist(list.some(w => w.gameId === game.id))
      })
      .catch(() => {})
  }, [user, game])

  // Load reviews
  useEffect(() => {
    if (!game) return
    fetch(`/api/reviews/game/${game.id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setReviews([]))
  }, [game])

  const toggleWishlist = async () => {
    if (!user) return alert('Faça login para adicionar à lista de desejos!')
    if (inWishlist) {
      await apiFetch(`/api/wishlist/${game.id}`, { method: 'DELETE' })
      setInWishlist(false)
    } else {
      await apiFetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ gameId: game.id })
      })
      setInWishlist(true)
    }
  }

  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' })

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) return alert('Faça login para avaliar!')
    setReviewMsg('')
    try {
      if (editingReview) {
        // Update
        const res = await apiFetch(`/api/reviews/${editingReview}`, {
          method: 'PUT',
          body: JSON.stringify(editForm)
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(prev => prev.map(r => r.id === editingReview ? { ...data, user: r.user } : r))
          setEditingReview(null)
          setReviewMsg('Avaliação atualizada!')
        } else {
          setReviewMsg('Erro ao atualizar.')
        }
      } else {
        // Create
        const res = await apiFetch('/api/reviews', {
          method: 'POST',
          body: JSON.stringify({ gameId: game.id, rating: reviewForm.rating, comment: reviewForm.comment })
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(prev => [{ ...data, user: { name: user.name } }, ...prev])
          setReviewForm({ rating: 5, comment: '' })
          setReviewMsg('Avaliação enviada!')
        } else {
          const err = await res.json()
          setReviewMsg(err.error || 'Erro ao enviar.')
        }
      }
    } catch { setReviewMsg('Erro de conexão.') }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Excluir esta avaliação?')) return
    try {
      const res = await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id))
        if (editingReview === id) setEditingReview(null)
      }
    } catch { alert('Erro ao excluir') }
  }

  const startEdit = (rev) => {
    setEditingReview(rev.id)
    setEditForm({ rating: rev.rating, comment: rev.comment || '' })
    window.scrollTo({ top: document.querySelector('.gd-reviews-section').offsetTop, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setReviewMsg('')
  }

  if (loading) return (
    <div className="container gd-loading">
      <div className="gd-skeleton-cover"></div>
      <div className="gd-skeleton-text"></div>
    </div>
  )

  if (!game) return (
    <div className="container gd-notfound">
      <h2>Jogo não encontrado</h2>
      <p>O jogo que você procura não existe ou foi removido.</p>
      <Link to="/" className="btn btn-primary">← voltar ao catálogo</Link>
    </div>
  )

  return (
    <div className="game-detail-page">
      <div className="container">
        <div className="gd-layout">
          {/* ─── Cover ─── */}
          <div className="gd-cover-wrapper">
            <img
              src={game.coverUrl || `https://picsum.photos/seed/${game.slug}/300/400`}
              alt={game.title}
              className="gd-cover"
              loading="lazy"
            />
          </div>

          {/* ─── Info ─── */}
          <div className="gd-info">
            <div className="gd-badges">
              <span className="badge">{game.genre || 'demo'}</span>
              {game.status === 'FEATURED' && <span className="badge badge-accent">destaque</span>}
              {game.status === 'COMING_SOON' && <span className="badge badge-coming">em breve</span>}
            </div>

            <h1 className="gd-title">{game.title}</h1>

            {game.studioName && <p className="gd-studio">por <strong>{game.studioName}</strong></p>}

            <p className="gd-description">{game.fullDescription || game.shortDescription}</p>

            {/* ─── Actions ─── */}
            <div className="gd-actions">
              {game.demoUrl ? (
                <Link to={`/play/${game.slug}`} className="btn btn-primary btn-play">▶ Jogar Demo</Link>
              ) : (
                <span className="badge badge-coming gd-badge-lg">Em breve</span>
              )}
              <button className={`btn btn-ghost gd-wish-btn ${inWishlist ? 'wishlisted' : ''}`} onClick={toggleWishlist}>
                {inWishlist ? '♥ Na sua lista' : '♡ Lista de desejos'}
              </button>
            </div>

            {/* ─── Meta ─── */}
            <div className="gd-meta">
              {game.genre && (
                <div className="gd-meta-item">
                  <span className="gd-meta-label">Gênero</span>
                  <span className="gd-meta-value">{game.genre}</span>
                </div>
              )}
              {game.launchWindow && (
                <div className="gd-meta-item">
                  <span className="gd-meta-label">Lançamento</span>
                  <span className="gd-meta-value">{game.launchWindow}</span>
                </div>
              )}
              {game.studioName && (
                <div className="gd-meta-item">
                  <span className="gd-meta-label">Estúdio</span>
                  <span className="gd-meta-value">{game.studioName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Reviews Section ─── */}
        <section className="gd-reviews-section">
          <h2 className="gd-section-title">Avaliações</h2>

          {user && (
            <form className="gd-review-form" onSubmit={submitReview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="gd-rating-select">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={`gd-star ${(editingReview ? editForm.rating : reviewForm.rating) >= n ? 'active' : ''}`} onClick={() => editingReview ? setEditForm(f => ({...f, rating: n})) : setReviewForm(f => ({...f, rating: n}))}>★</button>
                  ))}
                </div>
                {editingReview && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>Editando avaliação</span>}
              </div>
              <textarea
                placeholder="Conte o que achou da demo..."
                value={editingReview ? editForm.comment : reviewForm.comment}
                onChange={e => editingReview ? setEditForm(f => ({...f, comment: e.target.value})) : setReviewForm(f => ({...f, comment: e.target.value}))}
                rows={3}
              />
              <div className="gd-review-form-actions">
                <button type="submit" className="btn btn-primary">{editingReview ? 'Salvar Alterações' : 'Enviar avaliação'}</button>
                {editingReview && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>}
                {reviewMsg && <span className="gd-review-msg">{reviewMsg}</span>}
              </div>
            </form>
          )}

          {!user && (
            <p className="gd-login-hint"><Link to="/login">Faça login</Link> para avaliar esta demo.</p>
          )}

          <div className="gd-reviews-list">
            {reviews.length === 0 && <p className="gd-no-reviews">Nenhuma avaliação ainda. Seja o primeiro!</p>}
            {reviews.map(rev => {
              const isOwner = user && (user.id === rev.userId || user.id === rev.user?.id)
              return (
              <div key={rev.id} className={`gd-review-card ${editingReview === rev.id ? 'editing' : ''}`}>
                <div className="gd-review-header">
                  <span className="gd-review-user">{rev.user?.name || 'Usuário'} {isOwner && <span style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)'}}>(você)</span>}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span className="gd-review-stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    {isOwner && !editingReview && (
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button onClick={() => startEdit(rev)} style={{background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-xs)'}}>Editar</button>
                        <button onClick={() => handleDeleteReview(rev.id)} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 'var(--text-xs)'}}>Excluir</button>
                      </div>
                    )}
                  </div>
                </div>
                {rev.comment && <p className="gd-review-comment">{rev.comment}</p>}
              </div>
            )})}
          </div>
        </section>
      </div>
    </div>
  )
}
