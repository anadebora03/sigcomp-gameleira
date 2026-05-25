'use client'
import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { G } from '@/lib/constants'

export default function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); onFiles(Array.from(e.dataTransfer.files)) }}
      onClick={() => ref.current?.click()}
      style={{
        border: `2px dashed ${drag ? G : 'var(--brd)'}`,
        borderRadius:12, padding:'22px 16px', textAlign:'center',
        background: drag ? '#f0f7f3' : 'var(--inp)', cursor:'pointer',
      }}
    >
      <Upload size={22} color={drag ? G : 'var(--muted)'} style={{ margin:'0 auto 8px' }} />
      <p style={{ fontSize:13, fontWeight:700, color: drag ? G : 'var(--muted)' }}>
        Arraste arquivos ou clique para selecionar
      </p>
      <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
        PDF, Word, Excel, Imagens, ZIP
      </p>
      <input ref={ref} type="file" multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
        style={{ display:'none' }}
        onChange={e => onFiles(Array.from(e.target.files || []))}
      />
    </div>
  )
}
