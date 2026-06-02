'use client'
import {useState,useRef} from 'react'
import {Ic,IB,PB,Card,Fld,Sb,Pb,SAv,IS,oF,oB,G,GB,GD,NAVY} from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import DropZoneUpload from '@/components/ui/DropZoneUpload'
import ARow from '@/components/ui/ARow'
import {SECS,STO,PRI} from '@/lib/constants'
import {gS,gT,uid} from '@/utils/helpers'
import {useUpload} from '@/hooks/useUpload'
import {deleteArquivo} from '@/lib/storage'
import {td,fD,fKB,isOv,isSn,nOf} from '@/utils/formatters'


function OficioForm({initial,oficios,onSave,onClose}:any){
  const[f,sf]=useState(initial||{numero:nOf(oficios),secretaria_id:1,responsavel:'',resp_acomp:'',data:td(),assunto:'',descricao:'',tipo:'Compra',prioridade:'media',prazo:'',status:'recebido',obs:'',favorito:false,historico:[],comentarios:[],anexos:[]})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  const{uploadFiles,uploading,erros}=useUpload({modulo:'oficios',vinculo:f.numero,secretaria_id:Number(f.secretaria_id)})
  function save(){
    if(!f.assunto.trim()){alert('Preencha o assunto.');return}
    const h=[...(f.historico||[]),{data:td(),acao:!initial?'Cadastrado':'Atualizado',usuario:'Você'}]
    const payload = { ...f, secretaria_id: Number(f.secretaria_id), historico: h, ...(f.id ? { id: f.id } : {}) }
    onSave(payload)
  }
  async function addAnexos(files:File[]){const n=await uploadFiles(files);if(n.length)up('anexos',[...(f.anexos||[]),...n])}
  const sec=gS(Number(f.secretaria_id))
  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Número" req><input style={IS} value={f.numero} readOnly={!!initial} onFocus={oF} onBlur={oB} onChange={e=>up('numero',e.target.value)}/></Fld>
        <Fld label="Data"><input type="date" style={IS} value={f.data} onFocus={oF} onBlur={oB} onChange={e=>up('data',e.target.value)}/></Fld>
      </div>
      <Fld label="Secretaria" req>
        <select style={IS} value={f.secretaria_id} onFocus={oF} onBlur={oB} onChange={e=>up('secretaria_id',e.target.value)}>
          {SECS.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Fld>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Responsável"><input style={IS} value={f.responsavel} onFocus={oF} onBlur={oB} onChange={e=>up('responsavel',e.target.value)}/></Fld>
        <Fld label="Acompanhamento"><input style={IS} value={f.resp_acomp} onFocus={oF} onBlur={oB} onChange={e=>up('resp_acomp',e.target.value)}/></Fld>
      </div>
      <Fld label="Assunto" req><input style={IS} value={f.assunto} onFocus={oF} onBlur={oB} onChange={e=>up('assunto',e.target.value)}/></Fld>
      <Fld label="Descrição"><textarea style={{...IS,resize:'none'}} rows={3} value={f.descricao} onFocus={oF} onBlur={oB} onChange={e=>up('descricao',e.target.value)}/></Fld>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Fld label="Tipo">
          <select style={IS} value={f.tipo} onFocus={oF} onBlur={oB} onChange={e=>up('tipo',e.target.value)}>
            {['Compra','Serviço','Obra','Locação','Outro'].map(t=><option key={t}>{t}</option>)}
          </select>
        </Fld>
        <Fld label="Prioridade">
          <select style={IS} value={f.prioridade} onFocus={oF} onBlur={oB} onChange={e=>up('prioridade',e.target.value)}>
            {PRI.map(p=><option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
        </Fld>
        <Fld label="Status">
          <select style={IS} value={f.status} onFocus={oF} onBlur={oB} onChange={e=>up('status',e.target.value)}>
            {STO.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </Fld>
      </div>
      <Fld label="Prazo"><input type="date" style={IS} value={f.prazo} onFocus={oF} onBlur={oB} onChange={e=>up('prazo',e.target.value)}/></Fld>
      <Fld label="Observações"><textarea style={{...IS,resize:'none'}} rows={2} value={f.obs} onFocus={oF} onBlur={oB} onChange={e=>up('obs',e.target.value)}/></Fld>
      <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px'}}>
        <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:10}}>Documentos Anexados</p>
        <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:10,padding:'10px 13px',display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
          <Ic n="folder" z={15} c={G}/><p style={{fontSize:11,fontWeight:700,color:G}}>Pasta: {sec.nome} / {f.numero}</p>
        </div>
        <DropZoneUpload onFiles={addAnexos} uploading={uploading} erros={erros}/>
        {(f.anexos||[]).map((a:any)=><ARow key={a.id} a={a} onDelete={async(id:string)=>{const arq=(f.anexos||[]).find((x:any)=>x.id===id);if(arq?.caminho)await deleteArquivo(arq as any);up('anexos',(f.anexos||[]).filter((x:any)=>x.id!==id))}}/>)}
      </div>
      <div style={{display:'flex',gap:10}}><PB onClick={save} full>{!initial?'Cadastrar':'Salvar'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

function OficioDetail({o,setOficios,onClose,onEdit,saveOficio}:any){
  const{uploadFiles:uploadDet,uploading:uploaDet,erros:errosDet}=useUpload({modulo:'oficios',vinculo:o.numero,secretaria_id:o.secretaria_id})
  const[tab,setTab]=useState('info')
  const[comment,setCom]=useState('')
  const[coms,setComs]=useState(o.comentarios||[])
  const[anx,setAnx]=useState(o.anexos||[])
  const sec=gS(o.secretaria_id)
  async function sendC(){
    if(!comment.trim())return
    const n={texto:comment,data:td(),usuario:'Você'}
    const updated = {...o, comentarios:[...(o.comentarios||[]),n], historico:[...(o.historico||[]),{data:td(),acao:'Comentário adicionado',usuario:'Você'}]}
    setComs((p:any)=>[...p,n])
    setOficios((prev:any)=>prev.map((x:any)=>x.id===o.id?updated:x))
    await saveOficio(updated,false)
    setCom('')
  }
  async function addFiles(files:File[]){
    const n=await uploadDet(files)
    if(n.length){
      const updated = {...o, anexos:[...(o.anexos||[]),...n]}
      setAnx((p:any)=>[...p,...n])
      setOficios((prev:any)=>prev.map((x:any)=>x.id===o.id?updated:x))
      await saveOficio(updated,false)
    }
  }
  async function delA(id:string){
    const updatedAnexos=(o.anexos||[]).filter((a:any)=>String(a.id)!==String(id))
    const updated = {...o, anexos: updatedAnexos}
    setAnx((p:any)=>p.filter((a:any)=>String(a.id)!==String(id)))
    setOficios((prev:any)=>prev.map((x:any)=>x.id===o.id?updated:x))
    await saveOficio(updated,false)
  }
  const TABS=[{id:'info',l:'Detalhes',n:'file'},{id:'anexos',l:`Docs (${anx.length})`,n:'clip'},{id:'hist',l:'Timeline',n:'hist'},{id:'chat',l:`Chat (${coms.length})`,n:'msg'}]
  const over=isOv(o.prazo)&&!['concluido','arquivado'].includes(o.status)
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
        <SAv id={o.secretaria_id} size={44}/>
        <div style={{flex:1}}>
          <span style={{fontFamily:'monospace',fontWeight:900,color:G,fontSize:12}}>{o.numero}</span>
          <p style={{fontSize:14,fontWeight:800,color:'var(--txt)',lineHeight:1.3}}>{o.assunto}</p>
          <p style={{fontSize:11,color:'var(--muted)'}}>{sec.nome}</p>
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><Pb v={o.prioridade}/><Sb v={o.status} list={STO}/></div>
      <div style={{display:'flex',borderBottom:'1px solid var(--brd)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 4px',fontSize:10,fontWeight:700,border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:tab===t.id?G:'var(--muted)',borderBottom:tab===t.id?`2px solid ${G}`:'2px solid transparent',marginBottom:-1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <Ic n={t.n} z={13} c={tab===t.id?G:undefined}/>{t.l}
          </button>
        ))}
      </div>
      {tab==='info'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
          {[['Tipo',o.tipo],['Responsável',o.responsavel||'--'],['Data',fD(o.data)],['Prazo',o.prazo?fD(o.prazo):'--'],['Acomp.',o.resp_acomp||'--'],['Secretaria',sec.sigla]].map(([k,v])=>(
            <div key={k} style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px'}}>
              <p style={{fontSize:9,color:'var(--muted)',fontWeight:800,textTransform:'uppercase',marginBottom:3}}>{k}</p>
              <p style={{fontSize:12,fontWeight:700,color:over&&k==='Prazo'?'#dc2626':'var(--txt)'}}>{v}</p>
            </div>
          ))}
        </div>
      )}
      {tab==='anexos'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:10,padding:'10px 13px',display:'flex',alignItems:'center',gap:9}}>
            <Ic n="folder" z={15} c={G}/><p style={{fontSize:11,fontWeight:700,color:G}}>Pasta: {sec.nome} / {o.numero}</p>
          </div>
          <DropZoneUpload onFiles={addFiles} uploading={uploaDet} erros={errosDet}/>
          {anx.length===0&&<p style={{textAlign:'center',color:'var(--muted)',fontSize:12,padding:16}}>Nenhum documento.</p>}
          {anx.map((a:any)=><ARow key={a.id} a={a} onDelete={async(id:string)=>{const arq=anx.find((x:any)=>String(x.id)===String(id));if(arq?.caminho)await deleteArquivo(arq as any);delA(id)}}/>)}
        </div>
      )}
      {tab==='hist'&&(
        <div>
          {(o.historico||[]).slice().reverse().map((h:any,i:number)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:G,flexShrink:0,marginTop:6}}/>
              <div style={{flex:1,background:'var(--inp)',borderRadius:8,padding:'8px 11px'}}>
                <p style={{fontSize:12,fontWeight:700,color:'var(--txt)'}}>{h.acao}</p>
                <p style={{fontSize:10,color:'var(--muted)'}}>{fD(h.data)} · {h.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='chat'&&(
        <div>
          <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
            {coms.length===0&&<p style={{textAlign:'center',color:'var(--muted)',fontSize:12,padding:16}}>Sem comentários.</p>}
            {coms.map((c:any,i:number)=>(
              <div key={i} style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px'}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                  <div style={{width:20,height:20,borderRadius:6,background:G+'20',display:'flex',alignItems:'center',justifyContent:'center',color:G,fontWeight:900,fontSize:10}}>{c.usuario.charAt(0)}</div>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--txt)'}}>{c.usuario}</span>
                  <span style={{fontSize:10,color:'var(--muted)',marginLeft:'auto'}}>{fD(c.data)}</span>
                </div>
                <p style={{fontSize:12,color:'var(--txt)'}}>{c.texto}</p>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            <input style={{...IS,flex:1}} placeholder="Comentário..." value={comment} onChange={e=>setCom(e.target.value)} onFocus={oF} onBlur={oB} onKeyDown={e=>e.key==='Enter'&&sendC()}/>
            <PB onClick={sendC} sm><Ic n="send" z={13}/>Enviar</PB>
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:10,paddingTop:4}}><PB onClick={()=>onEdit(o)} full><Ic n="edit" z={14}/>Editar</PB><PB onClick={onClose} outline>Fechar</PB></div>
    </div>
  )
}

export default function OficiosPage({oficios,setOficios,saveOficio,deleteOficio,toast}:any){
  const[modal,setModal]=useState<any>(null)
  const[sel,setSel]=useState<any>(null)
  const[q,setQ]=useState('')
  const[fSec,setFSec]=useState('')
  const[fSt,setFSt]=useState('')
  const filtered=oficios.filter((o:any)=>{
    const sq=q.toLowerCase()
    return(!q||o.numero.toLowerCase().includes(sq)||o.assunto.toLowerCase().includes(sq))&&(!fSec||o.secretaria_id===Number(fSec))&&(!fSt||o.status===fSt)
  })
  function save(data:any){saveOficio(data,modal==='new');toast(modal==='new'?'Cadastrado!':'Atualizado!','success');setModal(null);setSel(null)}
  function del(id:string){if(!confirm('Excluir?'))return;deleteOficio(id);toast('Excluído.','info')}
  const th:React.CSSProperties={padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,position:'relative'}}>
          <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}><Ic n="search" z={15}/></div>
          <input style={{...IS,paddingLeft:35}} placeholder="Buscar número, assunto..." value={q} onChange={e=>setQ(e.target.value)} onFocus={oF} onBlur={oB}/>
        </div>
        <select style={{...IS,width:140,fontSize:12,padding:'9px 10px'}} value={fSec} onChange={e=>setFSec(e.target.value)}>
          <option value="">Secretarias</option>{SECS.map(s=><option key={s.id} value={s.id}>{s.sigla}</option>)}
        </select>
        <select style={{...IS,width:140,fontSize:12,padding:'9px 10px'}} value={fSt} onChange={e=>setFSt(e.target.value)}>
          <option value="">Status</option>{STO.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <button onClick={()=>{setSel(null);setModal('new')}} style={{display:'flex',alignItems:'center',gap:7,background:G,color:'#fff',fontWeight:800,padding:'9px 15px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',whiteSpace:'nowrap'}}>
          <Ic n="plus" z={15} c="#fff"/>Novo Ofício
        </button>
      </div>
      <p style={{fontSize:11,color:'var(--muted)',fontWeight:600}}>{filtered.length} ofício(s)</p>
      <Card style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
                {['Número','Secretaria','Assunto','Prioridade','Status','Prazo','Ações'].map(h=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={7} style={{padding:'40px 14px',textAlign:'center',color:'var(--muted)',fontSize:13}}>Nenhum ofício encontrado.</td></tr>}
              {filtered.map((o:any)=>{
                const sec=gS(o.secretaria_id)
                const over=isOv(o.prazo)&&!['concluido','arquivado'].includes(o.status)
                const done=['concluido','arquivado'].includes(o.status)
                return(
                  <tr key={o.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontWeight:800,color:G,fontSize:11,whiteSpace:'nowrap'}}>{o.numero}</td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}><SAv id={o.secretaria_id} size={24}/><span style={{fontSize:10,color:'var(--muted)'}}>{sec.sigla}</span></div>
                    </td>
                    <td style={{padding:'10px 14px',maxWidth:220}}><p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600,color:'var(--txt)'}}>{o.assunto}</p></td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><Pb v={o.prioridade}/></td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><Sb v={o.status} list={STO}/></td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><span style={{fontSize:11,color:done?'#94a3b8':'#0F1E3A',fontWeight:over?800:600}}>{o.prazo?fD(o.prazo):'--'}</span></td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:3}}>
                        <IB icon="eye" color={G} title="Ver" onClick={()=>{setSel(o);setModal('view')}} sm/>
                        <IB icon="edit" color="#d97706" title="Editar" onClick={()=>{setSel(o);setModal('edit')}} sm/>
                        <IB icon="trash" color="#dc2626" title="Excluir" onClick={()=>del(o.id)} sm/>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {modal==='new'&&<Modal title="Novo Ofício" onClose={()=>setModal(null)} wide><OficioForm oficios={oficios} onSave={save} onClose={()=>setModal(null)}/></Modal>}
      {modal==='view'&&sel&&<Modal title="Detalhes do Ofício" onClose={()=>setModal(null)} wide><OficioDetail o={sel} setOficios={setOficios} onClose={()=>setModal(null)} onEdit={(o:any)=>{setModal('edit');setSel(o)}} saveOficio={save} /></Modal>}
      {modal==='edit'&&sel&&<Modal title="Editar Ofício" onClose={()=>setModal(null)} wide><OficioForm initial={sel} oficios={oficios} onSave={save} onClose={()=>setModal(null)}/></Modal>}
    </div>
  )
}
