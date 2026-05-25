interface StatusItem { v:string; l:string; cor:string; bg:string }
interface Props { v?: string; list: StatusItem[]; sm?: boolean }

export default function StatusBadge({ v, list, sm }: Props) {
  const s = list.find(x => x.v === v) || list[0]
  return (
    <span style={{
      color: s.bg, background: s.cor, border: `1px solid ${s.cor}`,
      padding: sm ? '1px 7px' : '3px 9px',
      borderRadius: 999, fontSize: 10, fontWeight: 700,
      whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.7,
    }}>
      {s.l}
    </span>
  )
}
