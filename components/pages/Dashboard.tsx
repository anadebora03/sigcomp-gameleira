'use client'
import { useState, useEffect } from 'react'
import { Ic, Card, Sb, G } from '@/components/ui/atoms'
import { SECS, STO } from '@/lib/constants'
import { gS } from '@/utils/helpers'
import { fD, isOv, isSn } from '@/utils/formatters'
import { getUser } from '@/services/auth'

function useMob() {
  const [w, sw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => { const f = () => sw(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return w < 640
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

function ClockBar({ saudacao, nomeUsuario, errorMessage }: { saudacao: string; nomeUsuario: string; errorMessage?: string | null }) {
  const now = useClock()
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dia = dias[now.getDay()]
  const data = `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`
  const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div style={{ background: 'linear-gradient(135deg,#0d3d22,#1a5c38)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ minWidth: 240 }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>{saudacao}, {nomeUsuario}!</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', margin: '8px 0 0', maxWidth: 420, lineHeight: 1.4 }}>Painel principal com dados de ofícios, processos e pesquisas de preço.</p>
        {errorMessage && <p style={{ fontSize: 11, color: '#fcd34d', margin: '8px 0 0' }}>{errorMessage}</p>}
      </div>
      <div style={{ textAlign: 'right', minWidth: 180 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 600, margin: 0 }}>{dia} — {data}</p>
        <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '6px 0 0', fontFamily: 'monospace', lineHeight: 1 }}>{hora}</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Horário de Brasília</p>
      </div>
    </div>
  )
}

export default function Dashboard({ user, oficios, processos, pesquisas }: any) {
  const mob = useMob()
  const [nomeUsuario, setNomeUsuario] = useState('Usuário')
  const [nomeError, setNomeError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const extractName = (value: string) => {
      const clean = value.trim()
      if (!clean) return 'Usuário'
      return clean.split(' ')[0]
    }

    if (typeof user.user_metadata?.nome === 'string' && user.user_metadata.nome.trim()) {
      setNomeUsuario(extractName(user.user_metadata.nome))
      return
    }

    async function loadNome() {
      try {
        const result = await getUser(user.id)
        if (result.success && result.data) {
          const candidate = result.data.nome_completo || result.data.nome || result.data.display_name
          if (candidate) {
            setNomeUsuario(extractName(candidate))
            return
          }
        } else {
          console.error('[dashboard] erro ao buscar usuário:', result.error)
          setNomeError('Não foi possível buscar seu nome no sistema. Usando o e-mail como fallback.')
        }
      } catch (err) {
        console.error('[dashboard] erro ao buscar usuário:', err)
        setNomeError('Não foi possível carregar seu nome no momento.')
      }

      if (user?.email) {
        setNomeUsuario(user.email.split('@')[0])
      }
    }

    loadNome()
  }, [user])

  const now = new Date()
  const hour = now.getHours()
  let saudacao = 'Bom dia'
  if (hour >= 12 && hour < 18) saudacao = 'Boa tarde'
  else if (hour >= 18 || hour < 6) saudacao = 'Boa noite'

  const at = oficios.filter((o: any) => isOv(o.prazo) && !['concluido', 'arquivado'].includes(o.status))
  const venc = oficios.filter((o: any) => isSn(o.prazo) && !['concluido', 'arquivado'].includes(o.status))
  const cards = [
    { l: 'Total de Ofícios', v: oficios.length, g: '#1a5c38,#2d8f5e', i: 'file' },
    { l: 'Pendentes', v: oficios.filter((o: any) => o.status === 'pendente').length, g: '#a07800,#c9a227', i: 'alert' },
    { l: 'Concluídos', v: oficios.filter((o: any) => o.status === 'concluido').length, g: '#0d3d22,#1a5c38', i: 'check' },
    { l: 'Processos', v: processos.length, g: '#0a1628,#0F1E3A', i: 'gavel' },
    { l: 'Pesquisas de Preço', v: pesquisas.length, g: '#1a5c38,#22744a', i: 'check_sq' },
    { l: 'Atrasados', v: at.length, g: '#7a5a00,#c9a227', i: 'clock' },
  ]
  const bySec = SECS.map(s => ({ ...s, n: oficios.filter((o: any) => o.secretaria_id === s.id).length })).sort((a: any, b: any) => b.n - a.n)
  const mx = Math.max(...bySec.map((s: any) => s.n), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ClockBar saudacao={saudacao} nomeUsuario={nomeUsuario} errorMessage={nomeError} />
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(6,1fr)', gap: 12 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg,${c.g})`, borderRadius: 16, padding: 16, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.15)', animation: `fadeUp .4s ease ${i * .06}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <Ic n={c.i} z={20} c='rgba(255,255,255,.85)' />
              <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{c.v}</span>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, opacity: .9 }}>{c.l}</p>
          </div>
        ))}
      </div>
      {(at.length > 0 || venc.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14 }}>
          {at.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ic n='alert' z={14} c='#dc2626' />Atrasados ({at.length})
              </p>
              {at.slice(0, 4).map((o: any) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fee2e2' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', fontFamily: 'monospace' }}>{o.numero}</span>
                  <span style={{ fontSize: 10, color: '#b91c1c' }}>{fD(o.prazo)}</span>
                </div>
              ))}
            </div>
          )}
          {venc.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#d97706', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ic n='clock' z={14} c='#d97706' />Vencendo ({venc.length})
              </p>
              {venc.slice(0, 4).map((o: any) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fef3c7' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', fontFamily: 'monospace' }}>{o.numero}</span>
                  <span style={{ fontSize: 10, color: '#b45309' }}>{fD(o.prazo)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14 }}>
        <Card style={{ padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n='chart' z={16} c={G} />Ofícios por Secretaria
          </p>
          {bySec.map((s: any) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>{s.sigla}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: s.cor }}>{s.n}</span>
              </div>
              <div style={{ height: 5, background: 'var(--brd)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (s.n / mx * 100) + '%', background: s.cor, borderRadius: 99, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n='hist' z={16} c={G} />Últimas Movimentações
          </p>
          {[...oficios].reverse().slice(0, 6).map((o: any) => {
            const s = gS(o.secretaria_id)
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--brd)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.cor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.numero} — {o.assunto}</p>
                  <p style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sigla} · {fD(o.data)}</p>
                </div>
                <Sb v={o.status} list={STO} sm />
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
