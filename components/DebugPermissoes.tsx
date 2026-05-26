'use client'
/**
 * DebugPermissoes - Componente para debug de permissões (remover em produção)
 * Use apenas para desenvolvimento!
 * 
 * Adicione ao final de App.tsx dentro de <main>:
 * {process.env.NODE_ENV === 'development' && <DebugPermissoes />}
 */

import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

export default function DebugPermissoes() {
  const { user } = useAuth()
  const { perfil, permissoes } = usePermissions()

  const metadata = user?.user_metadata || {}
  const appMetadata = user?.app_metadata || {}

  const permissoesList = Object.entries(permissoes)
    .filter(([_, v]) => v === true)
    .map(([k]) => k)

  return (
    <details style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#1a1a1a',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: 8,
      fontSize: 11,
      fontFamily: 'monospace',
      maxWidth: 400,
      maxHeight: 300,
      overflowY: 'auto',
      border: '1px solid #444',
      zIndex: 10000,
    }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 8 }}>
        🔐 Debug Permissões ({permissoesList.length})
      </summary>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Usuário */}
        <div>
          <strong>Email:</strong> {user?.email || 'N/A'}
        </div>

        {/* Perfil */}
        <div>
          <strong>Perfil Detectado:</strong>
          <div style={{ 
            background: '#0f1e3a', 
            padding: '4px 8px', 
            borderRadius: 4,
            marginTop: 4,
            color: '#4ade80'
          }}>
            {perfil}
          </div>
        </div>

        {/* User Metadata */}
        <div>
          <strong>user_metadata:</strong>
          <pre style={{
            background: '#0a0a0a',
            padding: '4px 8px',
            borderRadius: 4,
            marginTop: 4,
            overflow: 'auto',
            maxHeight: 100,
            fontSize: 9
          }}>
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>

        {/* App Metadata */}
        <div>
          <strong>app_metadata:</strong>
          <pre style={{
            background: '#0a0a0a',
            padding: '4px 8px',
            borderRadius: 4,
            marginTop: 4,
            overflow: 'auto',
            maxHeight: 100,
            fontSize: 9
          }}>
            {JSON.stringify(appMetadata, null, 2)}
          </pre>
        </div>

        {/* Permissões */}
        <div>
          <strong>Permissões Ativas ({permissoesList.length}):</strong>
          <div style={{
            background: '#0a0a0a',
            padding: '4px 8px',
            borderRadius: 4,
            marginTop: 4,
            maxHeight: 150,
            overflowY: 'auto'
          }}>
            {permissoesList.length > 0 ? (
              permissoesList.map(p => (
                <div key={p} style={{ color: '#10b981', fontSize: 9 }}>
                  ✓ {p}
                </div>
              ))
            ) : (
              <div style={{ color: '#ef4444' }}>Nenhuma permissão</div>
            )}
          </div>
        </div>

        {/* Status */}
        <div style={{
          background: perfil === 'administrador' || perfil === 'diretor_compras' ? '#1a4d2e' : '#3a3a3a',
          padding: '8px 12px',
          borderRadius: 4,
          marginTop: 8,
          textAlign: 'center',
          fontSize: 10
        }}>
          {perfil === 'administrador' && '👑 Admin - Acesso Total'}
          {perfil === 'diretor_compras' && '👔 Diretor - Acesso Total'}
          {perfil === 'setor_compras' && '🏢 Setor de Compras'}
          {perfil === 'secretaria' && '📋 Secretaria'}
          {perfil === 'visualizador' && '👁️ Visualizador'}
        </div>

        {/* Teste de Permissões Específicas */}
        <div>
          <strong>Testes:</strong>
          <div style={{ marginTop: 4, fontSize: 9 }}>
            <div>
              tem('usuarios.ver'): {useTestPermission('usuarios.ver')}
            </div>
            <div>
              tem('sistema.logs'): {useTestPermission('sistema.logs')}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}

function useTestPermission(permissao: string): string {
  const { tem } = usePermissions()
  const resultado = tem(permissao)
  return resultado ? '✓ SIM' : '✗ NÃO'
}