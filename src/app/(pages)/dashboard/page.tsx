import Footer from "@/components/footer/footer";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { dadosEstados, dadosProjeto } from "@/firebase/schema/entities";
import DashboardClientArea from "@/components/dashboard/dashboardAreaClient";
import DashboardContent from "@/components/dashboard/dashboardContent";

//interface para o searchParams
interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

const estadosSiglas: { [key: string]: string } = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
};

async function getLeisSiglas(): Promise<{ [key: string]: string }> {
  const snapshot = await getDocs(collection(db, "leis"));
  const map: { [nome: string]: string } = {};

  snapshot.forEach((doc) => {
    const data = doc.data() as { nome: string; sigla: string }; // mudar para tipo lei
    if (data.nome && data.sigla) {
      map[data.nome] = data.sigla;
    }
  });

  return map;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {

  async function buscarDadosEstado(
    estado: string
  ): Promise<dadosEstados | null> {
    const docRef = doc(db, "dadosEstados", estado);
    console.log(estado);

    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const dados = docSnapshot.data() as dadosEstados;
        console.log("Documento encontrado");
        return dados;
      } else {
        console.log("Documento não existe");
        return null;
      }
    } catch (error) {
      console.error("Erro na busca do documento");
      throw error;
    }
  }

  function somarDadosEstados(array: dadosEstados[]): dadosEstados {
    const maiorAporteGlobal = array
      .map((d) => d.maiorAporte)
      .reduce((max, curr) => {
        if (!max || (curr && curr.valorAportado > max.valorAportado)) {
          return curr;
        }
        return max;
      }, null as { nome: string; valorAportado: number } | null) ?? {
      nome: "",
      valorAportado: 0,
    };

    return array.reduce((acc, curr) => {
      // Soma dos valores escalares
      const novoAcc = {
        nomeEstado: "Todos",
        valorTotal: (acc.valorTotal ?? 0) + (curr.valorTotal ?? 0),
        maiorAporte: maiorAporteGlobal,
        qtdProjetos: (acc.qtdProjetos ?? 0) + (curr.qtdProjetos ?? 0),
        beneficiariosDireto:
          (acc.beneficiariosDireto ?? 0) + (curr.beneficiariosDireto ?? 0),
        beneficiariosIndireto:
          (acc.beneficiariosIndireto ?? 0) + (curr.beneficiariosIndireto ?? 0),
        qtdOrganizacoes:
          (acc.qtdOrganizacoes ?? 0) + (curr.qtdOrganizacoes ?? 0),
        qtdMunicipios: (acc.qtdMunicipios ?? 0) + (curr.qtdMunicipios ?? 0),
        projetosODS: acc.projetosODS
          ? acc.projetosODS.map((v, i) => v + (curr.projetosODS?.[i] ?? 0))
          : curr.projetosODS ?? [],
        lei: [] as { nome: string; qtdProjetos: number }[],
        segmento: [] as { nome: string; qtdProjetos: number }[],
        municipios: [
          ...(acc.municipios ?? []),
          ...(curr.municipios ?? []),
        ],
      };

      // Agora agrupa e soma os segmentos

      const segmentosCombinados = [
        ...(acc.segmento || []),
        ...(curr.segmento || []),
      ];
      const leiCombinada = [...(acc.lei || []), ...(curr.lei || [])];

      const segmentoAgrupado = segmentosCombinados.reduce((segAcc, segCurr) => {
        const index = segAcc.findIndex((item) => item.nome === segCurr.nome);
        if (index >= 0) {
          segAcc[index].qtdProjetos += segCurr.qtdProjetos || 0;
        } else {
          segAcc.push({ ...segCurr });
        }
        return segAcc;
      }, [] as { nome: string; qtdProjetos: number }[]);

      novoAcc.segmento = segmentoAgrupado;

      const leiAgrupada = leiCombinada.reduce((leiAcc, leiCurr) => {
        const index = leiAcc.findIndex((item) => item.nome === leiCurr.nome);
        if (index >= 0) {
          leiAcc[index].qtdProjetos += leiCurr.qtdProjetos || 0;
        } else {
          leiAcc.push({ ...leiCurr });
        }
        return leiAcc;
      }, [] as { nome: string; qtdProjetos: number }[]);

      novoAcc.lei = leiAgrupada;

      return novoAcc;
    });
  }

  function somarDadosMunicipios(array: dadosProjeto[]): dadosEstados {
    const maiorAporteGlobal = array
      .map((d) => d.valorAprovado)
      .reduce((max, curr) => {
        if (!max || (curr && curr.valorAportado > max.valorAportado)) {
          return curr;
        }
        return max;
      }, null as { nome: string; valorAportado: number } | null) ?? {
      nome: "",
      valorAportado: 0,
    };

    const organizacoes = Array.from(new Set(array.map((d) => d.instituicao)));

    const leisAgrupadas: Record<string, number> = {};

    array.forEach((d) => {
      leisAgrupadas[d.lei.nome] =
        (leisAgrupadas[d.lei.nome] ?? 0) + d.lei.qtdProjetos;
    });

    const resultLeis = Object.entries(leisAgrupadas).map(
      ([nome, qtdProjetos]) => ({
        nome,
        qtdProjetos,
      })
    );

    const segmentosAgrupados: Record<string, number> = {};

    array.forEach((d) => {
      segmentosAgrupados[d.segmento.nome] =
        (leisAgrupadas[d.segmento.nome] ?? 0) + d.segmento.qtdProjetos;
    });

    const resultSegmentos = Object.entries(segmentosAgrupados).map(
      ([nome, qtdProjetos]) => ({
        nome,
        qtdProjetos,
      })
    );

    const projetosODS: number[] = Array(17).fill(0);

    array.forEach((d) => {
      d.ods.forEach((element) => {
        projetosODS[element] += 1;
      });
    });

    const initial: dadosEstados = {
      nomeEstado: "",
      valorTotal: 0,
      maiorAporte: maiorAporteGlobal,
      qtdProjetos: 0,
      beneficiariosDireto: 0,
      beneficiariosIndireto: 0,
      qtdOrganizacoes: organizacoes.length,
      qtdMunicipios: 0,
      projetosODS: projetosODS,
      lei: [],
      segmento: [],
      municipios: [],
    };

    return array.reduce(
      (acc, curr) => ({
        ...acc,
        valorTotal:
          (acc.valorTotal ?? 0) + (curr.valorAprovado?.valorAportado ?? 0),
        maiorAporte: maiorAporteGlobal,
        qtdProjetos: array.length,
        qtdOrganizacoes: organizacoes.length,
        beneficiariosDireto:
          (acc.beneficiariosDireto ?? 0) + (curr.beneficiariosDireto ?? 0),
        beneficiariosIndireto:
          (acc.beneficiariosIndireto ?? 0) + (curr.beneficiariosIndireto ?? 0),
        projetosODS: projetosODS,
        lei: resultLeis,
        segmento: resultSegmentos,
      }),
      initial
    );
  }

  async function buscarDadosGerais(): Promise<{
    dados: dadosEstados;
    dadosMapa: Record<string, number>;
    estadosAtendidos: number;
  }> {
    const consulta = query(
      collection(db, "dadosEstados"),
      where("qtdProjetos", "!=", 0)
    );

    const consultaSnapshot = await getDocs(consulta);
    const todosDados: dadosEstados[] = [];
    const dadosMapaTemp: Record<string, number> = {};

    consultaSnapshot.forEach((doc) => {
      const data = doc.data() as dadosEstados;
      todosDados.push(data);
      if (data.nomeEstado) {
        dadosMapaTemp[data.nomeEstado] = data.qtdProjetos;
      }
    });

    const dadosSomados = somarDadosEstados(todosDados);
    const totalEstadosAtendidos = todosDados.length;

    return {
      dados: dadosSomados,
      dadosMapa: dadosMapaTemp,
      estadosAtendidos: totalEstadosAtendidos,
    };
  }

  async function buscarDadosMunicipios(
    municipios: string[]
  ): Promise<dadosEstados> {
    const idsUltimosForms: string[] = [];
    const valoresAportados: Record<string, number> = {};
    const nomesProjetos: Record<string, string> = {};
    const todosDados: dadosProjeto[] = [] as dadosProjeto[];

    //Procuro nos projetos quais atuam em cada municipio e armazeno os ids
    for (const municipio of municipios) {
      const consulta = query(
        collection(db, "projetos"),
        where("municipios", "array-contains", municipio)
      );
      const consultaSnapshot = await getDocs(consulta);

      consultaSnapshot.forEach((doc) => {
        idsUltimosForms.push(doc.data().ultimoFormulario);
        valoresAportados[doc.data().ultimoFormulario] =
          doc.data().valorAprovado;
        nomesProjetos[doc.data().ultimoFormulario] = doc.data().nome;
      });
    }
    //Evito ids repetidos
    const idsUltimosFormsUnicos = Array.from(new Set(idsUltimosForms));

    //Pego os dados do forms de acompanhamento e armazeno em um array com todos os dados
    for (const id of idsUltimosFormsUnicos) {
      const refForms = doc(db, "forms-acompanhamento", id);
      const formsSnapshot = await getDoc(refForms);

      if (formsSnapshot.exists()) {
        const dado = formsSnapshot.data();
        const dadoFiltrado: dadosProjeto = {
          instituicao: dado.instituicao,
          qtdProjetos: dado.qtdProjetos,
          valorAprovado: {
            valorAportado: valoresAportados[id],
            nome: nomesProjetos[id],
          },
          beneficiariosDireto: dado.beneficiariosDiretos,
          beneficiariosIndireto: dado.beneficiariosIndiretos,
          ods: dado.ods,
          segmento: { nome: dado.segmento, qtdProjetos: 1 },
          lei: { nome: dado.lei, qtdProjetos: 1 },
        };
        todosDados.push(dadoFiltrado);
      } else {
        const refFormsCadastro = doc(db, "forms-cadastro", id);
        const formsCadastroSnapshot = await getDoc(refFormsCadastro);

        if (formsCadastroSnapshot.exists()) {
          const dado = formsCadastroSnapshot.data();
          const dadoFiltrado: dadosProjeto = {
            instituicao: dado.instituicao,
            qtdProjetos: dado.qtdProjetos,
            valorAprovado: {
              valorAportado: valoresAportados[id],
              nome: nomesProjetos[id],
            },
            beneficiariosDireto: dado.beneficiariosDiretos,
            beneficiariosIndireto: dado.beneficiariosIndiretos,
            ods: dado.ods,
            segmento: { nome: dado.segmento, qtdProjetos: 1 },
            lei: { nome: dado.lei, qtdProjetos: 1 },
          };
          todosDados.push(dadoFiltrado);
        }
      }
    }
    return somarDadosMunicipios(todosDados);
  }

  const resolvedSearchParams = await searchParams;
  const estadoParam = resolvedSearchParams?.estado;
  const estado = Array.isArray(estadoParam) ? estadoParam[0] ?? "" : estadoParam ?? "";
  const cidades = Array.isArray(resolvedSearchParams?.cidades)
    ? resolvedSearchParams.cidades
    : resolvedSearchParams?.cidades
    ? [resolvedSearchParams.cidades]
    : [];

  let dados: dadosEstados | null = null;
  let dadosMapa: Record<string, number> = {};
  let estadosAtendidos: number = 0;

  if (estado && cidades.length > 0) {
    dados = await buscarDadosMunicipios(cidades);
  } else if (estado) {
    dados = await buscarDadosEstado(estado);
  } else {
    const dadosGerais = await buscarDadosGerais();

    dados = dadosGerais.dados;
    dadosMapa = dadosGerais.dadosMapa;
    estadosAtendidos = dadosGerais.estadosAtendidos;
  }

  const odsData = {
    labels: [
      "ODS 1: Erradicação da Pobreza",
      "ODS 2: Fome Zero",
      "ODS 3: Saúde e Bem-Estar",
      "ODS 4: Educação de Qualidade",
      "ODS 5: Igualdade de Gênero",
      "ODS 6: Água Potável e Saneamento",
      "ODS 7: Energia Limpa e Acessível",
      "ODS 8: Trabalho Decente e Crescimento Econômico",
      "ODS 9: Indústria, Inovação e Infraestrutura",
      "ODS 10: Redução das Desigualdades",
      "ODS 11: Cidades e Comunidades Sustentáveis",
      "ODS 12: Consumo e Produção Responsáveis",
      "ODS 13: Ação Contra a Mudança Global do Clima",
      "ODS 14: Vida na Água",
      "ODS 15: Vida Terrestre",
      "ODS 16: Paz, Justiça e Instituições Eficazes",
      "ODS 17: Parcerias e Meios de Implementação",
    ],
  };


  const leisSiglas = await getLeisSiglas();
  console.log("Leis Siglas:", leisSiglas);
  const segmentoNomes: string[] =
    dados?.segmento.map((item) => item.nome) ?? [];
  const segmentoValores: number[] =
    dados?.segmento.map((item) => item.qtdProjetos) ?? [];
  const leiNomes: string[] = dados?.lei.map((item) => item.nome) ?? [];
  const leiSiglas: string[] =
    dados?.lei.map((item) => leisSiglas[item.nome]) ?? [];
  const leiValores: number[] = dados?.lei.map((item) => item.qtdProjetos) ?? [];

  //começo do código em si
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-blue-fcsn text-blue-fcsn dark:text-white-off">
      <DashboardClientArea>
        <DashboardContent
        dados={dados}
        dadosMapa={dadosMapa}
        estadosAtendidos={estadosAtendidos}
        estado={estado}
        cidades={cidades}
        odsData={odsData}
        segmentoNomes={segmentoNomes}
        segmentoValores={segmentoValores}
        leiNomes={leiNomes}
        leiSiglas={leiSiglas}
        leiValores={leiValores}
        estadosSiglas={estadosSiglas}
        />
      </DashboardClientArea>

      <Footer />
    </div>
  );
}
