import { gS } from '@/utils/helpers'
export default function SecretariaAvatar({ id, size=30 }: { id?: number; size?: number }) {
  const s = gS(id)
  return (
    <div style={{
      width:size, height:size, borderRadius:size*.28,
      background:s.cor, display:'flex', alignItems:'center',
      justifyContent:'center', color:'#fff', fontWeight:900,
      fontSize:size*.34, flexShrink:0,
    }}>
      {s.sigla.slice(0,2)}
    </div>
  )
}
