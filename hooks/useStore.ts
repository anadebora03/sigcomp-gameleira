'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { SECS } from '@/lib/constants'
import type { Oficio, Processo, Pesquisa, Usuario, Log, Secretaria, OrdemFornecimento } from '@/lib/types'
import { createLog, listLogs, listOficios, saveOficio as persistOficio, deleteOficio as removeOficio, listProcessos, saveProcesso as persistProcesso, deleteProcesso as removeProcesso, listPesquisas, savePesquisa as persistPesquisa, deletePesquisa as removePesquisa, listSecretarias, listOrdens, saveOrdem as persistOrdem, deleteOrdem as removeOrdem } from '@/services/data'
import { listUsers } from '@/services/auth'

/** autor: nome de quem está logado, gravado nos logs (lido por ref para não recriar os callbacks) */
export function useStore(autor?: string) {
  const autorRef = useRef(autor)
  autorRef.current = autor
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [processos, setProcessos] = useState<Processo[]>([])
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [secretarias, setSecretarias] = useState<Secretaria[]>([])
  const [ordens, setOrdens] = useState<OrdemFornecimento[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cada lista é aplicada assim que chega: o Dashboard não espera usuários e logs (que ele nem usa)
    console.log('[store] iniciando carregamento de dados...')
    setError(null)
    function carregar<T>(nome: string, req: Promise<{ success: boolean; data?: T[]; error?: string }>, aplicar: (d: T[]) => void, critico = true) {
      req.then(res => {
        if (res.success && res.data) {
          console.log(`[store] ${nome} carregados:`, res.data.length)
          aplicar(res.data)
        } else {
          console.error(`[store] erro ao carregar ${nome}:`, res.error)
          if (critico) setError(res.error || `Erro ao carregar ${nome}`)
        }
      }).catch(err => {
        console.error(`[store] erro ao carregar ${nome}:`, err)
        if (critico) setError(String(err))
      })
    }

    carregar('ofícios', listOficios(), setOficios)
    carregar('processos', listProcessos(), setProcessos)
    carregar('pesquisas', listPesquisas(), setPesquisas)
    carregar('ordens de fornecimento', listOrdens(), setOrdens)
    carregar('secretarias', listSecretarias(), setSecretarias)
    carregar('logs', listLogs(), setLogs)
    carregar('usuários', listUsers(100), (data: any[]) => setUsuarios(data.map((user: any) => ({
      id: user.id,
      nome: user.nome_completo || user.nome || user.display_name || 'Sem nome',
      cargo: user.cargo || '',
      email: user.email || '',
      perfil: user.perfil || 'visualizador',
      ativo: user.status !== 'bloqueado',
      avatar: '',
      status: user.status || 'ativo',
      permissoes: user.permissoes || {},
    }))), false)
  }, [])

  const saveOficio = useCallback(async (data: Oficio, isNew: boolean) => {
    console.log('[store] salvando ofício:', data.numero)
    setError(null)
    const result = await persistOficio(data, isNew)
    if (!result.success) {
      console.error('[store] erro ao salvar ofício:', result.error)
      setError(result.error || 'Erro ao salvar ofício')
      return result
    }

    console.log('[store] ofício salvo com sucesso')
    setOficios(prev => isNew ? [result.data!, ...prev] : prev.map(o => o.id === result.data!.id ? result.data! : o))

    const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Ofícios', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) {
      setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [])

  const deleteOficio = useCallback(async (id: string) => {
    console.log('[store] deletando ofício:', id)
    setError(null)
    const oficio = oficios.find(o => o.id === id)
    const result = await removeOficio(id)
    if (!result.success) {
      console.error('[store] erro ao deletar ofício:', result.error)
      setError(result.error || 'Erro ao excluir ofício')
      return result
    }

    console.log('[store] ofício deletado com sucesso')
    setOficios(prev => prev.filter(o => o.id !== id))
    if (oficio) {
      const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Ofícios', tipo: 'delete', descricao: `Excluiu ${oficio.numero}`, data: new Date().toISOString() })
      if (log.success && log.data) setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [oficios])

  const saveProcesso = useCallback(async (data: Processo, isNew: boolean) => {
    console.log('[store] salvando processo:', data.numero)
    setError(null)
    const result = await persistProcesso(data, isNew)
    if (!result.success) {
      console.error('[store] erro ao salvar processo:', result.error)
      setError(result.error || 'Erro ao salvar processo')
      return result
    }

    console.log('[store] processo salvo com sucesso')
    setProcessos(prev => isNew ? [result.data!, ...prev] : prev.map(p => p.id === result.data!.id ? result.data! : p))

    const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Processos', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const deleteProcesso = useCallback(async (id: string) => {
    console.log('[store] deletando processo:', id)
    setError(null)
    const processo = processos.find(p => p.id === id)
    const result = await removeProcesso(id)
    if (!result.success) {
      console.error('[store] erro ao deletar processo:', result.error)
      setError(result.error || 'Erro ao excluir processo')
      return result
    }

    console.log('[store] processo deletado com sucesso')
    setProcessos(prev => prev.filter(p => p.id !== id))
    if (processo) {
      const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Processos', tipo: 'delete', descricao: `Excluiu ${processo.numero}`, data: new Date().toISOString() })
      if (log.success && log.data) setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [processos])

  const savePesquisa = useCallback(async (data: Pesquisa, isNew: boolean) => {
    console.log('[store] salvando pesquisa:', data.numero)
    setError(null)
    const result = await persistPesquisa(data, isNew)
    if (!result.success) {
      console.error('[store] erro ao salvar pesquisa:', result.error)
      setError(result.error || 'Erro ao salvar pesquisa')
      return result
    }

    console.log('[store] pesquisa salva com sucesso')
    setPesquisas(prev => isNew ? [result.data!, ...prev] : prev.map(p => p.id === result.data!.id ? result.data! : p))

    const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Pesquisas', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const deletePesquisa = useCallback(async (id: string) => {
    console.log('[store] deletando pesquisa:', id)
    setError(null)
    const result = await removePesquisa(id)
    if (!result.success) {
      console.error('[store] erro ao deletar pesquisa:', result.error)
      setError(result.error || 'Erro ao excluir pesquisa')
      return result
    }

    console.log('[store] pesquisa deletada com sucesso')
    setPesquisas(prev => prev.filter(p => p.id !== id))
    const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Pesquisas', tipo: 'delete', descricao: 'Excluiu pesquisa', data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const saveOrdem = useCallback(async (data: OrdemFornecimento, isNew: boolean, acao?: string) => {
    console.log('[store] salvando ordem de fornecimento:', data.numero_ordem)
    setError(null)
    const result = await persistOrdem(data, isNew)
    if (!result.success) {
      console.error('[store] erro ao salvar ordem de fornecimento:', result.error)
      setError(result.error || 'Erro ao salvar ordem de fornecimento')
      return result
    }

    console.log('[store] ordem de fornecimento salva com sucesso')
    setOrdens(prev => isNew ? [result.data!, ...prev] : prev.map(o => o.id === result.data!.id ? result.data! : o))

    const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Ordens de Fornecimento', tipo: isNew ? 'create' : 'update', descricao: `${acao || (isNew ? 'Criou' : 'Atualizou')} OF ${result.data!.numero_ordem}`, data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const deleteOrdem = useCallback(async (id: string) => {
    console.log('[store] deletando ordem de fornecimento:', id)
    setError(null)
    const ordem = ordens.find(o => o.id === id)
    const result = await removeOrdem(id)
    if (!result.success) {
      console.error('[store] erro ao deletar ordem de fornecimento:', result.error)
      setError(result.error || 'Erro ao excluir ordem de fornecimento')
      return result
    }

    console.log('[store] ordem de fornecimento deletada com sucesso')
    setOrdens(prev => prev.filter(o => o.id !== id))
    if (ordem) {
      const log = await createLog({ usuario: autorRef.current || 'Desconhecido', modulo: 'Ordens de Fornecimento', tipo: 'delete', descricao: `Excluiu OF ${ordem.numero_ordem}`, data: new Date().toISOString() })
      if (log.success && log.data) setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [ordens])

  return {
    ordens,
    saveOrdem,
    deleteOrdem,
    oficios,
    setOficios,
    processos,
    setProcessos,
    pesquisas,
    setPesquisas,
    usuarios,
    setUsuarios,
    logs,
    secretarias,
    error,
    saveOficio,
    deleteOficio,
    saveProcesso,
    deleteProcesso,
    savePesquisa,
    deletePesquisa,
  }
}

