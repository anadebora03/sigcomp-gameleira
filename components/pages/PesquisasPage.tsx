'use client'
import {useState} from 'react'
import {Ic,IB,PB,Card,Fld,Sb,SAv,IS,oF,oB,G,GB,GD,NAVY} from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import {SECS,SPQ,MESES} from '@/lib/constants'
import {gS,gT,uid} from '@/utils/helpers'
import {useUpload} from '@/hooks/useUpload'
import ARow from '@/components/ui/ARow'
import {deleteArquivo,getSignedUrl} from '@/lib/storage'
import {td,fD,fR,fKB,fmtM,nPq} from '@/utils/formatters'


// ── PesquisaForm ───────────────────────────────────────────────────────────────
function PesquisaForm({initial,oficios,pesquisas,onSave,onClose}:any){
  const[uploadFornId,setUploadFornId]=useState<number|null>(null)
  const hoje=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')
  const nxt=`PQ-${new Date().getFullYear()}-${String(pesquisas.length+1).padStart(4,'0')}`
  const[f,sf]=useState(initial||{numero:nxt,secretaria_id:1,objeto:'',descricao:'',oficio_ref:'',periodo:hoje,prazo_cotacao:'',responsavel:'',status:'aguardando',obs:'',fornecedores:[{id:uid(),nome:'',cnpj:'',email:'',telefone:'',valor:'',obs:'',arquivos:[]}],anexos:[]})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  const addForn=()=>up('fornecedores',[...f.fornecedores,{id:uid(),nome:'',cnpj:'',email:'',telefone:'',valor:'',obs:'',arquivos:[]}])
  const upForn=(id:number,k:string,v:any)=>up('fornecedores',f.fornecedores.map((x:any)=>x.id===id?{...x,[k]:v}:x))
  const delForn=(id:number)=>up('fornecedores',f.fornecedores.filter((x:any)=>x.id!==id))
  const vals=f.fornecedores.map((x:any)=>Number(x.valor||0)).filter((v:number)=>v>0)
  const menorV=vals.length>0?Math.min(...vals):0
  function save(){if(!f.objeto.trim()){alert('Preencha o objeto.');return}
    const payload = { ...f, secretaria_id: Number(f.secretaria_id), ...(f.id ? { id: f.id } : {}) }
    onSave(payload)
  }
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Identificação */}
      <div style={{background:GB,border:`1.5px solid ${GD}`,borderRadius:12,padding:'12px 14px'}}>
        <p style={{fontSize:10,fontWeight:800,color:G,textTransform:'uppercase',marginBottom:10}}>Identificação</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <Fld label="Número"><input style={IS} value={f.numero} readOnly={!!initial} onFocus={oF} onBlur={oB} onChange={e=>up('numero',e.target.value)}/></Fld>
          <Fld label="Secretaria" req>
            <select style={IS} value={f.secretaria_id} onFocus={oF} onBlur={oB} onChange={e=>up('secretaria_id',e.target.value)}>
              {SECS.map((s:any)=><option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </Fld>
          <Fld label="Período">
            <select style={IS} value={f.periodo} onFocus={oF} onBlur={oB} onChange={e=>up('periodo',e.target.value)}>
              {MESES.map((m:string)=><option key={m} value={m}>{fmtM(m)}</option>)}
            </select>
          </Fld>
        </div>
      </div>
      {/* Objeto */}
      <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px'}}>
        <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:10}}>Objeto</p>
        <Fld label="Objeto / Descrição" req><input style={IS} value={f.objeto} placeholder="Ex: Paracetamol 500mg 1000 comprimidos" onFocus={oF} onBlur={oB} onChange={e=>up('objeto',e.target.value)}/></Fld>
        <div style={{marginTop:10}}><Fld label="Especificações Técnicas"><textarea style={{...IS,resize:'none'} as any} rows={3} value={f.descricao} placeholder="Quantidades, unidades, especificações..." onFocus={oF} onBlur={oB} onChange={e=>up('descricao',e.target.value)}/></Fld></div>
      </div>
      {/* Vínculo */}
      <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px'}}>
        <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',marginBottom:10}}>Vínculo e Controle</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <Fld label="Ofício de Referência">
            <select style={IS} value={f.oficio_ref} onFocus={oF} onBlur={oB} onChange={e=>up('oficio_ref',e.target.value)}>
              <option value="">Sem vínculo</option>
              {oficios.map((o:any)=><option key={o.id} value={o.numero}>{o.numero} — {o.assunto.slice(0,30)}</option>)}
            </select>
          </Fld>
          <Fld label="Prazo para Cotação"><input type="date" style={IS} value={f.prazo_cotacao} onFocus={oF} onBlur={oB} onChange={e=>up('prazo_cotacao',e.target.value)}/></Fld>
          <Fld label="Responsável"><input style={IS} value={f.responsavel} onFocus={oF} onBlur={oB} onChange={e=>up('responsavel',e.target.value)}/></Fld>
        </div>
      </div>
      {/* Fornecedores */}
      <div style={{border:'1px solid var(--brd)',borderRadius:12,padding:'12px 14px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontSize:10,fontWeight:800,color:'var(--muted)',textTransform:'uppercase'}}>Fornecedores e Cotações</p>
          <button onClick={addForn} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,color:G,background:GB,border:`1px solid ${GD}`,padding:'5px 10px',borderRadius:7,cursor:'pointer',fontFamily:'inherit'}}>
            <Ic n="plus" z={12} c={G}/>Adicionar
          </button>
        </div>
        {f.fornecedores.map((forn:any,idx:number)=>{
          const isMin=Number(forn.valor||0)===menorV&&menorV>0
          return(
            <div key={forn.id} style={{background:'var(--inp)',borderRadius:10,padding:'12px 13px',marginBottom:8,border:`1.5px solid ${isMin?'#86efac':'var(--brd)'}`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9}}>
                <p style={{fontSize:11,fontWeight:800,color:'var(--txt)'}}>
                  Fornecedor {idx+1}
                  {isMin&&<span style={{marginLeft:8,fontSize:9,background:G,color:'#fff',padding:'1px 7px',borderRadius:999}}>MENOR PREÇO</span>}
                </p>
                {f.fornecedores.length>1&&<IB icon="trash" color="#dc2626" onClick={()=>delForn(forn.id)} sm/>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:9,marginBottom:9}}>
                <Fld label="Razão Social"><input style={IS} value={forn.nome} placeholder="Nome do fornecedor" onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'nome',e.target.value)}/></Fld>
                <Fld label="CNPJ"><input style={IS} value={forn.cnpj} placeholder="00.000.000/0001-00" onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'cnpj',e.target.value)}/></Fld>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:9}}>
                <Fld label="E-mail"><input type="email" style={IS} value={forn.email||''} placeholder="contato@empresa.com.br" onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'email',e.target.value)}/></Fld>
                <Fld label="Telefone"><input style={IS} value={forn.telefone||''} placeholder="(00) 00000-0000" onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'telefone',e.target.value)}/></Fld>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:9,marginBottom:9}}>
                <Fld label="Obs. Rápida"><input style={IS} value={forn.obs} placeholder="Condições, prazo de entrega..." onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'obs',e.target.value)}/></Fld>
                <Fld label="Valor Cotado (R$)"><input style={{...IS,fontWeight:isMin?800:400,color:isMin?'#059669':'var(--txt)'} as any} type="number" step="0.01" value={forn.valor} placeholder="0,00" onFocus={oF} onBlur={oB} onChange={e=>upForn(forn.id,'valor',e.target.value)}/></Fld>
              </div>
              {/* Anexo orçamento */}
              <div style={{marginTop:10}}>
                <p style={{fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>📎 Orçamento / Proposta do Fornecedor</p>
                {(forn.arquivos||[]).map((arq:any,ai:number)=>(
                  <ARow key={arq.id||ai} a={arq} sm onDelete={async(id:string)=>{if(arq.caminho)await deleteArquivo(arq);upForn(forn.id,'arquivos',(forn.arquivos||[]).filter((_:any,j:number)=>j!==ai))}}/>
                ))}
                <label style={{display:'flex',alignItems:'center',gap:7,padding:'7px 12px',background:GB,border:`1.5px dashed ${GD}`,borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:700,color:G,width:'fit-content',opacity:uploadFornId===forn.id?.6:1}}>
                  <Ic n="ul" z={14} c={G}/>{uploadFornId===forn.id?'Enviando...':'Anexar orçamento'}
                  <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" style={{display:'none'}} disabled={uploadFornId===forn.id}
                    onChange={async e=>{
                      const files=Array.from(e.target.files as FileList);if(!files.length)return;
                      (e.target as any).value='';setUploadFornId(forn.id);
                      const supabase=(await import('@/lib/supabase/client')).createClient();
                      const{data:{user}}=await supabase.auth.getUser();
                      if(!user){alert('Login necessário para upload.');setUploadFornId(null);return;}
                      const{uploadArquivos}=await import('@/lib/storage');
                      const{successes,errors}=await uploadArquivos(files,{modulo:'pesquisas',vinculo:f.numero,secretaria_id:Number(f.secretaria_id),userId:user.id});
                      setUploadFornId(null);
                      if(errors.length)alert('Erro no upload:\n'+errors.join('\n'));
                      if(successes.length){const novos=successes.map(s=>({id:s.id,nome:s.nome,caminho:s.caminho,mime_type:s.mime_type,tamanho:s.tamanho,data:s.uploaded_at||''}));upForn(forn.id,'arquivos',[...(forn.arquivos||[]),...novos]);}
                    }}/>
                </label>
              </div>
            </div>
          )
        })}
        {menorV>0&&(
          <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
            <span style={{fontSize:11,fontWeight:700,color:'#065f46'}}>Menor Valor:</span>
            <span style={{fontSize:14,fontWeight:900,color:'#059669'}}>{fR(menorV)}</span>
          </div>
        )}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Status">
          <select style={IS} value={f.status} onFocus={oF} onBlur={oB} onChange={e=>up('status',e.target.value)}>
            {SPQ.map((s:any)=><option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </Fld>
        <Fld label="Observações Gerais"><input style={IS} value={f.obs} onFocus={oF} onBlur={oB} onChange={e=>up('obs',e.target.value)}/></Fld>
      </div>
      <div style={{display:'flex',gap:10}}>
        <PB onClick={save} full>{!initial?'Cadastrar Pesquisa':'Salvar Alterações'}</PB>
        <PB onClick={onClose} outline>Cancelar</PB>
      </div>
    </div>
  )
}

