/**
 * Serviço de autenticação e gerenciamento de usuários
 * Integração com Supabase Auth e banco de dados
 * 
 * Sistema de Sincronização Automática:
 * - Ao criar/editar usuário: dados são salvos em tabela `usuarios`
 * - Trigger automático sincroniza com auth.users (raw_user_meta_data)
 * - Permissões são regeneradas automaticamente baseado no perfil
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================
// INTERFACES
// ============================================================

export interface CreateUserRequest {
  email: string
  nome: string
  cargo: string
  perfil: string
}

export interface UpdateUserRequest {
  userId: string
  nome?: string
  cargo?: string
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
  cargo?: string
  perfil: string
  permissoes?: Record<string, Record<string, boolean>>
  status?: string
  is_admin?: boolean
}

/**
 * Cria um novo usuário no Supabase Auth e na tabela usuarios
 * Sistema de sincronização automática:
 * 1. Cria usuário no Supabase Auth com senha temporária
 * 2. Insere na tabela `usuarios` (trigger sincroniza para auth.users automaticamente)
 * 3. Trigger regenera permissões baseado no perfil
 * 4. Envia e-mail de convite
 */
export async function createUserWithInvite(data: CreateUserRequest): Promise<CreateUserResponse> {
  try {
    const supabase = await createClient()

    // 1. Gerar senha temporária segura
    const senhaTemporaria = Math.random().toString(36).slice(-12)

    // 2. Criar usuário no Supabase Auth (sem metadata ainda)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: senhaTemporaria,
      email_confirm: false,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        message: 'Erro ao criar usuário',
        error: authError?.message || 'Erro desconhecido'
      }
    }

    const userId = authData.user.id

    // 3. Inserir na tabela `usuarios` (trigger fará o resto)
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email: data.email,
        nome: data.nome,
        cargo: data.cargo,
        perfil: data.perfil,
        status: 'convite_enviado',
        // Permissões serão regeneradas automaticamente pelo trigger
      })

    if (insertError) {
      return {
        success: false,
        message: 'Erro ao armazenar usuário',
        error: insertError.message
      }
    }

    // 4. Enviar e-mail de convite
    await sendInviteEmail(data.email, data.nome).catch(() => {
      // Continua mesmo se email falhar
    })

    return {
      success: true,
      message: 'Usuário criado e convite enviado',
      userId
    }
  } catch (error) {
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
    const supabase = await createClient()

    // 1. Atualizar na tabela `usuarios` (trigger fará sincronização)
    const { error } = await supabase
      .from('usuarios')
      .update({
        ...(data.nome && { nome: data.nome }),
        ...(data.cargo && { cargo: data.cargo }),
        ...(data.perfil && { perfil: data.perfil }),
        ...(data.status && { status: data.status }),
      })
      .eq('id', data.userId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // 2. Se mudou perfil, regenerar permissões
    if (data.perfil) {
      await supabase.rpc('regenerate_permissions', {
        p_user_id: data.userId
      }).catch(() => {
        // Continua se falhar
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: String(error)
    }
  }
}

/**
 * Obter dados completos de um usuário (incluindo permissões)
 */
export async function getUser(userId: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
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
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data, count: count || 0 }
  } catch (error) {
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
    const supabase = await createClient()

    const { error } = await supabase
      .from('usuarios')
      .update({ status })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
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
    const supabase = await createClient()

    await supabase
      .from('usuarios')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  } catch (error) {
    // Falha silenciosa
  }
}

/**
 * Buscar usuários por perfil
 */
export async function getUsersByProfile(
  perfil: string
): Promise<{ success: boolean; data?: UserData[]; error?: string }> {
  try {
    const supabase = await createClient()

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
 * Enviar e-mail de convite
 */
async function sendInviteEmail(email: string, nome: string): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.auth.admin.sendRawSMTPEmail({
      to: email,
      subject: 'Você foi convidado para o SIGCOMP',
      html: generateInviteEmail(nome)
    })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    // Continua mesmo se falhar
  }
}

/**
 * Enviar e-mail de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/nova-senha`
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
    const supabase = await createClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { status: 'bloqueado' }
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
 * Reativa um usuário
 */
export async function enableUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { status: 'ativo' }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
