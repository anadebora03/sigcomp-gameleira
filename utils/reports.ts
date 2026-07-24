export type ReportType = 'oficios' | 'processos' | 'pesquisas' | 'secretarias' | 'usuarios'

export interface ReportFilterState {
  startDate?: string
  endDate?: string
  status?: string
  secretaria?: string
}

interface ReportDefinition {
  title: string
  headers: string[]
  rows: string[][]
}

import { formatCurrency, parseCurrencyInput } from '@/utils/formatters'

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function formatDate(value?: string) {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

export function buildReport(type: ReportType, data: any, filters: ReportFilterState = {}) {
  const filtered = { ...data }

  if (type === 'oficios') {
    const rows = (data.oficios || []).filter((item: any) => {
      const matchesDate = (!filters.startDate || item.data >= filters.startDate) && (!filters.endDate || item.data <= filters.endDate)
      const matchesStatus = !filters.status || item.status === filters.status
      const matchesSecretaria = !filters.secretaria || String(item.secretaria_id) === String(filters.secretaria)
      return matchesDate && matchesStatus && matchesSecretaria
    })

    return {
      title: 'Relatório de Ofícios',
      headers: ['Número', 'Secretaria', 'Assunto', 'Status', 'Data', 'Prazo', 'Responsável'],
      rows: rows.map((item: any) => [item.numero || '--', item.secretaria_nome || '--', item.assunto || '--', item.status || '--', formatDate(item.data), formatDate(item.prazo), item.responsavel || '--']),
    } as ReportDefinition
  }

  if (type === 'processos') {
    const rows = (data.processos || []).filter((item: any) => {
      const matchesDate = (!filters.startDate || item.data_abertura >= filters.startDate) && (!filters.endDate || item.data_abertura <= filters.endDate)
      const matchesStatus = !filters.status || item.status === filters.status
      const matchesSecretaria = !filters.secretaria || String(item.secretaria_id) === String(filters.secretaria)
      return matchesDate && matchesStatus && matchesSecretaria
    })

    return {
      title: 'Relatório de Processos Licitatórios',
      headers: ['Número', 'Secretaria', 'Assunto', 'Status', 'Modalidade', 'Valor Estimado', 'Valor Final', 'Responsável'],
      rows: rows.map((item: any) => [item.numero || '--', item.secretaria_nome || '--', item.assunto || '--', item.status || '--', item.modalidade || '--', formatCurrency(parseCurrencyInput(item.valor_estimado)), formatCurrency(parseCurrencyInput(item.valor_final)), item.responsavel || '--']),
    } as ReportDefinition
  }

  if (type === 'pesquisas') {
    const rows = (data.pesquisas || []).filter((item: any) => {
      const matchesDate = (!filters.startDate || item.periodo >= filters.startDate) && (!filters.endDate || item.periodo <= filters.endDate)
      const matchesStatus = !filters.status || item.status === filters.status
      const matchesSecretaria = !filters.secretaria || String(item.secretaria_id) === String(filters.secretaria)
      return matchesDate && matchesStatus && matchesSecretaria
    })

    return {
      title: 'Relatório de Pesquisas de Preço',
      headers: ['Número', 'Secretaria', 'Objeto', 'Status', 'Período', 'Responsável', 'Fornecedores'],
      rows: rows.map((item: any) => [item.numero || '--', item.secretaria_nome || '--', item.objeto || '--', item.status || '--', item.periodo || '--', item.responsavel || '--', String(item.fornecedores?.length || 0)]),
    } as ReportDefinition
  }

  if (type === 'secretarias') {
    const rows = (data.secretarias || []).filter((item: any) => {
      const matchesSecretaria = !filters.secretaria || String(item.id) === String(filters.secretaria)
      return matchesSecretaria
    })

    return {
      title: 'Relatório de Secretarias',
      headers: ['ID', 'Nome', 'Sigla', 'Cor'],
      rows: rows.map((item: any) => [String(item.id || '--'), item.nome || '--', item.sigla || '--', item.cor || '--']),
    } as ReportDefinition
  }

  if (type === 'usuarios') {
    const rows = (data.usuarios || []).filter((item: any) => {
      const matchesStatus = !filters.status || item.status === filters.status
      return matchesStatus
    })

    return {
      title: 'Relatório de Usuários',
      headers: ['Nome', 'Email', 'Perfil', 'Status'],
      rows: rows.map((item: any) => [item.nome || '--', item.email || '--', item.perfil || '--', item.status || '--']),
    } as ReportDefinition
  }

  return { title: 'Relatório', headers: [], rows: [] } as ReportDefinition
}

export function downloadCsvReport(type: ReportType, data: any, filters: ReportFilterState = {}) {
  const report = buildReport(type, data, filters)
  const content = [report.headers.join(','), ...report.rows.map((row) => row.map(escapeCsv).join(','))].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${type}-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return report
}

export function openPrintableReport(type: ReportType, data: any, filters: ReportFilterState = {}) {
  const report = buildReport(type, data, filters)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${report.title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f3f4f6; }
      h1 { font-size: 20px; margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <h1>${report.title}</h1>
    <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <table>
      <thead><tr>${report.headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
      <tbody>${report.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </body>
</html>`

  const win = window.open('', '_blank', 'width=980,height=720')
  if (!win) throw new Error('A janela de impressão não foi aberta.')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
  return report
}
