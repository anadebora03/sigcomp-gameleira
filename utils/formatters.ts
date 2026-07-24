export const td=()=>new Date().toISOString().split('T')[0]
export const fD=(d?:string)=>d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR'):'--'
export const fDT=(d?:string)=>d?new Date(d).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'--'

export function parseCurrencyInput(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  const text = String(value).trim()
  if (!text) return 0

  const normalized = text
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatCurrency(value: unknown, options?: Intl.NumberFormatOptions) {
  const numeric = parseCurrencyInput(value)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', ...options }).format(numeric)
}

export const fR=(v?:string|number)=>v!==undefined&&v!==null&&v!==''?formatCurrency(v):'--'
export const fKB=(b?:number)=>!b?'0 KB':b>1048576?`${(b/1048576).toFixed(1)} MB`:`${(b/1024).toFixed(0)} KB`
export const fmtM=(m?:string)=>{
  if(!m)return'--'
  const[y,mo]=m.split('-')
  return['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Number(mo)]+'/'+y
}
export const isOv=(p?:string)=>!!p&&new Date(p)<new Date(td()+'T00:00:00')
export const isSn=(p?:string)=>{
  if(!p)return false
  const d=(new Date(p).getTime()-new Date(td()+'T00:00:00').getTime())/86400000
  return d>=0&&d<=5
}
export const nOf=(l:any[])=>`OFF-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
export const nPl=(l:any[])=>`PL-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
export const nPq=(l:any[])=>`PQ-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
