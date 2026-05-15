import { Link } from 'react-router-dom'
import './GameCard.css'

export default function GameCard({ game }) {
  return (
    <Link to={`/game/${game.slug}`} className="game-card">
      <div className="game-card-cover">
        <img
          src={game.coverUrl || `https://picsum.photos/seed/${game.slug}/300/400`}
          alt={game.title}
          width="300"
          height="400"
          loading="lazy"
        />
        {game.status === 'COMING_SOON' && (
          <span className="game-card-overlay-badge badge badge-coming">em breve</span>
        )}
        {game.status === 'FEATURED' && (
          <span className="game-card-overlay-badge badge badge-accent">destaque</span>
        )}
      </div>
      <div className="game-card-info">
        <h3 className="game-card-title">{game.title}</h3>
        <p className="game-card-studio">{game.studioName}</p>
      </div>
    </Link>
  )
}
