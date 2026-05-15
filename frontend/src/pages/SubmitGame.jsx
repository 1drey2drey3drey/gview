import { useState } from 'react'
import './SubmitGame.css'

export default function SubmitGame() {
  const [form, setForm] = useState({
    gameTitle:'', projectUrl:'', description:'', launchPlans:'',
    targetPlatforms:'', launchDateRange:'', demoLink:'',
    contactRole:'', contactEmail:'', studioName:''
  })
  const [sent, setSent] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    } catch (_) {}
    setSent(true)
  }

  if (sent) return (
    <div className="container submit-success">
      <h2>🚀 Submissão enviada!</h2>
      <p>Obrigado! Nossa equipe vai analisar e entrar em contato pelo e-mail informado.</p>
    </div>
  )

  return (
    <div className="container submit-page">
      <div className="submit-header">
        <h1>envie seu jogo</h1>
        <p>Está desenvolvendo uma demo incrível? Adoraríamos conhecer! Preencha as informações abaixo e nossa equipe entrará em contato.</p>
      </div>
      <form className="submit-form" onSubmit={submit}>
        <fieldset>
          <legend>sobre o jogo</legend>
          <Field label="Título do jogo *" name="gameTitle" value={form.gameTitle} onChange={handle} required />
          <Field label="Link do projeto ou página Steam" name="projectUrl" value={form.projectUrl} onChange={handle} placeholder="https://" />
          <Field label="Conte sobre o jogo *" name="description" value={form.description} onChange={handle} required textarea hint="O que é? O que o torna único? Quais são os planos?" />
        </fieldset>
        <fieldset>
          <legend>planos de lançamento</legend>
          <Field label="Como planeja lançar e divulgar o jogo?" name="launchPlans" value={form.launchPlans} onChange={handle} textarea />
          <Field label="Plataformas-alvo" name="targetPlatforms" value={form.targetPlatforms} onChange={handle} placeholder="PC, Steam..." />
          <Field label="Previsão de lançamento" name="launchDateRange" value={form.launchDateRange} onChange={handle} placeholder="Ex: Q2 2026" />
        </fieldset>
        <fieldset>
          <legend>sobre a demo</legend>
          <Field label="Link da demo ou vídeo de gameplay" name="demoLink" value={form.demoLink} onChange={handle} placeholder="Steam, itch.io, link direto..." hint="Se não tiver demo, adicione link para vídeo de gameplay." />
        </fieldset>
        <fieldset>
          <legend>contato</legend>
          <Field label="Seu papel no projeto *" name="contactRole" value={form.contactRole} onChange={handle} required placeholder="Desenvolvedor, produtor, publisher..." />
          <Field label="E-mail *" name="contactEmail" value={form.contactEmail} onChange={handle} required type="email" />
          <Field label="Estúdio ou empresa" name="studioName" value={form.studioName} onChange={handle} />
        </fieldset>
        <button type="submit" className="btn btn-primary" style={{marginTop:'1rem'}}>Enviar submissão 🚀</button>
      </form>
    </div>
  )
}

function Field({ label, name, value, onChange, required, textarea, hint, placeholder, type='text' }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      {textarea
        ? <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={4} />
        : <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} />
      }
    </div>
  )
}
