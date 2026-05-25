'use client'
import {useState,useRef} from 'react'
import {Ic,IB,PB,Card,Fld,Sb,SAv,IS,oF,oB,G,GB,GD,NAVY} from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import DropZone from '@/components/ui/DropZone'
import {SECS,SPL,MOD,MESES} from '@/lib/constants'
import {gS,gT,uid,readFiles,openFile,downloadFile} from '@/utils/helpers'
import {td,fD,fR,fKB,fmtM,nPl} from '@/utils/formatters'

function ARow({a,onDelete}:any){
  const ext=(a.nome||'').split('.').pop().toLowerCase()
  const t={pdf:'PDF',doc:'DOC',docx:'DOC',xls:'XLS',xlsx:'XLS',jpg:'IMG',jpeg:'IMG',png:'IMG',zip:'ZIP'}[ext]||'ARQ'
  const cor:any={PDF:'#dc2626',DOC:'#2563eb',XLS:'#059669',IMG:'#6d28d9',ZIP:'#d97706',ARQ:'#64748b'}
  return(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--inp)',borderRadius:10,marginBottom:6}}>
      <div style={{width:34,height:34,borderRadius:8,background:(cor[t]||'#64748b')+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:9,fontWeight:900,color:cor[t]||'#64748b'}}>{t}</span></div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:12,fontWeight:700,color:'var(--txt)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nome}</p>
        <p style={{fontSize:10,color:'var(--muted)'}}>{fKB(a.tamanho)} · {fD(a.data)}</p>
      </div>
      {a.dataUrl&&<IB icon="dl" color={G} title="Baixar" onClick={()=>downloadFile(a.dataUrl,a.nome)} sm/>}
      <IB icon="trash" color="#dc2626" onClick={()=>onDelete(a.id)} sm/>
    </div>
  )
}

