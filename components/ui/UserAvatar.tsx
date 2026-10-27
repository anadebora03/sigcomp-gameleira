'use client'
import { useState, useEffect } from 'react'
import { Ic } from './atoms'

/** Avatar circular: FOTO > INICIAL DO NOME > ícone neutro. Nunca usa o e-mail. */
export default function UserAvatar({ url, nome, size = 34 }: { url?: string | null; nome?: string; size?: number }) {
  const [falhou, setFalhou] = useState(false)
  useEffect(() => { setFalhou(false) }, [url])
  const inicial = (nome || '').trim().charAt(0).toLocaleUpperCase('pt-BR')
  const base: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5ec', color: '#1a5c38', fontWeight: 900, fontSize: Math.round(size * 0.42) }

  if (url && !falhou) {
    return <div style={base}><img src={url} alt={nome || 'Foto do perfil'} onError={() => setFalhou(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>
  }
  return <div style={base}>{inicial || <Ic n="person" z={Math.round(size * 0.5)} c="#1a5c38"/>}</div>
}
