import { useEffect, useState } from 'react'
import './AdminPanel.css'

const STATUS_LABEL = {
  PENDING:  'pendente',
  APPROVED: 'aprovado',
  REJECTED: 'rejeitado',
}

const STATUS_CLASS = {
  PENDING:  'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
}

export default function AdminPanel() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  useEffect(() => {
    fetch('/api/submissions')
      .then(r => r.json())
      .then(json => {
        // suporta { data: [...] } ou array direto
        setSubmissions(Array.isArray(json) ? json : (json.data || []))
        setLoading(false)
      })
      .catch(() => {
        setError('Não foi possível carregar as submissões.')
        setLoading(false)
      })
  }, [])

  const handleStatus = async (id, status) => {
    try {
      await fetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, reviewStatus: status } : s)
      )
    } catch {
      alert('Erro ao atualizar status. Tente novamente.')
    }
  }

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <h1>painel admin</h1>
        <p>Gerencie as submissões de jogos recebidas.</p>
      </div>

      {loading && <p className="admin-msg">Carregando submissões…</p>}
      {error   && <p className="admin-msg admin-error">{error}</p>}

      {!loading && !error && submissions.length === 0 && (
        <p className="admin-msg">Nenhuma submissão recebida ainda.</p>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="submissions-list">
          {submissions.map(s => (
            <div key={s.id} className="submission-card">
              <div className="submission-top">
                <div>
                  <h2 className="submission-title">{s.gameTitle}</h2>
                  <p className="submission-meta">
                    {s.studioName && <span>{s.studioName} · </span>}
                    <span>{s.contactEmail}</span>
                    {s.contactRole && <span> · {s.contactRole}</span>}
                  </p>
                </div>
                <span className={`badge ${STATUS_CLASS[s.reviewStatus] || 'badge-pending'}`}>
                  {STATUS_LABEL[s.reviewStatus] || s.reviewStatus}
                </span>
              </div>

              {s.description && (
                <p className="submission-desc">{s.description}</p>
              )}

              <div className="submission-details">
                {s.targetPlatforms && <span>Plataformas: {s.targetPlatforms}</span>}
                {s.launchDateRange  && <span>Previsão: {s.launchDateRange}</span>}
                {s.demoLink && (
                  <a href={s.demoLink} target="_blank" rel="noreferrer">
                    ver demo ↗
                  </a>
                )}
                {s.projectUrl && (
                  <a href={s.projectUrl} target="_blank" rel="noreferrer">
                    página do projeto ↗
                  </a>
                )}
              </div>

              {s.reviewStatus === 'PENDING' && (
                <div className="submission-actions">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleStatus(s.id, 'APPROVED')}
                  >
                    ✓ aprovar
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleStatus(s.id, 'REJECTED')}
                  >
                    ✕ rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
