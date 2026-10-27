export type ReportType = 'oficios' | 'processos' | 'pesquisas' | 'ordens' | 'secretarias' | 'usuarios'

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

import { formatCurrency, parseCurrencyInput, fD } from '@/utils/formatters'
import { statusOF, labelStatusOF } from '@/utils/ordens'

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

  if (type === 'ordens') {
    // Período pela data de envio; status é o calculado (pendente, atrasado...)
    const rows = (data.ordens || []).filter((item: any) => {
      const matchesDate = (!filters.startDate || item.data_envio >= filters.startDate) && (!filters.endDate || item.data_envio <= filters.endDate)
      const matchesStatus = !filters.status || statusOF(item) === filters.status
      const matchesSecretaria = !filters.secretaria || String(item.secretaria_id) === String(filters.secretaria)
      return matchesDate && matchesStatus && matchesSecretaria
    })

    return {
      title: 'Relatório de Ordens de Fornecimento',
      headers: ['Número', 'Processo', 'Fornecedor', 'Secretaria', 'Envio', 'Prazo', 'Status', 'Entrega'],
      rows: rows.map((item: any) => [item.numero_ordem || '--', item.processo_numero || '--', item.fornecedor || '--', item.secretaria_nome || '--', fD(item.data_envio), fD(item.prazo_final_entrega), labelStatusOF(statusOF(item)), fD(item.data_entrega || '')]),
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

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

// Mesma identidade visual do sistema: fonte Inter e verde principal (#1a5c38).
// print-color-adjust garante que o fundo verde do cabeçalho saia igual na impressão.
export function openPrintableReport(type: ReportType, data: any, filters: ReportFilterState = {}) {
  const report = buildReport(type, data, filters)
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(report.title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;900&display=swap" rel="stylesheet" />
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      @page { margin: 14mm; }
      body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 24px; color: #0a1f10; -webkit-font-smoothing: antialiased; }
      h1 { font-size: 22px; font-weight: 900; color: #1a5c38; margin: 0 0 6px; line-height: 1.2; }
      .sub { font-size: 12px; font-weight: 300; color: #1a5c38; margin: 0 0 18px; }
      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      th { background: #1a5c38; color: #fff; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; text-align: left; padding: 9px 10px; border: 1px solid #1a5c38; }
      td { font-size: 12px; padding: 8px 10px; border: 1px solid #d4e8d9; text-align: left; vertical-align: top; }
      tbody tr:nth-child(even) td { background: #f5f9f6; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(report.title)}</h1>
    <p class="sub">SIGCOMP — Prefeitura Municipal da Gameleira &nbsp;·&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <table>
      <thead><tr>${report.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>${report.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <script>
      // Só imprime depois que a fonte carregar, para a impressão sair igual à tela
      window.addEventListener('load', function () {
        var go = function () { setTimeout(function () { window.focus(); window.print() }, 100) }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go()
      })
    </script>
  </body>
</html>`

  const win = window.open('', '_blank', 'width=980,height=720')
  if (!win) throw new Error('A janela de impressão não foi aberta.')
  win.document.write(html)
  win.document.close()
  win.focus()
  return report
}
