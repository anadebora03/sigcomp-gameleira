'use client'
import {Card,Ic,G} from '@/components/ui/atoms'

export default function RelatoriosPage({oficios,processos,pesquisas,toast}:any){
  const rels=[
    {nome:'Ofícios por Secretaria',cor:'#1a5c38',icon:'building'},
    {nome:'Ofícios Pendentes',cor:'#dc2626',icon:'alert'},
    {nome:'Processos Licitatórios',cor:'#c9a227',icon:'gavel'},
    {nome:'Pesquisas de Preço',cor:'#0F1E3A',icon:'check_sq'},
    {nome:'Relatório Geral',cor:'#1a5c38',icon:'rep'},
  ]
  const sum=[
    {l:'Ofícios',v:oficios.length,cor:'#1a5c38'},
    {l:'Pendentes',v:oficios.filter((o:any)=>o.status==='pendente').length,cor:'#a07800'},
    {l:'Concluídos',v:oficios.filter((o:any)=>o.status==='concluido').length,cor:'#1a5c38'},
    {l:'Processos',v:processos.length,cor:'#0F1E3A'},
    {l:'Pesquisas',v:pesquisas.length,cor:'#1a5c38'},
    {l:'Valor Total',v:processos.reduce((a:number,p:any)=>a+Number(p.valor_estimado||0),0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),cor:'#a07800',str:true},
  ]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:11}}>
        {sum.map((c,i)=>(
          <Card key={i} style={{padding:'14px 16px',textAlign:'center'}}>
            <p style={{fontSize:c.str?12:24,fontWeight:900,color:c.cor,lineHeight:1}}>{c.v}</p>
            <p style={{fontSize:9,color:'var(--muted)',fontWeight:600,marginTop:4}}>{c.l}</p>
          </Card>
        ))}
      </div>
      <Card style={{padding:20}}>
        <p style={{fontSize:13,fontWeight:800,color:'var(--txt)',marginBottom:16}}>Gerar Relatórios</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:11}}>
          {rels.map((r,i)=>(
            <div key={i} style={{border:`1.5px solid ${r.cor}22`,borderRadius:13,padding:14,
              background:'var(--inp)',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{(e.currentTarget as any).style.background=r.cor+'0f';(e.currentTarget as any).style.borderColor=r.cor+'55'}}
              onMouseLeave={e=>{(e.currentTarget as any).style.background='var(--inp)';(e.currentTarget as any).style.borderColor=r.cor+'22'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9}}>
                <div style={{width:32,height:32,borderRadius:8,background:r.cor+'16',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic n={r.icon} z={16} c={r.cor}/></div>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={()=>toast('PDF: '+r.nome,'success')} style={{padding:'4px 8px',borderRadius:6,border:'none',background:r.cor+'16',color:r.cor,cursor:'pointer',fontFamily:'inherit',fontSize:9,fontWeight:800}}>PDF</button>
                  <button onClick={()=>toast('XLS: '+r.nome,'success')} style={{padding:'4px 8px',borderRadius:6,border:'none',background:'#05996916',color:'#059669',cursor:'pointer',fontFamily:'inherit',fontSize:9,fontWeight:800}}>XLS</button>
                </div>
              </div>
              <p style={{fontSize:12,fontWeight:800,color:'var(--txt)'}}>{r.nome}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