function PlForm({ini,pls,onSave,onClose}:any){
  const[f,sf]=useState(ini||{numero:nPl(pls),secretaria_id:1,modalidade:'pregao_eletronico',assunto:'',status:'solicitado',data_abertura:td(),data_prevista:'',responsavel:'',valor_estimado:'',valor_final:'',obs:'',anexos:[],contrato:null})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  function sv(){if(!f.assunto.trim()){alert('Preencha o assunto.');return}onSave({...f,secretaria_id:Number(f.secretaria_id),id:f.id||uid()})}
  async function addAnexos(files:File[]){const n=await readFiles(files);up('anexos',[...(f.anexos||[]),...n])}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Número"><input style={IS} value={f.numero} readOnly={!!ini} onFocus={oF} onBlur={oB} onChange={e=>up('numero',e.target.value)}/></Fld>
        <Fld label="Secretaria">
          <select style={IS} value={f.secretaria_id} onFocus={oF} onBlur={oB} onChange={e=>up('secretaria_id',e.target.value)}>
            {SECS.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Fld>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Modalidade">
          <select style={IS} value={f.modalidade} onFocus={oF} onBlur={oB} onChange={e=>up('modalidade',e.target.value)}>
            {Object.entries(MOD).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </Fld>
        <Fld label="Status">
          <select style={IS} value={f.status} onFocus={oF} onBlur={oB} onChange={e=>up('status',e.target.value)}>
            {SPL.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </Fld>
      </div>
      <Fld label="Assunto / Objeto" req><input style={IS} value={f.assunto} onFocus={oF} onBlur={oB} onChange={e=>up('assunto',e.target.value)}/></Fld>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Fld label="Abertura"><input type="date" style={IS} value={f.data_abertura} onFocus={oF} onBlur={oB} onChange={e=>up('data_abertura',e.target.value)}/></Fld>
        <Fld label="Previsão"><input type="date" style={IS} value={f.data_prevista} onFocus={oF} onBlur={oB} onChange={e=>up('data_prevista',e.target.value)}/></Fld>
        <Fld label="Responsável"><input style={IS} value={f.responsavel} onFocus={oF} onBlur={oB} onChange={e=>up('responsavel',e.target.value)}/></Fld>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Valor Estimado (R$)"><input style={IS} type="number" value={f.valor_estimado} placeholder="0,00" onFocus={oF} onBlur={oB} onChange={e=>up('valor_estimado',e.target.value)}/></Fld>
        <Fld label="Valor Final (R$)"><input style={IS} type="number" value={f.valor_final} placeholder="0,00 — após homologação" onFocus={oF} onBlur={oB} onChange={e=>up('valor_final',e.target.value)}/></Fld>
      </div>
      <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px'}}>
        <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:10}}>Documentos do Processo</p>
        <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:10,padding:'10px 13px',display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
          <Ic n="folder" z={15} c={G}/><p style={{fontSize:11,fontWeight:700,color:G}}>Pasta: Processos / {f.numero}</p>
        </div>
        <DropZone onFiles={addAnexos}/>
        {(f.anexos||[]).map((a:any)=><ARow key={a.id} a={a} onDelete={(id:number)=>up('anexos',(f.anexos||[]).filter((x:any)=>x.id!==id))}/>)}
      </div>
      <div style={{display:'flex',gap:10}}><PB onClick={sv} color={NAVY} full>{!ini?'Cadastrar':'Salvar'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

function ProcessoDetail({proc,setProcessos,onClose,onEdit,onSaveContrato}:any){
  const[tab,setTab]=useState(proc.contrato&&proc.contrato.empresa?'contrato':'info')
  const ct=proc.contrato||{}
  const[f,sf]=useState({empresa:ct.empresa||'',cnpj:ct.cnpj||'',responsavel:ct.responsavel||'',email:ct.email||'',telefone:ct.telefone||'',numero_contrato:ct.numero_contrato||'',data_assinatura:ct.data_assinatura||'',data_vigencia:ct.data_vigencia||'',objeto:ct.objeto||proc.assunto||'',valor:ct.valor||proc.valor_final||'',obs:ct.obs||'',arquivos:ct.arquivos||[]})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  const fileRef=useRef<HTMLInputElement>(null)
  async function pickPDFs(e:any){const files=Array.from(e.target.files as FileList);if(!files.length)return;const n=await readFiles(files);up('arquivos',[...f.arquivos,...n]);e.target.value=''}
  function downloadArq(arq:any){if(arq.dataUrl)downloadFile(arq.dataUrl,arq.nome)}
  function viewArq(arq:any){if(arq.dataUrl)openFile(arq.dataUrl,arq.nome)}
  function saveContrato(){if(!f.empresa.trim()){alert('Informe a empresa contratada.');return}const newProc={...proc,contrato:f};onSaveContrato(newProc);setProcessos((prev:any)=>prev.map((x:any)=>x.id===proc.id?newProc:x))}
  async function addAnexos(files:File[]){const n=await readFiles(files);setProcessos((prev:any)=>prev.map((x:any)=>x.id===proc.id?{...x,anexos:[...(x.anexos||[]),...n]}:x))}
  const sec=gS(proc.secretaria_id)
  const st=gT(SPL,proc.status)
  const TABS=[{id:'info',l:'Detalhes',n:'file'},{id:'contrato',l:'Contrato',n:'clip'},{id:'anexos',l:`Documentos (${(proc.anexos||[]).length})`,n:'ul'}]
  const g2={display:'grid',gridTemplateColumns:'1fr 1fr',gap:12} as React.CSSProperties
  const g3={display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12} as React.CSSProperties
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
        <SAv id={proc.secretaria_id} size={44}/>
        <div style={{flex:1}}>
          <span style={{fontFamily:'monospace',fontWeight:900,color:NAVY,fontSize:12}}>{proc.numero}</span>
          <p style={{fontSize:14,fontWeight:800,color:'var(--txt)',lineHeight:1.3}}>{proc.assunto}</p>
          <p style={{fontSize:11,color:'var(--muted)'}}>{sec.nome}</p>
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        <Sb v={proc.status} list={SPL}/>
        {proc.valor_estimado&&<span style={{color:'#059669',background:'#f0fdf4',border:'1px solid #86efac',padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:700}}>Est: {fR(proc.valor_estimado)}</span>}
        {proc.valor_final&&<span style={{color:'#0369a1',background:'#eff6ff',border:'1px solid #bfdbfe',padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:800}}>Final: {fR(proc.valor_final)}</span>}
      </div>
      <div style={{display:'flex',borderBottom:'1px solid var(--brd)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 4px',fontSize:10,fontWeight:700,border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:tab===t.id?NAVY:'var(--muted)',borderBottom:tab===t.id?`2px solid ${NAVY}`:'2px solid transparent',marginBottom:-1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <Ic n={t.n} z={13} c={tab===t.id?NAVY:undefined}/>{t.l}
          </button>
        ))}
      </div>
      {tab==='info'&&(
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {[['Modalidade',MOD[proc.modalidade]||proc.modalidade],['Responsável',proc.responsavel||'--'],['Abertura',fD(proc.data_abertura)],['Previsão',fD(proc.data_prevista)],['Valor Estimado',fR(proc.valor_estimado)],['Valor Final',proc.valor_final?fR(proc.valor_final):'Não informado']].map(([k,v])=>(
              <div key={k} style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px'}}>
                <p style={{fontSize:9,color:'var(--muted)',fontWeight:800,textTransform:'uppercase',marginBottom:3}}>{k}</p>
                <p style={{fontSize:12,fontWeight:700,color:'var(--txt)'}}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:6}}><PB onClick={()=>onEdit(proc)} full color={NAVY}><Ic n="edit" z={14}/>Editar Processo</PB><PB onClick={onClose} outline>Fechar</PB></div>
        </div>
      )}
      {tab==='contrato'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:`linear-gradient(135deg,${NAVY}cc,${NAVY})`,borderRadius:12,padding:'13px 16px',color:'#fff',display:'flex',alignItems:'center',gap:10}}>
            <Ic n="clip" z={18} c="rgba(255,255,255,.85)"/>
            <div><p style={{fontSize:11,opacity:.8}}>Contrato vinculado ao processo</p><p style={{fontSize:13,fontWeight:800}}>{proc.numero} — {proc.assunto.slice(0,45)}</p></div>
          </div>
          <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'14px 16px'}}>
            <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:12}}>📄 Arquivos do Contrato (PDF) — pode anexar mais de um</p>
            {f.arquivos.map((arq:any,i:number)=>(
              <div key={arq.id||i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:10,marginBottom:8}}>
                <div style={{width:42,height:42,borderRadius:9,background:'#dc262618',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:11,fontWeight:900,color:'#dc2626'}}>PDF</span></div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:800,color:'var(--txt)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{arq.nome}</p>
                  <p style={{fontSize:11,color:'var(--muted)'}}>{fKB(arq.tamanho)} · Anexado em {fD(arq.data)}</p>
                </div>
                <button onClick={()=>viewArq(arq)} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:NAVY,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}><Ic n="eye" z={13} c="#fff"/>Ver</button>
                <button onClick={()=>downloadArq(arq)} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'#059669',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}><Ic n="dl" z={13} c="#fff"/>Baixar</button>
                <IB icon="trash" color="#dc2626" onClick={()=>up('arquivos',f.arquivos.filter((_:any,j:number)=>j!==i))} sm/>
              </div>
            ))}
            <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${NAVY}`,borderRadius:10,padding:'20px 16px',textAlign:'center',cursor:'pointer',background:'#e8eef7',marginTop:4,transition:'all .2s'}} onMouseEnter={e=>{(e.currentTarget as any).style.background='#bfdbfe'}} onMouseLeave={e=>{(e.currentTarget as any).style.background='#e8eef7'}}>
              <Ic n="ul" z={22} c={NAVY} sx={{margin:'0 auto 8px'}}/>
              <p style={{fontSize:13,fontWeight:800,color:NAVY}}>Clique para adicionar {f.arquivos.length>0?'mais um contrato':'o contrato em PDF'}</p>
              <p style={{fontSize:11,color:NAVY,marginTop:3,opacity:.7}}>Você pode anexar múltiplos arquivos PDF</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" multiple style={{display:'none'}} onChange={pickPDFs}/>
          </div>
          <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'14px 16px'}}>
            <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:12}}>Dados do Contrato</p>
            <div style={g3}>
              <Fld label="Número do Contrato"><input style={IS} value={f.numero_contrato} placeholder="CONT-2025-001" onFocus={oF} onBlur={oB} onChange={e=>up('numero_contrato',e.target.value)}/></Fld>
              <Fld label="Data de Assinatura"><input type="date" style={IS} value={f.data_assinatura} onFocus={oF} onBlur={oB} onChange={e=>up('data_assinatura',e.target.value)}/></Fld>
              <Fld label="Data de Vigência"><input type="date" style={IS} value={f.data_vigencia} onFocus={oF} onBlur={oB} onChange={e=>up('data_vigencia',e.target.value)}/></Fld>
            </div>
            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Fld label="Objeto do Contrato"><input style={IS} value={f.objeto} onFocus={oF} onBlur={oB} onChange={e=>up('objeto',e.target.value)}/></Fld>
              <Fld label="Valor do Contrato (R$)"><input style={IS} type="number" value={f.valor} placeholder="0,00" onFocus={oF} onBlur={oB} onChange={e=>up('valor',e.target.value)}/></Fld>
            </div>
          </div>
          <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'14px 16px'}}>
            <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:12}}>Empresa Contratada</p>
            <div style={g2}>
              <Fld label="Razão Social" req><input style={IS} value={f.empresa} placeholder="Nome da empresa" onFocus={oF} onBlur={oB} onChange={e=>up('empresa',e.target.value)}/></Fld>
              <Fld label="CNPJ"><input style={IS} value={f.cnpj} placeholder="00.000.000/0001-00" onFocus={oF} onBlur={oB} onChange={e=>up('cnpj',e.target.value)}/></Fld>
            </div>
            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <Fld label="Responsável / Rep. Legal"><input style={IS} value={f.responsavel} placeholder="Nome do responsável" onFocus={oF} onBlur={oB} onChange={e=>up('responsavel',e.target.value)}/></Fld>
              <Fld label="E-mail"><input type="email" style={IS} value={f.email} placeholder="contato@empresa.com.br" onFocus={oF} onBlur={oB} onChange={e=>up('email',e.target.value)}/></Fld>
              <Fld label="Telefone"><input style={IS} value={f.telefone} placeholder="(00) 00000-0000" onFocus={oF} onBlur={oB} onChange={e=>up('telefone',e.target.value)}/></Fld>
            </div>
          </div>
          <Fld label="Observações"><textarea style={{...IS,resize:'none'}} rows={3} value={f.obs} placeholder="Observações sobre o contrato..." onFocus={oF} onBlur={oB} onChange={e=>up('obs',e.target.value)}/></Fld>
          <div style={{display:'flex',gap:10}}><PB onClick={saveContrato} color={NAVY} full><Ic n="check" z={14}/>Salvar Contrato</PB><PB onClick={onClose} outline>Fechar</PB></div>
        </div>
      )}
      {tab==='anexos'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:10,padding:'10px 13px',display:'flex',alignItems:'center',gap:9}}>
            <Ic n="folder" z={15} c={G}/><p style={{fontSize:11,fontWeight:700,color:G}}>Pasta: Processos / {proc.numero}</p>
          </div>
          <DropZone onFiles={addAnexos}/>
          {(proc.anexos||[]).length===0&&<p style={{fontSize:12,color:'var(--muted)',textAlign:'center',padding:16}}>Nenhum documento anexado.</p>}
          {(proc.anexos||[]).map((a:any)=>(
            <ARow key={a.id} a={a} onDelete={(id:number)=>setProcessos((prev:any)=>prev.map((x:any)=>x.id===proc.id?{...x,anexos:(x.anexos||[]).filter((an:any)=>an.id!==id)}:x))}/>
          ))}
          <PB onClick={onClose} outline>Fechar</PB>
        </div>
      )}
    </div>
  )
}

export default function ProcessosPage({processos,setProcessos,saveProcesso,deleteProcesso,toast}:any){
  const[modal,setModal]=useState<any>(null)
  const[sel,setSel]=useState<any>(null)
  const[detProc,setDetProc]=useState<any>(null)
  const[q,setQ]=useState('')
  const[fSec,setFSec]=useState('')
  const filtered=processos.filter((p:any)=>{
    const sq=q.toLowerCase()
    return(!q||p.numero.toLowerCase().includes(sq)||p.assunto.toLowerCase().includes(sq))&&(!fSec||p.secretaria_id===Number(fSec))
  })
  function save(data:any){saveProcesso(data,modal==='new');toast(modal==='new'?'Cadastrado!':'Atualizado!','success');setModal(null);setSel(null)}
  function saveContrato(data:any){saveProcesso(data,false);toast('Contrato salvo!','success');setDetProc(null)}
  function del(id:number){if(!confirm('Excluir?'))return;deleteProcesso(id);toast('Excluído.','info')}
  const th:React.CSSProperties={padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,position:'relative'}}>
          <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}><Ic n="search" z={15}/></div>
          <input style={{...IS,paddingLeft:35}} placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} onFocus={oF} onBlur={oB}/>
        </div>
        <select style={{...IS,width:140,fontSize:12,padding:'9px 10px'}} value={fSec} onChange={e=>setFSec(e.target.value)}>
          <option value="">Secretarias</option>{SECS.map(s=><option key={s.id} value={s.id}>{s.sigla}</option>)}
        </select>
        <button onClick={()=>{setSel(null);setModal('new')}} style={{display:'flex',alignItems:'center',gap:7,background:NAVY,color:'#fff',fontWeight:800,padding:'9px 15px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',whiteSpace:'nowrap'}}>
          <Ic n="plus" z={15} c="#fff"/>Novo Processo
        </button>
      </div>
      <Card style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
                {['Número','Secretaria','Assunto','Modalidade','Responsável','Valor Est.','Valor Final','Status','Contrato','Ações'].map(h=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={10} style={{padding:'40px 14px',textAlign:'center',color:'var(--muted)',fontSize:13}}>Nenhum processo.</td></tr>}
              {filtered.map((p:any)=>{
                const sec=gS(p.secretaria_id)
                const st=gT(SPL,p.status)
                return(
                  <tr key={p.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontWeight:800,color:NAVY,fontSize:11,whiteSpace:'nowrap'}}>{p.numero}</td>
                    <td style={{padding:'10px 14px'}}><SAv id={p.secretaria_id} size={24}/></td>
                    <td style={{padding:'10px 14px',maxWidth:200}}><p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600,color:'var(--txt)'}}>{p.assunto}</p></td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{MOD[p.modalidade]||p.modalidade}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{p.responsavel||'--'}</td>
                    <td style={{padding:'10px 14px',fontSize:11,fontWeight:700,color:'#059669',whiteSpace:'nowrap'}}>{fR(p.valor_estimado)}</td>
                    <td style={{padding:'10px 14px',fontSize:11,fontWeight:700,color:'#0369a1',whiteSpace:'nowrap'}}>{p.valor_final?fR(p.valor_final):<span style={{color:'var(--muted)'}}>--</span>}</td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><span style={{color:st.bg,background:st.cor,border:`1px solid ${st.cor}`,padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:700,display:'inline-block'}}>{st.l}</span></td>
                    <td style={{padding:'10px 14px',textAlign:'center'}}>
                      {p.contrato&&p.contrato.empresa
                        ?<span style={{fontSize:10,color:'#059669',background:'#f0fdf4',border:'1px solid #86efac',padding:'2px 8px',borderRadius:999,fontWeight:700,display:'inline-flex',alignItems:'center',gap:4}}><Ic n="check" z={10} c="#059669"/>Vinculado</span>
                        :<span style={{fontSize:10,color:'#dc2626',background:'#fef2f2',border:'1px solid #fecaca',padding:'2px 8px',borderRadius:999,fontWeight:700}}>Sem contrato</span>
                      }
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <button onClick={()=>setDetProc(p)} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:NAVY,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',whiteSpace:'nowrap'}}>
                          <Ic n="clip" z={12} c="#fff"/>Contrato
                        </button>
                        <IB icon="edit" color="#d97706" onClick={()=>{setSel(p);setModal('edit')}} sm/>
                        <IB icon="trash" color="#dc2626" onClick={()=>del(p.id)} sm/>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {(modal==='new'||modal==='edit')&&<Modal title={modal==='new'?'Novo Processo':'Editar Processo'} onClose={()=>setModal(null)} wide><PlForm ini={modal==='edit'?sel:null} pls={processos} onSave={save} onClose={()=>setModal(null)}/></Modal>}
      {detProc&&<Modal title={`Processo ${detProc.numero}`} onClose={()=>setDetProc(null)} wide><ProcessoDetail proc={detProc} setProcessos={setProcessos} onClose={()=>setDetProc(null)} onEdit={(p:any)=>{setDetProc(null);setSel(p);setModal('edit')}} onSaveContrato={saveContrato}/></Modal>}
    </div>
  )
}
