'use client'
import {useState,useMemo} from 'react'
import {Ic,IB,PB,Card,Fld,Sb,SAv,IS,oF,oB,G,GB,GD} from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import DropZoneUpload from '@/components/ui/DropZoneUpload'
import ARow from '@/components/ui/ARow'
import {SECS} from '@/lib/constants'
import {gS} from '@/utils/helpers'
import {fD} from '@/utils/formatters'
import {useUpload} from '@/hooks/useUpload'
import {usePermissions} from '@/hooks/usePermissions'
import {deleteArquivo,getSignedUrl} from '@/lib/storage'
import {SOF,statusOF,hojeLocal,diasEntre,mensagemAlertaOF,resumoOF} from '@/utils/ordens'
import type {OrdemFornecimento,Arquivo} from '@/lib/types'

const isPdf=(f:File)=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf')

/** Próximo número no formato 015/2026 */
function nOF(ordens:OrdemFornecimento[]){
  const ano=new Date().getFullYear()
  const n=ordens.filter(o=>o.numero_ordem.endsWith('/'+ano)).length+1
  return `${String(n).padStart(3,'0')}/${ano}`
}

/** Campo de PDF único: mostra o arquivo atual ou a área de upload (Storage "documentos") */
function PdfField({label,arquivo,onChange,modulo,vinculo,secretaria_id,req}:{label:string;arquivo:Arquivo|null;onChange:(a:Arquivo|null)=>void;modulo:'ordens_fornecimento';vinculo:string;secretaria_id:number;req?:boolean}){
  const{uploadFiles,uploading,erros}=useUpload({modulo,vinculo,secretaria_id})
  const[aviso,setAviso]=useState('')
  async function add(files:File[]){
    setAviso('')
    const f=files[0]
    if(!f)return
    if(!isPdf(f)){setAviso('Envie o arquivo em PDF.');return}
    if(!vinculo.trim()){setAviso('Preencha o número da ordem antes de enviar o arquivo.');return}
    const[a]=await uploadFiles([f])
    if(a)onChange(a)
  }
  return(
    <Fld label={label} req={req}>
      {arquivo
        ?<ARow a={arquivo} onDelete={()=>onChange(null)}/>
        :<DropZoneUpload onFiles={add} uploading={uploading} erros={aviso?[aviso,...erros]:erros} accept=".pdf,application/pdf" label="Arraste o PDF ou clique para selecionar" sublabel="Somente PDF · Máx. 50MB"/>}
    </Fld>
  )
}

function Erro({msg}:{msg:string}){
  if(!msg)return null
  return(
    <div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:8}}>
      <Ic n="alert" z={15} c="#dc2626"/><p style={{fontSize:12,fontWeight:700,color:'#991b1b'}}>{msg}</p>
    </div>
  )
}

