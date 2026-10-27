import type { Metadata } from 'next'
import '@/styles/globals.css'
import AuthProvider from '@/components/AuthProvider'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SIGCOMP — Prefeitura de Gameleira',
  description: 'Sistema Integrado de Gestão de Compras — Prefeitura Municipal de Gameleira/PE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
