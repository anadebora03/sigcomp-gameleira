import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { temPermissao } from '@/lib/permissoes'

/**
 * Confere, no servidor, se quem chamou a rota está logado e tem a permissão.
 * Perfil e permissões vêm da tabela usuarios (lida com a service role), nunca do user_metadata,
 * que o próprio usuário consegue alterar pelo navegador.
 * Retorna null se pode seguir, ou a resposta de erro (401/403).
 */
export async function exigirPermissao(chave: string): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Faça login para continuar.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: row } = await admin.from('usuarios').select('perfil,permissoes').eq('id', user.id).maybeSingle()

  const pode = temPermissao({
    email: user.email || '',
    perfil: row?.perfil ?? (user.app_metadata?.perfil as string | undefined),
    permissoes: row?.permissoes ?? null,
  }, chave)

  if (!pode) {
    console.warn('[exigirPermissao] negado:', { userId: user.id, chave })
    return NextResponse.json({ success: false, message: 'Você não tem permissão para esta ação.' }, { status: 403 })
  }
  return null
}