// ── PesquisaDetail ────────────────────────────────────────────────────────────
function PesquisaDetail({pq,onClose,onEdit}:any){
  const[tab,setTab]=useState('det')
  const sec=gS(pq.secretaria_id)
  const st=gT(SPQ,pq.status)
  const vals=pq.fornecedores.map((x:any)=>Number(x.valor||0)).filter((v:number)=>v>0)
  const menorV=vals.length>0?Math.min(...vals):0
  const TABS=[{id:'det',l:'Detalhes',n:'file'},{id:'cot',l:`Cotações (${pq.fornecedores.length})`,n:'coins'},{id:'doc',l:`Docs (${(pq.anexos||[]).length})`,n:'clip'}]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
        <SAv id={pq.secretaria_id} size={44}/>
        <div style={{flex:1}}>
          <span style={{fontFamily:'monospace',fontWeight:900,color:G,fontSize:12}}>{pq.numero}</span>
          <p style={{fontSize:14,fontWeight:800,color:'var(--txt)',lineHeight:1.3}}>{pq.objeto}</p>
          <p style={{fontSize:11,color:'var(--muted)'}}>{sec.nome}</p>
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        <span style={{color:st.bg,background:st.cor,border:`1px solid ${st.cor}`,padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:700}}>{st.l}</span>
        {menorV>0&&<span style={{color:'#059669',background:'#f0fdf4',border:'1px solid #86efac',padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:700}}>Menor: {fR(menorV)}</span>}
        {pq.oficio_ref&&<span style={{color:'#0F1E3A',background:'#e8eef7',border:'1px solid #bfdbfe',padding:'3px 9px',borderRadius:999,fontSize:10,fontWeight:700}}>Ref: {pq.oficio_ref}</span>}
      </div>
      <div style={{display:'flex',borderBottom:'1px solid var(--brd)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 4px',fontSize:10,fontWeight:700,border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',color:tab===t.id?G:'var(--muted)',borderBottom:tab===t.id?`2px solid ${G}`:'2px solid transparent',marginBottom:-1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <Ic n={t.n} z={13} c={tab===t.id?G:undefined}/>{t.l}
          </button>
        ))}
      </div>
      {tab==='det'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
          {[['Período',fmtM(pq.periodo)],['Prazo Cotação',fD(pq.prazo_cotacao)],['Responsável',pq.responsavel||'--'],['Fornecedores',String(pq.fornecedores.length)],['Especificações',pq.descricao||'--'],['Obs',pq.obs||'--']].map(([k,v])=>(
            <div key={k} style={{background:'var(--inp)',borderRadius:9,padding:'9px 11px',gridColumn:['Especificações','Obs'].includes(k)?'1/-1':undefined}}>
              <p style={{fontSize:9,color:'var(--muted)',fontWeight:800,textTransform:'uppercase',marginBottom:3}}>{k}</p>
              <p style={{fontSize:12,fontWeight:700,color:'var(--txt)'}}>{v}</p>
            </div>
          ))}
        </div>
      )}
      {tab==='cot'&&(
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {pq.fornecedores.map((forn:any,i:number)=>{
            const isMin=Number(forn.valor||0)===menorV&&menorV>0
            return(
              <div key={forn.id||i} style={{background:'var(--inp)',borderRadius:11,padding:'12px 14px',border:`1.5px solid ${isMin?'#86efac':'var(--brd)'}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <p style={{fontSize:12,fontWeight:800,color:'var(--txt)'}}>{forn.nome||`Fornecedor ${i+1}`}</p>
                  {isMin&&<span style={{fontSize:9,background:G,color:'#fff',padding:'2px 8px',borderRadius:999,fontWeight:700}}>MENOR PREÇO</span>}
                  {forn.valor&&<span style={{fontSize:15,fontWeight:900,color:isMin?'#059669':'#0F1E3A',marginLeft:'auto'}}>{fR(forn.valor)}</span>}
                </div>
                {forn.cnpj&&<p style={{fontSize:10,color:'var(--muted)',marginBottom:4}}>CNPJ: {forn.cnpj}</p>}
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  {forn.email&&<p style={{fontSize:10,color:'var(--muted)'}}>✉ {forn.email}</p>}
                  {forn.telefone&&<p style={{fontSize:10,color:'var(--muted)'}}>📞 {forn.telefone}</p>}
                </div>
                {forn.obs&&<p style={{fontSize:11,color:'var(--txt)',marginTop:6,fontStyle:'italic'}}>"{forn.obs}"</p>}
                {(forn.arquivos||[]).length>0&&(
                  <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--brd)'}}>
                    {(forn.arquivos||[]).map((arq:any,ai:number)=>(
                      <div key={ai} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:9,fontWeight:900,color:'#dc2626',background:'#dc262618',padding:'2px 6px',borderRadius:5}}>{(arq.nome||'').split('.').pop().toUpperCase()}</span>
                        <span style={{fontSize:11,color:'var(--txt)',flex:1}}>{arq.nome}</span>
                        {(arq.caminho||arq.dataUrl)&&<button onClick={async()=>{const url=arq.caminho?(await getSignedUrl(arq.caminho)):arq.dataUrl;if(url)window.open(url,'_blank')}} style={{fontSize:9,padding:'2px 8px',background:NAVY,color:'#fff',border:'none',borderRadius:5,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>Ver</button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {tab==='doc'&&(
        <div>
          {(pq.anexos||[]).length===0&&<p style={{fontSize:12,color:'var(--muted)',textAlign:'center',padding:24}}>Nenhum documento.</p>}
          {(pq.anexos||[]).map((a:any)=>(
            <ARow key={a.id} a={a}/>
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:10,paddingTop:4}}>
        <PB onClick={()=>onEdit(pq)} full><Ic n="edit" z={14}/>Editar</PB>
        <PB onClick={onClose} outline>Fechar</PB>
      </div>
    </div>
  )
}

// ── PesquisasPage ─────────────────────────────────────────────────────────────
export default function PesquisasPage({pesquisas,oficios,savePesquisa,deletePesquisa,toast}:any){
  const[modal,setModal]=useState<any>(null)
  const[sel,setSel]=useState<any>(null)
  const[q,setQ]=useState('')
  const[fSec,setFSec]=useState('')
  const[fSt,setFSt]=useState('')
  const filtered=pesquisas.filter((p:any)=>{
    const sq=q.toLowerCase()
    return(!q||p.numero.toLowerCase().includes(sq)||p.objeto.toLowerCase().includes(sq))&&(!fSec||p.secretaria_id===Number(fSec))&&(!fSt||p.status===fSt)
  })
  function save(data:any){savePesquisa(data,modal==='new');toast(modal==='new'?'Cadastrado!':'Atualizado!','success');setModal(null);setSel(null)}
  function del(id:string){if(!confirm('Excluir pesquisa?'))return;deletePesquisa(id);toast('Excluído.','info')}
  const th:React.CSSProperties={padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}
  const totals=[['Total',pesquisas.length,'#1a5c38'],['Aguardando',pesquisas.filter((p:any)=>p.status==='aguardando').length,'#4a6155'],['Em Andamento',pesquisas.filter((p:any)=>p.status==='andamento').length,'#a07800'],['Concluídas',pesquisas.filter((p:any)=>p.status==='concluida').length,'#1a5c38']]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {totals.map(([l,v,c])=>(
          <div key={String(l)} style={{background:'var(--card)',borderRadius:12,padding:'14px 16px',border:'1px solid var(--brd)',textAlign:'center',boxShadow:'0 1px 8px rgba(0,0,0,.05)'}}>
            <p style={{fontSize:22,fontWeight:900,color:String(c),lineHeight:1}}>{v}</p>
            <p style={{fontSize:10,color:'var(--muted)',fontWeight:600,marginTop:4}}>{l}</p>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,position:'relative'}}>
          <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}><Ic n="search" z={15}/></div>
          <input style={{...IS,paddingLeft:35}} placeholder="Buscar objeto..." value={q} onChange={e=>setQ(e.target.value)} onFocus={oF} onBlur={oB}/>
        </div>
        <select style={{...IS,width:140,fontSize:12,padding:'9px 10px'}} value={fSec} onChange={e=>setFSec(e.target.value)}>
          <option value="">Secretarias</option>{SECS.map((s:any)=><option key={s.id} value={s.id}>{s.sigla}</option>)}
        </select>
        <select style={{...IS,width:140,fontSize:12,padding:'9px 10px'}} value={fSt} onChange={e=>setFSt(e.target.value)}>
          <option value="">Status</option>{SPQ.map((s:any)=><option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <button onClick={()=>{setSel(null);setModal('new')}} style={{display:'flex',alignItems:'center',gap:7,background:G,color:'#fff',fontWeight:800,padding:'9px 15px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',whiteSpace:'nowrap'}}>
          <Ic n="plus" z={15} c="#fff"/>Nova Pesquisa
        </button>
      </div>
      {/* Table */}
      <Card style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
                {['Número','Secretaria','Objeto','Período','Fornecedores','Menor Valor','Status','Ações'].map(h=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8} style={{padding:'40px 14px',textAlign:'center',color:'var(--muted)',fontSize:13}}>Nenhuma pesquisa.</td></tr>}
              {filtered.map((p:any)=>{
                const st=gT(SPQ,p.status)
                const vals=p.fornecedores.map((x:any)=>Number(x.valor||0)).filter((v:number)=>v>0)
                const menor=vals.length>0?Math.min(...vals):0
                return(
                  <tr key={p.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontWeight:800,color:G,fontSize:11,whiteSpace:'nowrap'}}>{p.numero}</td>
                    <td style={{padding:'10px 14px'}}><SAv id={p.secretaria_id} size={24}/></td>
                    <td style={{padding:'10px 14px',maxWidth:200}}><p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600,color:'var(--txt)'}}>{p.objeto}</p></td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{fmtM(p.periodo)}</td>
                    <td style={{padding:'10px 14px',textAlign:'center',fontWeight:700,color:'var(--txt)'}}>{p.fornecedores.length}</td>
                    <td style={{padding:'10px 14px',fontWeight:800,color:menor>0?'#059669':'var(--muted)',whiteSpace:'nowrap'}}>{menor>0?fR(menor):'--'}</td>
                    <td style={{padding:'10px 14px',whiteSpace:'nowrap'}}><span style={{color:st.bg,background:st.cor,border:`1px solid ${st.cor}`,padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:700,display:'inline-block'}}>{st.l}</span></td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:3}}>
                        <IB icon="eye" color={G} title="Ver" onClick={()=>{setSel(p);setModal('view')}} sm/>
                        <IB icon="edit" color="#d97706" title="Editar" onClick={()=>{setSel(p);setModal('edit')}} sm/>
                        <IB icon="trash" color="#dc2626" title="Excluir" onClick={()=>del(p.id)} sm/>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {modal==='new'&&<Modal title="Nova Pesquisa de Preço" onClose={()=>setModal(null)} wide><PesquisaForm pesquisas={pesquisas} oficios={oficios} onSave={save} onClose={()=>setModal(null)}/></Modal>}
      {modal==='view'&&sel&&<Modal title={`Pesquisa ${sel.numero}`} onClose={()=>setModal(null)} wide><PesquisaDetail pq={sel} onClose={()=>setModal(null)} onEdit={(p:any)=>{setModal('edit');setSel(p)}}/></Modal>}
      {modal==='edit'&&sel&&<Modal title="Editar Pesquisa" onClose={()=>setModal(null)} wide><PesquisaForm initial={sel} pesquisas={pesquisas} oficios={oficios} onSave={save} onClose={()=>setModal(null)}/></Modal>}
    </div>
  )
}
