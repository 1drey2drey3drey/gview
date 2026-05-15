import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span className="footer-brand">gview</span>
          <span className="footer-tagline">demos de jogos no navegador</span>
        </div>
        <nav className="footer-links">
          <Link to="/submit">envie seu jogo</Link>
          <a href="#" target="_blank" rel="noopener noreferrer">sobre</a>
          <a href="#" target="_blank" rel="noopener noreferrer">termos de uso</a>
          <a href="#" target="_blank" rel="noopener noreferrer">privacidade</a>
        </nav>
      </div>
    </footer>
  )
}
