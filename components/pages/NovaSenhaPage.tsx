'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Ic } from '@/components/ui/atoms'

export default function NovaSenhaPage() {
  const { updatePassword, user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [erro, setErro] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [temToken, setTemToken] = useState(false)
  const [callbackError, setCallbackError] = useState<string | null>(null)

  // Detectar se estamos em um fluxo de convite/reset (query ou hash na URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.replace(/^#/, '')
    const hashParams = new URLSearchParams(hash)

    const authParams = {
      code: params.get('code') || hashParams.get('code'),
      type: params.get('type') || hashParams.get('type'),
      access_token: params.get('access_token') || hashParams.get('access_token'),
      refresh_token: params.get('refresh_token') || hashParams.get('refresh_token'),
      token: params.get('token') || hashParams.get('token'),
      token_hash: params.get('token_hash') || hashParams.get('token_hash'),
      error_description:
        params.get('error_description') || hashParams.get('error_description'),
    }

    const hasAuthParams = Object.values(authParams).some(Boolean)
    console.log('[NovaSenhaPage] URL callback params:', { authParams, hasUser: !!user })

    if (hasAuthParams) {
      setTemToken(true)
      console.log('[NovaSenhaPage] Fluxo de convite/recuperação detectado, preservando página')

      const getSessionFromUrl = (supabase.auth as any).getSessionFromUrl
      if (typeof getSessionFromUrl === 'function') {
        getSessionFromUrl()
          .then((result: any) => {
            console.log('[NovaSenhaPage] getSessionFromUrl resultado:', result)
            if (result?.error) setCallbackError(result.error.message || 'Erro ao processar callback')
          })
          .catch((err: unknown) => {
            console.error('[NovaSenhaPage] getSessionFromUrl exceção:', err)
            setCallbackError(String(err))
          })
      }

      return
    }

    const timer = setTimeout(() => {
      if (!user) {
        console.log('[NovaSenhaPage] Sem callback de auth e sem usuário, redirecionando para /login')
        router.push('/login')
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [user, router, supabase.auth])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
    if (senha !== confirma) { setErro('As senhas não conferem.'); return }
    setLoading(true)
    setErro('')
    console.log('[NovaSenhaPage] Atualizando senha...')
    const { error } = await updatePassword(senha)
    setLoading(false)
    if (error) {
      console.error('[NovaSenhaPage] Erro ao atualizar:', error)
      setErro(error)
    } else {
      console.log('[NovaSenhaPage] Senha atualizada com sucesso')
      setDone(true)
      setTimeout(() => {
        console.log('[NovaSenhaPage] Redirecionando para login')
        router.push('/login')
      }, 2500)
    }
  }

  const IS: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: '1.5px solid #d4e8d9', background: '#f5f9f6',
    color: '#0a1f10', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  // Strength indicator
  const strength = senha.length === 0 ? 0 : senha.length < 6 ? 1 : senha.length < 10 ? 2 : /[A-Z]/.test(senha) && /[0-9]/.test(senha) ? 4 : 3
  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const strengthColor = ['', '#dc2626', '#d97706', '#1a5c38', '#059669']

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg,#0d2a0d,#1a5c38,#0d3d22)',
      padding: 16, fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 28px 90px rgba(0,0,0,.45)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1a5c38,#2d8f5e)', padding: '28px 32px', textAlign: 'center', color: '#fff' }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,.18)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Ic n="lock" z={24} c="#fff"/>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Nova Senha</h1>
            <p style={{ fontSize: 11, opacity: .8, margin: '5px 0 0' }}>SIGCOMP — Prefeitura de Gameleira</p>
          </div>

          <div style={{ padding: '28px 32px 32px' }}>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Ic n="check" z={28} c="#1a5c38"/>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a1f10', marginBottom: 10 }}>Senha alterada!</h2>
                <p style={{ fontSize: 13, color: '#4a6155' }}>Redirecionando para o sistema...</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                {erro && (
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Ic n="alert" z={15} c="#dc2626"/>
                    <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{erro}</p>
                  </div>
                )}

                {/* Nova senha */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#4a6155', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Nova Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} value={senha} required
                      onChange={e => { setSenha(e.target.value); setErro('') }}
                      style={{ ...IS, paddingRight: 44 }} placeholder="Mínimo 8 caracteres"
                      onFocus={e => { e.target.style.borderColor = '#1a5c38'; e.target.style.boxShadow = '0 0 0 3px #1a5c3820' }}
                      onBlur={e => { e.target.style.borderColor = '#d4e8d9'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a6155', display: 'flex' }}>
                      <Ic n="eye" z={16}/>
                    </button>
                  </div>
                  {senha && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${strength * 25}%`, background: strengthColor[strength], borderRadius: 99, transition: 'all .3s' }}/>
                      </div>
                      <p style={{ fontSize: 10, color: strengthColor[strength], fontWeight: 700, marginTop: 4 }}>Força: {strengthLabel[strength]}</p>
                    </div>
                  )}
                </div>

                {/* Confirmar */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#4a6155', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Confirmar Nova Senha</label>
                  <input
                    type={showPass ? 'text' : 'password'} value={confirma} required
                    onChange={e => { setConfirma(e.target.value); setErro('') }}
                    style={{ ...IS, borderColor: confirma && confirma !== senha ? '#dc2626' : '#d4e8d9' }}
                    placeholder="Repita a senha"
                    onFocus={e => { e.target.style.borderColor = '#1a5c38'; e.target.style.boxShadow = '0 0 0 3px #1a5c3820' }}
                    onBlur={e => { e.target.style.borderColor = confirma && confirma !== senha ? '#dc2626' : '#d4e8d9'; e.target.style.boxShadow = 'none' }}
                  />
                  {confirma && senha !== confirma && (
                    <p style={{ fontSize: 10, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>As senhas não conferem.</p>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px', background: '#1a5c38',
                  color: '#fff', fontWeight: 800, fontSize: 13, border: 'none',
                  borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? .8 : 1, fontFamily: 'inherit',
                  boxShadow: '0 4px 18px #1a5c3840',
                }}>
                  {loading ? 'Salvando...' : 'Definir Nova Senha'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
