'use client'
/**
 * PermissoesSelector — componente para selecionar permissões por módulo
 */
import { MODULOS_PERMISSOES, PERFIS_PERMISSOES, GREEN_CHECK } from '@/lib/constants'

interface Props {
  permissoes: Record<string, boolean>
  onChange: (permissoes: Record<string, boolean>) => void
  perfil: string
  onPerfilChange: (perfil: string) => void
}

export default function PermissoesSelector({ permissoes, onChange, perfil, onPerfilChange }: Props) {
  function aplicarPerfil(perfil: string) {
    onPerfilChange(perfil)
    const novasPerms = PERFIS_PERMISSOES[perfil] || {}
    onChange(novasPerms)
  }

  function togglePermissao(chave: string) {
    onChange({
      ...permissoes,
      [chave]: !permissoes[chave]
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Modelo de perfil */}
      <div style={{ background: '#f0f4f8', border: '1px solid #d4dce6', borderRadius: 10, padding: '12px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#0F1E3A', textTransform: 'uppercase', marginBottom: 10 }}>
          Modelo de Perfil
        </p>
        <p style={{ fontSize: 11, color: '#334155', marginBottom: 10 }}>
          Selecione um modelo para preencher automaticamente as permissões.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['administrador', 'diretor_compras', 'setor_compras', 'secretaria', 'visualizador'].map((p) => (
            <button
              key={p}
              onClick={() => aplicarPerfil(p)}
              style={{
                padding: '8px 12px',
                background: perfil === p ? '#0F1E3A' : '#e2e8f0',
                color: perfil === p ? '#fff' : '#0F1E3A',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'inherit',
                transition: 'all .2s'
              }}
            >
              {p === 'administrador' && 'Administrador'}
              {p === 'diretor_compras' && 'Diretor Compras'}
              {p === 'setor_compras' && 'Setor Compras'}
              {p === 'secretaria' && 'Secretaria'}
              {p === 'visualizador' && 'Visualizador'}
            </button>
          ))}
        </div>
      </div>

      {/* Permissões por módulo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
          Permissões Detalhadas
        </p>

        {Object.entries(MODULOS_PERMISSOES).map(([modulo, config]: any) => (
          <div
            key={modulo}
            style={{
              background: 'var(--inp)',
              border: '1px solid var(--brd)',
              borderRadius: 10,
              padding: '12px 14px',
              overflow: 'hidden'
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--txt)', marginBottom: 10 }}>
              {config.label}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {config.permissoes.map((perm: any) => (
                <label
                  key={perm.chave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 6,
                    transition: 'background .1s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={permissoes[perm.chave] === true}
                    onChange={() => togglePermissao(perm.chave)}
                    style={{
                      cursor: 'pointer',
                      width: 16,
                      height: 16,
                      accentColor: GREEN_CHECK
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--txt)', fontWeight: 600 }}>
                    {perm.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
