'use client'
/**
 * ARow — linha de arquivo anexado.
 * Suporta tanto arquivos no Supabase Storage (caminho) quanto base64 legacy (dataUrl).
 * Gera URL assinada on-demand ao clicar em Visualizar/Baixar.
 */
import { useState } from 'react'
import { Ic, IB, G } from './atoms'
import { getSignedUrl, downloadBlobFromUrl } from '@/lib/storage'
import { fKB, fD } from '@/utils/formatters'
import type { Arquivo } from '@/lib/types'

interface Props {
  a: Arquivo
  onDelete?: (id: string) => void
  sm?: boolean
}

export default function ARow({ a, onDelete, sm }: Props) {
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Determine file type badge
  const ext = (a.nome || '').split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = { pdf:'PDF', doc:'DOC', docx:'DOC', xls:'XLS', xlsx:'XLS', jpg:'IMG', jpeg:'IMG', png:'IMG', gif:'IMG', zip:'ZIP' }
  const colorMap: Record<string, string> = { PDF:'#dc2626', DOC:'#2563eb', XLS:'#059669', IMG:'#6d28d9', ZIP:'#d97706', ARQ:'#64748b' }
  const t = typeMap[ext] || 'ARQ'
  const cor = colorMap[t]

  async function resolveUrl(): Promise<string | null> {
    // Already have a signed URL cached
    if (a.signedUrl) return a.signedUrl
    // Legacy base64
    if (a.dataUrl) return a.dataUrl
    // No path — can't resolve
    if (!a.caminho) {
      setErro('Arquivo sem referência de caminho.')
      return null
    }
    setLoadingUrl(true)
    setErro('')
    const url = await getSignedUrl(a.caminho)
    setLoadingUrl(false)
    if (!url) {
      setErro('Não foi possível gerar URL do arquivo. Tente novamente.')
      return null
    }
    // Cache on the object (transient)
    a.signedUrl = url
    return url
  }

  async function handleView() {
    const url = await resolveUrl()
    if (!url) return
    window.open(url, '_blank')
  }

  async function handleDownload() {
    const url = await resolveUrl()
    if (!url) return
    setDownloadLoading(true)
    setErro('')
    
    if (url.startsWith('http')) {
      // Supabase signed URL — buscar como blob e forçar download
      const result = await downloadBlobFromUrl(url, a.nome)
      if (!result.ok) {
        setErro(result.error || 'Erro ao fazer download')
      }
    } else {
      // base64 legacy — download simples
      const link = document.createElement('a')
      link.href = url
      link.download = a.nome
      link.click()
    }
    setDownloadLoading(false)
  }

  const z = sm ? 28 : 34
  const pad = sm ? '7px 10px' : '10px 12px'

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:pad, background:'var(--inp)', borderRadius:10, marginBottom:6, border:'1px solid var(--brd)' }}>
      {/* Type badge */}
      <div style={{ width:z, height:z, borderRadius:sm?7:8, background:`${cor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontSize:sm?8:9, fontWeight:900, color:cor }}>{t}</span>
      </div>

      {/* File info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:sm?11:12, fontWeight:700, color:'var(--txt)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.nome}</p>
        <p style={{ fontSize:9, color:'var(--muted)' }}>
          {fKB(a.tamanho)} · {fD(a.data || a.uploaded_at)}
          {a.caminho && <span style={{ marginLeft:6, color:'#059669', fontSize:9 }}>✓ Supabase</span>}
        </p>
        {erro && <p style={{ fontSize:9, color:'#dc2626', marginTop:2, fontWeight:600 }}>{erro}</p>}
      </div>

      {/* Actions */}
      <button onClick={handleView}
        disabled={loadingUrl}
        style={{ display:'flex', alignItems:'center', gap:4, padding:sm?'4px 8px':'5px 10px', background:'#0F1E3A', color:'#fff', border:'none', borderRadius:7, cursor:loadingUrl?'not-allowed':'pointer', fontFamily:'inherit', fontSize:sm?9:10, fontWeight:700, flexShrink:0, whiteSpace:'nowrap', opacity:loadingUrl?0.6:1 }}>
        <Ic n="eye" z={sm?10:11} c="#fff"/>Ver
      </button>
      <button onClick={handleDownload}
        disabled={downloadLoading}
        style={{ display:'flex', alignItems:'center', gap:4, padding:sm?'4px 8px':'5px 10px', background:'#059669', color:'#fff', border:'none', borderRadius:7, cursor:downloadLoading?'not-allowed':'pointer', fontFamily:'inherit', fontSize:sm?9:10, fontWeight:700, flexShrink:0, whiteSpace:'nowrap', opacity:downloadLoading?0.6:1 }}>
        <Ic n="dl" z={sm?10:11} c="#fff"/>{downloadLoading?'...':'Baixar'}
      </button>

      {onDelete && (
        <IB icon="trash" color="#dc2626" onClick={() => onDelete(a.id)} sm/>
      )}
    </div>
  )
}
