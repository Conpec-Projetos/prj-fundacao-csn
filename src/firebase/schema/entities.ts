import { Timestamp } from "firebase/firestore";

export interface Associacao {
  usuarioID: string;
  projetoID: string;
}

export interface usuarioExt {
  id: string;
  nome: string;
  email: string;
}

export interface usuarioInt {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
}

export interface Projetos {
  id: string;
  nome: string;
  aprovado: boolean;
  ativo: boolean;
  compliance: boolean;
  empresa: string;
  indicacao?: string;
  ultimoFormulario?: string;
  valorAportadoReal: number;
}

export interface formsCadastroDados {
  id: string;
  projetoID: string;
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
  valorSolicitado: number;
  valorAportado: number;
  dataInicial: Timestamp;
  dataFinal: Timestamp;
  diario: File;
  banco: string;
  agencia: string;
  conta: string;
  segmento: number;
  descricao: string;
  apresentacao: File;
  publico: number;
  ods: number[];
  beneficiariosDiretos: number;
  qtdEstados: number;   
  estados: string[];  
  qtdMunicipios: number;
  municipios: string[];
  lei: number;
  numeroLei: number;
  contrapartidasProjeto: string;
  observacoes: string;
  termosPrivacidade: boolean;
}

export interface formsAcompanhamentoDados {
  id: string;
  projetoID: string;
  dataResposta: Timestamp;
  usuarioID: string;
  instituicao: string;
  descricao: string;
  segmento: number;
  lei: number;
  pontosPositivos?: string;
  pontosNegativos?: string;
  pontosAtencao? : string;
  especificacoes: string;
  ambito: number;
  qtdEstados: number;
  estados: string[];
  qtdMunicipios: number;
  municipios: string[];
  especificacaoTerritorio: string;
  dataInicial: Timestamp;
  dataFinal: Timestamp;
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
  relato? : string;
  fotos: File[];
  website: string;
  links: string;
  contrapartidasExecutadas?: string;
}

export interface dadosEstados {
  nomeEstado: string;
  qtdProjetos: number;
  qtdMunicipios: number;
  valorTotal: number;
  maiorAporte: number;
  beneficiariosDiretos: number;
  beneficiariosIndiretos: number;
  qtdOrganizacoes: number;
  ods: number[];
  segmento: number[];
  lei: number[];
}

export interface dadosMunicipios {
  id: string;
  nomeCidade: string;
  nomeEstado: string;
  qtdProjetos: number;
  valorTotal: number;
  maiorAporte: number;
  beneficiariosDiretos: number;
  beneficiariosIndiretos: number;
  qtdOrganizacoes: number;
  ods: number[];
  segmento: number[];
  lei: number[];
}

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
  { id: 5, nome: "Outro" }
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
