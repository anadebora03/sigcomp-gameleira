'use client'
/**
 * useUpload — hook para upload de arquivos para Supabase Storage.
 * Retorna uploadFiles() que encapsula toda a lógica de upload, erro e feedback.
 */
import { useState } from 'react'
import { uploadArquivos } from '@/lib/storage'
import { useAuth } from '@/hooks/useAuth'
import type { Arquivo } from '@/lib/types'

interface UploadOpts {
  modulo: 'oficios' | 'processos' | 'pesquisas' | 'contratos'
  vinculo: string       // numero do oficio/processo (ex: OFF-2025-0001)
  secretaria_id: number
  onSuccess?: (arquivos: Arquivo[]) => void
  onError?: (erros: string[]) => void
}

export function useUpload(opts: UploadOpts) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [erros, setErros] = useState<string[]>([])

  async function uploadFiles(files: File[]): Promise<Arquivo[]> {
    if (!files.length) return []
    if (!user) {
      const err = ['Você precisa estar logado para enviar arquivos.']
      setErros(err)
      opts.onError?.(err)
      return []
    }

    setUploading(true)
    setErros([])

    const { successes, errors } = await uploadArquivos(files, {
      modulo: opts.modulo,
      vinculo: opts.vinculo,
      secretaria_id: opts.secretaria_id,
      userId: user.id,
    })

    setUploading(false)

    // Map ArquivoUpload → Arquivo (our local type)
    const arquivos: Arquivo[] = successes.map(s => ({
      id: s.id,
      nome: s.nome,
      caminho: s.caminho,
      mime_type: s.mime_type,
      tamanho: s.tamanho,
      data: s.uploaded_at || new Date().toISOString(),
      uploaded_by: s.uploaded_by,
      uploaded_at: s.uploaded_at,
    }))

    if (errors.length) {
      setErros(errors)
      opts.onError?.(errors)
    }
    if (arquivos.length) {
      opts.onSuccess?.(arquivos)
    }

    return arquivos
  }

  return { uploadFiles, uploading, erros, clearErros: () => setErros([]) }
}
