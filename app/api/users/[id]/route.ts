import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Params {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = params.id
  const body = await request.json()

  console.log('[api/users/[id] PATCH] Recebido:', { userId, body })

  const updatePayload: Record<string, any> = {}
  if (body.nome !== undefined) updatePayload.nome = body.nome
  if (body.cargo !== undefined) updatePayload.cargo = body.cargo
  if (body.secretaria !== undefined) updatePayload.secretaria = body.secretaria
  if (body.perfil !== undefined) updatePayload.perfil = body.perfil
  if (body.status !== undefined) updatePayload.status = body.status

  if (Object.keys(updatePayload).length === 0) {
    console.warn('[api/users/[id] PATCH] Nenhum campo para atualizar')
    return NextResponse.json({ success: false, message: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('usuarios')
      .update(updatePayload)
      .eq('id', userId)

    console.log('[api/users/[id] PATCH] UPDATE resultado:', { userId, success: !error, error: error?.message })

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar usuário', error: error.message },
        { status: 500 }
      )
    }

    if (body.perfil !== undefined) {
      const { error: rpcError } = await supabase.rpc('regenerate_permissions', {
        p_user_id: userId,
      })

      console.log('[api/users/[id] PATCH] regenerate_permissions:', { userId, success: !rpcError, error: rpcError?.message })

      if (rpcError) {
        return NextResponse.json(
          { success: false, message: 'Erro ao regenerar permissões', error: rpcError.message },
          { status: 500 }
        )
      }
    }

    console.log('[api/users/[id] PATCH] Sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao atualizar usuário'
    console.error('[api/users/[id] PATCH] Exceção:', message, error)
    return NextResponse.json({ success: false, message, error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = params.id

  console.log('[api/users/[id] DELETE] Recebido:', { userId })

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId)

    console.log('[api/users/[id] DELETE] DELETE resultado:', { userId, success: !error, error: error?.message })

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Erro ao excluir usuário', error: error.message },
        { status: 500 }
      )
    }

    console.log('[api/users/[id] DELETE] Sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao excluir usuário'
    console.error('[api/users/[id] DELETE] Exceção:', message, error)
    return NextResponse.json({ success: false, message, error: message }, { status: 500 })
  }
}
