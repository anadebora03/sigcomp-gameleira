'use client'
import { useState } from 'react'
import { Ic } from '@/components/ui/atoms'
import { usePermissions } from '@/hooks/usePermissions'
import type { PageId } from './App'
import type { PerfilCtx } from '@/hooks/usePerfil'
import ConfigMenu from './ConfigMenu'

const NAV = [
  {id:'dashboard',  l:'Dashboard',         icon:'dashboard', permissao: undefined},  // sempre visível
  {id:'oficios',    l:'Ofícios',            icon:'file', permissao: 'oficios.ver'},
  {id:'processos',  l:'Processos Licit.',   icon:'gavel', permissao: 'processos.ver'},
  {id:'pesquisas',  l:'Pesquisas de Preço', icon:'check_sq', permissao: 'pesquisas.ver'},
  {id:'ordens',     l:'Ordens de Fornec.',  icon:'truck', permissao: 'ordens.ver'},
  {id:'secretarias',l:'Secretarias',        icon:'building', permissao: 'secretarias.ver'},
  {id:'alertas',    l:'Alertas',            icon:'bell', permissao: undefined, badge:true},
  {id:'relatorios', l:'Relatórios',         icon:'rep', permissao: 'relatorios.ver'},
  {id:'usuarios',   l:'Usuários',           icon:'users', permissao: 'usuarios.ver'},
  {id:'logs',       l:'Logs',               icon:'log', permissao: 'sistema.logs'},
] as const

interface Props {
  mini: boolean; mobile: boolean; page: PageId; dark: boolean
  alertCount: number
  setPage: (p: PageId) => void
  setDark: (d: boolean) => void
  onLogout: () => void
  onCollapse?: () => void
  onExpand?: () => void
  onClose?: () => void
  perfil: PerfilCtx
  userEmail?: string
  toast: (msg: string, type?: string) => void
}

export default function Sidebar({ mini, mobile, page, setPage, dark, setDark, onLogout, onCollapse, onExpand, onClose, alertCount, perfil, userEmail, toast }: Props) {
  const show = !mini || mobile
  const [logoHover, setLogoHover] = useState(false)
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
        {mini && !mobile ? (
          // Recolhida: o logo vira o botão de expandir (a seta aparece ao passar o mouse)
          <button onClick={onExpand} title="Expandir menu" onMouseEnter={() => setLogoHover(true)} onMouseLeave={() => setLogoHover(false)}
            style={{ width:34, height:34, borderRadius:9, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#1a5c38,#2d8f5e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ic n={logoHover ? 'chevR' : 'building'} z={17} c="#fff"/>
          </button>
        ) : (
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#1a5c38,#2d8f5e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ic n="building" z={17} c="#fff"/>
          </div>
        )}
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

      {/* Footer: Configurações (perfil + modo escuro) e Sair */}
      <div style={{ padding:'9px 7px', borderTop:'1px solid var(--sbb)', display:'flex', flexDirection:show?'row':'column', alignItems:'stretch', gap:4 }}>
        <ConfigMenu show={show} perfil={perfil} userEmail={userEmail} dark={dark} setDark={setDark} toast={toast}/>
        <button onClick={onLogout} title="Sair do sistema"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:9, borderRadius:10, border:'none', background:'transparent', cursor:'pointer', flexShrink:0, opacity:.8 }}
          onMouseEnter={e => { (e.currentTarget as any).style.background='rgba(220,38,38,.15)'; (e.currentTarget as any).style.opacity='1' }}
          onMouseLeave={e => { (e.currentTarget as any).style.background='transparent'; (e.currentTarget as any).style.opacity='.8' }}>
          <Ic n="logout" z={16} c="#fca5a5"/>
        </button>
      </div>
    </>
  )
}
