'use client'
import {useEffect} from 'react'
export default function Toast({msg,type,onDone}:{msg:string;type:string;onDone:()=>void}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t)},[])
  const cols:Record<string,string>={success:'#1a5c38',error:'#dc2626',info:'#0369a1',warning:'#a07800'}
  return(
    <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',zIndex:300,
      background:cols[type]||cols.info,color:'#fff',padding:'11px 20px',borderRadius:11,
      fontWeight:700,fontSize:12,boxShadow:'0 6px 24px rgba(0,0,0,.25)',
      animation:'fadeUp .3s ease',whiteSpace:'nowrap'}}>
      {msg}
    </div>
  )
}
