'use client'
import { useState, useCallback } from 'react'
import { INIT_OF, INIT_PL, INIT_PQ, INIT_US, INIT_LG } from '@/lib/initialData'
import type { Oficio, Processo, Pesquisa, Usuario, Log } from '@/lib/types'
import { uid } from '@/utils/helpers'
import { td } from '@/utils/formatters'

export function useStore() {
  const [oficios,    setOficios]    = useState<Oficio[]>(INIT_OF)
  const [processos,  setProcessos]  = useState<Processo[]>(INIT_PL)
  const [pesquisas,  setPesquisas]  = useState<Pesquisa[]>(INIT_PQ)
  const [usuarios,   setUsuarios]   = useState<Usuario[]>(INIT_US)
  const [logs,       setLogs]       = useState<Log[]>(INIT_LG)

  const addLog = useCallback((descricao: string, modulo: string, tipo = 'update') => {
    setLogs(p => [...p, { id: uid(), usuario: 'Você', modulo, tipo, descricao, data: new Date().toISOString() }])
  }, [])

  const saveOficio = useCallback((data: Oficio, isNew: boolean) => {
    setOficios(p => isNew ? [data, ...p] : p.map(o => o.id === data.id ? data : o))
    addLog((isNew ? 'Criou ' : 'Atualizou ') + data.numero, 'Ofícios', isNew ? 'create' : 'update')
  }, [addLog])

  const deleteOficio = useCallback((id: number) => {
    const o = oficios.find(x => x.id === id)
    setOficios(p => p.filter(x => x.id !== id))
    addLog('Excluiu ' + o?.numero, 'Ofícios', 'delete')
  }, [oficios, addLog])

  const saveProcesso = useCallback((data: Processo, isNew: boolean) => {
    setProcessos(p => isNew ? [data, ...p] : p.map(x => x.id === data.id ? data : x))
    addLog((isNew ? 'Criou ' : 'Atualizou ') + data.numero, 'Processos', isNew ? 'create' : 'update')
  }, [addLog])

  const deleteProcesso = useCallback((id: number) => {
    const p = processos.find(x => x.id === id)
    setProcessos(prev => prev.filter(x => x.id !== id))
    addLog('Excluiu ' + p?.numero, 'Processos', 'delete')
  }, [processos, addLog])

  const savePesquisa = useCallback((data: Pesquisa, isNew: boolean) => {
    setPesquisas(p => isNew ? [data, ...p] : p.map(x => x.id === data.id ? data : x))
    addLog((isNew ? 'Criou ' : 'Atualizou ') + data.numero, 'Pesquisas', isNew ? 'create' : 'update')
  }, [addLog])

  const deletePesquisa = useCallback((id: number) => {
    setPesquisas(p => p.filter(x => x.id !== id))
    addLog('Excluiu pesquisa', 'Pesquisas', 'delete')
  }, [addLog])

  const saveUsuario = useCallback((data: Usuario, isNew: boolean) => {
    setUsuarios(p => isNew ? [data, ...p] : p.map(u => u.id === data.id ? data : u))
  }, [])

  const deleteUsuario = useCallback((id: number) => {
    setUsuarios(p => p.filter(x => x.id !== id))
  }, [])

  return {
    oficios, setOficios, processos, setProcessos,
    pesquisas, setPesquisas, usuarios, setUsuarios, logs,
    addLog, saveOficio, deleteOficio, saveProcesso, deleteProcesso,
    savePesquisa, deletePesquisa, saveUsuario, deleteUsuario,
  }
}
