export interface Secretaria { id:number; nome:string; sigla:string; cor:string }

/**
 * Arquivo — representa um documento armazenado no Supabase Storage.
 * Após o upload, dataUrl é removido e caminho/mime_type são usados para gerar URLs assinadas.
 */
export interface Arquivo {
  id: string              // UUID
  nome: string            // nome original
  caminho?: string        // path no Storage (ex: saude/2025/OFF-0001/file.pdf)
  mime_type?: string
  tamanho: number
  data: string            // data do upload (ISO ou dd/mm/yyyy)
  uploaded_by?: string    // user UUID
  uploaded_at?: string
  // Transient — preenchido localmente antes do upload ou após gerar signed URL
  dataUrl?: string        // base64 (apenas pré-upload ou fallback)
  signedUrl?: string      // URL assinada do Supabase (válida por 1h)
}

export interface Fornecedor {
  id: number; nome: string; cnpj: string; email: string; telefone: string
  valor: string; obs: string; arquivos: Arquivo[]
}

export interface Contrato {
  empresa: string; cnpj: string; responsavel: string; email: string; telefone: string
  numero_contrato: string; data_assinatura: string; data_vigencia: string
  objeto: string; valor: string; obs: string; arquivos: Arquivo[]
}

export interface Historico { data: string; acao: string; usuario: string }
export interface Comentario { texto: string; data: string; usuario: string }

export interface Oficio {
  id: number; numero: string; secretaria_id: number; responsavel: string
  resp_acomp: string; data: string; assunto: string; descricao: string
  tipo: string; prioridade: string; prazo: string; status: string
  obs: string; favorito: boolean; historico: Historico[]
  comentarios: Comentario[]; anexos: Arquivo[]
}

export interface Processo {
  id: number; numero: string; secretaria_id: number; modalidade: string
  assunto: string; status: string; data_abertura: string; data_prevista: string
  responsavel: string; valor_estimado: number | string; valor_final: string
  obs: string; anexos: Arquivo[]; contrato: Contrato | null
}

export interface Pesquisa {
  id: number; numero: string; secretaria_id: number; objeto: string
  descricao: string; oficio_ref: string; periodo: string; prazo_cotacao: string
  responsavel: string; status: string; obs: string
  fornecedores: Fornecedor[]; anexos: Arquivo[]
}

export interface Usuario {
  id: number; nome: string; cargo: string; email: string
  perfil: string; ativo: boolean; avatar: string; senha?: string; senha2?: string
  status?: string; // 'convite_enviado' | 'aguardando_ativacao' | 'ativo' | 'bloqueado'
  permissoes?: Record<string, boolean>  // JSONB: chaves tipo "oficios.criar", valores booleanos
}

export interface Permissoes {
  'oficios.ver': boolean
  'oficios.criar': boolean
  'oficios.editar': boolean
  'oficios.excluir': boolean
  'oficios.anexar': boolean
  'oficios.status': boolean
  'oficios.baixa': boolean
  'processos.ver': boolean
  'processos.criar': boolean
  'processos.editar': boolean
  'processos.cancelar': boolean
  'processos.concluir': boolean
  'processos.anexar': boolean
  'pesquisas.ver': boolean
  'pesquisas.criar': boolean
  'pesquisas.editar': boolean
  'pesquisas.excluir': boolean
  'documentos.ver': boolean
  'documentos.baixar': boolean
  'documentos.excluir': boolean
  'secretarias.ver': boolean
  'secretarias.criar': boolean
  'secretarias.editar': boolean
  'secretarias.excluir': boolean
  'relatorios.ver': boolean
  'relatorios.pdf': boolean
  'relatorios.excel': boolean
  'usuarios.ver': boolean
  'usuarios.criar': boolean
  'usuarios.editar': boolean
  'usuarios.desativar': boolean
  'usuarios.permissoes': boolean
  'sistema.logs': boolean
  'sistema.config': boolean
  'sistema.admin': boolean
}

export interface Log {
  id: number; usuario: string; modulo: string; tipo: string
  descricao: string; data: string
}
