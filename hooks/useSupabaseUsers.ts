'use client'
/**
 * Hook para gerenciamento de usuários com Supabase
 * Sincronização automática com base de dados
 * Carrega usuarios, cria, edita, deleta com persistência automática
 */

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PERFIS_PERMISSOES } from '@/lib/constants'
import type { UserData } from '@/services/auth'
import { 
  createUserWithInvite, 
  updateUser, 
  listUsers, 
  changeUserStatus 
} from '@/services/auth'

export interface UseSupabaseUsersOptions {
  autoLoad?: boolean
  limit?: number
}

export function useSupabaseUsers(options: UseSupabaseUsersOptions = {}) {
  const { autoLoad = true, limit = 50 } = options
  
  const [usuarios, setUsuarios] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Carregar usuários do Supabase
   */
  const loadUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { success, data, error: apiError } = await listUsers(limit)
      if (success && data) {
        console.log('[useSupabaseUsers] Usuários carregados:', data.length)
        setUsuarios(data)
      } else {
        const errorMsg = apiError || 'Erro ao carregar usuários'
        console.error('[useSupabaseUsers] Erro ao carregar:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      const errorMsg = String(err)
      console.error('[useSupabaseUsers] Exceção:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [limit])

  /**
   * Criar novo usuário
   */
  const createUser = useCallback(async (data: {
    email: string
    nome: string
    cargo: string
    perfil: string
  }) => {
    try {
      setError(null)
      
      // Validação
      if (!data.email || !data.nome || !data.perfil) {
        setError('Preencha todos os campos obrigatórios')
        return { success: false, error: 'Campos obrigatórios faltando' }
      }

      // Criar via serviço (que faz toda a sincronização)
      const result = await createUserWithInvite(data)
      
      if (result.success) {
        // Recarregar lista
        await loadUsuarios()
        return result
      } else {
        setError(result.error || 'Erro ao criar usuário')
        return result
      }
    } catch (err) {
      const errorMsg = String(err)
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadUsuarios])

  /**
   * Editar usuário existente
   */
  const editUser = useCallback(async (userId: string, data: {
    nome?: string
    cargo?: string
    perfil?: string
    status?: string
  }) => {
    try {
      setError(null)
      
      const result = await updateUser({
        userId,
        ...data
      })
      
      if (result.success) {
        // Recarregar lista
        await loadUsuarios()
        return result
      } else {
        setError(result.error || 'Erro ao editar usuário')
        return result
      }
    } catch (err) {
      const errorMsg = String(err)
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadUsuarios])

  /**
   * Mudar status de um usuário
   */
  const updateStatus = useCallback(async (userId: string, status: string) => {
    try {
      setError(null)
      
      const result = await changeUserStatus(
        userId,
        status as 'ativo' | 'bloqueado' | 'aguardando_ativacao'
      )
      
      if (result.success) {
        // Atualizar localmente
        setUsuarios(prev => 
          prev.map(u => u.id === userId ? { ...u, status } : u)
        )
        return result
      } else {
        setError(result.error || 'Erro ao atualizar status')
        return result
      }
    } catch (err) {
      const errorMsg = String(err)
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  /**
   * Deletar usuário
   */
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null)
      
      // Deletar via Supabase (cascade do RLS)
      const { error: err } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)
      
      if (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
      
      // Atualizar lista local
      setUsuarios(prev => prev.filter(u => u.id !== userId))
      return { success: true }
    } catch (err) {
      const errorMsg = String(err)
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [supabase])

  /**
   * Buscar usuário por ID
   */
  const getUser = useCallback((userId: string) => {
    return usuarios.find(u => u.id === userId)
  }, [usuarios])

  /**
   * Obter perfil automático baseado no role
   * Admin e Diretor têm acesso total
   * Outros têm acesso baseado em permissões
   */
  const getPerfisDisponiveis = useCallback(() => {
    return [
      { value: 'administrador', label: 'Administrador (Acesso Total)' },
      { value: 'diretor_compras', label: 'Diretor do Setor de Compras (Acesso Total)' },
      { value: 'setor_compras', label: 'Setor de Compras' },
      { value: 'secretaria', label: 'Secretaria' },
      { value: 'visualizador', label: 'Visualizador' },
    ]
  }, [])

  /**
   * Obter permissões padrão de um perfil
   */
  const getPermissoesForPerfil = useCallback((perfil: string) => {
    return (PERFIS_PERMISSOES as any)[perfil] || {}
  }, [])

  // Carregar usuários ao montar o componente
  useEffect(() => {
    if (autoLoad) {
      loadUsuarios()
    }
  }, [autoLoad, loadUsuarios])

  return {
    // Estado
    usuarios,
    loading,
    error,
    
    // Ações
    loadUsuarios,
    createUser,
    editUser,
    updateStatus,
    deleteUser,
    getUser,
    
    // Helpers
    getPerfisDisponiveis,
    getPermissoesForPerfil,
  }
}
