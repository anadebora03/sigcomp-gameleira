'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Ic } from '@/components/ui/atoms'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true)
    setErro('')
    const { error } = await signIn(email.trim(), senha)
    if (error) {
      setErro(
        error.includes('Invalid login') || error.includes('invalid_credentials')
          ? 'E-mail ou senha incorretos.'
          : error.includes('Email not confirmed')
          ? 'Confirme seu e-mail antes de entrar.'
          : error
      )
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
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
        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 28px 90px rgba(0,0,0,.45)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1a5c38,#2d8f5e)', padding: '36px 32px', textAlign: 'center', color: '#fff' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.18)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Ic n="building" z={28} c="#fff"/>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-.3px' }}>SIGCOMP</h1>
            <p style={{ fontSize: 12, opacity: .8, margin: '5px 0 0' }}>Sistema de Gestão de Compras</p>
            <p style={{ fontSize: 10, opacity: .6, margin: '3px 0 0' }}>Prefeitura Municipal de Gameleira / PE</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ padding: '28px 32px 32px' }}>
            {/* Error */}
            {erro && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Ic n="alert" z={15} c="#dc2626"/>
                <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{erro}</p>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#4a6155', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>E-mail institucional</label>
              <input
                type="email" value={email} autoComplete="email" required
                onChange={e => { setEmail(e.target.value); setErro('') }}
                style={IS} placeholder="seu@gameleira.pe.gov.br"
                onFocus={e => { e.target.style.borderColor = '#1a5c38'; e.target.style.boxShadow = '0 0 0 3px #1a5c3820' }}
                onBlur={e => { e.target.style.borderColor = '#d4e8d9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Senha */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#4a6155', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={senha}
                  autoComplete="current-password" required
                  onChange={e => { setSenha(e.target.value); setErro('') }}
                  style={{ ...IS, paddingRight: 44 }} placeholder="••••••••"
                  onFocus={e => { e.target.style.borderColor = '#1a5c38'; e.target.style.boxShadow = '0 0 0 3px #1a5c3820' }}
                  onBlur={e => { e.target.style.borderColor = '#d4e8d9'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a6155', display: 'flex' }}>
                  <Ic n="eye" z={16}/>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: loading ? '#2d8f5e' : '#1a5c38',
              color: '#fff', fontWeight: 800, fontSize: 14, border: 'none',
              borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? .8 : 1, fontFamily: 'inherit',
              boxShadow: '0 4px 18px #1a5c3840', transition: 'all .2s',
            }}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>

            {/* Esqueci */}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <Link href="/recuperar-senha" style={{ fontSize: 12, color: '#1a5c38', fontWeight: 600, textDecoration: 'none' }}>
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 20 }}>
          © {new Date().getFullYear()} Prefeitura Municipal de Gameleira — PE
        </p>
      </div>
    </div>
  )
}
