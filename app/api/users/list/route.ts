import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? '50')
    const offset = Number(url.searchParams.get('offset') ?? '0')

    const supabase = createAdminClient()

    const { data, error, count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Erro ao listar usuários', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data ?? [], count: count ?? 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao listar usuários'
    return NextResponse.json({ success: false, message, error: message }, { status: 500 })
  }
}
