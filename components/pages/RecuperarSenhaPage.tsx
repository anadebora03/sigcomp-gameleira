'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Ic } from '@/components/ui/atoms'

export default function RecuperarSenhaPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setErro('Digite seu e-mail.'); return }
    setLoading(true)
    setErro('')
    const { error } = await resetPassword(email.trim())
    setLoading(false)
    if (error) {
      setErro(error.includes('User not found') ? 'E-mail não encontrado.' : error)
    } else {
      setSent(true)
    }
  }

  const IS: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: '1.5px solid #d4e8d9', background: '#f5f9f6',
    color: '#0a1f10', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg,#0d2a0d,#1a5c38,#0d3d22)',
      padding: 16, fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 28px 90px rgba(0,0,0,.45)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1a5c38,#2d8f5e)', padding: '28px 32px', textAlign: 'center', color: '#fff' }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,.18)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Ic n="lock" z={24} c="#fff"/>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Recuperar Senha</h1>
            <p style={{ fontSize: 11, opacity: .8, margin: '5px 0 0' }}>SIGCOMP — Prefeitura de Gameleira</p>
          </div>

          <div style={{ padding: '28px 32px 32px' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Ic n="check" z={28} c="#1a5c38"/>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a1f10', marginBottom: 10 }}>E-mail enviado!</h2>
                <p style={{ fontSize: 13, color: '#4a6155', lineHeight: 1.6, marginBottom: 24 }}>
                  Enviamos um link de recuperação para <strong>{email}</strong>.<br/>
                  Verifique sua caixa de entrada e spam.
                </p>
                <Link href="/login" style={{ display: 'block', padding: '12px', background: '#1a5c38', color: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 11, textDecoration: 'none', textAlign: 'center' }}>
                  Voltar ao Login
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p style={{ fontSize: 13, color: '#4a6155', marginBottom: 20, lineHeight: 1.6 }}>
                  Digite seu e-mail institucional. Enviaremos um link para redefinir sua senha.
                </p>

                {erro && (
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Ic n="alert" z={15} c="#dc2626"/>
                    <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{erro}</p>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#4a6155', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>E-mail institucional</label>
                  <input
                    type="email" value={email} required
                    onChange={e => { setEmail(e.target.value); setErro('') }}
                    style={IS} placeholder="seu@gameleira.pe.gov.br"
                    onFocus={e => { e.target.style.borderColor = '#1a5c38'; e.target.style.boxShadow = '0 0 0 3px #1a5c3820' }}
                    onBlur={e => { e.target.style.borderColor = '#d4e8d9'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px', background: '#1a5c38',
                  color: '#fff', fontWeight: 800, fontSize: 13, border: 'none',
                  borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? .8 : 1, fontFamily: 'inherit',
                  boxShadow: '0 4px 18px #1a5c3840',
                }}>
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <Link href="/login" style={{ fontSize: 12, color: '#1a5c38', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Ic n="chevL" z={13} c="#1a5c38"/>Voltar ao Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
