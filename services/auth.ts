/**
 * Serviço de autenticação e gerenciamento de usuários
 * Integração com Supabase Auth e banco de dados
 * 
 * Sistema de Sincronização Automática:
 * - Ao criar/editar usuário: dados são salvos em tabela `usuarios`
 * - Trigger automático sincroniza com auth.users (raw_user_meta_data)
 * - Permissões são regeneradas automaticamente baseado no perfil
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================
// INTERFACES
// ============================================================

export interface CreateUserRequest {
  email: string
  nome: string
  cargo: string
  secretaria?: string
  perfil: string
}

export interface UpdateUserRequest {
  userId: string
  nome?: string
  cargo?: string
  secretaria?: string
  perfil?: string
  status?: string
}

export interface CreateUserResponse {
  success: boolean
  message: string
  userId?: string
  error?: string
}

export interface UserData {
  id: string
  email: string
  nome: string
  nome_completo?: string
  display_name?: string
  cargo?: string
  perfil: string
  permissoes?: Record<string, Record<string, boolean>>
  status?: string
  is_admin?: boolean
}

/**
 * Cria um novo usuário no Supabase Auth e na tabela usuarios
 * Sistema de sincronização automática:
 * 1. Cria usuário no Supabase Auth via convite oficial do Supabase
 * 2. Insere na tabela `usuarios` (trigger sincroniza para auth.users automaticamente)
 * 3. Trigger regenera permissões baseado no perfil
 * 4. Link de convite redireciona para /nova-senha
 */
 export async function createUserWithInvite(data: CreateUserRequest): Promise<CreateUserResponse> {
   try {
     console.log('enviando convite', data.email)

     const response = await fetch('/api/users/invite', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     })

     const result = await response.json()

     if (!response.ok || !result.success) {
       console.error('erro ao enviar convite', result.error || result)
       return {
         success: false,
         message: result.message || 'Erro ao criar usuário',
         error: result.error || 'Erro desconhecido'
       }
     }

     console.log('convite enviado', result.userId)
     return {
       success: true,
       message: result.message || 'Convite enviado por email com sucesso.',
       userId: result.userId
     }
   } catch (error) {
     console.error('erro ao enviar convite', error)
     return {
       success: false,
       message: 'Erro ao criar usuário',
       error: String(error)
     }
   }
}

/**
 * Atualiza um usuário existente
 * Trigger automático:
 * 1. Sincroniza com auth.users
 * 2. Regenera permissões se perfil foi alterado
 * 3. Registra alterações na auditoria
 */
export async function updateUser(data: UpdateUserRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(data.userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: data.nome,
        cargo: data.cargo,
        secretaria: data.secretaria,
        perfil: data.perfil,
        status: data.status,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message || 'Erro ao atualizar usuário' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Obter dados completos de um usuário (incluindo permissões)
 */
export async function getUser(userId: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('usuarios')
      .select('id,email,nome,nome_completo,display_name,cargo,perfil,permissoes,status')
      .eq('id', userId)
      .single()

    if (error && !data) {
      console.warn('[auth] usuário não encontrado em usuarios:', error.message)
    }

    if (data) {
      return { success: true, data }
    }

    const { data: profile, error: profileError } = await supabase
      .from('perfis')
      .select('id,nome,nome_completo,display_name,cargo,perfil')
      .eq('id', userId)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    if (profile) {
      return {
        success: true,
        data: {
          id: profile.id,
          email: '',
          nome: profile.nome || profile.nome_completo || profile.display_name || '',
          nome_completo: profile.nome_completo,
          display_name: profile.display_name,
          cargo: profile.cargo,
          perfil: profile.perfil,
        }
      }
    }

    return { success: false, error: 'Usuário não encontrado' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Listar todos os usuários com paginação
 */
export async function listUsers(
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; data?: UserData[]; count?: number; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error, count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[listUsers] Erro do Supabase:', error.message, error.code, error.details)
      return { success: false, error: `${error.message} (${error.code})` }
    }

    if (!data) {
      console.warn('[listUsers] Nenhum dado retornado, mas sem erro')
      return { success: true, data: [], count: 0 }
    }

    console.log('[listUsers] Usuários carregados:', data.length)
    return { success: true, data, count: count || 0 }
  } catch (error) {
    console.error('[listUsers] Erro de exceção:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Mudar status de um usuário
 */
export async function changeUserStatus(
  userId: string,
  status: 'ativo' | 'bloqueado' | 'aguardando_ativacao'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message || 'Erro ao atualizar status do usuário' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message || 'Erro ao excluir usuário' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Registrar login (atualizar last_login)
 */
export async function recordLogin(userId: string): Promise<void> {
  try {
    const supabase = createClient()

    await supabase
      .from('usuarios')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  } catch (error) {
    console.error('erro ao registrar login', error)
  }
}

/**
 * Buscar usuários por perfil
 */
export async function getUsersByProfile(
  perfil: string
): Promise<{ success: boolean; data?: UserData[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('perfil', perfil)
      .order('nome', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Enviar e-mail de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sigcomp-gameleira-irnl.vercel.app'}/nova-senha`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Gera HTML do e-mail de convite
 */
function generateInviteEmail(nome: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a5c38, #2d8f5e); border-radius: 12px; padding: 30px; color: white; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">SIGCOMP</h1>
        <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Sistema de Gestão de Compras</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <h2 style="margin: 0 0 16px; color: #1a5c38; font-size: 20px;">Bem-vindo(a), ${nome}!</h2>
        
        <p style="color: #4a6155; line-height: 1.6; margin-bottom: 16px;">
          Você foi convidado para acessar o <strong>SIGCOMP</strong>, a plataforma de gestão de compras da Prefeitura de Gameleira.
        </p>

        <div style="background: #f0f7f3; border-left: 4px solid #1a5c38; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1a5c38; font-weight: 600;">Próximos passos:</p>
          <ol style="margin: 8px 0 0; color: #4a6155; padding-left: 20px;">
            <li>Clique no link abaixo para confirmar seu e-mail</li>
            <li>Defina uma senha segura (mínimo 8 caracteres)</li>
            <li>Acesse o sistema com seu e-mail e a nova senha</li>
          </ol>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/nova-senha" 
           style="display: inline-block; background: #1a5c38; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Confirmar E-mail e Definir Senha
        </a>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          Se você não foi convidado para o SIGCOMP, ignore este e-mail.<br/>
          Dúvidas? Entre em contato com o administrador do sistema.
        </p>
      </div>

      <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">
        © ${new Date().getFullYear()} Prefeitura Municipal de Gameleira — PE
      </p>
    </div>
  `
}

/**
 * Desativa um usuário
 */
export async function disableUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'bloqueado' }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message || 'Erro ao bloquear usuário' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Reativa um usuário
 */
export async function enableUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ativo' }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message || 'Erro ao ativar usuário' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}


