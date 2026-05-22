import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './GameDetail.css'

export default function GameDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [game, setGame]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [inWishlist, setInWishlist]   = useState(false)
  const [wishlistId, setWishlistId]   = useState(null)
  const [reviews, setReviews]         = useState([])
  const [reviewForm, setReviewForm]   = useState({ rating: 5, comment: '' })
  const [reviewMsg, setReviewMsg]     = useState('')
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm]       = useState({ rating: 5, comment: '' })

  // Carrega o jogo: se for rawgId, importa para o banco e usa o game local
  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setGame(null)
    setReviews([])
    setInWishlist(false)

    const isRawgId = /^\d+$/.test(slug)

    const fetchGame = async () => {
      try {
        if (isRawgId) {
          // POST /api/rawg/import/:rawgId — importa ou retorna o jogo já importado
          const importRes = await apiFetch(`/api/rawg/import/${slug}`, { method: 'POST' })
          if (importRes.ok) {
            const imported = await importRes.json()
            setGame(imported.game || imported)
          } else {
            // Fallback: busca dados diretamente da RAWG (sem persistência)
            const rawRes = await fetch(`/api/rawg/game/${slug}`)
            if (rawRes.ok) {
              const rawData = await rawRes.json()
              setGame({
                id:               String(rawData.rawgId),
                slug,
                title:            rawData.name,
                coverUrl:         rawData.coverUrl,
                genre:            rawData.genres ? rawData.genres.join(', ') : '',
                studioName:       rawData.rating ? `★ ${rawData.rating.toFixed(1)}` : 'RAWG',
                demoUrl:          null,
                status:           'AVAILABLE',
                shortDescription: rawData.description ? rawData.description.slice(0, 120) + '...' : '',
                fullDescription:  rawData.description || '',
                launchWindow:     rawData.released,
              })
            } else {
              setGame(null)
            }
          }
        } else {
          const res = await fetch(`/api/games/${slug}`)
          if (res.ok) {
            setGame(await res.json())
          } else {
            setGame(null)
          }
        }
      } catch (e) {
        console.error('Erro ao carregar jogo:', e)
        setGame(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [slug])

  // Verifica status da wishlist
  useEffect(() => {
    if (!user || !game?.id) return
    apiFetch(`/api/wishlist/${user.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || [])
        const entry = list.find(w => w.gameId === game.id)
        setInWishlist(!!entry)
        setWishlistId(entry?.id || null)
      })
      .catch(() => {})
  }, [user, game])

  // Carrega reviews do jogo
  useEffect(() => {
    if (!game?.id) return
    // Se o id é numérico (fallback sem persistência), não busca reviews
    if (/^\d+$/.test(String(game.id))) return
    fetch(`/api/reviews/game/${game.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setReviews(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setReviews([]))
  }, [game])

  const toggleWishlist = async () => {
    if (!user) return alert('Faça login para adicionar à lista de favoritos!')
    if (!game?.id) return

    // Se o game.id é rawgId numérico, o backend vai auto-importar
    if (inWishlist) {
      // Remove pelo gameId (que é o UUID do banco após import)
      const res = await apiFetch(`/api/wishlist/${game.id}`, { method: 'DELETE' })
      if (res.ok) setInWishlist(false)
    } else {
      const res = await apiFetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ gameId: game.id }),
      })
      if (res.ok) {
        const data = await res.json()
        // Atualiza o game.id com o UUID retornado caso tenha sido auto-importado
        if (data.gameId && data.gameId !== game.id) {
          setGame(prev => ({ ...prev, id: data.gameId }))
        }
        setInWishlist(true)
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao adicionar à lista')
      }
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) return alert('Faça login para avaliar!')
    if (!game?.id) return
    setReviewMsg('')

    try {
      if (editingReview) {
        const res = await apiFetch(`/api/reviews/${editingReview}`, {
          method: 'PUT',
          body: JSON.stringify(editForm),
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(prev => prev.map(r => r.id === editingReview ? { ...r, ...data } : r))
          setEditingReview(null)
          setReviewMsg('Avaliação atualizada!')
        } else {
          const err = await res.json()
          setReviewMsg(err.error || 'Erro ao atualizar.')
        }
      } else {
        const res = await apiFetch('/api/reviews', {
          method: 'POST',
          body: JSON.stringify({ gameId: game.id, rating: reviewForm.rating, comment: reviewForm.comment }),
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(prev => [data, ...prev])
          setReviewForm({ rating: 5, comment: '' })
          setReviewMsg('Avaliação enviada!')
        } else {
          const err = await res.json()
          setReviewMsg(err.error || 'Erro ao enviar.')
        }
      }
    } catch {
      setReviewMsg('Erro de conexão.')
    }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Excluir esta avaliação?')) return
    try {
      const res = await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id))
        if (editingReview === id) setEditingReview(null)
      }
    } catch {
      alert('Erro ao excluir')
    }
  }

  const startEdit = (rev) => {
    setEditingReview(rev.id)
    setEditForm({ rating: rev.rating, comment: rev.comment || '' })
    window.scrollTo({ top: document.querySelector('.gd-reviews-section')?.offsetTop || 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setReviewMsg('')
  }

  const isRawgOnlyMode = game && /^\d+$/.test(String(game.id))

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
              <span className="badge">{game.genre || 'game'}</span>
              {game.status === 'FEATURED'    && <span className="badge badge-accent">destaque</span>}
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
                <span className="badge badge-coming gd-badge-lg">Demo indisponível</span>
              )}
              <button
                className={`btn btn-ghost gd-wish-btn ${inWishlist ? 'wishlisted' : ''}`}
                onClick={toggleWishlist}
              >
                {inWishlist ? '♥ Nos favoritos' : '♡ Adicionar aos favoritos'}
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

          {isRawgOnlyMode && (
            <p className="gd-login-hint" style={{ color: 'var(--color-text-muted)' }}>
              Não foi possível carregar avaliações para este jogo no momento.
            </p>
          )}

          {!isRawgOnlyMode && user && (
            <form className="gd-review-form" onSubmit={submitReview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="gd-rating-select">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`gd-star ${(editingReview ? editForm.rating : reviewForm.rating) >= n ? 'active' : ''}`}
                      onClick={() => editingReview
                        ? setEditForm(f => ({ ...f, rating: n }))
                        : setReviewForm(f => ({ ...f, rating: n }))
                      }
                    >★</button>
                  ))}
                </div>
                {editingReview && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
                    Editando avaliação
                  </span>
                )}
              </div>

              <textarea
                placeholder="Conte o que achou..."
                value={editingReview ? editForm.comment : reviewForm.comment}
                onChange={e => editingReview
                  ? setEditForm(f => ({ ...f, comment: e.target.value }))
                  : setReviewForm(f => ({ ...f, comment: e.target.value }))
                }
                rows={3}
              />

              <div className="gd-review-form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingReview ? 'Salvar Alterações' : 'Enviar avaliação'}
                </button>
                {editingReview && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancelar
                  </button>
                )}
                {reviewMsg && <span className="gd-review-msg">{reviewMsg}</span>}
              </div>
            </form>
          )}

          {!isRawgOnlyMode && !user && (
            <p className="gd-login-hint">
              <Link to="/login">Faça login</Link> para avaliar este jogo.
            </p>
          )}

          {!isRawgOnlyMode && (
            <div className="gd-reviews-list">
              {reviews.length === 0 && (
                <p className="gd-no-reviews">Nenhuma avaliação ainda. Seja o primeiro!</p>
              )}
              {reviews.map(rev => {
                const isOwner = user && (user.id === rev.userId || user.id === rev.user?.id)
                return (
                  <div key={rev.id} className={`gd-review-card ${editingReview === rev.id ? 'editing' : ''}`}>
                    <div className="gd-review-header">
                      <span className="gd-review-user">
                        {rev.user?.name || 'Usuário'}
                        {isOwner && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                            {' '}(você)
                          </span>
                        )}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="gd-review-stars">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                        {isOwner && !editingReview && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => startEdit(rev)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                            >Editar</button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                            >Excluir</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {rev.comment && <p className="gd-review-comment">{rev.comment}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
