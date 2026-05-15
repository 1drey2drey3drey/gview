import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="container" style={{padding:'5rem 0', textAlign:'center'}}>
      <p style={{fontSize:'var(--text-2xl)', fontWeight:700, marginBottom:'1rem'}}>404</p>
      <p style={{color:'var(--color-text-muted)', marginBottom:'2rem'}}>Página não encontrada.</p>
      <Link to="/" className="btn btn-primary">← voltar para home</Link>
    </div>
  )
}
