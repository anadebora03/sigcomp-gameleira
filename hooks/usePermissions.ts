'use client'
/**
 * usePermissions — verifica permissões do usuário logado
 * Lê de: user_metadata, app_metadata, email
 * Retorna funções para validar acesso a funcionalidades específicas
 */
import { useAuth } from '@/hooks/useAuth'
import { PERFIS_PERMISSOES } from '@/lib/constants'

// Emails com acesso automático de admin/diretor
const ADMIN_EMAILS = ['deboramelo391997@gmail.com']
const DIRECTOR_EMAILS = ['setordecompras@gameleira.pe.gov.br']

export function usePermissions() {
  const { user } = useAuth()

  // ============================================================
  // 1. DETERMINAR PERFIL COM MÚLTIPLOS FALLBACKS
  // ============================================================
  
  // Verificar se email tem acesso automático
  const userEmail = user?.email || ''
  
  let perfil = 'visualizador'  // default
  
  if (ADMIN_EMAILS.includes(userEmail)) {
    // Email é admin automático
    perfil = 'administrador'
  } else if (DIRECTOR_EMAILS.includes(userEmail)) {
    // Email é diretor automático
    perfil = 'diretor_compras'
  } else {
    // Procurar em user_metadata/app_metadata (disponíveis no frontend)
    perfil = (user?.user_metadata?.perfil as string) || 
             (user?.app_metadata?.perfil as string) ||
             'visualizador'
    
    // Normalizar variações do nome do perfil
    if (perfil === 'admin') perfil = 'administrador'
    if (perfil === 'diretor_setor_compras') perfil = 'diretor_compras'
  }

  // ============================================================
  // 2. OBTER PERMISSÕES
  // ============================================================
  
  let permissoes: Record<string, boolean> = {}
  
  // Procurar em múltiplas localizações (disponíveis no frontend)
  if (user?.user_metadata?.permissoes) {
    permissoes = user.user_metadata.permissoes as Record<string, boolean>
  } else if (user?.app_metadata?.permissoes) {
    permissoes = user.app_metadata.permissoes as Record<string, boolean>
  }
  
  // Se não achou, usar padrão do perfil
  if (!permissoes || Object.keys(permissoes).length === 0) {
    permissoes = (PERFIS_PERMISSOES as any)[perfil] || (PERFIS_PERMISSOES as any).visualizador || {}
  }

  /**
   * Verifica se usuário tem uma permissão específica
   * Admin/Diretor (por email ou perfil) sempre retornam true
   * Exemplo: tem('oficios.criar')
   */
  function tem(chave: string): boolean {
    // Admin por email ou perfil
    if (ADMIN_EMAILS.includes(userEmail)) return true
    if (DIRECTOR_EMAILS.includes(userEmail)) return true
    if (perfil === 'administrador' || perfil === 'admin') return true
    if (perfil === 'diretor_compras' || perfil === 'diretor_setor_compras') return true
    
    // Outros: verificar permissão específica
    return permissoes[chave] === true
  }

  /**
   * Verifica múltiplas permissões (AND)
   * Exemplo: temTodas(['oficios.criar', 'oficios.editar'])
   */
  function temTodas(chaves: string[]): boolean {
    // Admin por email ou perfil
    if (ADMIN_EMAILS.includes(userEmail)) return true
    if (DIRECTOR_EMAILS.includes(userEmail)) return true
    if (perfil === 'administrador' || perfil === 'admin') return true
    if (perfil === 'diretor_compras' || perfil === 'diretor_setor_compras') return true
    
    // Outros: verificar todas
    return chaves.every(c => permissoes[c] === true)
  }

  /**
   * Verifica múltiplas permissões (OR)
   * Exemplo: temAlguma(['usuarios.criar', 'usuarios.editar'])
   */
  function temAlguma(chaves: string[]): boolean {
    // Admin por email ou perfil
    if (ADMIN_EMAILS.includes(userEmail)) return true
    if (DIRECTOR_EMAILS.includes(userEmail)) return true
    if (perfil === 'administrador' || perfil === 'admin') return true
    if (perfil === 'diretor_compras' || perfil === 'diretor_setor_compras') return true
    
    // Outros: verificar alguma
    return chaves.some(c => permissoes[c] === true)
  }

  /**
   * Verifica se é admin ou diretor (para acesso completo)
   */
  function isAdminOrDirector(): boolean {
    if (ADMIN_EMAILS.includes(userEmail)) return true
    if (DIRECTOR_EMAILS.includes(userEmail)) return true
    if (perfil === 'administrador' || perfil === 'admin') return true
    if (perfil === 'diretor_compras' || perfil === 'diretor_setor_compras') return true
    return false
  }

  return { tem, temTodas, temAlguma, isAdminOrDirector, perfil, permissoes, email: userEmail }
}