function OrdemForm({initial,ordens,processos,onSave,onClose}:any){
  const[f,sf]=useState<OrdemFornecimento>(initial||{
    numero_ordem:nOF(ordens),processo_id:null,fornecedor:'',fornecedor_cnpj:'',secretaria_id:SECS[0]?.id||1,
    data_emissao:hojeLocal(),data_envio:hojeLocal(),prazo_final_entrega:'',data_entrega:null,
    status:'aberta',observacoes:'',obs_entrega:'',arquivo:null,comprovante_entrega:null,
  })
  const[erro,setErro]=useState('')
  const[salvando,setSalvando]=useState(false)
  const up=(k:keyof OrdemFornecimento,v:any)=>sf(p=>({...p,[k]:v}))

  // Ao escolher o processo: secretaria e fornecedor (contrato) vêm junto
  function escolherProcesso(id:string){
    const p=processos.find((x:any)=>x.id===id)
    sf(prev=>({
      ...prev,processo_id:id||null,
      ...(p?{secretaria_id:Number(p.secretaria_id)||prev.secretaria_id}:{}),
      ...(p?.contrato?.empresa?{fornecedor:p.contrato.empresa,fornecedor_cnpj:p.contrato.cnpj||''}:{}),
    }))
  }

  async function save(){
    const num=f.numero_ordem.trim()
    if(!num)return setErro('Informe o número da Ordem de Fornecimento.')
    if(ordens.some((o:OrdemFornecimento)=>o.numero_ordem.trim()===num&&o.id!==f.id))return setErro(`Já existe a Ordem de Fornecimento nº ${num}.`)
    if(!f.fornecedor.trim())return setErro('Informe o fornecedor.')
    if(!f.data_envio)return setErro('Informe a data de envio da ordem.')
    if(!f.prazo_final_entrega)return setErro('Informe o prazo final para entrega.')
    if(f.prazo_final_entrega<f.data_envio)return setErro('O prazo final não pode ser anterior à data de envio.')
    if(f.status==='entregue'&&!f.data_entrega)return setErro('Informe a data da entrega.')
    if(!f.arquivo)return setErro('Anexe o PDF da Ordem de Fornecimento.')
    setErro('');setSalvando(true)
    const r=await onSave({...f,numero_ordem:num,fornecedor:f.fornecedor.trim(),secretaria_id:Number(f.secretaria_id),data_entrega:f.status==='entregue'?f.data_entrega:null})
    setSalvando(false)
    if(r&&!r.success)setErro(r.error||'Não foi possível salvar.')
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Nº da Ordem" req><input style={IS} value={f.numero_ordem} placeholder="015/2026" onFocus={oF} onBlur={oB} onChange={e=>up('numero_ordem',e.target.value)}/></Fld>
        <Fld label="Processo Licitatório">
          <select style={IS} value={f.processo_id||''} onFocus={oF} onBlur={oB} onChange={e=>escolherProcesso(e.target.value)}>
            <option value="">— Sem processo vinculado —</option>
            {processos.map((p:any)=><option key={p.id} value={p.id}>{p.numero}{p.assunto?` — ${p.assunto}`:''}</option>)}
          </select>
        </Fld>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
        <Fld label="Fornecedor" req><input style={IS} value={f.fornecedor} placeholder="Razão social" onFocus={oF} onBlur={oB} onChange={e=>up('fornecedor',e.target.value)}/></Fld>
        <Fld label="CNPJ"><input style={IS} value={f.fornecedor_cnpj} placeholder="00.000.000/0000-00" onFocus={oF} onBlur={oB} onChange={e=>up('fornecedor_cnpj',e.target.value)}/></Fld>
      </div>
      <Fld label="Secretaria solicitante" req>
        <select style={IS} value={f.secretaria_id} onFocus={oF} onBlur={oB} onChange={e=>up('secretaria_id',Number(e.target.value))}>
          {SECS.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Fld>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Fld label="Data de emissão"><input type="date" style={IS} value={f.data_emissao||''} onFocus={oF} onBlur={oB} onChange={e=>up('data_emissao',e.target.value)}/></Fld>
        <Fld label="Data de envio" req><input type="date" style={IS} value={f.data_envio} onFocus={oF} onBlur={oB} onChange={e=>up('data_envio',e.target.value)}/></Fld>
        <Fld label="Prazo final de entrega" req><input type="date" style={IS} value={f.prazo_final_entrega} min={f.data_envio||undefined} onFocus={oF} onBlur={oB} onChange={e=>up('prazo_final_entrega',e.target.value)}/></Fld>
      </div>
      {f.prazo_final_entrega&&(
        <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:10,padding:'10px 13px',display:'flex',alignItems:'center',gap:9}}>
          <Ic n="clock" z={15} c={G}/>
          <p style={{fontSize:12,fontWeight:800,color:G}}>Prazo de entrega: {fD(f.prazo_final_entrega)}
            {f.data_envio&&f.prazo_final_entrega>=f.data_envio&&<span style={{fontWeight:600}}> · {diasEntre(f.data_envio,f.prazo_final_entrega)} dia(s) após o envio</span>}
          </p>
        </div>
      )}
      {initial&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Fld label="Situação">
            <select style={IS} value={f.status} onFocus={oF} onBlur={oB} onChange={e=>{const v=e.target.value as OrdemFornecimento['status'];sf(p=>({...p,status:v,data_entrega:v==='entregue'?(p.data_entrega||hojeLocal()):p.data_entrega}))}}>
              <option value="aberta">Em aberto (status pelo prazo)</option>
              <option value="entregue">Entregue</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </Fld>
          {f.status==='entregue'&&<Fld label="Data da entrega" req><input type="date" style={IS} value={f.data_entrega||''} onFocus={oF} onBlur={oB} onChange={e=>up('data_entrega',e.target.value)}/></Fld>}
        </div>
      )}
      <Fld label="Observações"><textarea style={{...IS,resize:'none'}} rows={2} value={f.observacoes} onFocus={oF} onBlur={oB} onChange={e=>up('observacoes',e.target.value)}/></Fld>
      <PdfField label="Arquivo da Ordem de Fornecimento (PDF)" req arquivo={f.arquivo} onChange={a=>up('arquivo',a)} modulo="ordens_fornecimento" vinculo={f.numero_ordem} secretaria_id={Number(f.secretaria_id)}/>
      <Erro msg={erro}/>
      <div style={{display:'flex',gap:10}}><PB onClick={save} full disabled={salvando}>{salvando?'Salvando...':!initial?'Cadastrar':'Salvar'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

function EntregaForm({o,onSave,onClose}:{o:OrdemFornecimento;onSave:(d:OrdemFornecimento)=>Promise<any>;onClose:()=>void}){
  const[data,setData]=useState(hojeLocal())
  const[obs,setObs]=useState('')
  const[comp,setComp]=useState<Arquivo|null>(null)
  const[erro,setErro]=useState('')
  const[salvando,setSalvando]=useState(false)
  const atraso=data?diasEntre(o.prazo_final_entrega,data):0
  async function save(){
    if(!data)return setErro('Informe a data da entrega.')
    setErro('');setSalvando(true)
    const r=await onSave({...o,status:'entregue',data_entrega:data,obs_entrega:obs.trim(),comprovante_entrega:comp})
    setSalvando(false)
    if(r&&!r.success)setErro(r.error||'Não foi possível salvar.')
  }
  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div style={{background:'var(--inp)',borderRadius:10,padding:'10px 13px'}}>
        <p style={{fontSize:12,fontWeight:800,color:'var(--txt)'}}>OF nº {o.numero_ordem} · {o.fornecedor}</p>
        <p style={{fontSize:11,color:'var(--muted)'}}>Prazo de entrega: {fD(o.prazo_final_entrega)}</p>
      </div>
      <Fld label="Data da entrega" req><input type="date" style={IS} value={data} onFocus={oF} onBlur={oB} onChange={e=>setData(e.target.value)}/></Fld>
      {data&&atraso>0&&<p style={{fontSize:11,fontWeight:700,color:'#b45309',marginTop:-6}}>Entregue {atraso} dia(s) após o prazo.</p>}
      <Fld label="Observação da entrega"><textarea style={{...IS,resize:'none'}} rows={2} value={obs} placeholder="Ex.: entregue parcialmente, conferido por..." onFocus={oF} onBlur={oB} onChange={e=>setObs(e.target.value)}/></Fld>
      <PdfField label="Comprovante de entrega (PDF, opcional)" arquivo={comp} onChange={setComp} modulo="ordens_fornecimento" vinculo={o.numero_ordem} secretaria_id={o.secretaria_id}/>
      <Erro msg={erro}/>
      <div style={{display:'flex',gap:10}}><PB onClick={save} full disabled={salvando}><Ic n="check" z={14}/>{salvando?'Salvando...':'Confirmar entrega'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

function PrazoBanner({o}:{o:OrdemFornecimento}){
  const st=statusOF(o)
  const s=SOF.find(x=>x.v===st)!
  const msg=st==='entregue'?`Entregue em ${fD(o.data_entrega||'')}`:st==='cancelada'?'Ordem cancelada':mensagemAlertaOF(o).replace(`Ordem de Fornecimento nº ${o.numero_ordem} `,'').replace(/^./,c=>c.toUpperCase())
  return(
    <div style={{background:s.bg,borderRadius:12,padding:'12px 15px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <Ic n="clock" z={18} c={s.cor}/>
      <div style={{flex:1,minWidth:160}}>
        <p style={{fontSize:14,fontWeight:900,color:s.cor}}>Prazo de entrega: {fD(o.prazo_final_entrega)}</p>
        <p style={{fontSize:11,fontWeight:700,color:s.cor,opacity:.85}}>{msg}</p>
      </div>
      <Sb v={st} list={SOF}/>
    </div>
  )
}

function OrdemDetail({o,processos,onEdit,onEntregar,onClose,podeEditar,podeEntregar}:any){
  const sec=gS(o.secretaria_id)
  const proc=processos.find((p:any)=>p.id===o.processo_id)
  const info=[
    ['Processo',proc?.numero||'--'],['Secretaria',sec.sigla],
    ['Fornecedor',o.fornecedor],['CNPJ',o.fornecedor_cnpj||'--'],
    ['Emissão',fD(o.data_emissao||'')],['Envio',fD(o.data_envio)],
  ]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
        <SAv id={o.secretaria_id} size={44}/>
        <div style={{flex:1}}>
          <span style={{fontFamily:'monospace',fontWeight:900,color:G,fontSize:12}}>OF nº {o.numero_ordem}</span>
          <p style={{fontSize:14,fontWeight:800,color:'var(--txt)',lineHeight:1.3}}>{o.fornecedor}</p>
          <p style={{fontSize:11,color:'var(--muted)'}}>{sec.nome}</p>
        </div>
      </div>
      <PrazoBanner o={o}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
        {info.map(([k,v])=>(
          <div key={k} style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px'}}>
            <p style={{fontSize:9,color:'var(--muted)',fontWeight:800,textTransform:'uppercase',marginBottom:3}}>{k}</p>
            <p style={{fontSize:12,fontWeight:700,color:'var(--txt)'}}>{v}</p>
          </div>
        ))}
      </div>
      {o.observacoes&&<div style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px'}}><p style={{fontSize:9,color:'var(--muted)',fontWeight:800,textTransform:'uppercase',marginBottom:3}}>Observações</p><p style={{fontSize:12,color:'var(--txt)',whiteSpace:'pre-wrap'}}>{o.observacoes}</p></div>}
      <div>
        <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:8}}>Ordem de Fornecimento (PDF)</p>
        {o.arquivo?<ARow a={o.arquivo}/>:<p style={{fontSize:12,color:'var(--muted)'}}>Nenhum arquivo.</p>}
      </div>
      {o.status==='entregue'&&(
        <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
          <p style={{fontSize:10,fontWeight:800,color:'#065f46',textTransform:'uppercase'}}>Entrega</p>
          <p style={{fontSize:12,fontWeight:700,color:'var(--txt)'}}>Entregue em {fD(o.data_entrega||'')}{o.data_entrega&&o.data_entrega>o.prazo_final_entrega?` · ${diasEntre(o.prazo_final_entrega,o.data_entrega)} dia(s) após o prazo`:''}</p>
          {o.obs_entrega&&<p style={{fontSize:12,color:'var(--txt)',whiteSpace:'pre-wrap'}}>{o.obs_entrega}</p>}
          {o.comprovante_entrega&&<ARow a={o.comprovante_entrega} sm/>}
        </div>
      )}
      <div style={{display:'flex',gap:10,paddingTop:4,flexWrap:'wrap'}}>
        {podeEntregar&&o.status==='aberta'&&<PB onClick={()=>onEntregar(o)} full><Ic n="check" z={14}/>Marcar como entregue</PB>}
        {podeEditar&&<PB onClick={()=>onEdit(o)} full outline={podeEntregar&&o.status==='aberta'}><Ic n="edit" z={14}/>Editar</PB>}
        <PB onClick={onClose} outline>Fechar</PB>
      </div>
    </div>
  )
}

export default function OrdensPage({ordens,processos,saveOrdem,deleteOrdem,toast}:any){
  const{tem}=usePermissions()
  const pode={criar:tem('ordens.criar'),editar:tem('ordens.editar'),excluir:tem('ordens.excluir'),entregar:tem('ordens.entregar')}
  const[modal,setModal]=useState<'new'|'view'|'edit'|'entrega'|'del'|null>(null)
  const[sel,setSel]=useState<OrdemFornecimento|null>(null)
  const[q,setQ]=useState('')
  const[fSec,setFSec]=useState('')
  const[fProc,setFProc]=useState('')
  const[fSt,setFSt]=useState('')
  const[de,setDe]=useState('')
  const[ate,setAte]=useState('')
  const[excluindo,setExcluindo]=useState(false)

  const hoje=hojeLocal()
  const procNum=useMemo(()=>Object.fromEntries((processos||[]).map((p:any)=>[p.id,p.numero])),[processos])
  const resumo=resumoOF(ordens,hoje)
  const filtered=(ordens as OrdemFornecimento[]).filter(o=>{
    const sq=q.trim().toLowerCase()
    const txt=!sq||o.numero_ordem.toLowerCase().includes(sq)||o.fornecedor.toLowerCase().includes(sq)||String(procNum[o.processo_id||'']||'').toLowerCase().includes(sq)
    return txt&&(!fSec||o.secretaria_id===Number(fSec))&&(!fProc||o.processo_id===fProc)&&(!fSt||statusOF(o,hoje)===fSt)&&(!de||o.data_envio>=de)&&(!ate||o.data_envio<=ate)
  })

  function abrir(m:typeof modal,o:OrdemFornecimento|null=null){setSel(o);setModal(m)}
  function fechar(){setModal(null);setSel(null)}

  async function save(data:OrdemFornecimento){
    const isNew=modal==='new'
    const r=await saveOrdem(data,isNew,modal==='entrega'?'Marcou como entregue':undefined)
    if(r.success){toast(modal==='entrega'?'Entrega registrada!':isNew?'Ordem cadastrada!':'Ordem atualizada!','success');fechar()}
    return r
  }

  async function confirmarExclusao(){
    if(!sel)return
    setExcluindo(true)
    const r=await deleteOrdem(sel.id)
    setExcluindo(false)
    if(!r.success){toast(r.error||'Não foi possível excluir.','error');return}
    // Remove os PDFs do Storage; falha aqui não desfaz a exclusão
    for(const a of [sel.arquivo,sel.comprovante_entrega])if(a?.caminho)await deleteArquivo(a as any).catch(()=>{})
    toast('Ordem excluída.','info');fechar()
  }

  async function verPdf(o:OrdemFornecimento){
    if(!o.arquivo?.caminho){toast('Ordem sem PDF anexado.','error');return}
    const url=await getSignedUrl(o.arquivo.caminho)
    if(!url){toast('Não foi possível abrir o PDF.','error');return}
    window.open(url,'_blank')
  }

  const th:React.CSSProperties={padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}
  const sel2:React.CSSProperties={...IS,width:140,fontSize:12,padding:'9px 10px'}
  const chips=[{v:'',l:'Todas',n:resumo.total},...SOF.map(s=>({v:s.v,l:s.l,n:resumo[s.v]}))]

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,position:'relative'}}>
          <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}><Ic n="search" z={15}/></div>
          <input style={{...IS,paddingLeft:35}} placeholder="Buscar nº da ordem, fornecedor, processo..." value={q} onChange={e=>setQ(e.target.value)} onFocus={oF} onBlur={oB}/>
        </div>
        <select style={sel2} value={fSec} onChange={e=>setFSec(e.target.value)}>
          <option value="">Secretarias</option>{SECS.map(s=><option key={s.id} value={s.id}>{s.sigla}</option>)}
        </select>
        <select style={sel2} value={fProc} onChange={e=>setFProc(e.target.value)}>
          <option value="">Processos</option>{(processos||[]).map((p:any)=><option key={p.id} value={p.id}>{p.numero}</option>)}
        </select>
        <div style={{display:'flex',alignItems:'center',gap:6}} title="Período pela data de envio">
          <span style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase'}}>Envio</span>
          <input type="date" style={{...sel2,width:138}} value={de} onChange={e=>setDe(e.target.value)}/>
          <span style={{fontSize:11,color:'var(--muted)'}}>até</span>
          <input type="date" style={{...sel2,width:138}} value={ate} onChange={e=>setAte(e.target.value)}/>
        </div>
        {pode.criar&&(
          <button onClick={()=>abrir('new')} style={{display:'flex',alignItems:'center',gap:7,background:G,color:'#fff',fontWeight:800,padding:'9px 15px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            <Ic n="plus" z={15} c="#fff"/>Nova Ordem de Fornecimento
          </button>
        )}
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {chips.map(c=>{
          const s=SOF.find(x=>x.v===c.v)
          const on=fSt===c.v
          return(
            <button key={c.v||'all'} onClick={()=>setFSt(c.v)} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 11px',borderRadius:999,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:700,border:`1.5px solid ${on?(s?.cor||G):'var(--brd)'}`,background:on?(s?.bg||GB):'var(--card)',color:on?(s?.cor||G):'var(--muted)'}}>
              {c.l}<span style={{fontSize:10,fontWeight:900,background:on?'#fff':'var(--inp)',color:s?.cor||G,padding:'0 7px',borderRadius:999}}>{c.n}</span>
            </button>
          )
        })}
      </div>

      <p style={{fontSize:11,color:'var(--muted)',fontWeight:600}}>{filtered.length} ordem(ns)</p>
      <Card style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
                {['Ordem','Processo','Fornecedor','Secretaria','Envio','Prazo final','Status','Ações'].map(h=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8} style={{padding:'40px 14px',textAlign:'center',color:'var(--muted)',fontSize:13}}>{ordens.length?'Nenhuma ordem encontrada com esses filtros.':'Nenhuma ordem de fornecimento cadastrada.'}</td></tr>}
              {filtered.map(o=>{
                const sec=gS(o.secretaria_id)
                const st=statusOF(o,hoje)
                const alerta=st==='atrasado'||st==='hoje'
                return(
                  <tr key={o.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontWeight:800,color:G,fontSize:11,whiteSpace:'nowrap'}}>{o.numero_ordem}</td>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{procNum[o.processo_id||'']||'--'}</td>
                    <td style={{padding:'10px 14px',maxWidth:220}}><p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600,color:'var(--txt)'}}>{o.fornecedor}</p></td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}><SAv id={o.secretaria_id} size={24}/><span style={{fontSize:10,color:'var(--muted)'}}>{sec.sigla}</span></div>
                    </td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap',fontSize:11,color:'var(--txt)'}}>{fD(o.data_envio)}</td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><span style={{fontSize:11,color:alerta?'#dc2626':'var(--txt)',fontWeight:alerta?800:600}}>{fD(o.prazo_final_entrega)}</span></td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><Sb v={st} list={SOF}/></td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:3}}>
                        <IB icon="eye" color={G} title="Visualizar" onClick={()=>abrir('view',o)} sm/>
                        {pode.editar&&<IB icon="edit" color="#d97706" title="Editar" onClick={()=>abrir('edit',o)} sm/>}
                        {o.arquivo&&<IB icon="dl" color="#0F1E3A" title="Ver PDF" onClick={()=>verPdf(o)} sm/>}
                        {pode.entregar&&o.status==='aberta'&&<IB icon="check" color="#059669" title="Marcar como entregue" onClick={()=>abrir('entrega',o)} sm/>}
                        {pode.excluir&&<IB icon="trash" color="#dc2626" title="Excluir" onClick={()=>abrir('del',o)} sm/>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modal==='new'&&<Modal title="Nova Ordem de Fornecimento" onClose={fechar} wide><OrdemForm ordens={ordens} processos={processos} onSave={save} onClose={fechar}/></Modal>}
      {modal==='edit'&&sel&&<Modal title="Editar Ordem de Fornecimento" onClose={fechar} wide><OrdemForm initial={sel} ordens={ordens} processos={processos} onSave={save} onClose={fechar}/></Modal>}
      {modal==='view'&&sel&&<Modal title="Ordem de Fornecimento" onClose={fechar} wide><OrdemDetail o={sel} processos={processos} podeEditar={pode.editar} podeEntregar={pode.entregar} onEdit={(o:any)=>abrir('edit',o)} onEntregar={(o:any)=>abrir('entrega',o)} onClose={fechar}/></Modal>}
      {modal==='entrega'&&sel&&<Modal title="Marcar como entregue" onClose={fechar}><EntregaForm o={sel} onSave={save} onClose={fechar}/></Modal>}
      {modal==='del'&&sel&&(
        <Modal title="Excluir Ordem de Fornecimento" onClose={fechar}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <p style={{fontSize:13,color:'var(--txt)'}}>Excluir a <b>OF nº {sel.numero_ordem}</b> ({sel.fornecedor})? Os PDFs anexados também serão apagados. Essa ação não pode ser desfeita.</p>
            <div style={{display:'flex',gap:10}}><PB onClick={confirmarExclusao} color="#dc2626" full disabled={excluindo}><Ic n="trash" z={14}/>{excluindo?'Excluindo...':'Excluir'}</PB><PB onClick={fechar} outline>Cancelar</PB></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
