import { createClient } from '@/lib/supabase/client'
import type { Oficio, Processo, Pesquisa, Log, Secretaria, OrdemFornecimento } from '@/lib/types'

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

export async function listOrdens(): Promise<{ success: boolean; data?: OrdemFornecimento[]; error?: string }> {
  try {
    console.log('[data] carregando ordens de fornecimento do Supabase')
    const supabase = client()
    const { data, error } = await supabase.from('ordens_fornecimento').select('*').order('prazo_final_entrega', { ascending: true })
    if (error) {
      console.error('[data] erro ao carregar ordens de fornecimento:', error.message)
      return { success: false, error: error.message }
    }
    console.log('[data] ordens de fornecimento carregadas com sucesso:', data?.length || 0)
    return { success: true, data: data || [] }
  } catch (err) {
    console.error('[data] erro ao carregar ordens de fornecimento:', err)
    return { success: false, error: String(err) }
  }
}

/** Converte erros do Postgres em mensagens amigáveis */
function erroOrdem(message?: string) {
  if (!message) return 'Erro ao salvar ordem de fornecimento'
  if (message.includes('ordens_fornecimento_numero_ordem_key')) return 'Já existe uma ordem com esse número.'
  if (message.includes('ordens_prazo_apos_envio')) return 'O prazo final não pode ser anterior à data de envio.'
  if (message.includes('ordens_entregue_tem_data')) return 'Informe a data da entrega.'
  if (message.includes('row-level security')) return 'Sem permissão para salvar no banco (RLS).'
  return message
}

export async function saveOrdem(ordem: OrdemFornecimento, isNew: boolean): Promise<{ success: boolean; data?: OrdemFornecimento; error?: string }> {
  try {
    console.log('[data] salvando ordem de fornecimento no Supabase:', ordem.numero_ordem, '(isNew=' + isNew + ')')
    const supabase = client()
    const { id, created_by, created_at, updated_at, ...payload } = ordem as any
    // Datas opcionais vazias precisam ir como null para colunas DATE
    payload.data_emissao = payload.data_emissao || null
    payload.data_entrega = payload.data_entrega || null
    payload.processo_id = payload.processo_id || null

    const query = isNew
      ? supabase.from('ordens_fornecimento').insert(payload)
      : supabase.from('ordens_fornecimento').update(payload).eq('id', id)
    const { data, error } = await query.select('*').single()

    if (error || !data) {
      console.error('[data] erro ao salvar ordem de fornecimento:', error?.message || 'dados nulos')
      return { success: false, error: erroOrdem(error?.message) }
    }

    console.log('[data] ordem de fornecimento salva com sucesso:', data.numero_ordem)
    return { success: true, data }
  } catch (err) {
    console.error('[data] erro ao salvar ordem de fornecimento:', err)
    return { success: false, error: String(err) }
  }
}

export async function deleteOrdem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[data] deletando ordem de fornecimento:', id)
    const supabase = client()
    // .select() devolve as linhas apagadas: sem isso, um DELETE barrado pelo RLS "passa" sem apagar nada
    const { data, error } = await supabase.from('ordens_fornecimento').delete().eq('id', id).select('id')
    if (error) {
      console.error('[data] erro ao deletar ordem de fornecimento:', error.message)
      return { success: false, error: error.message }
    }
    if (!data?.length) return { success: false, error: 'A ordem não foi excluída (sem permissão ou já removida).' }
    console.log('[data] ordem de fornecimento deletada com sucesso:', id)
    return { success: true }
  } catch (err) {
    console.error('[data] erro ao deletar ordem de fornecimento:', err)
    return { success: false, error: String(err) }
  }
}

export const LIMITE_LOGS = 200

export async function listLogs(): Promise<{ success: boolean; data?: Log[]; error?: string }> {
  try {
    console.log('[data] carregando logs do Supabase')
    const supabase = client()
    // Só os mais recentes: o histórico completo continua no banco, mas não é baixado a cada login
    const { data, error } = await supabase.from('logs').select('*').order('id', { ascending: false }).limit(LIMITE_LOGS)
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

