'use client'
import { Menu, ChevronRight, Moon, Sun, LogOut, User } from 'lucide-react'
import { PAGE_TITLES, type PageId } from './App'

interface Props {
  page: PageId; mob: boolean; dark: boolean; sideOpen: boolean
  setDark: (d: boolean) => void
  onOpenSide: () => void; onOpenMob: () => void; onLogout: () => void
}

export default function Header({ page, mob, dark, setDark, sideOpen, onOpenSide, onOpenMob, onLogout }: Props) {
  return (
    <header style={{ flexShrink:0, background:'var(--card)', borderBottom:'1px solid var(--brd)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12, zIndex:10 }}>
      {mob
        ? <button onClick={onOpenMob} style={{ padding:7, borderRadius:9, border:'none', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex' }}><Menu size={19} /></button>
        : !sideOpen && <button onClick={onOpenSide} style={{ padding:7, borderRadius:9, border:'none', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex' }}><ChevronRight size={18} /></button>
      }
      <div style={{ flex:1, minWidth:0 }}>
        <h1 style={{ fontSize: mob ? 13 : 15, fontWeight:900, color:'var(--txt)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {PAGE_TITLES[page] || 'SIGCOMP'}
        </h1>
        {!mob && <p style={{ fontSize:10, color:'var(--muted)' }}>Prefeitura Municipal de Gameleira — PE</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
        {mob && (
          <button onClick={() => setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:'1px solid var(--brd)', background:'var(--card)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}
        <div style={{ width:34, height:34, borderRadius:10, background:'#e8f5ec', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <User size={17} color="#1a5c38" />
        </div>
        {!mob && (
          <button onClick={onLogout} title="Sair" style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #fca5a544', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626' }}>
            <LogOut size={16} color="#dc2626" />
          </button>
        )}
      </div>
    </header>
  )
}
