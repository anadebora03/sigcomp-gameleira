'use client'
import { useState } from 'react'
import { Building2 } from 'lucide-react'

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@gameleira.pe.gov.br')
  const [senha, setSenha] = useState('admin123')
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 800)
  }

  const IS: React.CSSProperties = {
    width:'100%', padding:'9px 12px', borderRadius:9,
    border:'1.5px solid #d4e8d9', background:'#f5f9f6',
    color:'#0a1f10', fontSize:13, outline:'none', fontFamily:'inherit',
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0d2a0d,#1a5c38,#0d3d22)', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,.4)' }}>
          <div style={{ background:'linear-gradient(135deg,#1a5c38,#2d8f5e)', padding:'32px 28px', textAlign:'center', color:'#fff' }}>
            <div style={{ width:60, height:60, background:'rgba(255,255,255,.18)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Building2 size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, margin:0 }}>SIGCOMP</h1>
            <p style={{ fontSize:12, opacity:.8, margin:'4px 0 0' }}>Sistema de Gestão de Compras</p>
            <p style={{ fontSize:10, opacity:.6, margin:'3px 0 0' }}>Prefeitura Municipal de Gameleira/PE</p>
          </div>
          <form onSubmit={submit} style={{ padding:'24px 28px 28px' }}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', display:'block', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={IS} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', display:'block', marginBottom:6 }}>Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} style={IS} />
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', padding:13, background:'#1a5c38', color:'#fff', fontWeight:800, fontSize:13, border:'none', borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily:'inherit' }}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
