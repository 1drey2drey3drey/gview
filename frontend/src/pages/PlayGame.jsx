import { useParams, Link } from 'react-router-dom'
import { mockGames } from '../services/mockData'

export default function PlayGame() {
  const { slug } = useParams()
  const game = mockGames.find(g => g.slug === slug)

  if (!game || !game.demoUrl) return (
    <div className="container" style={{padding:'4rem 0'}}>
      <p>Demo não disponível.</p>
      <Link to="/" className="btn btn-ghost" style={{marginTop:'1rem'}}>← voltar</Link>
    </div>
  )

  return (
    <div style={{background:'#000', minHeight:'calc(100dvh - 65px)', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderBottom:'1px solid var(--color-border)', background:'var(--color-surface)'}}>
        <Link to={`/game/${slug}`} className="btn btn-ghost" style={{padding:'0.3rem 0.8rem', fontSize:'var(--text-xs)'}}>← voltar</Link>
        <span style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>{game.title}</span>
      </div>
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', flexDirection:'column', gap:'1.5rem'}}>
        <iframe
          src={game.demoUrl}
          title={game.title}
          width="960"
          height="540"
          style={{border:'none', borderRadius:'0.5rem', maxWidth:'100%'}}
          allow="autoplay; fullscreen; gamepad"
        />
      </div>
    </div>
  )
}
