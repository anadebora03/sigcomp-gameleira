import type { OrdemFornecimento } from '@/lib/types'

/** Quantos dias antes do prazo a ordem passa a "Próximo do vencimento" */
export const DIAS_ALERTA_OF = 5

export type StatusOF = 'pendente' | 'proximo' | 'hoje' | 'atrasado' | 'entregue' | 'cancelada'

export const SOF: { v: StatusOF; l: string; cor: string; bg: string }[] = [
  { v: 'pendente', l: 'Pendente', cor: '#1e3a5f', bg: '#bfdbfe' },
  { v: 'proximo', l: 'Próximo do vencimento', cor: '#7a5800', bg: '#fef3c7' },
  { v: 'hoje', l: 'Vencendo hoje', cor: '#9a3412', bg: '#ffedd5' },
  { v: 'atrasado', l: 'Atrasado', cor: '#991b1b', bg: '#fecaca' },
  { v: 'entregue', l: 'Entregue', cor: '#065f46', bg: '#d1fae5' },
  { v: 'cancelada', l: 'Cancelado', cor: '#374151', bg: '#e5e7eb' },
]

/** Data de hoje (YYYY-MM-DD) no fuso do navegador — td() usa UTC e vira o dia às 21h em Brasília */
export function hojeLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Dias corridos de `de` até `ate` (datas YYYY-MM-DD), sem influência de fuso */
export function diasEntre(de: string, ate: string): number {
  const [y1, m1, d1] = de.split('-').map(Number)
  const [y2, m2, d2] = ate.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

export function statusOF(o: Pick<OrdemFornecimento, 'status' | 'prazo_final_entrega'>, hoje = hojeLocal()): StatusOF {
  if (o.status === 'entregue') return 'entregue'
  if (o.status === 'cancelada') return 'cancelada'
  const d = diasEntre(hoje, o.prazo_final_entrega)
  if (d < 0) return 'atrasado'
  if (d === 0) return 'hoje'
  if (d <= DIAS_ALERTA_OF) return 'proximo'
  return 'pendente'
}

export const labelStatusOF = (s: StatusOF) => SOF.find(x => x.v === s)?.l || s

/** Frase de alerta: "Ordem de Fornecimento nº 015/2026 está atrasada." */
export function mensagemAlertaOF(o: OrdemFornecimento, hoje = hojeLocal()): string {
  const d = diasEntre(hoje, o.prazo_final_entrega)
  const n = `Ordem de Fornecimento nº ${o.numero_ordem}`
  if (d < 0) return `${n} está atrasada${-d === 1 ? ' (1 dia)' : ` (${-d} dias)`}.`
  if (d === 0) return `${n} vence hoje.`
  return `${n} vence em ${d} ${d === 1 ? 'dia' : 'dias'}.`
}

/** Ordens que geram alerta (atrasadas, vencendo hoje, próximas), mais urgentes primeiro */
export function alertasOF(ordens: OrdemFornecimento[], hoje = hojeLocal()) {
  return ordens
    .filter(o => ['atrasado', 'hoje', 'proximo'].includes(statusOF(o, hoje)))
    .sort((a, b) => a.prazo_final_entrega.localeCompare(b.prazo_final_entrega))
}

export function resumoOF(ordens: OrdemFornecimento[], hoje = hojeLocal()) {
  const r = { total: ordens.length, pendente: 0, proximo: 0, hoje: 0, atrasado: 0, entregue: 0, cancelada: 0 }
  ordens.forEach(o => { r[statusOF(o, hoje)]++ })
  return r
}
