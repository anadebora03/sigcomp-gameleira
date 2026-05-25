export const fD = (d?: string) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '--'

export const fDT = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }) : '--'

export const fR = (v?: string | number) =>
  v ? Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) : '--'

export const fKB = (b?: number) => {
  if (!b) return '0 KB'
  return b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`
}

export const fmtM = (m?: string) => {
  if (!m) return '--'
  const [y, mo] = m.split('-')
  const n = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return n[Number(mo)] + '/' + y
}

export const td = () => new Date().toISOString().split('T')[0]

export const isOv = (p?: string) => p ? new Date(p) < new Date(td() + 'T00:00:00') : false

export const isSn = (p?: string) => {
  if (!p) return false
  const d = (new Date(p).getTime() - new Date(td() + 'T00:00:00').getTime()) / 86400000
  return d >= 0 && d <= 5
}

export const nOf = (l: any[]) =>
  `OFF-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
export const nPl = (l: any[]) =>
  `PL-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
export const nPq = (l: any[]) =>
  `PQ-${new Date().getFullYear()}-${String(l.length+1).padStart(4,'0')}`
