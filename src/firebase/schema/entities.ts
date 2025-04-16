export interface formsAcompanhamentoData {
    userid: string; check
    projectid: string; check
    nome: string; check
    descricao: string; check
    positivos: string; check
    negativos: string; check
    atencao: string; check
    especificacoes: string; check
    contrapartidas: string; check
    website: string; check
    links: string; check
    executadas: string; check
    relato: string; check
    ambito: number; check
    segmento: number; check
    lei: number; checj
    dataComeco: string; check
    dataFim: string; check
    beneficiarios: number[]; check
    dei: boolean; check
    etnias: number[]; check
    ODS: boolean[]; check
    estados: string[]; check
    cidades: string[]; check
    fotos: File[];
}