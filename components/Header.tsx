'use client'
import { useState, useEffect, useRef } from 'react'
import { Ic } from '@/components/ui/atoms'
import UserAvatar from '@/components/ui/UserAvatar'
import PerfilModal from './PerfilModal'
import type { PerfilCtx } from '@/hooks/usePerfil'
import { PAGE_TITLES, type PageId } from './App'

interface Props {
  page: PageId; mob: boolean; dark: boolean; sideOpen: boolean; userEmail?: string
  perfil: PerfilCtx
  setDark: (d: boolean) => void
  onOpenSide: () => void; onOpenMob: () => void; onLogout: () => void
  toast: (msg: string, type?: string) => void
}

function UserMenu({ perfil, userEmail, onLogout, toast }: Pick<Props, 'perfil' | 'userEmail' | 'onLogout' | 'toast'>) {
  const [aberto, setAberto] = useState(false)
  const [modal, setModal] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc) }
  }, [aberto])

  const item: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'var(--txt)', borderRadius: 8, textAlign: 'left' }
  const hover = { onMouseEnter: (e: any) => (e.currentTarget.style.background = 'var(--hov)'), onMouseLeave: (e: any) => (e.currentTarget.style.background = 'transparent') }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setAberto(a => !a)} title="Meu perfil" aria-haspopup="menu" aria-expanded={aberto}
        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '50%', display: 'flex', boxShadow: aberto ? '0 0 0 3px #1a5c3830' : 'none' }}>
        <UserAvatar url={perfil.fotoUrl} nome={perfil.nome} size={34}/>
      </button>
      {aberto && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 250, background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 14, boxShadow: '0 12px 36px rgba(0,0,0,.18)', padding: 6, zIndex: 60, animation: 'fadeUp .15s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 12px', borderBottom: '1px solid var(--brd)', marginBottom: 4 }}>
            <UserAvatar url={perfil.fotoUrl} nome={perfil.nome} size={42}/>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil.nome || 'Perfil sem nome'}</p>
              {perfil.perfil?.cargo && <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil.perfil.cargo}</p>}
              <p style={{ fontSize: 10, color: 'var(--muted)', opacity: .8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
            </div>
          </div>
          <button role="menuitem" style={item} {...hover} onClick={() => { setAberto(false); setModal(true) }}><Ic n="person" z={15}/>Meu perfil</button>
          <button role="menuitem" style={item} {...hover} onClick={() => { setAberto(false); setModal(true) }}><Ic n="edit" z={15}/>Editar perfil</button>
          <button role="menuitem" style={{ ...item, color: '#dc2626' }} {...hover} onClick={() => { setAberto(false); onLogout() }}><Ic n="logout" z={15} c="#dc2626"/>Sair</button>
        </div>
      )}
      {modal && <PerfilModal ctx={perfil} email={userEmail} onClose={() => setModal(false)} onSaved={() => { setModal(false); toast('Perfil atualizado!', 'success') }}/>}
    </div>
  )
}

export default function Header({ page, mob, dark, setDark, sideOpen, onOpenSide, onOpenMob, onLogout, userEmail, perfil, toast }: Props) {
  return (
    <header style={{ flexShrink:0, background:'var(--card)', borderBottom:'1px solid var(--brd)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12, zIndex:10 }}>
      {mob
        ? <button onClick={onOpenMob} style={{ padding:7, borderRadius:9, border:'none', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex' }}><Ic n="menu" z={19}/></button>
        : !sideOpen && <button onClick={onOpenSide} style={{ padding:7, borderRadius:9, border:'none', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex' }}><Ic n="chevR" z={18}/></button>
      }
      <div style={{ flex:1, minWidth:0 }}>
        <h1 style={{ fontSize:mob?13:15, fontWeight:900, color:'var(--txt)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {PAGE_TITLES[page]}
        </h1>
        {!mob && <p style={{ fontSize:10, color:'var(--muted)' }}>Prefeitura Municipal de Gameleira — PE</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
        {mob && (
          <button onClick={() => setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:'1px solid var(--brd)', background:'var(--card)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n={dark?'sun':'moon'} z={15}/>
          </button>
        )}
        {/* User avatar */}
        <UserMenu perfil={perfil} userEmail={userEmail} onLogout={onLogout} toast={toast}/>
        {/* Logout */}
        <button onClick={onLogout} title="Sair do sistema"
          style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #fca5a544', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626' }}>
          <Ic n="logout" z={16} c="#dc2626"/>
        </button>
      </div>
    </header>
  )
}
