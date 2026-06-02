import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { CreateUserRequest } from '@/services/auth'

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as CreateUserRequest
    
    console.log('[invite] POST recebido:', { email: data.email, nome: data.nome })

    if (!data.email || !data.nome || !data.cargo || !data.perfil) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados incompletos para criar o convite.',
        },
        { status: 400 }
      )
    }

    console.log('[invite] Criando admin client...')
    const supabase = createAdminClient()
    console.log('[invite] Admin client criado com sucesso')
    
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sigcomp-gameleira-irnl.vercel.app'}/nova-senha`

    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
      redirectTo,
      data: {
        nome: data.nome,
        cargo: data.cargo,
        perfil: data.perfil,
        secretaria: data.secretaria,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao enviar convite de usuário.',
          error: authError?.message || 'Erro desconhecido ao convidar.',
        },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    const { error: insertError } = await supabase.from('usuarios').insert({
      id: userId,
      email: data.email,
      nome: data.nome,
      cargo: data.cargo,
      secretaria: data.secretaria,
      perfil: data.perfil,
      status: 'convite_enviado',
    })

    if (insertError) {
      await supabase.auth.admin.deleteUser(userId).catch(() => null)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao armazenar usuário.',
          error: insertError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Convite enviado por email com sucesso.',
      userId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao processar o convite.'
    return NextResponse.json(
      {
        success: false,
        message,
        error: message,
      },
      { status: 500 }
    )
  }
}
