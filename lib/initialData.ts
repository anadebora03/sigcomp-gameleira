import type { Oficio, Processo, Pesquisa, Usuario, Log } from './types'

export const INIT_OF: Oficio[] = [
  {id:'1',numero:'OFF-2025-0001',secretaria_id:1,responsavel:'Dr. Luís',resp_acomp:'Ana Lima',data:'2025-05-10',assunto:'Aquisição urgente de medicamentos para UBS Central',descricao:'Solicitação emergencial de medicamentos essenciais.',tipo:'Compra',prioridade:'urgente',prazo:'2025-05-25',status:'andamento',obs:'Verificar estoque.',favorito:true,historico:[{data:'2025-05-10',acao:'Recebido',usuario:'Sistema'}],comentarios:[{texto:'Estoque crítico!',data:'2025-05-12',usuario:'Dr. Luís'}],anexos:[]},
  {id:'2',numero:'OFF-2025-0002',secretaria_id:2,responsavel:'Marcelo',resp_acomp:'Ana Lima',data:'2025-05-12',assunto:'Material escolar para escolas municipais 2º semestre',descricao:'',tipo:'Compra',prioridade:'alta',prazo:'2025-06-15',status:'licit_solicit',obs:'',favorito:false,historico:[],comentarios:[],anexos:[]},
  {id:'3',numero:'OFF-2025-0003',secretaria_id:6,responsavel:'',resp_acomp:'',data:'2025-05-14',assunto:'Pavimentação Rua das Flores bairro Centro',descricao:'420 metros paralelepípedo.',tipo:'Servico',prioridade:'media',prazo:'2025-08-01',status:'analise',obs:'',favorito:false,historico:[],comentarios:[],anexos:[]},
  {id:'4',numero:'OFF-2025-0004',secretaria_id:3,responsavel:'',resp_acomp:'Ana Lima',data:'2025-05-08',assunto:'Cestas básicas emergenciais famílias vulneráveis',descricao:'300 cestas.',tipo:'Compra',prioridade:'urgente',prazo:'2025-05-18',status:'pendente',obs:'Falta declaração.',favorito:true,historico:[],comentarios:[],anexos:[]},
  {id:'5',numero:'OFF-2025-0005',secretaria_id:7,responsavel:'',resp_acomp:'',data:'2025-05-16',assunto:'Reforma do prédio da Secretaria de Administração',descricao:'',tipo:'Servico',prioridade:'media',prazo:'2025-10-01',status:'recebido',obs:'',favorito:false,historico:[],comentarios:[],anexos:[]},
  {id:'6',numero:'OFF-2025-0006',secretaria_id:8,responsavel:'',resp_acomp:'Ana Lima',data:'2025-04-20',assunto:'Renovação licença Sistema Folha de Pagamento',descricao:'',tipo:'Servico',prioridade:'alta',prazo:'2025-05-30',status:'concluido',obs:'',favorito:false,historico:[],comentarios:[],anexos:[]},
]

export const INIT_PL: Processo[] = [
  {id:'1',numero:'PL-2025-0001',secretaria_id:1,modalidade:'pregao_eletronico',assunto:'Medicamentos hospitalares Lote 01/2025',status:'elaboracao',data_abertura:'2025-05-10',data_prevista:'2025-06-10',responsavel:'Ana Lima',valor_estimado:45000,valor_final:'',obs:'',anexos:[],contrato:null},
  {id:'2',numero:'PL-2025-0002',secretaria_id:2,modalidade:'dispensa',assunto:'Material escolar emergência',status:'publicado',data_abertura:'2025-05-12',data_prevista:'2025-05-30',responsavel:'Carlos Melo',valor_estimado:12000,valor_final:'',obs:'',anexos:[],contrato:null},
  {id:'3',numero:'PL-2025-0003',secretaria_id:6,modalidade:'concorrencia',assunto:'Pavimentação de vias urbanas Lote 01',status:'solicitado',data_abertura:'2025-05-14',data_prevista:'2025-07-20',responsavel:'José Ferreira',valor_estimado:380000,valor_final:'',obs:'',anexos:[],contrato:null},
]

export const INIT_PQ: Pesquisa[] = [
  {id:'1',numero:'PQ-2025-0001',secretaria_id:1,objeto:'Paracetamol 500mg 1.000 comprimidos',descricao:'Caixa 20 comprimidos. Qtd: 50 caixas.',oficio_ref:'OFF-2025-0001',periodo:'2025-05',prazo_cotacao:'2025-05-20',responsavel:'Ana Lima',status:'concluida',obs:'3 fornecedores.',fornecedores:[{id:101,nome:'Distribuidora Saúde PE',cnpj:'12.345.678/0001-90',email:'comercial@saudep.com.br',telefone:'(81) 3333-1111',valor:'450',obs:'Entrega 3 dias',arquivos:[]},{id:102,nome:'Farmácia Atacado NE',cnpj:'98.765.432/0001-11',email:'',telefone:'(81) 3333-4444',valor:'520',obs:'',arquivos:[]},{id:103,nome:'MedSupply Brasil',cnpj:'11.222.333/0001-55',email:'vendas@medsupply.com.br',telefone:'',valor:'480',obs:'',arquivos:[]}],anexos:[]},
  {id:'2',numero:'PQ-2025-0002',secretaria_id:2,objeto:'Material escolar kit pedagógico 2025',descricao:'Cadernos lápis e borrachas para 500 alunos.',oficio_ref:'OFF-2025-0002',periodo:'2025-05',prazo_cotacao:'2025-06-05',responsavel:'Ana Lima',status:'andamento',obs:'',fornecedores:[{id:104,nome:'Papelaria Central Recife',cnpj:'55.444.333/0001-22',email:'contato@papelaria.com.br',telefone:'(81) 3333-2222',valor:'8900',obs:'',arquivos:[]},{id:105,nome:'Distribuidora Escolar PE',cnpj:'33.222.111/0001-44',email:'',telefone:'(81) 4444-5555',valor:'',obs:'Aguardando',arquivos:[]}],anexos:[]},
  {id:'3',numero:'PQ-2025-0003',secretaria_id:6,objeto:'Pedras paralelepípedo granítico',descricao:'420m lineares.',oficio_ref:'OFF-2025-0003',periodo:'2025-05',prazo_cotacao:'2025-07-10',responsavel:'Carlos Melo',status:'aguardando',obs:'',fornecedores:[{id:106,nome:'Construtora Gameleira',cnpj:'77.888.999/0001-33',email:'comercial@construtora.com.br',telefone:'(87) 3333-9999',valor:'',obs:'',arquivos:[]}],anexos:[]},
]

export const INIT_US: Usuario[] = [
  {id:'1',nome:'Carlos Administrador',cargo:'Administrador',email:'admin@gameleira.pe.gov.br',perfil:'administrador',ativo:true,avatar:''},
  {id:'2',nome:'Ana Lima',cargo:'Diretora de Compras',email:'compras@gameleira.pe.gov.br',perfil:'diretor_compras',ativo:true,avatar:''},
  {id:'3',nome:'Dr. Luís',cargo:'Secretário de Saúde',email:'saude@gameleira.pe.gov.br',perfil:'secretaria',ativo:true,avatar:''},
]

export const INIT_LG: Log[] = [
  {id:'1',usuario:'Ana Lima',modulo:'Ofícios',tipo:'create',descricao:'Criou OFF-2025-0001',data:'2025-05-22T08:15:00'},
  {id:'2',usuario:'Admin',modulo:'Processos',tipo:'create',descricao:'Criou PL-2025-0001',data:'2025-05-22T09:30:00'},
]
