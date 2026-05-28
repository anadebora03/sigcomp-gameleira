'use client'
import { useState, useCallback, useEffect } from 'react'
import { SECS } from '@/lib/constants'
import type { Oficio, Processo, Pesquisa, Usuario, Log, Secretaria } from '@/lib/types'
import { createLog, listLogs, listOficios, saveOficio as persistOficio, deleteOficio as removeOficio, listProcessos, saveProcesso as persistProcesso, deleteProcesso as removeProcesso, listPesquisas, savePesquisa as persistPesquisa, deletePesquisa as removePesquisa, listSecretarias } from '@/services/data'

export function useStore() {
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [processos, setProcessos] = useState<Processo[]>([])
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [secretarias, setSecretarias] = useState<Secretaria[]>(SECS)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setError(null)

      const [oficiosRes, processosRes, pesquisasRes, logsRes, secretariasRes] = await Promise.all([
        listOficios(),
        listProcessos(),
        listPesquisas(),
        listLogs(),
        listSecretarias(),
      ])

      if (oficiosRes.success && oficiosRes.data) {
        setOficios(oficiosRes.data)
      } else {
        setError(oficiosRes.error || 'Erro ao carregar ofícios')
      }

      if (processosRes.success && processosRes.data) {
        setProcessos(processosRes.data)
      } else {
        setError(processosRes.error || 'Erro ao carregar processos')
      }

      if (pesquisasRes.success && pesquisasRes.data) {
        setPesquisas(pesquisasRes.data)
      } else {
        setError(pesquisasRes.error || 'Erro ao carregar pesquisas')
      }

      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data)
      } else {
        setError(logsRes.error || 'Erro ao carregar logs')
      }

      if (secretariasRes.success && secretariasRes.data && secretariasRes.data.length > 0) {
        setSecretarias(secretariasRes.data)
      }
    }

    loadData().catch(err => setError(String(err)))
  }, [])

  const saveOficio = useCallback(async (data: Oficio, isNew: boolean) => {
    setError(null)
    const result = await persistOficio(data, isNew)
    if (!result.success) {
      setError(result.error || 'Erro ao salvar ofício')
      return result
    }

    setOficios(prev => isNew ? [result.data!, ...prev] : prev.map(o => o.id === result.data!.id ? result.data! : o))

    const log = await createLog({ usuario: 'Você', modulo: 'Ofícios', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) {
      setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [])

  const deleteOficio = useCallback(async (id: number) => {
    setError(null)
    const oficio = oficios.find(o => o.id === id)
    const result = await removeOficio(id)
    if (!result.success) {
      setError(result.error || 'Erro ao excluir ofício')
      return result
    }

    setOficios(prev => prev.filter(o => o.id !== id))
    if (oficio) {
      const log = await createLog({ usuario: 'Você', modulo: 'Ofícios', tipo: 'delete', descricao: `Excluiu ${oficio.numero}`, data: new Date().toISOString() })
      if (log.success && log.data) setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [oficios])

  const saveProcesso = useCallback(async (data: Processo, isNew: boolean) => {
    setError(null)
    const result = await persistProcesso(data, isNew)
    if (!result.success) {
      setError(result.error || 'Erro ao salvar processo')
      return result
    }

    setProcessos(prev => isNew ? [result.data!, ...prev] : prev.map(p => p.id === result.data!.id ? result.data! : p))

    const log = await createLog({ usuario: 'Você', modulo: 'Processos', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const deleteProcesso = useCallback(async (id: number) => {
    setError(null)
    const processo = processos.find(p => p.id === id)
    const result = await removeProcesso(id)
    if (!result.success) {
      setError(result.error || 'Erro ao excluir processo')
      return result
    }

    setProcessos(prev => prev.filter(p => p.id !== id))
    if (processo) {
      const log = await createLog({ usuario: 'Você', modulo: 'Processos', tipo: 'delete', descricao: `Excluiu ${processo.numero}`, data: new Date().toISOString() })
      if (log.success && log.data) setLogs(prev => [log.data!, ...prev])
    }

    return result
  }, [processos])

  const savePesquisa = useCallback(async (data: Pesquisa, isNew: boolean) => {
    setError(null)
    const result = await persistPesquisa(data, isNew)
    if (!result.success) {
      setError(result.error || 'Erro ao salvar pesquisa')
      return result
    }

    setPesquisas(prev => isNew ? [result.data!, ...prev] : prev.map(p => p.id === result.data!.id ? result.data! : p))

    const log = await createLog({ usuario: 'Você', modulo: 'Pesquisas', tipo: isNew ? 'create' : 'update', descricao: `${isNew ? 'Criou' : 'Atualizou'} ${result.data!.numero}`, data: new Date().toISOString() })
    if (log.success && log.data) setLogs(prev => [log.data!, ...prev])

    return result
  }, [])

  const deletePesquisa = useCallback(async (id: number) => {
    setError(null)
    const result = await removePesquisa(id)
    if (!result.success) {
      setError(result.error || 'Erro ao excluir pesquisa')
      return result
    }

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
