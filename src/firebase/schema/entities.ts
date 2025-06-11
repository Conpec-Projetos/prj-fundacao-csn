export interface Associacao {
  usuarioID: string;
  projetosIDs: string[];
}

export interface usuarioExt {
  nome: string;
  email: string;
}

export interface usuarioInt {
  nome: string;
  email: string;
  administrador: boolean;
}

export interface Projetos {
  nome: string;
  municipios: string[];
  status: "pendente" | "aprovado" | "reprovado";
  ativo: boolean;
  compliance: "pendente" | "aprovado" | "reprovado";
  empresas: string[];
  indicacao?: string;
  ultimoFormulario?: string;
  valorAportadoReal: number;
}

export interface formsCadastroDados {
  dataPreenchido: string;
  instituicao: string;
  cnpj: string;
  representante: string;
  telefone: string;
  emailLegal: string;
  emailResponsavel: string;
  cep: string;
  endereco: string;
  numeroEndereco: number;
  complemento?: string;
  cidade: string;
  estado: string;
  nomeProjeto: string;
  website: string; 
  valorAprovado: number;
  valorApto: number;
  dataInicial: string;
  dataFinal: string;
  banco: string;
  agencia: string;
  conta: string;
  segmento: string;
  descricao: string;
  publico: string[];
  ods: number[];
  beneficiariosDiretos: number;
  qtdEstados: number;   
  estados: string[];  
  qtdMunicipios: number;
  municipios: string[];
  lei: string;
  numeroLei: string;
  contrapartidasProjeto: string;
  observacoes: string;
  termosPrivacidade: boolean;
}

export interface formsCadastroDocumentos {
  projetoID: string;
  diario: string[];
  apresentacao: string[];
  compliance: string[];
  documentos: string[];
}

export interface formsAcompanhamentoDados {
  projetoID: string;
  dataResposta: string;
  usuarioID: string;
  instituicao: string;
  descricao: string;
  segmento: string;
  lei: string;
  pontosPositivos?: string;
  pontosNegativos?: string;
  pontosAtencao? : string;
  ambito: string;
  qtdEstados: number;
  estados: string[];
  qtdMunicipios: number;
  municipios: string[];
  especificacoes: string;
  dataInicial: string;
  dataFinal: string;
  contrapartidasProjeto: string;
  beneficiariosDiretos: number;
  beneficiariosIndiretos: number;
  diversidade: boolean;
  qtdAmarelas: number;
  qtdBrancas: number;
  qtdIndigenas: number;
  qtdPardas: number;
  qtdPretas: number;
  qtdMulherCis: number;
  qtdMulherTrans: number;
  qtdHomemCis: number;
  qtdHomemTrans: number;
  qtdNaoBinarios: number;
  qtdPCD: number;
  qtdLGBT: number;
  ods: number[];
  relato?: string;
  fotos: string[];
  website: string;
  links: string;
  contrapartidasExecutadas?: string;
}

export interface dadosEstados {
  nomeEstado: string;
  qtdProjetos: number;
  qtdMunicipios: number;
  valorTotal: number;
  maiorAporte: {nome: string, valorAportado: number};
  beneficiariosDireto: number;
  beneficiariosIndireto: number;
  qtdOrganizacoes: number;
  projetosODS: number[];
  segmento: { nome: string; qtdProjetos: number }[];
  lei: { nome: string; qtdProjetos: number }[];
}

 export interface dadosProjeto {
   qtdProjetos: number;
   instituicao: string;
   valorAportadoReal: {nome: string, valorAportado: number};
   beneficiariosDireto: number;
   beneficiariosIndireto: number;
   ods: number[];
   segmento: { nome: string; qtdProjetos: number };
   lei: { nome: string; qtdProjetos: number };
}

export interface ambito {
  id: number;
  nome: string;
}

export const ambitoList: ambito[] = [
  { id: 0, nome: "Nacional" },
  { id: 1, nome: "Estadual" },
  { id: 2, nome: "Municipal" }
];

export interface Segmento {
  id: number;
  nome: string;
}

export const segmentoList: Segmento[] = [
  { id: 0, nome: "Cultura" },
  { id: 1, nome: "Esporte" },
  { id: 2, nome: "Pessoa Idosa" },
  { id: 3, nome: "Criança e Adolescente" },
  { id: 4, nome: "Saúde" },
];

export interface Lei {
  id: number;
  nome: string;
}

export const leiList: Lei[] = [
  { id: 0, nome: "Lei de Incentivo à Cultura" },
  { id: 1, nome: "PROAC - Programa de Ação Cultural" },
  { id: 2, nome: "FIA - Lei Fundo para a Infância e Adolescência" },
  { id: 3, nome: "LIE - Lei de Incentivo ao Esporte" },
  { id: 4, nome: "Lei da Pessoa Idosa" },
  { id: 5, nome: "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência" },
  { id: 6, nome: "Pronon - Programa Nacional de Apoio à Atenção Oncológica" },
  { id: 7, nome: "Promac - Programa de Incentivo à Cultura do Município de São Paulo" },
  { id: 8, nome: "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços" },
  { id: 9, nome: "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços" },
  { id: 10, nome: "PIE - Lei Paulista de Incentivo ao Esporte" }
];


export interface Publico {
  id: number;
  nome: string;
}

export const publicoList: Publico[] = [
  { id: 0, nome: "Crianças" },
  { id: 1, nome: "Adolescentes" },
  { id: 2, nome: "Jovens" },
  { id: 3, nome: "Adultos" },
  { id: 4, nome: "Idosos" },
  { id: 5, nome: "" },
];

export interface Ods {
  id: number;
  nome: string;
}

export const odsList: Ods[] = [
  { id: 0, nome: "Erradicar a pobreza" },
  { id: 1, nome: "Fome zero e agricultura sustentável" },
  { id: 2, nome: "Saúde e bem-estar" },
  { id: 3, nome: "Educação de qualidade" },
  { id: 4, nome: "Igualdade de gênero" },
  { id: 5, nome: "Água potável e saneamento" },
  { id: 6, nome: "Energia limpa e acessível" },
  { id: 7, nome: "Trabalho decente e crescimento econômico" },
  { id: 8, nome: "Indústria, inovação e infraestrutura" },
  { id: 9, nome: "Redução das desigualdades" },
  { id: 10, nome: "Cidades e comunidades sustentáveis" },
  { id: 11, nome: "Consumo e produção responsáveis" },
  { id: 12, nome: "Combate às mudanças climáticas" },
  { id: 13, nome: "Vida na água" },
  { id: 14, nome: "Vida terrestre" },
  { id: 15, nome: "Paz, justiça e instituições eficazes" },
  { id: 16, nome: "Parcerias e meios de implementação" }
];
