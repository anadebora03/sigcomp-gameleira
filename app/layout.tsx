import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'SIGCOMP — Prefeitura de Gameleira',
  description: 'Sistema Integrado de Gestão de Compras — Prefeitura Municipal de Gameleira/PE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
