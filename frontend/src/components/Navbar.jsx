import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Gview logo">
            <polygon points="6,4 26,16 6,28" fill="var(--color-accent)" />
            <rect x="22" y="4" width="4" height="24" rx="2" fill="var(--color-accent-2)" />
          </svg>
          <span className="navbar-brand">gview</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className="nav-link">demos</Link>
          <Link to="/jams" className="nav-link">game jams</Link>
          {isAdmin && <Link to="/admin" className="nav-link nav-link-admin">admin</Link>}
          <Link to="/submit" className="nav-link nav-link-cta">envie seu jogo</Link>

          {user ? (
            <div className="nav-user-area">
              <Link to="/profile" className="nav-user-btn" title="Meu perfil">
                <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="nav-username">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="nav-link nav-link-logout" title="Sair">sair</button>
            </div>
          ) : (
            <Link to="/login" className="nav-link nav-link-login">entrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
