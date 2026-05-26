'use client'
import { Ic } from '@/components/ui/atoms'
import { usePermissions } from '@/hooks/usePermissions'
import type { PageId } from './App'

const NAV = [
  {id:'dashboard',  l:'Dashboard',         icon:'dashboard', permissao: undefined},  // sempre visível
  {id:'oficios',    l:'Ofícios',            icon:'file', permissao: 'oficios.ver'},
  {id:'processos',  l:'Processos Licit.',   icon:'gavel', permissao: 'processos.ver'},
  {id:'pesquisas',  l:'Pesquisas de Preço', icon:'check_sq', permissao: 'pesquisas.ver'},
  {id:'secretarias',l:'Secretarias',        icon:'building', permissao: 'secretarias.ver'},
  {id:'alertas',    l:'Alertas',            icon:'bell', permissao: undefined, badge:true},
  {id:'relatorios', l:'Relatórios',         icon:'rep', permissao: 'relatorios.ver'},
  {id:'usuarios',   l:'Usuários',           icon:'users', permissao: 'usuarios.ver'},
  {id:'logs',       l:'Logs',               icon:'log', permissao: 'sistema.logs'},
] as const

interface Props {
  mini: boolean; mobile: boolean; page: PageId; dark: boolean
  alertCount: number; userEmail?: string
  setPage: (p: PageId) => void
  setDark: (d: boolean) => void
  onLogout: () => void
  onCollapse?: () => void
  onClose?: () => void
}

export default function Sidebar({ mini, mobile, page, setPage, dark, setDark, onLogout, onCollapse, onClose, alertCount, userEmail }: Props) {
  const show = !mini || mobile
  const { tem, isAdminOrDirector } = usePermissions()

  // Filtrar itens do menu baseado em permissões
  // Admin e Diretor (por email ou perfil) sempre veem tudo
  const navVisivel = NAV.filter(item => {
    // Sem permissão requerida? sempre visível
    if (!item.permissao) return true
    
    // Admin/Diretor: sempre visível (Usuarios e Logs aparecem aqui!)
    if (isAdminOrDirector()) return true
    
    // Outros: verificar permissão específica
    return tem(item.permissao)
  })

  return (
    <>
      {/* Logo */}
      <div style={{ padding:'13px 11px', borderBottom:'1px solid var(--sbb)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#1a5c38,#2d8f5e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Ic n="building" z={17} c="#fff"/>
        </div>
        {show && (
          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:12, fontWeight:900, color:'#4ade80', lineHeight:1.1 }}>SIGCOMP</p>
            <p style={{ fontSize:9, color:'var(--sbf)', opacity:.5, fontWeight:700 }}>GAMELEIRA · PE</p>
          </div>
        )}
        {mobile && (
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', color:'var(--sbf)', opacity:.5, display:'flex', padding:4 }}>
            <Ic n="x" z={18}/>
          </button>
        )}
        {!mini && !mobile && (
          <button onClick={onCollapse} style={{ width:24, height:24, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', color:'var(--sbf)', opacity:.4, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="chevL" z={15}/>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'9px 7px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {navVisivel.map(({ id, l, icon, badge }: any) => {
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
              onMouseEnter={e => { if(!active){(e.currentTarget as any).style.background='rgba(255,255,255,.08)';(e.currentTarget as any).style.opacity='1'} }}
              onMouseLeave={e => { if(!active){(e.currentTarget as any).style.background='transparent';(e.currentTarget as any).style.opacity='.65'} }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <Ic n={icon} z={17}/>
                {badge && alertCount > 0 && (
                  <span style={{ position:'absolute', top:-5, right:-5, width:14, height:14, background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:7, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
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
        {/* User info */}
        {show && userEmail && (
          <div style={{ padding:'8px 10px', marginBottom:4 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:5 }}>
              <Ic n="person" z={15} c="var(--sbf)"/>
            </div>
            <p style={{ fontSize:9, color:'var(--sbf)', opacity:.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</p>
          </div>
        )}

        {/* Dark mode */}
        <button onClick={() => setDark(!dark)}
          style={{ display:'flex', alignItems:'center', gap:10, padding:show?'9px 10px':'9px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:'var(--sbf)', opacity:.5, width:'100%', justifyContent:show?'flex-start':'center' }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(255,255,255,.08)'; (e.currentTarget as any).style.opacity='1' }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.5' }}>
          <Ic n={dark?'sun':'moon'} z={16}/>{show && (dark?'Modo Claro':'Modo Escuro')}
        </button>

        {/* Logout */}
        <button onClick={onLogout}
          style={{ display:'flex', alignItems:'center', gap:10, padding:show?'9px 10px':'9px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:'#fca5a5', opacity:.8, width:'100%', justifyContent:show?'flex-start':'center' }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(220,38,38,.15)'; (e.currentTarget as any).style.opacity='1' }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.8' }}>
          <Ic n="logout" z={16} c="#fca5a5"/>{show && 'Sair'}
        </button>
      </div>
    </>
  )
}
