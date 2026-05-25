export const G = '#1a5c38'
export const G2 = '#22744a'
export const G3 = '#2d8f5e'
export const GB = '#f0f7f3'
export const GD = '#c3ddd0'
export const GOLD = '#c9a227'
export const GOLDD = '#a07800'
export const NAVY = '#1a3a6e'
export const NAVYD = '#0d2a4a'

export const SECS = [
  {id:1,nome:'Secretaria de Saúde e Saneamento',sigla:'SAÚDE',cor:'#1a5c38'},
  {id:2,nome:'Secretaria de Educação',sigla:'EDUC',cor:'#1a5c38'},
  {id:3,nome:'Secretaria de Assistência Social',sigla:'ASSIST',cor:'#1a5c38'},
  {id:4,nome:'Secretaria de Esportes, Cultura, Turismo e Juventude',sigla:'ECTJ',cor:'#1a5c38'},
  {id:5,nome:'Secretaria de Desenvolvimento Econômico',sigla:'DECO',cor:'#1a5c38'},
  {id:6,nome:'Secretaria de Infraestrutura, Obras e Transportes',sigla:'INFRA',cor:'#1a5c38'},
  {id:7,nome:'Secretaria de Administração',sigla:'ADMIN',cor:'#1a5c38'},
  {id:8,nome:'Secretaria da Fazenda',sigla:'FAZ',cor:'#1a5c38'},
  {id:9,nome:'Secretaria de Finanças',sigla:'FIN',cor:'#1a5c38'},
  {id:10,nome:'Secretaria de Agricultura',sigla:'AGRI',cor:'#1a5c38'},
]

export const STO = [
  {v:'recebido',    l:'Recebido',         cor:'#374151', bg:'#e5e7eb'},
  {v:'analise',     l:'Em Análise',        cor:'#1e3a5f', bg:'#bfdbfe'},
  {v:'andamento',   l:'Em Andamento',      cor:'#7a5800', bg:'#fef3c7'},
  {v:'aguardando',  l:'Aguardando Doc.',   cor:'#1e3a5f', bg:'#bfdbfe'},
  {v:'pendente',    l:'Pendente',          cor:'#7a5800', bg:'#fef3c7'},
  {v:'licit_solicit',l:'Licit. Solicitada',cor:'#1e3a5f', bg:'#bfdbfe'},
  {v:'concluido',   l:'Concluído',         cor:'#065f46', bg:'#d1fae5'},
  {v:'arquivado',   l:'Arquivado',         cor:'#374151', bg:'#e5e7eb'},
]

export const PRI = [
  {v:'baixa',   l:'Baixa',   cor:'#1a3a6e', bg:'#e8eef7'},
  {v:'media',   l:'Média',   cor:'#1a3a6e', bg:'#e8eef7'},
  {v:'alta',    l:'Alta',    cor:'#1a3a6e', bg:'#e8eef7'},
  {v:'urgente', l:'Urgente', cor:'#dc2626', bg:'#fef2f2'},
]

export const SPL = [
  {v:'solicitado',  l:'Solicitado',       cor:'#374151', bg:'#e5e7eb'},
  {v:'cotacao',     l:'Em Cotação',        cor:'#1e3a5f', bg:'#bfdbfe'},
  {v:'elaboracao',  l:'Em Elaboração',     cor:'#7a5800', bg:'#fef3c7'},
  {v:'juridico',    l:'Análise Jurídica',  cor:'#1e3a5f', bg:'#bfdbfe'},
  {v:'publicado',   l:'Publicado',         cor:'#065f46', bg:'#d1fae5'},
  {v:'andamento',   l:'Em Andamento',      cor:'#7a5800', bg:'#fef3c7'},
  {v:'finalizado',  l:'Finalizado',        cor:'#065f46', bg:'#d1fae5'},
  {v:'cancelado',   l:'Cancelado',         cor:'#991b1b', bg:'#fecaca'},
]

export const SPQ = [
  {v:'aguardando', l:'Aguardando',    cor:'#4a6155', bg:'#d1fae5'},
  {v:'andamento',  l:'Em Andamento',  cor:'#7a5800', bg:'#fef3c7'},
  {v:'concluida',  l:'Concluída',     cor:'#065f46', bg:'#d1fae5'},
  {v:'cancelada',  l:'Cancelada',     cor:'#991b1b', bg:'#fecaca'},
  {v:'deserta',    l:'Deserta',       cor:'#1e3a5f', bg:'#bfdbfe'},
]

export const MOD: Record<string,string> = {
  pregao_eletronico:'Pregão Eletrônico',
  pregao_presencial:'Pregão Presencial',
  concorrencia:'Concorrência',
  tomada_precos:'Tomada de Preços',
  convite:'Convite',
  dispensa:'Dispensa de Licitação',
  inexigibilidade:'Inexigibilidade',
}

export const MESES = [
  '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
  '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12',
  '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
]

export const PERF: Record<string,string> = {
  administrador:'Administrador',
  diretor_compras:'Dir. Compras',
  setor_compras:'Setor Compras',
  secretaria:'Secretaria',
  visualizador:'Visualizador',
}
