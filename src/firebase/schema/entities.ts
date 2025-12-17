import { Timestamp } from "firebase/firestore";

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
  instituicao: string;
  estados: string[];
  municipios: string[];
  lei: string;
  status: "pendente" | "aprovado" | "reprovado";
  dataAprovado?: Timestamp;
  notificacoes?: [
    {p3: Timestamp, enviado: boolean},
    {p7: Timestamp, enviado: boolean},
    {p10: Timestamp, enviado: boolean}
  ];
  ativo: boolean;
  compliance: boolean;
  empresas: { nome: string; valorAportado: number }[];
  indicacao?: string;
  ultimoFormulario?: string;
  valorAprovado?: number;
}

export interface formsCadastroDados {
  projetoID: string;
  dataPreenchido: string;
  instituicao: string;
  cnpj: string;
  representante: string;
  telefone: string;
  emailLegal: string;
  responsavel: string;
  emailResponsavel: string;
  cep: string;
  endereco: string;
  numeroEndereco?: number;
  complemento?: string;
  cidade: string;
  estado: string;
  nomeProjeto: string;
  website?: string; 
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
  numeroLei?: string;
  contrapartidasProjeto: string;
  observacoes: string;
  termosPrivacidade: boolean;
  diario: string[];
  apresentacao: string[];
  compliance: string[];
  documentos: string[];
}

export interface formsAcompanhamentoDados {
  projetoID: string;
  dataResposta: string;
  usuarioID: string;
  instituicao?: string;
  descricao?: string;
  segmento: string;
  lei: string;
  pontosPositivos?: string;
  pontosNegativos?: string;
  pontosAtencao? : string;
  ambito?: string;
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
  website?: string;
  links?: string;
  contrapartidasExecutadas?: string;
}

export interface dadosEstados {
  nomeEstado: string;
  qtdProjetos: number;
  qtdMunicipios: number;
  municipios: string[]
  valorTotal: number;
  maiorAporte: {nome: string, valorAportado: number};
  beneficiariosDireto: number;
  beneficiariosIndireto: number;
  qtdOrganizacoes: number;
  projetosODS?: number[];
  segmento: { nome: string; qtdProjetos: number }[];
  lei: { nome: string; qtdProjetos: number }[];
  idProjects: string[]
}

 export interface dadosProjeto {
   qtdProjetos: number;
   instituicao: string;
   valorAprovado: {nome: string, valorAportado: number};
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
  { id: 5, nome: "Outro:" },
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
