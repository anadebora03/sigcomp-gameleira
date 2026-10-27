import { PERFIS_PERMISSOES } from '@/lib/constants'

// Emails com acesso automático de admin/diretor
export const ADMIN_EMAILS = ['deboramelo391997@gmail.com']
export const DIRECTOR_EMAILS = ['setordecompras@gameleira.pe.gov.br']

export function normalizarPerfil(perfil?: string | null): string {
  if (perfil === 'admin') return 'administrador'
  if (perfil === 'diretor_setor_compras') return 'diretor_compras'
  return perfil || 'visualizador'
}

export function isAdminOuDiretor(email: string, perfil: string): boolean {
  if (ADMIN_EMAILS.includes(email) || DIRECTOR_EMAILS.includes(email)) return true
  return perfil === 'administrador' || perfil === 'diretor_compras'
}

/**
 * Mesma regra do usePermissions: admin/diretor podem tudo; os demais usam as permissões salvas
 * e, para chaves ausentes, o padrão do perfil.
 */
export function temPermissao(opts: { email: string; perfil?: string | null; permissoes?: Record<string, boolean> | null }, chave: string): boolean {
  const perfil = normalizarPerfil(opts.perfil)
  if (isAdminOuDiretor(opts.email, perfil)) return true
  const salvas = opts.permissoes && Object.keys(opts.permissoes).length ? opts.permissoes : null
  if (salvas && salvas[chave] !== undefined) return salvas[chave] === true
  return (PERFIS_PERMISSOES as any)[perfil]?.[chave] === true
}
