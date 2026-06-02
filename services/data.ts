import { createClient } from '@/lib/supabase/client'
import type { Oficio, Processo, Pesquisa, Log, Secretaria } from '@/lib/types'

function client() {
  return createClient()
}

export async function listOficios(): Promise<{ success: boolean; data?: Oficio[]; error?: string }> {
  try {
    console.log('[data] carregando ofícios do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('oficios').select('*').order('id', { ascending: false })

    if (error) {
      console.error('[data] erro ao carregar ofícios:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] ofícios carregados com sucesso:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (err) {
    console.error('[data] erro ao carregar ofícios:', err)
    return { success: false, error: String(err) }
  }
}

export async function saveOficio(oficio: Oficio, isNew: boolean): Promise<{ success: boolean; data?: Oficio; error?: string }> {
  try {
    console.log('[data] salvando ofício no Supabase:', oficio.numero, '(isNew=' + isNew + ')')
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
        console.error('[data] erro ao criar ofício:', error?.message || 'dados nulos')
        return { success: false, error: error?.message || 'Erro ao criar ofício' }
      }

      console.log('[data] ofício criado com sucesso:', data.numero)
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
      console.error('[data] erro ao atualizar ofício:', error?.message || 'dados nulos')
      return { success: false, error: error?.message || 'Erro ao atualizar ofício' }
    }

    console.log('[data] ofício atualizado com sucesso:', data.numero)
    return { success: true, data }
  } catch (err) {
    console.error('[data] erro ao salvar ofício:', err)
    return { success: false, error: String(err) }
  }
}

export async function deleteOficio(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[data] deletando ofício:', id)
    const supabase = client()
    const { error } = await supabase.from('oficios').delete().eq('id', id)
    if (error) {
      console.error('[data] erro ao deletar ofício:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] ofício deletado com sucesso:', id)
    return { success: true }
  } catch (err) {
    console.error('[data] erro ao deletar ofício:', err)
    return { success: false, error: String(err) }
  }
}

export async function listProcessos(): Promise<{ success: boolean; data?: Processo[]; error?: string }> {
  try {
    console.log('[data] carregando processos do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('processos').select('*').order('id', { ascending: false })
    if (error) {
      console.error('[data] erro ao carregar processos:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] processos carregados com sucesso:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (err) {
    console.error('[data] erro ao carregar processos:', err)
    return { success: false, error: String(err) }
  }
}

export async function saveProcesso(processo: Processo, isNew: boolean): Promise<{ success: boolean; data?: Processo; error?: string }> {
  try {
    console.log('[data] salvando processo no Supabase:', processo.numero, '(isNew=' + isNew + ')')
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
        console.error('[data] erro ao criar processo:', error?.message || 'dados nulos')
        return { success: false, error: error?.message || 'Erro ao criar processo' }
      }

      console.log('[data] processo criado com sucesso:', data.numero)
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
      console.error('[data] erro ao atualizar processo:', error?.message || 'dados nulos')
      return { success: false, error: error?.message || 'Erro ao atualizar processo' }
    }

    console.log('[data] processo atualizado com sucesso:', data.numero)
    return { success: true, data }
  } catch (err) {
    console.error('[data] erro ao salvar processo:', err)
    return { success: false, error: String(err) }
  }
}

export async function deleteProcesso(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[data] deletando processo:', id)
    const supabase = client()
    const { error } = await supabase.from('processos').delete().eq('id', id)
    if (error) {
      console.error('[data] erro ao deletar processo:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] processo deletado com sucesso:', id)
    return { success: true }
  } catch (err) {
    console.error('[data] erro ao deletar processo:', err)
    return { success: false, error: String(err) }
  }
}

export async function listPesquisas(): Promise<{ success: boolean; data?: Pesquisa[]; error?: string }> {
  try {
    console.log('[data] carregando pesquisas de preço do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('pesquisas_preco').select('*').order('id', { ascending: false })
    if (error) {
      console.error('[data] erro ao carregar pesquisas de preço:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] pesquisas de preço carregadas com sucesso:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (err) {
    console.error('[data] erro ao carregar pesquisas de preço:', err)
    return { success: false, error: String(err) }
  }
}

export async function savePesquisa(pesquisa: Pesquisa, isNew: boolean): Promise<{ success: boolean; data?: Pesquisa; error?: string }> {
  try {
    console.log('[data] salvando pesquisa de preço no Supabase:', pesquisa.numero, '(isNew=' + isNew + ')')
    const supabase = client()
    const { id, ...payload } = pesquisa as any

    if (isNew) {
      const { data, error } = await supabase
        .from('pesquisas_preco')
        .insert({
          ...payload,
          fornecedores: pesquisa.fornecedores || [],
          anexos: pesquisa.anexos || [],
        })
        .select('*')
        .single()

      if (error || !data) {
        console.error('[data] erro ao criar pesquisa de preço:', error?.message || 'dados nulos')
        return { success: false, error: error?.message || 'Erro ao criar pesquisa de preço' }
      }

      console.log('[data] pesquisa de preço criada com sucesso:', data.numero)
      return { success: true, data }
    }

    const { data, error } = await supabase
      .from('pesquisas_preco')
      .update({
        ...payload,
        fornecedores: pesquisa.fornecedores || [],
        anexos: pesquisa.anexos || [],
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      console.error('[data] erro ao atualizar pesquisa de preço:', error?.message || 'dados nulos')
      return { success: false, error: error?.message || 'Erro ao atualizar pesquisa de preço' }
    }

    console.log('[data] pesquisa de preço atualizada com sucesso:', data.numero)
    return { success: true, data }
  } catch (err) {
    console.error('[data] erro ao salvar pesquisa de preço:', err)
    return { success: false, error: String(err) }
  }
}

export async function deletePesquisa(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[data] deletando pesquisa de preço:', id)
    const supabase = client()
    const { error } = await supabase.from('pesquisas_preco').delete().eq('id', id)
    if (error) {
      console.error('[data] erro ao deletar pesquisa de preço:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] pesquisa de preço deletada com sucesso:', id)
    return { success: true }
  } catch (err) {
    console.error('[data] erro ao deletar pesquisa de preço:', err)
    return { success: false, error: String(err) }
  }
}

export async function listLogs(): Promise<{ success: boolean; data?: Log[]; error?: string }> {
  try {
    console.log('[data] carregando logs do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('logs').select('*').order('id', { ascending: false })
    if (error) {
      console.error('[data] erro ao carregar logs:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] logs carregados com sucesso:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (err) {
    console.error('[data] erro ao carregar logs:', err)
    return { success: false, error: String(err) }
  }
}

export async function createLog(log: Omit<Log, 'id'>): Promise<{ success: boolean; data?: Log; error?: string }> {
  try {
    console.log('[data] criando log no Supabase:', log.tipo)
    const supabase = client()
    const { data, error } = await supabase.from('logs').insert(log).select('*').single()
    if (error || !data) {
      console.error('[data] erro ao criar log:', error?.message || 'dados nulos')
      return { success: false, error: error?.message || 'Erro ao salvar log' }
    }
    console.log('[data] log criado com sucesso')
    return { success: true, data }
  } catch (err) {
    console.error('[data] erro ao criar log:', err)
    return { success: false, error: String(err) }
  }
}

export async function listSecretarias(): Promise<{ success: boolean; data?: Secretaria[]; error?: string }> {
  try {
    console.log('[data] carregando secretarias do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('secretarias').select('*').order('legacy_id', { ascending: true })
    if (error) {
      console.error('[data] erro ao carregar secretarias:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] secretarias carregadas com sucesso:', data?.length || 0)

    // Mapear para o formato esperado pelo frontend (id numérico = legacy_id)
    const mapped = (data || []).map((s: any) => ({ id: Number(s.legacy_id || s.id), nome: s.nome, sigla: s.sigla, cor: s.cor }))

    try {
      // Atualizar lista in-memory de SECS para compatibilidade com helpers que usam SECS
      const consts = await import('@/lib/constants')
      if (consts && Array.isArray(consts.SECS)) {
        consts.SECS.length = 0
        mapped.forEach((m: any) => consts.SECS.push(m))
      }
    } catch (e) {
      // não fatal — apenas log
      console.warn('[data] nao foi possivel sincronizar SECS em memoria:', e)
    }

    return { success: true, data: mapped }
  } catch (err) {
    console.error('[data] erro ao carregar secretarias:', err)
    return { success: false, error: String(err) }
  }
}

