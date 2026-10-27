'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Ic } from '@/components/ui/atoms'
import UserAvatar from '@/components/ui/UserAvatar'
import PerfilModal from './PerfilModal'
import type { PerfilCtx } from '@/hooks/usePerfil'

interface Props {
  show: boolean
  perfil: PerfilCtx
  userEmail?: string
  dark: boolean
  setDark: (d: boolean) => void
  toast: (msg: string, type?: string) => void
}

// Botão "Configurações" do rodapé da sidebar: abre um menu com o perfil e o modo escuro.
// O menu vai para o body (portal) porque a sidebar tem overflow:hidden.
export default function ConfigMenu({ show, perfil, userEmail, dark, setDark, toast }: Props) {
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null)
  const [modal, setModal] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pos) return
    const fora = (e: MouseEvent) => {
      const t = e.target as Node
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) setPos(null)
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPos(null) }
    const fechar = () => setPos(null)
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    window.addEventListener('resize', fechar)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); window.removeEventListener('resize', fechar) }
  }, [pos])

  function alternar() {
    if (pos) return setPos(null)
    const r = btn.current!.getBoundingClientRect()
    // Sidebar aberta: menu acima do botão. Sidebar recolhida: menu ao lado.
    setPos(show
      ? { left: r.left, bottom: window.innerHeight - r.top + 8 }
      : { left: r.right + 8, bottom: window.innerHeight - r.bottom })
  }

  const item: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'var(--txt)', borderRadius: 8, textAlign: 'left' }
  const hover = { onMouseEnter: (e: any) => (e.currentTarget.style.background = 'var(--hov)'), onMouseLeave: (e: any) => (e.currentTarget.style.background = 'transparent') }

  return (
    <>
      <button ref={btn} onClick={alternar} title="Configurações" aria-haspopup="menu" aria-expanded={!!pos}
        style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, padding: show ? '9px 10px' : '9px', borderRadius: 10, border: 'none', background: pos ? 'rgba(255,255,255,.08)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'var(--sbf)', opacity: pos ? 1 : .65, justifyContent: show ? 'flex-start' : 'center' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.opacity = '1' }}
        onMouseLeave={e => { if (!pos) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '.65' } }}>
        <Ic n="gear" z={16}/>{show && 'Configurações'}
      </button>

      {pos && createPortal(
        <div ref={menu} role="menu" style={{ position: 'fixed', left: pos.left, bottom: pos.bottom, width: 250, background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 14, boxShadow: '0 12px 36px rgba(0,0,0,.25)', padding: 6, zIndex: 9999, animation: 'fadeUp .15s ease', fontFamily: 'var(--font-sans),system-ui,sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 12px', borderBottom: '1px solid var(--brd)', marginBottom: 4 }}>
            <UserAvatar url={perfil.fotoUrl} nome={perfil.nome} size={42}/>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil.nome || 'Perfil sem nome'}</p>
              {perfil.perfil?.cargo && <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil.perfil.cargo}</p>}
              <p style={{ fontSize: 10, color: 'var(--muted)', opacity: .8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
            </div>
          </div>
          <button role="menuitem" style={item} {...hover} onClick={() => { setPos(null); setModal(true) }}><Ic n="person" z={15}/>Meu perfil</button>
          <button role="menuitem" style={item} {...hover} onClick={() => setDark(!dark)}><Ic n={dark ? 'sun' : 'moon'} z={15}/>{dark ? 'Modo claro' : 'Modo escuro'}</button>
        </div>,
        document.body
      )}

      {modal && <PerfilModal ctx={perfil} email={userEmail} onClose={() => setModal(false)} onSaved={() => { setModal(false); toast('Perfil atualizado!', 'success') }}/>}
    </>
  )
}
