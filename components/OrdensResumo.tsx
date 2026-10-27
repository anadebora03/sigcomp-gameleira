'use client'
import { Ic, Card, G } from '@/components/ui/atoms'
import { useMob } from '@/hooks/useMob'
import { resumoOF } from '@/utils/ordens'
import type { OrdemFornecimento } from '@/lib/types'

/** Resumo das ordens de fornecimento (antes no Dashboard, agora no topo da aba Ordens de Fornecimento) */
export default function OrdensResumo({ ordens }: { ordens: OrdemFornecimento[] }) {
  const mob = useMob()
  const rOF = resumoOF(ordens)
  const cardsOF = [
    { l: 'Total', v: rOF.total, cor: G },
    { l: 'Pendentes', v: rOF.pendente, cor: '#1e3a5f' },
    { l: 'Próximas do vencimento', v: rOF.proximo, cor: '#a07800' },
    { l: 'Vencendo hoje', v: rOF.hoje, cor: '#ea580c' },
    { l: 'Atrasadas', v: rOF.atrasado, cor: '#dc2626' },
    { l: 'Entregues', v: rOF.entregue, cor: '#065f46' },
  ]
  return (
    <Card style={{ padding: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Ic n='truck' z={16} c={G} />Ordens de Fornecimento
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 10 }}>
        {cardsOF.map(c => (
          <div key={c.l} style={{ background: 'var(--inp)', borderRadius: 11, padding: '11px 12px', borderLeft: `3px solid ${c.cor}` }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: c.cor, lineHeight: 1 }}>{c.v}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginTop: 5 }}>{c.l}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
