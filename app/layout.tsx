import type { Metadata } from 'next'
import '@/styles/globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'SIGCOMP — Prefeitura de Gameleira',
  description: 'Sistema Integrado de Gestão de Compras — Prefeitura Municipal de Gameleira/PE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
