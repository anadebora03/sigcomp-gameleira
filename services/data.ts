import { createClient } from '@/lib/supabase/client'
import type { Oficio, Processo, Pesquisa, Log, Secretaria } from '@/lib/types'

function client() {
  return createClient()
}

export async function listOficios(): Promise<{ success: boolean; data?: Oficio[]; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('oficios').select('*').order('id', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}

export async function saveOficio(oficio: Oficio, isNew: boolean): Promise<{ success: boolean; data?: Oficio; error?: string }> {
  const supabase = client()
  const { id, ...payload } = oficio as any

  if (isNew) {
    const { data, error } = await supabase
      .from('oficios')
      .insert({
        ...payload,
        historico: oficio.historico || [],
        comentarios: oficio.comentarios || [],
        anexos: oficio.anexos || [],
      })
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Erro ao criar ofício' }
    }

    return { success: true, data }
  }

  const { data, error } = await supabase
    .from('oficios')
    .update({
      ...payload,
      historico: oficio.historico || [],
      comentarios: oficio.comentarios || [],
      anexos: oficio.anexos || [],
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message || 'Erro ao atualizar ofício' }
  }

  return { success: true, data }
}

export async function deleteOficio(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = client()
  const { error } = await supabase.from('oficios').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function listProcessos(): Promise<{ success: boolean; data?: Processo[]; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('processos').select('*').order('id', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}

export async function saveProcesso(processo: Processo, isNew: boolean): Promise<{ success: boolean; data?: Processo; error?: string }> {
  const supabase = client()
  const { id, ...payload } = processo as any

  if (isNew) {
    const { data, error } = await supabase
      .from('processos')
      .insert({
        ...payload,
        anexos: processo.anexos || [],
        contrato: processo.contrato || null,
      })
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Erro ao criar processo' }
    }

    return { success: true, data }
  }

  const { data, error } = await supabase
    .from('processos')
    .update({
      ...payload,
      anexos: processo.anexos || [],
      contrato: processo.contrato || null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message || 'Erro ao atualizar processo' }
  }

  return { success: true, data }
}

export async function deleteProcesso(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = client()
  const { error } = await supabase.from('processos').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function listPesquisas(): Promise<{ success: boolean; data?: Pesquisa[]; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('pesquisas').select('*').order('id', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}

export async function savePesquisa(pesquisa: Pesquisa, isNew: boolean): Promise<{ success: boolean; data?: Pesquisa; error?: string }> {
  const supabase = client()
  const { id, ...payload } = pesquisa as any

  if (isNew) {
    const { data, error } = await supabase
      .from('pesquisas')
      .insert({
        ...payload,
        fornecedores: pesquisa.fornecedores || [],
        anexos: pesquisa.anexos || [],
      })
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Erro ao criar pesquisa' }
    }

    return { success: true, data }
  }

  const { data, error } = await supabase
    .from('pesquisas')
    .update({
      ...payload,
      fornecedores: pesquisa.fornecedores || [],
      anexos: pesquisa.anexos || [],
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message || 'Erro ao atualizar pesquisa' }
  }

  return { success: true, data }
}

export async function deletePesquisa(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = client()
  const { error } = await supabase.from('pesquisas').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function listLogs(): Promise<{ success: boolean; data?: Log[]; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('logs').select('*').order('id', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}

export async function createLog(log: Omit<Log, 'id'>): Promise<{ success: boolean; data?: Log; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('logs').insert(log).select('*').single()
  if (error || !data) {
    return { success: false, error: error?.message || 'Erro ao salvar log' }
  }
  return { success: true, data }
}

export async function listSecretarias(): Promise<{ success: boolean; data?: Secretaria[]; error?: string }> {
  const supabase = client()
  const { data, error } = await supabase.from('secretarias').select('*').order('id', { ascending: true })
  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}
