import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()

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
          <Link to="/submit" className="nav-link nav-link-cta">envie seu jogo</Link>
        </nav>
      </div>
    </header>
  )
}
