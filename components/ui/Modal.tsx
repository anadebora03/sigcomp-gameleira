'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Ic } from './atoms'

export default function Modal({title,onClose,children,wide}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}){
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{
    setMounted(true)
    document.body.style.overflow='hidden'
    const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()}
    document.addEventListener('keydown',esc)
    return()=>{document.body.style.overflow='';document.removeEventListener('keydown',esc)}
  },[])
  if(!mounted)return null
  return createPortal(
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:99999,
      background:'rgba(0,0,0,.75)',display:'flex',alignItems:'flex-start',
      justifyContent:'center',overflowY:'auto',padding:'40px 16px 60px',boxSizing:'border-box'}}
      onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'var(--card)',borderRadius:18,width:'100%',
        maxWidth:wide?820:600,flexShrink:0,boxShadow:'0 24px 80px rgba(0,0,0,.35)',position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'18px 22px',borderBottom:'1px solid var(--brd)',borderRadius:'18px 18px 0 0'}}>
          <h2 style={{fontSize:16,fontWeight:900,color:'var(--txt)'}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:9,border:'none',
            background:'var(--inp)',cursor:'pointer',display:'flex',alignItems:'center',
            justifyContent:'center',color:'var(--muted)'}}>
            <Ic n="x" z={17}/>
          </button>
        </div>
        <div style={{padding:'22px 22px 36px'}}>{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root')||document.body
  )
}
