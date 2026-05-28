'use client'
import {Card} from '@/components/ui/atoms'
import {SECS} from '@/lib/constants'
import {fR} from '@/utils/formatters'

export default function SecretariasPage({oficios,processos,secretarias}:any){
  const secretariasList = (secretarias && secretarias.length > 0) ? secretarias : SECS
  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
      {secretariasList.map((s:any)=>{
        const ofs=oficios.filter((o:any)=>o.secretaria_id===s.id)
        const pend=ofs.filter((o:any)=>o.status==='pendente').length
        const conc=ofs.filter((o:any)=>o.status==='concluido').length
        const pct=ofs.length?Math.round(conc/ofs.length*100):0
        return(
          <div key={s.id} style={{background:'var(--card)',borderRadius:16,border:'1px solid var(--brd)',overflow:'hidden',boxShadow:'0 1px 8px rgba(0,0,0,.05)'}}>
            <div style={{height:3,background:s.cor}}/>
            <div style={{padding:16}}>
              <div style={{display:'flex',gap:11,marginBottom:13}}>
                <div style={{width:42,height:42,borderRadius:12,background:s.cor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:14,flexShrink:0}}>{s.sigla.slice(0,2)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:800,color:'var(--txt)',lineHeight:1.3}}>{s.nome}</p>
                  <p style={{fontSize:10,color:'var(--muted)',marginTop:2}}>{s.sigla}</p>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,marginBottom:9}}>
                {([['Total',ofs.length,'#1a5c38'],['Pend.',pend,'#dc2626'],['Conc.',conc,'#059669']] as any[]).map(([l,v,c]:any)=>(
                  <div key={l} style={{background:'var(--inp)',borderRadius:9,padding:'9px 4px',textAlign:'center'}}>
                    <p style={{fontSize:17,fontWeight:900,color:c,lineHeight:1}}>{v}</p>
                    <p style={{fontSize:9,color:'var(--muted)',fontWeight:600,marginTop:2}}>{l}</p>
                  </div>
                ))}
              </div>
              {ofs.length>0&&(
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--muted)',marginBottom:3}}>
                    <span>Progresso</span><span>{pct}%</span>
                  </div>
                  <div style={{height:5,background:'var(--brd)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:pct+'%',background:s.cor,borderRadius:99,transition:'width .7s ease'}}/>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
