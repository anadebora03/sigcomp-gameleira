'use client'
import { useMemo, useState } from 'react'
import { Card, Ic, G, NAVY } from '@/components/ui/atoms'
import { SECS } from '@/lib/constants'
import { formatCurrency, parseCurrencyInput } from '@/utils/formatters'
import { buildReport, downloadCsvReport, openPrintableReport } from '@/utils/reports'
import { usePermissions } from '@/hooks/usePermissions'

const REPORT_TYPES = [
  { key: 'oficios', nome: 'Ofícios', cor: '#1a5c38', icon: 'building' },
  { key: 'processos', nome: 'Processos Licitatórios', cor: '#c9a227', icon: 'gavel' },
  { key: 'pesquisas', nome: 'Pesquisas de Preço', cor: '#0F1E3A', icon: 'check_sq' },
  { key: 'secretarias', nome: 'Secretarias', cor: '#1a5c38', icon: 'building' },
  { key: 'usuarios', nome: 'Usuários', cor: '#0F1E3A', icon: 'users' },
] as const

export default function RelatoriosPage({ oficios, processos, pesquisas, secretarias, usuarios, toast }: any) {
  const { tem } = usePermissions()
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', secretaria: '' })
  const [activeType, setActiveType] = useState<string>('oficios')

  const canExportPdf = tem('relatorios.pdf')
  const canExportXls = tem('relatorios.excel')

  const sum = useMemo(() => [
    { l: 'Ofícios', v: oficios.length, cor: '#1a5c38' },
    { l: 'Pendentes', v: oficios.filter((o: any) => o.status === 'pendente').length, cor: '#a07800' },
    { l: 'Concluídos', v: oficios.filter((o: any) => o.status === 'concluido').length, cor: '#1a5c38' },
    { l: 'Processos', v: processos.length, cor: '#0F1E3A' },
    { l: 'Pesquisas', v: pesquisas.length, cor: '#1a5c38' },
    { l: 'Valor Total', v: formatCurrency(processos.reduce((acc: number, item: any) => acc + parseCurrencyInput(item.valor_estimado), 0)), cor: '#a07800', str: true },
  ], [oficios, processos, pesquisas])

  const handleExport = (type: string, mode: 'pdf' | 'csv') => {
    if (!canExportPdf && mode === 'pdf') {
      toast('Você não possui permissão para exportar PDF.', 'error')
      return
    }
    if (!canExportXls && mode === 'csv') {
      toast('Você não possui permissão para exportar Excel.', 'error')
      return
    }

    try {
      const payload = {
        oficios: (oficios || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
        processos: (processos || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
        pesquisas: (pesquisas || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
        secretarias: secretarias || [],
        usuarios: usuarios || [],
      }
      if (mode === 'pdf') {
        openPrintableReport(type as any, payload, filters)
        toast(`PDF gerado para ${type === 'usuarios' ? 'Usuários' : type === 'secretarias' ? 'Secretarias' : type === 'processos' ? 'Processos Licitatórios' : type === 'pesquisas' ? 'Pesquisas de Preço' : 'Ofícios'}.`, 'success')
      } else {
        downloadCsvReport(type as any, payload, filters)
        toast(`CSV gerado para ${type === 'usuarios' ? 'Usuários' : type === 'secretarias' ? 'Secretarias' : type === 'processos' ? 'Processos Licitatórios' : type === 'pesquisas' ? 'Pesquisas de Preço' : 'Ofícios'}.`, 'success')
      }
    } catch (error) {
      console.error('[relatorios] erro ao gerar relatório:', error)
      toast('Não foi possível gerar o relatório neste momento. Verifique o console para mais detalhes.', 'error')
    }
  }

  const preview = useMemo(() => {
    const payload = {
      oficios: (oficios || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
      processos: (processos || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
      pesquisas: (pesquisas || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--' })),
      secretarias: secretarias || [],
      usuarios: usuarios || [],
    }
    return buildReport(activeType as any, payload, filters)
  }, [activeType, filters, oficios, processos, pesquisas, secretarias, usuarios])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 11 }}>
        {sum.map((c, i) => (
          <Card key={i} style={{ padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: c.str ? 12 : 24, fontWeight: 900, color: c.cor, lineHeight: 1 }}>{c.v}</p>
            <p style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>{c.l}</p>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Data inicial</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} style={{ border: '1px solid var(--brd)', borderRadius: 8, padding: '8px 10px', background: 'var(--inp)', color: 'var(--txt)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Data final</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} style={{ border: '1px solid var(--brd)', borderRadius: 8, padding: '8px 10px', background: 'var(--inp)', color: 'var(--txt)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} style={{ border: '1px solid var(--brd)', borderRadius: 8, padding: '8px 10px', background: 'var(--inp)', color: 'var(--txt)' }}>
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="solicitado">Solicitado</option>
              <option value="aguardando">Aguardando</option>
              <option value="andamento">Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Secretaria</label>
            <select value={filters.secretaria} onChange={(e) => setFilters((prev) => ({ ...prev, secretaria: e.target.value }))} style={{ border: '1px solid var(--brd)', borderRadius: 8, padding: '8px 10px', background: 'var(--inp)', color: 'var(--txt)' }}>
              <option value="">Todas</option>
              {SECS.map((sec: any) => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
            </select>
          </div>
        </div>

        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', marginBottom: 16 }}>Gerar Relatórios</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 11 }}>
          {REPORT_TYPES.map((r) => (
            <div key={r.key} style={{ border: `1.5px solid ${r.cor}22`, borderRadius: 13, padding: 14, background: activeType === r.key ? `${r.cor}0f` : 'var(--inp)', cursor: 'pointer', transition: 'all .2s' }} onClick={() => setActiveType(r.key)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: r.cor + '16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic n={r.icon} z={16} c={r.cor} /></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={(e) => { e.stopPropagation(); handleExport(r.key, 'pdf') }} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: r.cor + '16', color: r.cor, cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 800 }} disabled={!canExportPdf}>PDF</button>
                  <button onClick={(e) => { e.stopPropagation(); handleExport(r.key, 'csv') }} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#05996916', color: '#059669', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 800 }} disabled={!canExportXls}>CSV</button>
                </div>
              </div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--txt)' }}>{r.nome}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, border: '1px solid var(--brd)', borderRadius: 12, padding: 14, background: 'var(--inp)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Pré-visualização</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{preview.title}</p>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>{preview.rows.length} registro(s) após aplicar os filtros.</p>
        </div>
      </Card>
    </div>
  )
}
