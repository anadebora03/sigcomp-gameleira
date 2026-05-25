'use client'
// ─── Shared atomic components ────────────────────────────────────────────────
// Ported 1:1 from sigcomp-gameleira.html — DO NOT change styles

export const G='#1a5c38',G2='#22744a',G3='#2d8f5e',GB='#f0f7f3',GD='#c3ddd0'
export const GOLD='#c9a227',GOLDD='#a07800',NAVY='#1a3a6e',NAVYD='#0d2a4a'

export const IS: React.CSSProperties = {
  width:'100%',padding:'9px 12px',borderRadius:9,
  border:'1.5px solid var(--brd)',background:'var(--inp)',
  color:'var(--txt)',fontSize:13,outline:'none',fontFamily:'inherit',
  WebkitAppearance:'none' as any,
}
export const oF=(e:any)=>{e.target.style.borderColor='#1a5c38';e.target.style.boxShadow='0 0 0 3px #1a5c3818'}
export const oB=(e:any)=>{e.target.style.borderColor='var(--brd)';e.target.style.boxShadow='none'}

export function Fld({label,req,children}:{label:string;req?:boolean;children:React.ReactNode}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <label style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>
        {label}{req&&<span style={{color:'#ef4444',marginLeft:3}}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function Sb({v,list,sm}:{v?:string;list:any[];sm?:boolean}){
  const s=list.find(x=>x.v===v)||list[0]
  return(
    <span style={{color:s.bg,background:s.cor,border:`1px solid ${s.cor}`,
      padding:sm?'1px 7px':'3px 9px',borderRadius:999,fontSize:10,fontWeight:700,
      whiteSpace:'nowrap',display:'inline-block',lineHeight:1.7}}>
      {s.l}
    </span>
  )
}

export function Pb({v}:{v?:string}){
  const PRI=[
    {v:'baixa',l:'Baixa',cor:'#1a3a6e',bg:'#e8eef7'},
    {v:'media',l:'Média',cor:'#1a3a6e',bg:'#e8eef7'},
    {v:'alta',l:'Alta',cor:'#1a3a6e',bg:'#e8eef7'},
    {v:'urgente',l:'Urgente',cor:'#dc2626',bg:'#fef2f2'},
  ]
  const p=PRI.find(x=>x.v===v)||PRI[0]
  return(
    <span style={{color:p.bg,background:p.cor,border:`1px solid ${p.cor}`,
      padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:800,
      whiteSpace:'nowrap',display:'inline-block',lineHeight:1.7}}>
      {p.l}
    </span>
  )
}

export function Card({children,style:sx={}}:{children:React.ReactNode;style?:React.CSSProperties}){
  return(
    <div style={{background:'var(--card)',borderRadius:16,border:'1px solid var(--brd)',
      boxShadow:'0 1px 8px rgba(0,0,0,.05)',...sx}}>
      {children}
    </div>
  )
}

export function SAv({id,size=30}:{id?:number;size?:number}){
  const SECS=[
    {id:1,sigla:'SAÚDE',cor:'#1a5c38'},{id:2,sigla:'EDUC',cor:'#1a5c38'},
    {id:3,sigla:'ASSIST',cor:'#1a5c38'},{id:4,sigla:'ECTJ',cor:'#1a5c38'},
    {id:5,sigla:'DECO',cor:'#1a5c38'},{id:6,sigla:'INFRA',cor:'#1a5c38'},
    {id:7,sigla:'ADMIN',cor:'#1a5c38'},{id:8,sigla:'FAZ',cor:'#1a5c38'},
    {id:9,sigla:'FIN',cor:'#1a5c38'},{id:10,sigla:'AGRI',cor:'#1a5c38'},
  ]
  const s=SECS.find(x=>x.id===id)||{sigla:'?',cor:'#94a3b8'}
  return(
    <div style={{width:size,height:size,borderRadius:size*.28,background:s.cor,
      display:'flex',alignItems:'center',justifyContent:'center',
      color:'#fff',fontWeight:900,fontSize:size*.34,flexShrink:0}}>
      {s.sigla.slice(0,2)}
    </div>
  )
}

export function IB({icon,color,title,onClick,sm}:{icon:string;color:string;title?:string;onClick?:()=>void;sm?:boolean}){
  const z=sm?28:32
  return(
    <button title={title} onClick={onClick}
      style={{width:z,height:z,borderRadius:8,border:'none',background:color+'14',
        cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
        color,transition:'background .15s'}}
      onMouseEnter={e=>(e.currentTarget.style.background=color+'28')}
      onMouseLeave={e=>(e.currentTarget.style.background=color+'14')}>
      <Ic n={icon} z={sm?13:15}/>
    </button>
  )
}

export function PB({onClick,color,children,outline,full,sm,disabled}:{
  onClick?:()=>void;color?:string;children:React.ReactNode;
  outline?:boolean;full?:boolean;sm?:boolean;disabled?:boolean
}){
  const col=color||G
  const base:React.CSSProperties={
    display:'flex',alignItems:'center',justifyContent:'center',gap:7,
    fontFamily:'inherit',fontWeight:800,fontSize:sm?11:13,
    cursor:disabled?'not-allowed':'pointer',opacity:disabled?.55:1,
    borderRadius:9,transition:'all .15s',border:'none',whiteSpace:'nowrap',
  }
  if(outline) return(
    <button onClick={onClick} disabled={disabled}
      style={{...base,background:'transparent',border:'1.5px solid var(--brd)',
        color:'var(--muted)',padding:sm?'6px 11px':'10px 15px',width:full?'100%':undefined}}>
      {children}
    </button>
  )
  return(
    <button onClick={onClick} disabled={disabled}
      style={{...base,background:col,color:'#fff',
        padding:sm?'6px 11px':'10px 16px',width:full?'100%':undefined,
        boxShadow:`0 2px 8px ${col}44`}}>
      {children}
    </button>
  )
}

// ─── Icon component (all 35 icons from original) ─────────────────────────────
export function Ic({n,z=18,c,sx={}}:{n:string;z?:number;c?:string;sx?:React.CSSProperties}){
  const s:React.CSSProperties={width:z,height:z,color:c,display:'block',flexShrink:0,...sx}
  const p={fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
  const icons:Record<string,JSX.Element>={
    dashboard:<svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    file:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    gavel:<svg style={s} viewBox="0 0 24 24" {...p}><path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>,
    check_sq:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    building:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    bell:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chart:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    users:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    log:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    rep:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    plus:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:<svg style={s} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    trash:<svg style={s} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    x:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check:<svg style={s} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    alert:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    clock:<svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    menu:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    chevL:<svg style={s} viewBox="0 0 24 24" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
    chevR:<svg style={s} viewBox="0 0 24 24" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
    moon:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    sun:<svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
    filter:<svg style={s} viewBox="0 0 24 24" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    star:<svg style={s} viewBox="0 0 24 24" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starF:<svg style={{...s,fill:'#f59e0b',stroke:'#f59e0b'}} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    money:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    person:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    msg:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    ul:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    folder:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    send:<svg style={s} viewBox="0 0 24 24" {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    coins:<svg style={s} viewBox="0 0 24 24" {...p}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/></svg>,
    hist:<svg style={s} viewBox="0 0 24 24" {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.49"/></svg>,
    logout:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    cam:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    clip:<svg style={s} viewBox="0 0 24 24" {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
    dl:<svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    lock:<svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  }
  return icons[n]||null
}
