'use client'
/**
 * ProtectedElement — componente wrapper para elementos que requerem permissões
 */
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  require: string | string[]  // chave(s) de permissão necessária(s)
  fallback?: React.ReactNode  // o que mostrar se não tiver permissão
  children: React.ReactNode
  match?: 'any' | 'all'        // 'any' = uma ou mais (OR), 'all' = todas (AND)
}

export default function ProtectedElement({ require, children, fallback = null, match = 'all' }: Props) {
  const { tem, temTodas, temAlguma } = usePermissions()

  const reqs = typeof require === 'string' ? [require] : require
  const hasAccess = match === 'all' ? temTodas(reqs) : temAlguma(reqs)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  require: string | string[]
  match?: 'any' | 'all'
  children: React.ReactNode
}

/**
 * ProtectedButton — botão que se desabilita se não tiver permissão
 */
export function ProtectedButton({ require, match = 'all', children, ...props }: ProtectedButtonProps) {
  const { tem, temTodas, temAlguma } = usePermissions()
  const reqs = typeof require === 'string' ? [require] : require
  const hasAccess = match === 'all' ? temTodas(reqs) : temAlguma(reqs)

  return (
    <button
      {...props}
      disabled={!hasAccess || props.disabled}
      style={{
        ...props.style,
        opacity: !hasAccess ? 0.5 : (props.style as any)?.opacity || 1,
        cursor: !hasAccess ? 'not-allowed' : 'pointer'
      }}
      title={!hasAccess ? 'Você não tem permissão para isso' : props.title}
    >
      {children}
    </button>
  )
}
