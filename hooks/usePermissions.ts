'use client'
/**
 * usePermissions — verifica permissões do usuário logado
 * Retorna funções para validar acesso a funcionalidades específicas
 */
import { useAuth } from '@/hooks/useAuth'
import { PERFIS_PERMISSOES } from '@/lib/constants'

export function usePermissions() {
  const { user } = useAuth()

  // Obtém perfil do user (armazenado em raw_user_meta_data ou user_metadata)
  const perfil = (user?.user_metadata?.perfil as string) || (user?.app_metadata?.perfil as string) || 'visualizador'
  
  // Obtém permissões do user ou usa as padrão do perfil
  let permissoes = (user?.user_metadata?.permissoes as Record<string, boolean>) || 
    (user?.app_metadata?.permissoes as Record<string, boolean>)
  
  // Se não achou, usa as padrões do perfil
  if (!permissoes) {
    permissoes = PERFIS_PERMISSOES[perfil] || PERFIS_PERMISSOES.visualizador
  }

  /**
   * Verifica se usuário tem uma permissão específica
   * Exemplo: tem('oficios.criar')
   */
  function tem(chave: string): boolean {
    // Admin e Diretor têm tudo
    if (perfil === 'administrador' || perfil === 'diretor_compras') return true
    return permissoes[chave] === true
  }

  /**
   * Verifica múltiplas permissões (AND)
   * Exemplo: temTodas(['oficios.criar', 'oficios.editar'])
   */
  function temTodas(chaves: string[]): boolean {
    if (perfil === 'administrador' || perfil === 'diretor_compras') return true
    return chaves.every(c => permissoes[c] === true)
  }

  /**
   * Verifica múltiplas permissões (OR)
   * Exemplo: temAlguma(['usuarios.criar', 'usuarios.editar'])
   */
  function temAlguma(chaves: string[]): boolean {
    if (perfil === 'administrador' || perfil === 'diretor_compras') return true
    return chaves.some(c => permissoes[c] === true)
  }

  return { tem, temTodas, temAlguma, perfil, permissoes }
}
