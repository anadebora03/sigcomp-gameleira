import { createClient } from '@/lib/supabase/client'

export interface MeuPerfil {
  id: string
  email: string
  nome: string
  nome_completo: string | null
  cargo: string | null
  telefone: string | null
  secretaria: string | null
  avatar_path: string | null
}

export interface DadosPerfil { nome: string; cargo: string; telefone: string; secretaria: string }

/** Foto: manter a atual, trocar por uma nova imagem (já preparada) ou remover */
export type AcaoFoto = { acao: 'manter' } | { acao: 'trocar'; imagem: Blob } | { acao: 'remover' }

const BUCKET = 'avatars'
export const FOTO_MAX_BYTES = 5 * 1024 * 1024
export const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp']

/** Nome de apresentação — nunca derivado do e-mail */
export function nomeExibicao(p?: Pick<MeuPerfil, 'nome' | 'nome_completo'> | null): string {
  return (p?.nome_completo || p?.nome || '').trim()
}

export async function getMeuPerfil(): Promise<{ success: boolean; data?: MeuPerfil | null; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('meu_perfil')
    if (error) {
      console.error('[perfil] erro ao carregar perfil:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data: (data as MeuPerfil[] | null)?.[0] ?? null }
  } catch (err) {
    console.error('[perfil] erro ao carregar perfil:', err)
    return { success: false, error: String(err) }
  }
}

/** URL assinada da foto (bucket privado). Válida por 24h; é renovada a cada carregamento do perfil. */
export async function getFotoUrl(path: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 86400)
  if (error || !data?.signedUrl) {
    console.error('[perfil] erro ao gerar URL da foto:', error?.message)
    return null
  }
  return data.signedUrl
}

/** Valida o arquivo escolhido. Retorna a mensagem de erro amigável ou null. */
export function validarFoto(file: File): string | null {
  if (!FOTO_TIPOS.includes(file.type)) return 'Formato de imagem não permitido. Use JPG, PNG ou WEBP.'
  if (file.size > FOTO_MAX_BYTES) return 'Imagem muito grande. Escolha uma imagem de até 5 MB.'
  return null
}

/** Reduz a foto para no máximo 512px (corte quadrado central) e converte para WEBP — avatar leve e uniforme */
export async function prepararFoto(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const lado = Math.min(bmp.width, bmp.height)
  const tam = Math.min(512, lado)
  const canvas = document.createElement('canvas')
  canvas.width = tam
  canvas.height = tam
  canvas.getContext('2d')!.drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, tam, tam)
  bmp.close()
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', 0.85))
  // Navegador sem encoder WEBP devolve PNG; nesse caso usa JPEG
  if (blob && blob.type === 'image/webp') return blob
  const jpg = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.88))
  if (!jpg) throw new Error('Não foi possível processar a imagem.')
  return jpg
}

/**
 * Salva o perfil: envia a foto nova (se houver), grava os dados pela função atualizar_meu_perfil
 * e só então apaga a foto antiga. Se a gravação falhar, a foto recém-enviada é apagada.
 */
export async function salvarMeuPerfil(
  userId: string,
  dados: DadosPerfil,
  foto: AcaoFoto,
  pathAtual: string | null,
): Promise<{ success: boolean; avatar_path?: string | null; error?: string }> {
  const supabase = createClient()
  let novoPath = pathAtual

  if (foto.acao === 'trocar') {
    const ext = foto.imagem.type === 'image/webp' ? 'webp' : 'jpg'
    novoPath = `${userId}/profile-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(novoPath, foto.imagem, {
      contentType: foto.imagem.type,
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      console.error('[perfil] erro no upload da foto:', error.message)
      return { success: false, error: error.message.includes('Bucket not found') ? 'Armazenamento de fotos não configurado (bucket "avatars").' : 'Não foi possível enviar a foto. Tente novamente.' }
    }
  } else if (foto.acao === 'remover') {
    novoPath = null
  }

  const { error } = await supabase.rpc('atualizar_meu_perfil', {
    p_nome: dados.nome,
    p_cargo: dados.cargo,
    p_telefone: dados.telefone,
    p_secretaria: dados.secretaria,
    p_avatar_path: novoPath,
  })

  if (error) {
    console.error('[perfil] erro ao salvar perfil:', error.message)
    if (foto.acao === 'trocar' && novoPath) await supabase.storage.from(BUCKET).remove([novoPath])
    return { success: false, error: error.message.includes('Informe o nome') ? 'Informe o seu nome.' : 'Não foi possível salvar o perfil. Tente novamente.' }
  }

  // Foto antiga não é mais referenciada: remove do Storage (falha aqui não desfaz o que já foi salvo)
  if (pathAtual && pathAtual !== novoPath) {
    const { error: rmError } = await supabase.storage.from(BUCKET).remove([pathAtual])
    if (rmError) console.warn('[perfil] não foi possível apagar a foto antiga:', rmError.message)
  }

  return { success: true, avatar_path: novoPath }
}
