import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="6,4 26,16 6,28" fill="var(--color-accent)" />
              <rect x="22" y="4" width="4" height="24" rx="2" fill="var(--color-accent-2)" />
            </svg>
          </div>
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Junte-se à comunidade Gview. Salve demos, avalie jogos e participe de Game Jams.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="reg-name">Nome completo</label>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="Seu nome"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-email">E-mail</label>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-password">Senha</label>
            <input
              id="reg-password"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-confirm">Confirmar senha</label>
            <input
              id="reg-confirm"
              type="password"
              required
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
