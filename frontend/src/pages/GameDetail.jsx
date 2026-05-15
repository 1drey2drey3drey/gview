import { useParams, Link } from 'react-router-dom'
import { mockGames } from '../services/mockData'

export default function GameDetail() {
  const { slug } = useParams()
  const game = mockGames.find(g => g.slug === slug)

  if (!game) return (
    <div className="container" style={{padding:'4rem 0'}}>
      <p>Jogo não encontrado.</p>
      <Link to="/" className="btn btn-ghost" style={{marginTop:'1rem'}}>← voltar</Link>
    </div>
  )

  return (
    <div className="container" style={{padding:'3rem 0', display:'flex', gap:'3rem', flexWrap:'wrap'}}>
      <img
        src={game.coverUrl}
        alt={game.title}
        width="260"
        height="360"
        style={{borderRadius:'0.75rem', objectFit:'cover', flexShrink:0}}
        loading="lazy"
      />
      <div style={{flex:1, minWidth:'260px'}}>
        <span className="badge" style={{marginBottom:'1rem', display:'inline-block'}}>demo</span>
        <h1 style={{fontSize:'var(--text-xl)', fontWeight:700, marginBottom:'1rem'}}>{game.title}</h1>
        <p style={{color:'var(--color-text-muted)', marginBottom:'2rem', maxWidth:'52ch', lineHeight:1.7}}>{game.fullDescription}</p>
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
          {game.demoUrl
            ? <Link to={`/play/${game.slug}`} className="btn btn-primary">▶ jogar demo</Link>
            : <span className="badge badge-coming" style={{padding:'0.6rem 1.2rem'}}>em breve</span>
          }
          <button className="btn btn-ghost">♡ lista de desejos</button>
        </div>
        <div style={{marginTop:'2rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          {game.genre      && <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>gênero: <span style={{color:'var(--color-text)'}}>{game.genre}</span></p>}
          {game.studioName && <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>estúdio: <span style={{color:'var(--color-text)'}}>{game.studioName}</span></p>}
          {game.launchWindow && <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>lançamento: <span style={{color:'var(--color-text)'}}>{game.launchWindow}</span></p>}
        </div>
      </div>
    </div>
  )
}
