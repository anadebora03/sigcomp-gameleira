export const SECS=[
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
export const STO=[
  {v:'recebido',l:'Recebido',cor:'#374151',bg:'#e5e7eb'},
  {v:'analise',l:'Em Análise',cor:'#1e3a5f',bg:'#bfdbfe'},
  {v:'andamento',l:'Em Andamento',cor:'#7a5800',bg:'#fef3c7'},
  {v:'aguardando',l:'Aguardando Doc.',cor:'#1e3a5f',bg:'#bfdbfe'},
  {v:'pendente',l:'Pendente',cor:'#7a5800',bg:'#fef3c7'},
  {v:'licit_solicit',l:'Licit. Solicitada',cor:'#1e3a5f',bg:'#bfdbfe'},
  {v:'concluido',l:'Concluído',cor:'#065f46',bg:'#d1fae5'},
  {v:'arquivado',l:'Arquivado',cor:'#374151',bg:'#e5e7eb'},
]
export const PRI=[
  {v:'baixa',l:'Baixa',cor:'#0F1E3A',bg:'#e8eef7'},
  {v:'media',l:'Média',cor:'#0F1E3A',bg:'#e8eef7'},
  {v:'alta',l:'Alta',cor:'#0F1E3A',bg:'#e8eef7'},
  {v:'urgente',l:'Urgente',cor:'#dc2626',bg:'#fef2f2'},
]
export const SPL=[
  {v:'solicitado',l:'Solicitado',cor:'#374151',bg:'#e5e7eb'},
  {v:'cotacao',l:'Em Cotação',cor:'#1e3a5f',bg:'#bfdbfe'},
  {v:'elaboracao',l:'Em Elaboração',cor:'#7a5800',bg:'#fef3c7'},
  {v:'juridico',l:'Análise Jurídica',cor:'#1e3a5f',bg:'#bfdbfe'},
  {v:'publicado',l:'Publicado',cor:'#065f46',bg:'#d1fae5'},
  {v:'andamento',l:'Em Andamento',cor:'#7a5800',bg:'#fef3c7'},
  {v:'finalizado',l:'Finalizado',cor:'#065f46',bg:'#d1fae5'},
  {v:'cancelado',l:'Cancelado',cor:'#991b1b',bg:'#fecaca'},
]
export const SPQ=[
  {v:'aguardando',l:'Aguardando',cor:'#4a6155',bg:'#d1fae5'},
  {v:'andamento',l:'Em Andamento',cor:'#7a5800',bg:'#fef3c7'},
  {v:'concluida',l:'Concluída',cor:'#065f46',bg:'#d1fae5'},
  {v:'cancelada',l:'Cancelada',cor:'#991b1b',bg:'#fecaca'},
  {v:'deserta',l:'Deserta',cor:'#1e3a5f',bg:'#bfdbfe'},
]
export const MOD:Record<string,string>={
  pregao_eletronico:'Pregão Eletrônico',pregao_presencial:'Pregão Presencial',
  concorrencia:'Concorrência',tomada_precos:'Tomada de Preços',
  convite:'Convite',dispensa:'Dispensa de Licitação',inexigibilidade:'Inexigibilidade',
}
export const MESES=['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
  '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12',
  '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06']
export const PERF:Record<string,string>={
  administrador:'Administrador',diretor_compras:'Dir. Compras',
  setor_compras:'Setor Compras',secretaria:'Secretaria',visualizador:'Visualizador',
}
export const PCOR:Record<string,string>={
  administrador:'#0F1E3A',diretor_compras:'#0F1E3A',
  setor_compras:'#1a5c38',secretaria:'#0F1E3A',visualizador:'#64748b',
}

// ============================================================
// PERMISSÕES GRANULARES POR MÓDULO
// ============================================================

export const MODULOS_PERMISSOES = {
  oficios: {
    label: 'OFÍCIOS',
    permissoes: [
      { chave: 'oficios.ver', label: 'Ver ofícios' },
      { chave: 'oficios.criar', label: 'Criar ofício' },
      { chave: 'oficios.editar', label: 'Editar ofício' },
      { chave: 'oficios.excluir', label: 'Excluir ofício' },
      { chave: 'oficios.anexar', label: 'Anexar documentos' },
      { chave: 'oficios.status', label: 'Alterar status' },
      { chave: 'oficios.baixa', label: 'Dar baixa/concluir' },
    ]
  },
  processos: {
    label: 'PROCESSOS LICITATÓRIOS',
    permissoes: [
      { chave: 'processos.ver', label: 'Ver processos' },
      { chave: 'processos.criar', label: 'Criar processo' },
      { chave: 'processos.editar', label: 'Editar processo' },
      { chave: 'processos.cancelar', label: 'Cancelar processo' },
      { chave: 'processos.concluir', label: 'Concluir processo' },
      { chave: 'processos.anexar', label: 'Anexar documentos' },
    ]
  },
  pesquisas: {
    label: 'PESQUISAS DE PREÇO',
    permissoes: [
      { chave: 'pesquisas.ver', label: 'Ver pesquisas' },
      { chave: 'pesquisas.criar', label: 'Criar pesquisa' },
      { chave: 'pesquisas.editar', label: 'Editar pesquisa' },
      { chave: 'pesquisas.excluir', label: 'Excluir pesquisa' },
    ]
  },
  documentos: {
    label: 'DOCUMENTOS',
    permissoes: [
      { chave: 'documentos.ver', label: 'Ver documentos' },
      { chave: 'documentos.baixar', label: 'Baixar documentos' },
      { chave: 'documentos.excluir', label: 'Excluir documentos' },
    ]
  },
  secretarias: {
    label: 'SECRETARIAS',
    permissoes: [
      { chave: 'secretarias.ver', label: 'Ver secretarias' },
      { chave: 'secretarias.criar', label: 'Criar secretaria' },
      { chave: 'secretarias.editar', label: 'Editar secretaria' },
      { chave: 'secretarias.excluir', label: 'Excluir secretaria' },
    ]
  },
  relatorios: {
    label: 'RELATÓRIOS',
    permissoes: [
      { chave: 'relatorios.ver', label: 'Ver relatórios' },
      { chave: 'relatorios.pdf', label: 'Exportar PDF' },
      { chave: 'relatorios.excel', label: 'Exportar Excel' },
    ]
  },
  usuarios: {
    label: 'USUÁRIOS',
    permissoes: [
      { chave: 'usuarios.ver', label: 'Ver usuários' },
      { chave: 'usuarios.criar', label: 'Cadastrar usuários' },
      { chave: 'usuarios.editar', label: 'Editar usuários' },
      { chave: 'usuarios.desativar', label: 'Desativar usuários' },
      { chave: 'usuarios.permissoes', label: 'Gerenciar permissões' },
    ]
  },
  sistema: {
    label: 'SISTEMA',
    permissoes: [
      { chave: 'sistema.logs', label: 'Ver logs' },
      { chave: 'sistema.config', label: 'Gerenciar configurações' },
      { chave: 'sistema.admin', label: 'Acesso administrativo total' },
    ]
  }
}

// Perfis pré-definidos com permissões sugeridas
export const PERFIS_PERMISSOES: Record<string, Record<string, boolean>> = {
  administrador: {
    'oficios.ver': true, 'oficios.criar': true, 'oficios.editar': true, 'oficios.excluir': true,
    'oficios.anexar': true, 'oficios.status': true, 'oficios.baixa': true,
    'processos.ver': true, 'processos.criar': true, 'processos.editar': true,
    'processos.cancelar': true, 'processos.concluir': true, 'processos.anexar': true,
    'pesquisas.ver': true, 'pesquisas.criar': true, 'pesquisas.editar': true, 'pesquisas.excluir': true,
    'documentos.ver': true, 'documentos.baixar': true, 'documentos.excluir': true,
    'secretarias.ver': true, 'secretarias.criar': true, 'secretarias.editar': true, 'secretarias.excluir': true,
    'relatorios.ver': true, 'relatorios.pdf': true, 'relatorios.excel': true,
    'usuarios.ver': true, 'usuarios.criar': true, 'usuarios.editar': true, 'usuarios.desativar': true, 'usuarios.permissoes': true,
    'sistema.logs': true, 'sistema.config': true, 'sistema.admin': true,
  },
  diretor_compras: {
    'oficios.ver': true, 'oficios.criar': true, 'oficios.editar': true, 'oficios.excluir': true,
    'oficios.anexar': true, 'oficios.status': true, 'oficios.baixa': true,
    'processos.ver': true, 'processos.criar': true, 'processos.editar': true,
    'processos.cancelar': true, 'processos.concluir': true, 'processos.anexar': true,
    'pesquisas.ver': true, 'pesquisas.criar': true, 'pesquisas.editar': true, 'pesquisas.excluir': true,
    'documentos.ver': true, 'documentos.baixar': true, 'documentos.excluir': true,
    'secretarias.ver': true, 'secretarias.criar': true, 'secretarias.editar': true, 'secretarias.excluir': true,
    'relatorios.ver': true, 'relatorios.pdf': true, 'relatorios.excel': true,
    'usuarios.ver': true, 'usuarios.criar': true, 'usuarios.editar': true, 'usuarios.desativar': true, 'usuarios.permissoes': true,
    'sistema.logs': true, 'sistema.config': true, 'sistema.admin': true,
  },
  setor_compras: {
    'oficios.ver': true, 'oficios.criar': true, 'oficios.editar': true, 'oficios.excluir': false,
    'oficios.anexar': true, 'oficios.status': false, 'oficios.baixa': false,
    'processos.ver': true, 'processos.criar': true, 'processos.editar': true,
    'processos.cancelar': false, 'processos.concluir': false, 'processos.anexar': true,
    'pesquisas.ver': true, 'pesquisas.criar': true, 'pesquisas.editar': true, 'pesquisas.excluir': false,
    'documentos.ver': true, 'documentos.baixar': true, 'documentos.excluir': false,
    'secretarias.ver': true, 'secretarias.criar': false, 'secretarias.editar': false, 'secretarias.excluir': false,
    'relatorios.ver': true, 'relatorios.pdf': true, 'relatorios.excel': true,
    'usuarios.ver': false, 'usuarios.criar': false, 'usuarios.editar': false, 'usuarios.desativar': false, 'usuarios.permissoes': false,
    'sistema.logs': false, 'sistema.config': false, 'sistema.admin': false,
  },
  secretaria: {
    'oficios.ver': true, 'oficios.criar': true, 'oficios.editar': false, 'oficios.excluir': false,
    'oficios.anexar': true, 'oficios.status': false, 'oficios.baixa': false,
    'processos.ver': true, 'processos.criar': false, 'processos.editar': false,
    'processos.cancelar': false, 'processos.concluir': false, 'processos.anexar': false,
    'pesquisas.ver': true, 'pesquisas.criar': false, 'pesquisas.editar': false, 'pesquisas.excluir': false,
    'documentos.ver': true, 'documentos.baixar': true, 'documentos.excluir': false,
    'secretarias.ver': true, 'secretarias.criar': false, 'secretarias.editar': false, 'secretarias.excluir': false,
    'relatorios.ver': true, 'relatorios.pdf': false, 'relatorios.excel': false,
    'usuarios.ver': false, 'usuarios.criar': false, 'usuarios.editar': false, 'usuarios.desativar': false, 'usuarios.permissoes': false,
    'sistema.logs': false, 'sistema.config': false, 'sistema.admin': false,
  },
  visualizador: {
    'oficios.ver': true, 'oficios.criar': false, 'oficios.editar': false, 'oficios.excluir': false,
    'oficios.anexar': false, 'oficios.status': false, 'oficios.baixa': false,
    'processos.ver': true, 'processos.criar': false, 'processos.editar': false,
    'processos.cancelar': false, 'processos.concluir': false, 'processos.anexar': false,
    'pesquisas.ver': true, 'pesquisas.criar': false, 'pesquisas.editar': false, 'pesquisas.excluir': false,
    'documentos.ver': true, 'documentos.baixar': true, 'documentos.excluir': false,
    'secretarias.ver': true, 'secretarias.criar': false, 'secretarias.editar': false, 'secretarias.excluir': false,
    'relatorios.ver': true, 'relatorios.pdf': false, 'relatorios.excel': false,
    'usuarios.ver': false, 'usuarios.criar': false, 'usuarios.editar': false, 'usuarios.desativar': false, 'usuarios.permissoes': false,
    'sistema.logs': false, 'sistema.config': false, 'sistema.admin': false,
  }
}

export const G='#1a5c38',G2='#22744a',G3='#2d8f5e',GB='#f0f7f3',GD='#c3ddd0'
export const GOLD='#c9a227',GOLDD='#a07800',NAVY='#0F1E3A',NAVYD='#0a1628'
export const GREEN_CHECK='#166534'

// Status de usuário
export const USER_STATUS = {
  convite_enviado: { label: 'Convite enviado', cor: '#f59e0b', bg: '#fffbeb' },
  aguardando_ativacao: { label: 'Aguardando ativação', cor: '#3b82f6', bg: '#eff6ff' },
  ativo: { label: 'Ativo', cor: '#10b981', bg: '#f0fdf4' },
  bloqueado: { label: 'Bloqueado', cor: '#ef4444', bg: '#fef2f2' }
}
