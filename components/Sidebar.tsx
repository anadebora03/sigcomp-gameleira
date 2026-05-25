'use client'
import { LayoutDashboard, FileText, Gavel, CheckSquare, Building2, Bell, BarChart3, Users, FileSearch, Moon, Sun, LogOut, X, ChevronLeft } from 'lucide-react'
import type { PageId } from './App'

const NAV = [
  {id:'dashboard',  l:'Dashboard',          Icon:LayoutDashboard},
  {id:'oficios',    l:'Ofícios',             Icon:FileText},
  {id:'processos',  l:'Processos Licit.',    Icon:Gavel},
  {id:'pesquisas',  l:'Pesquisas de Preço',  Icon:CheckSquare},
  {id:'secretarias',l:'Secretarias',         Icon:Building2},
  {id:'alertas',    l:'Alertas',             Icon:Bell, badge:true},
  {id:'relatorios', l:'Relatórios',          Icon:BarChart3},
  {id:'usuarios',   l:'Usuários',            Icon:Users},
  {id:'logs',       l:'Logs',                Icon:FileSearch},
] as const

interface Props {
  mini: boolean; mobile: boolean; page: PageId; dark: boolean; alertCount: number
  setPage: (p: PageId) => void
  setDark: (d: boolean) => void
  onLogout: () => void
  onCollapse?: () => void
  onClose?: () => void
}

export default function Sidebar({ mini, mobile, page, setPage, dark, setDark, onLogout, onCollapse, onClose, alertCount }: Props) {
  const show = !mini || mobile

  return (
    <>
      {/* Header */}
      <div style={{ padding:'13px 11px', borderBottom:'1px solid var(--sbb)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#1a5c38,#2d8f5e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Building2 size={17} color="#fff" />
        </div>
        {show && (
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:900, color:'#4ade80', lineHeight:1.1 }}>SIGCOMP</p>
            <p style={{ fontSize:9, color:'var(--sbf)', opacity:.5, fontWeight:700 }}>GAMELEIRA · PE</p>
          </div>
        )}
        {mobile && <button onClick={onClose} style={{ marginLeft:'auto', border:'none', background:'transparent', cursor:'pointer', color:'var(--sbf)', opacity:.5, display:'flex' }}><X size={18} /></button>}
        {!mini && !mobile && <button onClick={onCollapse} style={{ marginLeft:'auto', width:26, height:26, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', color:'var(--sbf)', opacity:.4, display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={15} /></button>}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'9px 7px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {NAV.map(({ id, l, Icon, badge }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id as PageId)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding: show ? '9px 10px' : '9px',
                borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
                fontSize:12, fontWeight:700, width:'100%', textAlign:'left',
                background: active ? '#22744a' : 'transparent',
                color: active ? '#fff' : 'var(--sbf)',
                opacity: active ? 1 : .65,
                justifyContent: show ? 'flex-start' : 'center',
                transition:'all .15s',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as any).style.background='rgba(255,255,255,.08)'; (e.currentTarget as any).style.opacity='1' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.65' } }}
            >
              <div style={{ position:'relative', flexShrink:0 }}>
                <Icon size={17} />
                {badge && alertCount > 0 && (
                  <span style={{ position:'absolute', top:-5, right:-5, width:13, height:13, background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:7, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </div>
              {show && <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:'9px 7px', borderTop:'1px solid var(--sbb)', display:'flex', flexDirection:'column', gap:2 }}>
        <button onClick={() => setDark(!dark)}
          style={{ display:'flex', alignItems:'center', gap:10, padding: show ? '9px 10px' : '9px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:'var(--sbf)', opacity:.5, width:'100%', justifyContent: show ? 'flex-start' : 'center' }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(255,255,255,.08)'; (e.currentTarget as any).style.opacity='1' }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.5' }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {show && (dark ? 'Modo Claro' : 'Modo Escuro')}
        </button>
        <button onClick={onLogout}
          style={{ display:'flex', alignItems:'center', gap:10, padding: show ? '9px 10px' : '9px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:'#fca5a5', opacity:.8, width:'100%', justifyContent: show ? 'flex-start' : 'center' }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(220,38,38,.15)'; (e.currentTarget as any).style.opacity='1' }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.8' }}
        >
          <LogOut size={16} color="#fca5a5" />
          {show && 'Sair'}
        </button>
      </div>
    </>
  )
}
