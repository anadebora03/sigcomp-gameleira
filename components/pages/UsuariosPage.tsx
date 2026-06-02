'use client'
import { useState, useRef } from 'react'
import { Ic, IB, PB, Card, Fld, IS, oF, oB, G, NAVY } from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import PermissoesSelector from '@/components/PermissoesSelector'
import { PERF, PCOR, PERFIS_PERMISSOES, USER_STATUS } from '@/lib/constants'
import { uid } from '@/utils/helpers'
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers'

function UFrm({ini,onSave,onClose}:any){
  const[f,sf]=useState(ini||{nome:'',cargo:'',email:'',perfil:'setor_compras',ativo:true,avatar:'',status:'convite_enviado',permissoes:{...(PERFIS_PERMISSOES.setor_compras||{})}})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  const ref=useRef<HTMLInputElement>(null)
  function pickAv(e:any){const fl=e.target.files[0];if(!fl)return;const r=new FileReader();r.onload=ev=>up('avatar',(ev.target as any).result);r.readAsDataURL(fl)}
  function sv(){
    if(!f.nome.trim()||!f.email.trim()){alert('Preencha nome e email.');return}
    onSave(f)
  }
  const ini2=f.nome?f.nome.split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase():'?'
  const [expandPerms, setExpandPerms] = useState(false)
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <div style={{position:'relative',cursor:'pointer'}} onClick={()=>ref.current?.click()}>
          <div style={{width:64,height:64,borderRadius:14,background:f.avatar?'transparent':G,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',border:'2px dashed #c3ddd0'}}>
            {f.avatar?<img src={f.avatar} alt="av" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:20,fontWeight:900,color:'#fff'}}>{ini2}</span>}
          </div>
        </div>
        <p style={{fontSize:11,color:'var(--muted)'}}>Clique para foto</p>
        <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={pickAv}/>
      </div>
      <Fld label="Nome Completo" req><input style={IS} value={f.nome} onFocus={oF} onBlur={oB} onChange={e=>up('nome',e.target.value)}/></Fld>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Cargo"><input style={IS} value={f.cargo} onFocus={oF} onBlur={oB} onChange={e=>up('cargo',e.target.value)}/></Fld>
        <Fld label="Email" req><input type="email" style={IS} value={f.email} readOnly={!!ini} onFocus={oF} onBlur={oB} onChange={e=>up('email',e.target.value)}/></Fld>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Fld label="Perfil">
          <select style={IS} value={f.perfil} onFocus={oF} onBlur={oB} onChange={e=>{up('perfil',e.target.value);up('permissoes',(PERFIS_PERMISSOES as any)[e.target.value]||{})}}>
            {Object.entries(PERF).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </Fld>
        {ini&&<Fld label="Status">
          <select style={IS} value={f.status||'ativo'} onFocus={oF} onBlur={oB} onChange={e=>up('status',e.target.value)}>
            <option value="convite_enviado">Convite enviado</option>
            <option value="aguardando_ativacao">Aguardando ativação</option>
            <option value="ativo">Ativo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </Fld>}
      </div>
      <button onClick={()=>setExpandPerms(!expandPerms)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'#f0f4f8',border:'1px solid #d4dce6',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700,color:NAVY,fontFamily:'inherit',transition:'all .2s'}} onMouseEnter={e=>(e.currentTarget.style.background='#e2e8f0')} onMouseLeave={e=>(e.currentTarget.style.background='#f0f4f8')}>
        <span style={{display:'flex',alignItems:'center',gap:8}}>Permissões do Usuário</span>
        <span style={{transform:expandPerms?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s'}}>▼</span>
      </button>
      {expandPerms&&(
        <div style={{background:'#fafaf9',border:'1px solid var(--brd)',borderRadius:10,padding:'14px',maxHeight:'400px',overflowY:'auto'}}>
          <PermissoesSelector permissoes={f.permissoes||{}} onChange={p=>up('permissoes',p)} perfil={f.perfil} onPerfilChange={perf=>up('perfil',perf)}/>
        </div>
      )}
      <div style={{display:'flex',gap:10}}><PB onClick={sv} full>{!ini?'Criar e Enviar Convite':'Salvar'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

export default function UsuariosPage({ toast }: any){
  const { usuarios, loading, error, createUser, editUser, deleteUser } = useSupabaseUsers()
  const [modal, setModal] = useState<any>(null)
  const [sel, setSel] = useState<any>(null)

  async function save(data:any) {
    if (!data.id) {
      const result = await createUser(data)
      if (result.success) {
        toast('Convite enviado com sucesso','success')
        setModal(null)
        setSel(null)
      } else {
        toast(result.error || 'Erro ao enviar convite','error')
      }
      return
    }

    const result = await editUser(data.id, {
      nome: data.nome,
      cargo: data.cargo,
      perfil: data.perfil,
      status: data.status,
    })
    if (result.success) {
      toast('Atualizado!','success')
      setModal(null)
      setSel(null)
    } else {
      toast(result.error || 'Erro ao atualizar usuário','error')
    }
  }

  async function del(id:string){
    if (!confirm('Excluir usuário?')) return
    const result = await deleteUser(id)
    if (result.success) {
      toast('Excluído.','info')
    } else {
      toast(result.error || 'Erro ao excluir usuário','error')
    }
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {loading && <p style={{color: NAVY, fontWeight:700}}>Carregando usuários...</p>}
      {error && <p style={{color: '#dc2626', fontWeight:700}}>Erro: {error}</p>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <p style={{fontSize:13,fontWeight:700,color:'var(--muted)'}}>{usuarios.length} usuário(s)</p>
        <button onClick={()=>{setSel(null);setModal('new')}} style={{display:'flex',alignItems:'center',gap:7,background:G,color:'#fff',fontWeight:800,padding:'9px 15px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>
          <Ic n="plus" z={15} c="#fff"/>Novo Usuário
        </button>
      </div>
      <Card style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{borderBottom:'1.5px solid var(--brd)',background:'var(--inp)'}}>
              {['Usuário','Email','Perfil','Status','Ações'].map(h=>(
                <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:9,fontWeight:800,color:'var(--muted)',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u:any)=>{
              const pc=(PCOR as any)[u.perfil]||'#64748b'
              const st=(USER_STATUS as any)[u.status||'ativo']||USER_STATUS.ativo
              return(
                <tr key={u.id} style={{borderBottom:'1px solid var(--brd)',transition:'background .1s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--hov)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      {u.avatar
                        ?<img src={u.avatar} alt={u.nome} style={{width:32,height:32,borderRadius:9,objectFit:'cover',flexShrink:0}}/>
                        :<div style={{width:32,height:32,borderRadius:9,background:'#e8f5ec',display:'flex',alignItems:'center',justifyContent:'center',color:G,fontWeight:900,fontSize:13,flexShrink:0}}>{u.nome.charAt(0)}</div>
                      }
                      <div>
                        <p style={{fontWeight:700,color:'var(--txt)',fontSize:13}}>{u.nome}</p>
                        {u.cargo&&<p style={{fontSize:9,color:'var(--muted)'}}>{u.cargo}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'10px 14px',fontSize:11,color:'var(--muted)'}}>{u.email}</td>
                  <td style={{padding:'10px 14px'}}><span style={{color:'#fff',background:pc,border:`1px solid ${pc}`,padding:'2px 9px',borderRadius:999,fontSize:9,fontWeight:700}}>{(PERF as any)[u.perfil]}</span></td>
                  <td style={{padding:'10px 14px'}}><span style={{color:st.cor,background:st.bg,border:`1px solid ${st.cor}33`,padding:'2px 9px',borderRadius:999,fontSize:9,fontWeight:700}}>{st.label}</span></td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',gap:3}}>
                      <IB icon="edit" color="#d97706" onClick={()=>{setSel(u);setModal('edit')}} sm/>
                      {u.id!==1&&<IB icon="trash" color="#dc2626" onClick={()=>del(u.id)} sm/>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
      {(modal==='new'||modal==='edit')&&(
        <Modal title={modal==='new'?'Novo Usuário':'Editar Usuário'} onClose={()=>setModal(null)}>
          <UFrm ini={modal==='edit'?sel:null} onSave={save} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  )
}
