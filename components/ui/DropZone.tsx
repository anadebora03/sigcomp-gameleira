'use client'
import {useState,useRef} from 'react'
import {Ic,G} from './atoms'
export default function DropZone({onFiles}:{onFiles:(f:File[])=>void}){
  const[drag,setDrag]=useState(false)
  const ref=useRef<HTMLInputElement>(null)
  return(
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);onFiles(Array.from(e.dataTransfer.files))}}
      onClick={()=>ref.current?.click()}
      style={{border:`2px dashed ${drag?G:'var(--brd)'}`,borderRadius:12,padding:'22px 16px',
        textAlign:'center',background:drag?'#f0f7f3':'var(--inp)',cursor:'pointer',transition:'all .2s'}}>
      <Ic n="ul" z={22} c={drag?G:'var(--muted)'} sx={{margin:'0 auto 8px'}}/>
      <p style={{fontSize:13,fontWeight:700,color:drag?G:'var(--muted)'}}>Arraste arquivos ou clique para selecionar</p>
      <p style={{fontSize:11,color:'var(--muted)',marginTop:4}}>PDF, Word, Excel, Imagens, ZIP</p>
      <input ref={ref} type="file" multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
        style={{display:'none'}} onChange={e=>onFiles(Array.from(e.target.files||[]))}/>
    </div>
  )
}
