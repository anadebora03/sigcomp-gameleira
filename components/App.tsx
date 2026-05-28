'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/hooks/useStore'
import { useMob } from '@/hooks/useMob'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'
import Dashboard from './pages/Dashboard'
import OficiosPage from './pages/OficiosPage'
import ProcessosPage from './pages/ProcessosPage'
import PesquisasPage from './pages/PesquisasPage'
import SecretariasPage from './pages/SecretariasPage'
import AlertasPage from './pages/AlertasPage'
import RelatoriosPage from './pages/RelatoriosPage'
import UsuariosPage from './pages/UsuariosPage'
import LogsPage from './pages/LogsPage'
import Toast from './ui/Toast'

export type PageId = 'dashboard'|'oficios'|'processos'|'pesquisas'|'secretarias'|'alertas'|'relatorios'|'usuarios'|'logs'
export const PAGE_TITLES: Record<PageId,string> = {
  dashboard:'Dashboard', oficios:'Controle de Ofícios',
  processos:'Processos Licitatórios', pesquisas:'Pesquisas de Preço',
  secretarias:'Secretarias', alertas:'Alertas',
  relatorios:'Relatórios', usuarios:'Usuários', logs:'Logs do Sistema',
}

export default function App() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [page, setPage] = useState<PageId>('dashboard')
  const [sideOpen, setSideOpen] = useState(true)
  const [mobMenu, setMobMenu] = useState(false)
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null)
  const mob = useMob()
  const store = useStore()

  useEffect(() => { if (mob) setSideOpen(false); else setSideOpen(true) }, [mob])

  useEffect(() => {
    const vars = dark ? {
      '--bg':'#081a0e','--card':'#0d2618','--brd':'#1a3d2a','--txt':'#e8f5ec',
      '--muted':'#7aab8a','--inp':'#081a0e','--hov':'#1a3d2a',
      '--sb':'#040e07','--sbf':'#d1fae5','--sbb':'#1a5c38',
    } : {
      '--bg':'#f0f4f1','--card':'#ffffff','--brd':'#d4e8d9','--txt':'#0a1f10',
      '--muted':'#4a6155','--inp':'#f5f9f6','--hov':'#e8f5ec',
      '--sb':'#0d3d22','--sbf':'#d1fae5','--sbb':'#1a5c38',
    }
    Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k,v))
  }, [dark])

  // If no user after loading, middleware will redirect — show nothing
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:'3px solid #1a5c38', borderTopColor:'transparent', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'#4a6155', fontSize:13, fontWeight:600 }}>Carregando...</p>
      </div>
    </div>
  )

  if (!user) return null // middleware handles redirect

  async function handleLogout() {
    await signOut()
    router.push('/login')
  }

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const alertCount = store.oficios.filter(o =>
    (o.prazo && new Date(o.prazo) < new Date()) || o.status === 'pendente'
  ).length

  const pp = { ...store, toast: showToast }

  return (
    <div style={{ fontFamily:'system-ui,sans-serif', display:'flex', height:'100dvh', overflow:'hidden', background:'var(--bg)' }}>
      {/* Modal portal */}
      <div id="modal-root" style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:99999 }}>
        <style>{`#modal-root>*{pointer-events:all}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      </div>

      {/* Mobile overlay */}
      {mobMenu && <div onClick={() => setMobMenu(false)} style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,.5)' }}/>}

      {/* Mobile sidebar */}
      {mob && mobMenu && (
        <aside style={{ position:'fixed',inset:'0 auto 0 0',width:256,background:'var(--sb)',display:'flex',flexDirection:'column',zIndex:50 }}>
          <Sidebar mini={false} mobile page={page} setPage={p => { setPage(p); setMobMenu(false) }} dark={dark} setDark={setDark} onLogout={handleLogout} alertCount={alertCount} onClose={() => setMobMenu(false)} userEmail={user.email}/>
        </aside>
      )}

      {/* Desktop sidebar */}
      {!mob && (
        <aside style={{ width:sideOpen?228:60, flexShrink:0, transition:'width .25s ease', background:'var(--sb)', borderRight:'1px solid var(--sbb)', display:'flex', flexDirection:'column', overflow:'hidden', zIndex:30 }}>
          <Sidebar mini={!sideOpen} mobile={false} page={page} setPage={setPage} dark={dark} setDark={setDark} onLogout={handleLogout} alertCount={alertCount} onCollapse={() => setSideOpen(false)} userEmail={user.email}/>
        </aside>
      )}

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Header page={page} mob={mob} dark={dark} setDark={setDark} sideOpen={sideOpen} onOpenSide={() => setSideOpen(true)} onOpenMob={() => setMobMenu(true)} onLogout={handleLogout} userEmail={user.email}/>
        <main style={{ flex:1, overflowY:'auto', padding:mob?'12px 11px':'18px 22px', paddingBottom:mob?74:18 }}>
          <div style={{ animation:'fadeUp .3s ease both', maxWidth:1400, margin:'0 auto' }}>
            {page==='dashboard'   && <Dashboard   user={user} oficios={store.oficios} processos={store.processos} pesquisas={store.pesquisas}/>}
            {page==='oficios'     && <OficiosPage  {...pp}/>}
            {page==='processos'   && <ProcessosPage {...pp}/>}
            {page==='pesquisas'   && <PesquisasPage {...pp}/>}
            {page==='secretarias' && <SecretariasPage oficios={store.oficios} processos={store.processos} secretarias={store.secretarias}/>}
            {page==='alertas'     && <AlertasPage  oficios={store.oficios}/>}
            {page==='relatorios'  && <RelatoriosPage oficios={store.oficios} processos={store.processos} pesquisas={store.pesquisas} toast={showToast}/>}
            {page==='usuarios'    && <UsuariosPage  {...pp}/>}
            {page==='logs'        && <LogsPage      logs={store.logs}/>}
          </div>
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  )
}
