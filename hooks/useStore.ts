'use client'
import { useState, useCallback, useEffect } from 'react'
import { SECS } from '@/lib/constants'
import type { Oficio, Processo, Pesquisa, Usuario, Log, Secretaria } from '@/lib/types'
import { createLog, listLogs, listOficios, saveOficio as persistOficio, deleteOficio as removeOficio, listProcessos, saveProcesso as persistProcesso, deleteProcesso as removeProcesso, listPesquisas, savePesquisa as persistPesquisa, deletePesquisa as removePesquisa, listSecretarias } from '@/services/data'
import { listUsers } from '@/services/auth'

export function useStore() {
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [processos, setProcessos] = useState<Processo[]>([])
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [secretarias, setSecretarias] = useState<Secretaria[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      console.log('[store] iniciando carregamento de dados...')
      setError(null)

      const [oficiosRes, processosRes, pesquisasRes, logsRes, secretariasRes, usersRes] = await Promise.all([
        listOficios(),
        listProcessos(),
        listPesquisas(),
        listLogs(),
        listSecretarias(),
        listUsers(100),
      ])

      // Ofícios
      if (oficiosRes.success && oficiosRes.data) {
        console.log('[store] ofícios carregados:', oficiosRes.data.length)
        setOficios(oficiosRes.data)
      } else {
        console.error('[store] erro ao carregar ofícios:', oficiosRes.error)
        setError(oficiosRes.error || 'Erro ao carregar ofícios')
      }

      // Processos
      if (processosRes.success && processosRes.data) {
        console.log('[store] processos carregados:', processosRes.data.length)
        setProcessos(processosRes.data)
      } else {
        console.error('[store] erro ao carregar processos:', processosRes.error)
        setError(processosRes.error || 'Erro ao carregar processos')
      }

      // Pesquisas
      if (pesquisasRes.success && pesquisasRes.data) {
        console.log('[store] pesquisas carregadas:', pesquisasRes.data.length)
        setPesquisas(pesquisasRes.data)
      } else {
        console.error('[store] erro ao carregar pesquisas:', pesquisasRes.error)
        setError(pesquisasRes.error || 'Erro ao carregar pesquisas')
      }

      // Logs
      if (logsRes.success && logsRes.data) {
        console.log('[store] logs carregados:', logsRes.data.length)
        setLogs(logsRes.data)
      } else {
        console.error('[store] erro ao carregar logs:', logsRes.error)
        setError(logsRes.error || 'Erro ao carregar logs')
      }

      // Secretarias
      if (secretariasRes.success && secretariasRes.data) {
        console.log('[store] secretarias carregadas:', secretariasRes.data.length)
        setSecretarias(secretariasRes.data)
      } else {
        console.error('[store] erro ao carregar secretarias:', secretariasRes.error)
        setError(secretariasRes.error || 'Erro ao carregar secretarias')
      }

      // Usuários
      if (usersRes.success && usersRes.data) {
        console.log('[store] usuários carregados:', usersRes.data.length)
        setUsuarios(usersRes.data.map((user: any) => ({
          id: user.id,
          nome: user.nome || user.nome_completo || user.display_name || user.email || 'Usuário',
          cargo: user.cargo || '',
          email: user.email || '',
          perfil: user.perfil || 'visualizador',
          ativo: user.status !== 'bloqueado',
          avatar: '',
          status: user.status || 'ativo',
          permissoes: user.permissoes || {},
        })))
      } else {
        console.error('[store] erro ao carregar usuários:', usersRes.error)
      }

      console.log('[store] carregamento concluído')
    }

    loadData().catch(err => {
      console.error('[store] erro ao carregar dados:', err)
      setError(String(err))
    })
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

    const log = await createLog({ usuario: 'Você', modulo: 'Ofícios', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
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
      const log = await createLog({ usuario: 'Você', modulo: 'Ofícios', tipo: 'delete', descricao: `Excluiu ${oficio.numero}`, data: new Date().toISOString() })
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

    const log = await createLog({ usuario: 'Você', modulo: 'Processos', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
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
      const log = await createLog({ usuario: 'Você', modulo: 'Processos', tipo: 'delete', descricao: `Excluiu ${processo.numero}`, data: new Date().toISOString() })
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

    const log = await createLog({ usuario: 'Você', modulo: 'Pesquisas', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
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
    const log = await createLog({ usuario: 'Você', modulo: 'Pesquisas', tipo: 'delete', descricao: 'Excluiu pesquisa', data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  return {
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

