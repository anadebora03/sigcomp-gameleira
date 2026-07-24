'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthContext } from '@/hooks/useAuth'
import type { User, Session } from '@supabase/supabase-js'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)

    // Get initial session
    console.log('[AuthProvider] Inicializando...')
    client.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] getSession retornou:', { 
        hasSession: !!session, 
        user: session?.user?.id,
        email: session?.user?.email 
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthProvider] onAuthStateChange:', { 
        event: _event,
        hasSession: !!session, 
        user: session?.user?.id,
        email: session?.user?.email 
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const client = supabase ?? createClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    const client = supabase ?? createClient()
    await client.auth.signOut()
  }

  async function resetPassword(email: string) {
    const client = supabase ?? createClient()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })
    return { error: error?.message ?? null }
  }

  async function updatePassword(password: string) {
    const client = supabase ?? createClient()
    const { error } = await client.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
