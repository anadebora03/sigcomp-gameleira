'use client'
import { useMemo, useState } from 'react'
import { Card, Ic, G, NAVY, IS, oF, oB } from '@/components/ui/atoms'
import { SECS } from '@/lib/constants'
import { formatCurrency, parseCurrencyInput } from '@/utils/formatters'
import { buildReport, downloadCsvReport, openPrintableReport } from '@/utils/reports'
import { usePermissions } from '@/hooks/usePermissions'
import { useMob } from '@/hooks/useMob'
import { SOF } from '@/utils/ordens'

// mesmo padrão dos filtros das outras abas (ex.: Ordens de Fornecimento)
const fil: React.CSSProperties = { ...IS, fontSize: 12, padding: '9px 10px' }

const REPORT_TYPES = [
  { key: 'oficios', nome: 'Ofícios', cor: '#1a5c38', icon: 'file', desc: 'Assunto, secretaria, status, data, prazo e responsável.' },
  { key: 'processos', nome: 'Processos Licitatórios', cor: '#c9a227', icon: 'gavel', desc: 'Modalidade, status e valores estimado e final.' },
  { key: 'pesquisas', nome: 'Pesquisas de Preço', cor: '#0F1E3A', icon: 'check_sq', desc: 'Objeto, período, responsável e fornecedores.' },
  { key: 'ordens', nome: 'Ordens de Fornecimento', cor: '#c9a227', icon: 'truck', desc: 'Fornecedor, processo, envio, prazo e entrega.' },
  { key: 'secretarias', nome: 'Secretarias', cor: '#1a5c38', icon: 'building', desc: 'Lista das secretarias com nome e sigla.' },
] as const

export default function RelatoriosPage({ oficios, processos, pesquisas, ordens = [], secretarias, usuarios, toast }: any) {
  const { tem } = usePermissions()
  const mob = useMob()
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
        ordens: (ordens || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--', processo_numero: (processos || []).find((p: any) => p.id === item.processo_id)?.numero || '--' })),
        secretarias: secretarias || [],
        usuarios: usuarios || [],
      }
      if (mode === 'pdf') {
        openPrintableReport(type as any, payload, filters)
        toast(`PDF gerado para ${type === 'usuarios' ? 'Usuários' : type === 'secretarias' ? 'Secretarias' : type === 'processos' ? 'Processos Licitatórios' : type === 'pesquisas' ? 'Pesquisas de Preço' : type === 'ordens' ? 'Ordens de Fornecimento' : 'Ofícios'}.`, 'success')
      } else {
        downloadCsvReport(type as any, payload, filters)
        toast(`CSV gerado para ${type === 'usuarios' ? 'Usuários' : type === 'secretarias' ? 'Secretarias' : type === 'processos' ? 'Processos Licitatórios' : type === 'pesquisas' ? 'Pesquisas de Preço' : type === 'ordens' ? 'Ordens de Fornecimento' : 'Ofícios'}.`, 'success')
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
      ordens: (ordens || []).map((item: any) => ({ ...item, secretaria_nome: SECS.find((sec: any) => sec.id === item.secretaria_id)?.nome || '--', processo_numero: (processos || []).find((p: any) => p.id === item.processo_id)?.numero || '--' })),
      secretarias: secretarias || [],
      usuarios: usuarios || [],
    }
    return buildReport(activeType as any, payload, filters)
  }, [activeType, filters, oficios, processos, pesquisas, ordens, secretarias, usuarios])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 5 contadores + Valor Total com o dobro da largura, ocupando a linha toda */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2,1fr)' : 'repeat(5,1fr) 2fr', gap: 11 }}>
        {sum.map((c, i) => (
          <Card key={i} style={{ padding: '14px 16px', textAlign: 'center', gridColumn: c.str && mob ? 'span 2' : undefined }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: c.cor, lineHeight: 1, whiteSpace: 'nowrap' }}>{c.v}</p>
            <p style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>{c.l}</p>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Data inicial</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} style={{ ...fil, width: 138 }} onFocus={oF} onBlur={oB} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Data final</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} style={{ ...fil, width: 138 }} onFocus={oF} onBlur={oB} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} style={{ ...fil, width: 140 }} onFocus={oF} onBlur={oB}>
              <option value="">Todos</option>
              {activeType === 'ordens' ? SOF.map((s) => <option key={s.v} value={s.v}>{s.l}</option>) : <>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="solicitado">Solicitado</option>
              <option value="aguardando">Aguardando</option>
              <option value="andamento">Andamento</option>
              <option value="concluida">Concluída</option>
              </>}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Secretaria</label>
            <select value={filters.secretaria} onChange={(e) => setFilters((prev) => ({ ...prev, secretaria: e.target.value }))} style={{ ...fil, width: 170 }} onFocus={oF} onBlur={oB}>
              <option value="">Todas</option>
              {SECS.map((sec: any) => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
            </select>
          </div>
        </div>

        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--txt)', marginBottom: 16 }}>Gerar Relatórios</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 11 }}>
          {REPORT_TYPES.map((r) => (
            <div key={r.key} style={{ border: `1.5px solid ${activeType === r.key ? r.cor + '55' : r.cor + '22'}`, borderRadius: 13, padding: 14, background: activeType === r.key ? `${r.cor}0f` : 'var(--inp)', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', gap: 12 }} onClick={() => setActiveType(r.key)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: r.cor + '16', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic n={r.icon} z={17} c={r.cor} /></div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--txt)', lineHeight: 1.3 }}>{r.nome}</p>
                  <p style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)', lineHeight: 1.4, marginTop: 3 }}>{r.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={(e) => { e.stopPropagation(); handleExport(r.key, 'pdf') }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 10px', borderRadius: 8, border: 'none', background: G, color: '#fff', cursor: canExportPdf ? 'pointer' : 'not-allowed', opacity: canExportPdf ? 1 : .5, fontFamily: 'inherit', fontSize: 11, fontWeight: 800 }} disabled={!canExportPdf}><Ic n="dl" z={13} c="#fff" />PDF</button>
                <button onClick={(e) => { e.stopPropagation(); handleExport(r.key, 'csv') }} style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${G}33`, background: 'transparent', color: G, cursor: canExportXls ? 'pointer' : 'not-allowed', opacity: canExportXls ? 1 : .5, fontFamily: 'inherit', fontSize: 11, fontWeight: 800 }} disabled={!canExportXls}>CSV</button>
              </div>
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
