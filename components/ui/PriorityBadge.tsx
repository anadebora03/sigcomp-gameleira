import { PRI } from '@/lib/constants'
export default function PriorityBadge({ v }: { v?: string }) {
  const p = PRI.find(x => x.v === v) || PRI[0]
  return (
    <span style={{
      color: p.bg, background: p.cor, border: `1px solid ${p.cor}`,
      padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800,
      whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.7,
    }}>
      {p.l}
    </span>
  )
}
