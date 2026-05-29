import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../pages/Auth.css'

const GviewIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <polygon points="6,4 26,16 6,28" fill="var(--color-accent)" />
    <rect x="22" y="4" width="4" height="24" rx="2" fill="var(--color-accent-2)" />
  </svg>
)

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }
      if (form.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
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
          <div className="auth-icon"><GviewIcon /></div>
          <h1 className="auth-title">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Entre na sua conta para acessar sua lista de desejos, avaliações e mais.'
              : 'Junte-se à comunidade Gview. Salve demos, avalie jogos e participe de Game Jams.'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nome completo</label>
              <input
                id="auth-name"
                type="text"
                required
                placeholder="Seu nome"
                value={form.name}
                onChange={set('name')}
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="seu@email.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              type="password"
              required
              placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
              value={form.password}
              onChange={set('password')}
            />
          </div>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirmar senha</label>
              <input
                id="auth-confirm"
                type="password"
                required
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
              />
            </div>
          )}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? (isLogin ? 'Entrando...' : 'Criando conta...')
              : (isLogin ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <p className="auth-footer">
          {isLogin
            ? <><span>Não tem conta? </span><Link to="/register">Criar conta</Link></>
            : <><span>Já tem conta? </span><Link to="/login">Entrar</Link></>}
        </p>
      </div>
    </div>
  )
}