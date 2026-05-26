'use client'
import {useState} from 'react'
import {Card,Ic} from '@/components/ui/atoms'
import {fDT} from '@/utils/formatters'
import {G} from '@/components/ui/atoms'

export default function LogsPage({logs}:any){
  const[q,setQ]=useState('')
  const filtered=[...logs].filter((l:any)=>!q||l.usuario.toLowerCase().includes(q.toLowerCase())||l.descricao.toLowerCase().includes(q.toLowerCase())).reverse()
  const tc:Record<string,any>={create:{bg:'#f0fdf4',txt:'#059669'},update:{bg:'#eff6ff',txt:G},delete:{bg:'#fef2f2',txt:'#dc2626'}}
  const IS={width:'100%',padding:'9px 12px',borderRadius:9,border:'1.5px solid var(--brd)',background:'var(--inp)',color:'var(--txt)',fontSize:13,outline:'none',fontFamily:'inherit'} as React.CSSProperties
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{position:'relative'}}>
        <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}><Ic n="search" z={15}/></div>
        <input style={{...IS,paddingLeft:35}} placeholder="Buscar usuário ou ação..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <Card style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead>
            <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
              {['Data/Hora','Usuário','Módulo','Tipo','Ação'].map(h=>(
                <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l:any)=>{
              const c2=tc[l.tipo]||{bg:'#f8fafc',txt:'#64748b'}
              const cc:Record<string,string>={'Ofícios':G,'Processos':'#0F1E3A','Pesquisas':'#0369a1','Usuários':'#d97706'}
              const mc=cc[l.modulo]||'#64748b'
              return(
                <tr key={l.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{padding:'9px 14px',fontFamily:'monospace',fontSize:10,color:'var(--muted)',whiteSpace:'nowrap'}}>{fDT(l.data)}</td>
                  <td style={{padding:'9px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:22,height:22,borderRadius:6,background:G+'20',display:'flex',alignItems:'center',justifyContent:'center',color:G,fontWeight:900,fontSize:10}}>{l.usuario.charAt(0)}</div>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--txt)'}}>{l.usuario}</span>
                    </div>
                  </td>
                  <td style={{padding:'9px 14px'}}><span style={{color:mc,background:mc+'16',border:`1px solid ${mc}33`,padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:700}}>{l.modulo}</span></td>
                  <td style={{padding:'9px 14px'}}><span style={{color:c2.txt,background:c2.bg,border:`1px solid ${c2.txt}33`,padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:700}}>{l.tipo}</span></td>
                  <td style={{padding:'9px 14px',fontSize:11,color:'var(--txt)'}}>{l.descricao}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
