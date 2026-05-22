import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import './GameJams.css'

export default function GameJamsPage() {
  const { user } = useAuth()
  const [gameJams, setGameJams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gamejams')
      .then(res => res.json())
      .then(data => setGameJams(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getStatusInfo = (status) => {
    switch(status) {
      case 'ACTIVE': return { label: 'Ativa', class: 'jam-status-active' }
      case 'FINISHED': return { label: 'Encerrada', class: 'jam-status-finished' }
      default: return { label: 'Em breve', class: 'jam-status-upcoming' }
    }
  }

  return (
    <div className="jams-page">
      <div className="container">
        <div className="jams-header">
          <span className="jams-eyebrow">competições & desafios</span>
          <h1 className="jams-title">Game Jams</h1>
          <p className="jams-subtitle">Participe de desafios criativos, desenvolva jogos em tempo recorde e mostre seu talento para a comunidade.</p>
        </div>

        {loading && <p className="admin-msg">Carregando Game Jams...</p>}

        {!loading && gameJams.length === 0 && (
          <div className="jams-empty">
            <span className="jams-empty-icon">🎯</span>
            <h3>Nenhuma Game Jam agendada</h3>
            <p>Fique de olho! Novas competições serão anunciadas em breve.</p>
          </div>
        )}

        <div className="jams-grid">
          {gameJams.map(jam => {
            const statusInfo = getStatusInfo(jam.status)
            return (
              <article key={jam.id} className="jam-card">
                <div className="jam-card-header">
                  <div className="jam-card-top">
                    <h2 className="jam-card-title">{jam.title}</h2>
                    <span className={`jam-status ${statusInfo.class}`}>{statusInfo.label}</span>
                  </div>
                  <p className="jam-card-desc">{jam.description}</p>
                  {jam.theme && (
                    <div className="jam-theme">
                      <span className="jam-theme-label">Tema</span>
                      <span className="jam-theme-value">{jam.theme}</span>
                    </div>
                  )}
                </div>

                <div className="jam-card-footer">
                  <div className="jam-dates">
                    <div className="jam-date">
                      <span className="jam-date-label">Início</span>
                      <span className="jam-date-value">{new Date(jam.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="jam-date-divider"></div>
                    <div className="jam-date">
                      <span className="jam-date-label">Término</span>
                      <span className="jam-date-value">{new Date(jam.endDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  {jam.status !== 'FINISHED' && user && (
                    <button className="btn btn-primary jam-participate-btn">Participar</button>
                  )}
                  {!user && jam.status !== 'FINISHED' && (
                    <span className="jam-login-hint">Faça login para participar</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
