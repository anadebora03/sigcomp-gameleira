import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? '50')
    const offset = Number(url.searchParams.get('offset') ?? '0')

    console.log('[api/users/list] GET recebido:', { limit, offset })

    const supabase = createAdminClient()
    console.log('[api/users/list] Admin client criado com sucesso')

    const { data, error, count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('[api/users/list] Query executada:', { 
      error: error?.message, 
      dataLength: data?.length, 
      count,
      errorCode: error?.code,
      errorDetails: error?.details
    })

    if (error) {
      console.error('[api/users/list] ERRO do Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return NextResponse.json(
        { success: false, message: 'Erro ao listar usuários', error: error.message },
        { status: 500 }
      )
    }

    console.log('[api/users/list] Retornando:', data?.length ?? 0, 'usuários')
    return NextResponse.json({ success: true, data: data ?? [], count: count ?? 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao listar usuários'
    console.error('[api/users/list] EXCEÇÃO:', message, error)
    return NextResponse.json({ success: false, message, error: message }, { status: 500 })
  }
}
