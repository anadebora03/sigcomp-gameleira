import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignora erro em Server Component
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('[createAdminClient] SERVICE ROLE EXISTS:', !!serviceRoleKey)
  console.log('[createAdminClient] SERVICE ROLE LENGTH:', serviceRoleKey?.length || 0)
  
  if (!serviceRoleKey) {
    console.error('[createAdminClient] ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada')
    console.error('[createAdminClient] Variáveis disponíveis:', {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Supabase admin operations')
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey)
}
