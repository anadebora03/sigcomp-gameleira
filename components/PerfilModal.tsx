'use client'
import { useState, useRef, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import UserAvatar from '@/components/ui/UserAvatar'
import { Ic, PB, Fld, IS, oF, oB } from '@/components/ui/atoms'
import { validarFoto, prepararFoto, nomeExibicao, type AcaoFoto } from '@/services/perfil'
import type { PerfilCtx } from '@/hooks/usePerfil'

export default function PerfilModal({ ctx, email, onClose, onSaved }: { ctx: PerfilCtx; email?: string; onClose: () => void; onSaved: () => void }) {
  const p = ctx.perfil
  const [f, sf] = useState({ nome: nomeExibicao(p), cargo: p?.cargo || '', telefone: p?.telefone || '', secretaria: p?.secretaria || '' })
  const [foto, setFoto] = useState<AcaoFoto>({ acao: 'manter' })
  const [previa, setPrevia] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const up = (k: keyof typeof f, v: string) => sf(prev => ({ ...prev, [k]: v }))

  // Libera a URL temporária da prévia
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])

  async function escolher(file?: File) {
    if (!file) return
    setErro('')
    const msg = validarFoto(file)
    if (msg) { setErro(msg); return }
    try {
      const imagem = await prepararFoto(file)
      setFoto({ acao: 'trocar', imagem })
      setPrevia(URL.createObjectURL(imagem))
    } catch {
      setErro('Não foi possível ler essa imagem. Tente outra.')
    }
  }

  function remover() {
    setErro('')
    setPrevia(null)
    setFoto(p?.avatar_path ? { acao: 'remover' } : { acao: 'manter' })
  }

  async function salvar() {
    if (!f.nome.trim()) { setErro('Informe o seu nome.'); return }
    setErro(''); setSalvando(true)
    const r = await ctx.salvar(f, foto)
    setSalvando(false)
    if (!r.success) { setErro(r.error || 'Não foi possível salvar.'); return }
    onSaved()
  }

  const urlMostrada = foto.acao === 'trocar' ? previa : foto.acao === 'remover' ? null : ctx.fotoUrl
  const temFoto = !!urlMostrada
  const linkBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, padding: '4px 8px', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 5 }

  return (
    <Modal title="Meu Perfil" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <UserAvatar url={urlMostrada} nome={f.nome} size={96}/>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => ref.current?.click()} style={{ ...linkBtn, color: '#1a5c38' }}><Ic n="cam" z={14} c="#1a5c38"/>{temFoto ? 'Alterar foto' : 'Adicionar foto'}</button>
            {temFoto && <button onClick={remover} style={{ ...linkBtn, color: '#dc2626' }}><Ic n="trash" z={14} c="#dc2626"/>Remover foto</button>}
          </div>
          {foto.acao !== 'manter' && <p style={{ fontSize: 10, color: 'var(--muted)' }}>A foto só muda depois de salvar.</p>}
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => { escolher(e.target.files?.[0]); e.target.value = '' }}/>
        </div>
        <Fld label="Nome completo" req><input style={IS} value={f.nome} placeholder="Como você quer ser chamado(a)" onFocus={oF} onBlur={oB} onChange={e => up('nome', e.target.value)}/></Fld>
        <Fld label="Função / Cargo"><input style={IS} value={f.cargo} placeholder="Ex.: Diretor do Setor de Compras" onFocus={oF} onBlur={oB} onChange={e => up('cargo', e.target.value)}/></Fld>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Fld label="Telefone"><input style={IS} type="tel" value={f.telefone} placeholder="(81) 90000-0000" onFocus={oF} onBlur={oB} onChange={e => up('telefone', e.target.value)}/></Fld>
          <Fld label="Secretaria / Setor"><input style={IS} value={f.secretaria} placeholder="Ex.: Setor de Compras" onFocus={oF} onBlur={oB} onChange={e => up('secretaria', e.target.value)}/></Fld>
        </div>
        <Fld label="E-mail (login)"><div style={{ ...IS, color: 'var(--muted)', cursor: 'default' }}>{email || '--'}</div></Fld>
        {erro && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n="alert" z={15} c="#dc2626"/><p style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>{erro}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <PB onClick={onClose} outline>Cancelar</PB>
          <PB onClick={salvar} full disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</PB>
        </div>
      </div>
    </Modal>
  )
}
