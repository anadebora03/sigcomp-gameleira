/**
 * lib/storage.ts — Supabase Storage upload/download
 * Bucket privado: documentos
 * Caminho: secretaria/ano/numero/arquivo
 */
import { createClient } from '@/lib/supabase/client'
import { SECS } from '@/lib/constants'

export interface ArquivoUpload {
  id: string          // UUID gerado localmente antes de salvar no DB
  nome: string        // nome original do arquivo
  caminho: string     // path no Storage: ex. saude/2025/OFF-2025-0001/relatorio.pdf
  mime_type: string
  tamanho: number     // bytes
  modulo: string      // 'oficios' | 'processos' | 'pesquisas' | 'contratos'
  vinculo_id: string  // numero do oficio/processo (string pois é o número legível)
  secretaria_id: number
  uploaded_by: string // user UUID
  uploaded_at: string // ISO date
  // Transient — preenchido ao buscar URL assinada, não salvo no banco
  signedUrl?: string
  errorUrl?: string
}

export interface UploadResult {
  ok: boolean
  arquivo?: ArquivoUpload
  error?: string
}

/** Sanitiza nome de arquivo para o Storage */
function sanitize(nome: string): string {
  return nome
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 200)
}

/** Monta o caminho do arquivo no bucket */
export function buildPath(opts: {
  secretaria_id: number
  vinculo: string   // numero do oficio/processo
  nome: string
  ano?: number
}): string {
  const sec = SECS.find(s => s.id === opts.secretaria_id)
  const slug = (sec?.sigla || 'geral').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const ano = opts.ano ?? new Date().getFullYear()
  const num = opts.vinculo.replace(/[^a-zA-Z0-9-]/g, '_')
  const file = sanitize(opts.nome)
  // Add timestamp prefix to avoid collision
  const ts = Date.now()
  return `${slug}/${ano}/${num}/${ts}_${file}`
}

/**
 * Faz upload de um arquivo para o Supabase Storage.
 * Retorna ArquivoUpload com todos os metadados.
 */
export async function uploadArquivo(
  file: File,
  opts: {
    modulo: string
    vinculo: string   // numero do oficio (ex: OFF-2025-0001)
    secretaria_id: number
    userId: string
  }
): Promise<UploadResult> {
  const supabase = createClient()

  const caminho = buildPath({
    secretaria_id: opts.secretaria_id,
    vinculo: opts.vinculo,
    nome: file.name,
  })

  // 1. Upload para o Storage
  const { error: storageError } = await supabase.storage
    .from('documentos')
    .upload(caminho, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (storageError) {
    return {
      ok: false,
      error: storageError.message.includes('Bucket not found')
        ? 'Bucket "documentos" não encontrado. Verifique o Supabase Storage.'
        : storageError.message.includes('already exists')
        ? 'Arquivo já existe. Renomeie e tente novamente.'
        : `Erro no upload: ${storageError.message}`,
    }
  }

  const arquivo: ArquivoUpload = {
    id: crypto.randomUUID(),
    nome: file.name,
    caminho,
    mime_type: file.type || 'application/octet-stream',
    tamanho: file.size,
    modulo: opts.modulo,
    vinculo_id: opts.vinculo,
    secretaria_id: opts.secretaria_id,
    uploaded_by: opts.userId,
    uploaded_at: new Date().toISOString(),
  }

  // 2. Salvar metadados na tabela documentos
  const { error: dbError } = await supabase
    .from('documentos')
    .insert({
      id: arquivo.id,
      nome: arquivo.nome,
      caminho: arquivo.caminho,
      mime_type: arquivo.mime_type,
      tamanho: arquivo.tamanho,
      modulo: arquivo.modulo,
      vinculo_id: arquivo.vinculo_id,
      vinculo_num: arquivo.vinculo_id,
      secretaria_id: arquivo.secretaria_id,
      uploaded_by: arquivo.uploaded_by,
      uploaded_at: arquivo.uploaded_at,
    })

  if (dbError) {
    // Storage upload ok mas DB falhou — tentar limpar o arquivo
    await supabase.storage.from('documentos').remove([caminho])
    return {
      ok: false,
      error: `Upload feito mas erro ao salvar no banco: ${dbError.message}. Tente novamente.`,
    }
  }

  return { ok: true, arquivo }
}

/**
 * Faz upload de múltiplos arquivos em paralelo.
 * Retorna array de resultados com sucesso/erro por arquivo.
 */
export async function uploadArquivos(
  files: File[],
  opts: {
    modulo: string
    vinculo: string
    secretaria_id: number
    userId: string
  }
): Promise<{ successes: ArquivoUpload[]; errors: string[] }> {
  const results = await Promise.all(files.map(f => uploadArquivo(f, opts)))
  const successes = results.filter(r => r.ok).map(r => r.arquivo!)
  const errors = results.filter(r => !r.ok).map(r => r.error!)
  return { successes, errors }
}

/**
 * Gera URL assinada (válida por 1h) para visualizar/baixar um arquivo.
 */
export async function getSignedUrl(caminho: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('documentos')
    .createSignedUrl(caminho, expiresIn)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

/**
 * Faz download de um arquivo a partir de uma URL assinada.
 * Busca como blob e força download via link temporário.
 */
export async function downloadBlobFromUrl(url: string, nomeArquivo: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return { ok: false, error: `Erro ao baixar arquivo: ${response.statusText}` }
    }
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: `Erro ao fazer download: ${error instanceof Error ? error.message : 'desconhecido'}` }
  }
}

/**
 * Deleta um arquivo do Storage e do banco.
 */
export async function deleteArquivo(arquivo: ArquivoUpload): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()

  const { error: storageError } = await supabase.storage
    .from('documentos')
    .remove([arquivo.caminho])

  if (storageError) return { ok: false, error: storageError.message }

  const { error: dbError } = await supabase
    .from('documentos')
    .delete()
    .eq('id', arquivo.id)

  if (dbError) return { ok: false, error: dbError.message }
  return { ok: true }
}

/**
 * Busca todos os arquivos de um vínculo (oficio/processo) do banco.
 */
export async function getArquivosByVinculo(vinculo_id: string): Promise<ArquivoUpload[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('vinculo_id', vinculo_id)
    .order('uploaded_at', { ascending: false })
  if (error || !data) return []
  return data as ArquivoUpload[]
}
