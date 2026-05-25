'use client'
import {useState,useRef} from 'react'
import {Ic,IB,PB,Card,Fld,IS,oF,oB,G,NAVY} from '@/components/ui/atoms'
import Modal from '@/components/ui/Modal'
import {PERF,PCOR} from '@/lib/constants'
import {uid} from '@/utils/helpers'

function UFrm({ini,onSave,onClose}:any){
  const[f,sf]=useState(ini||{nome:'',cargo:'',email:'',perfil:'setor_compras',ativo:true,avatar:'',senha:'',senha2:''})
  const up=(k:string,v:any)=>sf((p:any)=>({...p,[k]:v}))
  const ref=useRef<HTMLInputElement>(null)
  function pickAv(e:any){const fl=e.target.files[0];if(!fl)return;const r=new FileReader();r.onload=ev=>up('avatar',(ev.target as any).result);r.readAsDataURL(fl)}
  function sv(){
    if(!f.nome.trim()||!f.email.trim()){alert('Preencha nome e email.');return}
    if(!ini&&(!f.senha||f.senha.length<6)){alert('Senha provisória precisa ter no mínimo 6 caracteres.');return}
    if(!ini&&f.senha!==f.senha2){alert('As senhas não conferem.');return}
    onSave({...f,id:f.id||uid()})
  }
  const ini2=f.nome?f.nome.split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase():'?'
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
      <Fld label="Perfil">
        <select style={IS} value={f.perfil} onFocus={oF} onBlur={oB} onChange={e=>up('perfil',e.target.value)}>
          {Object.entries(PERF).map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
      </Fld>
      {!ini&&(
        <div style={{background:'#fffbeb',border:'1.5px solid #fde68a',borderRadius:12,padding:'12px 14px'}}>
          <p style={{fontSize:10,fontWeight:800,color:'#b45309',textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:7}}>
            <Ic n="lock" z={13} c="#b45309"/>Senha Provisória
          </p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Fld label="Senha Provisória" req><input type="password" style={IS} value={f.senha} placeholder="Mínimo 6 caracteres" onFocus={oF} onBlur={oB} onChange={e=>up('senha',e.target.value)}/></Fld>
            <Fld label="Confirmar Senha" req><input type="password" style={IS} value={f.senha2} placeholder="Repita a senha" onFocus={oF} onBlur={oB} onChange={e=>up('senha2',e.target.value)}/></Fld>
          </div>
          <p style={{fontSize:10,color:'#92400e',marginTop:8}}>O funcionário deverá alterar a senha no primeiro acesso.</p>
        </div>
      )}
      <div style={{display:'flex',gap:10}}><PB onClick={sv} full>{!ini?'Criar':'Salvar'}</PB><PB onClick={onClose} outline>Cancelar</PB></div>
    </div>
  )
}

export default function UsuariosPage({usuarios,saveUsuario,deleteUsuario,toast}:any){
  const[modal,setModal]=useState<any>(null)
  const[sel,setSel]=useState<any>(null)
  function save(data:any){saveUsuario(data,modal==='new');toast(modal==='new'?'Criado!':'Atualizado!','success');setModal(null);setSel(null)}
  function del(id:number){if(!confirm('Excluir usuário?'))return;deleteUsuario(id);toast('Excluído.','info')}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
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
                  <td style={{padding:'10px 14px'}}><span style={{color:'#d1fae5',background:G,border:`1px solid ${G}`,padding:'2px 9px',borderRadius:999,fontSize:9,fontWeight:700}}>{(PERF as any)[u.perfil]}</span></td>
                  <td style={{padding:'10px 14px'}}><span style={{color:u.ativo?'#059669':'#64748b',background:u.ativo?'#f0fdf4':'#f8fafc',border:`1px solid ${u.ativo?'#059669':'#64748b'}33`,padding:'2px 9px',borderRadius:999,fontSize:9,fontWeight:700}}>{u.ativo?'Ativo':'Inativo'}</span></td>
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
