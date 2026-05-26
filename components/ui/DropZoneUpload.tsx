'use client'
/**
 * DropZoneUpload — DropZone integrado com Supabase Storage.
 * Substitui o DropZone simples nas páginas que precisam de upload real.
 */
import { useState, useRef } from 'react'
import { Ic, G } from './atoms'

interface Props {
  onFiles: (files: File[]) => void
  uploading?: boolean
  erros?: string[]
  accept?: string
  label?: string
  sublabel?: string
}

export default function DropZoneUpload({ onFiles, uploading, erros, accept, label, sublabel }: Props) {
  const [drag, setDrag] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); if (!uploading) setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (!uploading) onFiles(Array.from(e.dataTransfer.files)) }}
        onClick={() => { if (!uploading) ref.current?.click() }}
        style={{
          border: `2px dashed ${drag ? G : erros?.length ? '#dc2626' : 'var(--brd)'}`,
          borderRadius: 12, padding: '22px 16px', textAlign: 'center',
          background: uploading ? '#f0f7f3' : drag ? '#f0f7f3' : 'var(--inp)',
          cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all .2s',
          opacity: uploading ? .7 : 1,
        }}>
        {uploading ? (
          <>
            <div style={{ width:24, height:24, border:`2px solid ${G}`, borderTopColor:'transparent', borderRadius:'50%', margin:'0 auto 10px', animation:'spin 1s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize:13, fontWeight:700, color:G }}>Enviando para o Supabase...</p>
          </>
        ) : (
          <>
            <Ic n="ul" z={22} c={drag ? G : 'var(--muted)'} sx={{ margin:'0 auto 8px' }}/>
            <p style={{ fontSize:13, fontWeight:700, color: drag ? G : 'var(--muted)' }}>
              {label || 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
              {sublabel || 'PDF, Word, Excel, Imagens, ZIP · Máx. 50MB'}
            </p>
          </>
        )}
        <input ref={ref} type="file" multiple
          accept={accept || '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip'}
          style={{ display:'none' }}
          onChange={e => { onFiles(Array.from(e.target.files || [])); (e.target as any).value = '' }}
          disabled={uploading}
        />
      </div>

      {/* Erros */}
      {erros && erros.length > 0 && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:10, padding:'10px 14px', marginTop:10 }}>
          <p style={{ fontSize:11, fontWeight:800, color:'#dc2626', marginBottom:4, display:'flex', alignItems:'center', gap:7 }}>
            <Ic n="alert" z={14} c="#dc2626"/>Erro(s) no upload:
          </p>
          {erros.map((e, i) => (
            <p key={i} style={{ fontSize:11, color:'#991b1b', marginTop:2 }}>• {e}</p>
          ))}
        </div>
      )}
    </div>
  )
}
