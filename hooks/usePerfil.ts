'use client'
import { useState, useEffect, useCallback } from 'react'
import { getMeuPerfil, getFotoUrl, salvarMeuPerfil, nomeExibicao, type MeuPerfil, type DadosPerfil, type AcaoFoto } from '@/services/perfil'

/** Perfil do usuário logado (tabela usuarios + foto no bucket avatars), compartilhado por cabeçalho, menu e dashboard */
export function usePerfil(userId?: string) {
  const [perfil, setPerfil] = useState<MeuPerfil | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    if (!userId) return
    const r = await getMeuPerfil()
    // Erro ao carregar não aparece no cabeçalho: a interface só cai para a inicial/ícone neutro
    const p = r.success ? r.data ?? null : null
    setPerfil(p)
    setFotoUrl(p?.avatar_path ? await getFotoUrl(p.avatar_path) : null)
    setCarregando(false)
  }, [userId])

  useEffect(() => { carregar() }, [carregar])

  const salvar = useCallback(async (dados: DadosPerfil, foto: AcaoFoto) => {
    if (!userId) return { success: false, error: 'Sessão expirada. Entre novamente.' }
    const r = await salvarMeuPerfil(userId, dados, foto, perfil?.avatar_path ?? null)
    if (r.success) await carregar()
    return r
  }, [userId, perfil, carregar])

  return { perfil, fotoUrl, nome: nomeExibicao(perfil), carregando, salvar }
}

export type PerfilCtx = ReturnType<typeof usePerfil>
