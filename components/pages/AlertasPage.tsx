'use client'
import {Ic,Card,Pb} from '@/components/ui/atoms'
import {STO} from '@/lib/constants'
import {gS,gT} from '@/utils/helpers'
import {fD} from '@/utils/formatters'

export default function AlertasPage({oficios}:any){
  const secs=[
    {title:'Atrasados',items:oficios.filter((o:any)=>{const p=o.prazo;return p&&new Date(p)<new Date()&&!['concluido','arquivado'].includes(o.status)}),cor:'#dc2626',bg:'#fef2f2',icon:'alert'},
    {title:'Vencendo em 5 dias',items:oficios.filter((o:any)=>{if(!o.prazo)return false;const d=(new Date(o.prazo).getTime()-new Date().getTime())/86400000;return d>=0&&d<=5&&!['concluido','arquivado'].includes(o.status)}),cor:'#d97706',bg:'#fffbeb',icon:'clock'},
    {title:'Urgentes',items:oficios.filter((o:any)=>o.prioridade==='urgente'&&!['concluido','arquivado'].includes(o.status)),cor:'#ea580c',bg:'#fff7ed',icon:'alert'},
    {title:'Pendentes',items:oficios.filter((o:any)=>o.status==='pendente'),cor:'#0F1E3A',bg:'#e8eef7',icon:'filter'},
  ]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {secs.map(sec=>(
        <Card key={sec.title} style={{overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--brd)',display:'flex',alignItems:'center',gap:10,background:sec.bg}}>
            <Ic n={sec.icon} z={16} c={sec.cor}/>
            <span style={{fontSize:13,fontWeight:800,color:sec.cor}}>{sec.title}</span>
            <span style={{marginLeft:'auto',fontSize:10,fontWeight:800,color:sec.cor,background:'white',padding:'2px 8px',borderRadius:999}}>{sec.items.length}</span>
          </div>
          {sec.items.length===0
            ?<p style={{padding:16,fontSize:12,color:'var(--muted)',textAlign:'center'}}>Nenhum item</p>
            :sec.items.map((o:any)=>{
              const s=gS(o.secretaria_id)
              return(
                <div key={o.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:'1px solid var(--brd)',flexWrap:'wrap'}}>
                  <div style={{width:30,height:30,borderRadius:9,background:s.cor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:11,flexShrink:0}}>{s.sigla.slice(0,2)}</div>
                  <div style={{flex:1,minWidth:160}}>
                    <p style={{fontSize:12,fontWeight:700,color:'var(--txt)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      <span style={{fontFamily:'monospace',color:'#1a5c38'}}>{o.numero}</span> — {o.assunto}
                    </p>
                    <p style={{fontSize:10,color:'var(--muted)'}}>{s.sigla} · {fD(o.prazo)}</p>
                  </div>
                  <Pb v={o.prioridade}/>
                </div>
              )
            })
          }
        </Card>
      ))}
    </div>
  )
}
