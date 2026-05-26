'use client'
import { Ic } from '@/components/ui/atoms'
import { PAGE_TITLES, type PageId } from './App'

interface Props {
  page: PageId; mob: boolean; dark: boolean; sideOpen: boolean; userEmail?: string
  setDark: (d: boolean) => void
  onOpenSide: () => void; onOpenMob: () => void; onLogout: () => void
}

export default function Header({ page, mob, dark, setDark, sideOpen, onOpenSide, onOpenMob, onLogout, userEmail }: Props) {
  const initial = userEmail ? userEmail[0].toUpperCase() : '?'
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
        <div style={{ width:34, height:34, borderRadius:10, background:'#e8f5ec', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:'#1a5c38' }} title={userEmail}>
          {initial}
        </div>
        {/* Logout */}
        <button onClick={onLogout} title="Sair do sistema"
          style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #fca5a544', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626' }}>
          <Ic n="logout" z={16} c="#dc2626"/>
        </button>
      </div>
    </header>
  )
}
