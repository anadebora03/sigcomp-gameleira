export interface Secretaria { id:number; nome:string; sigla:string; cor:string }

export interface Arquivo {
  id: number; nome: string; tamanho: number; data: string; dataUrl?: string
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
}

export interface Log {
  id: number; usuario: string; modulo: string; tipo: string
  descricao: string; data: string
}
