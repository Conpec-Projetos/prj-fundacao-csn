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
import { Projetos } from "functions/src/tipos/entities";

//interface para o searchParams
interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
type ProjetoInfo = { id: string; repetiu: boolean; vezes: number };

type CorrecaoDadosGerais = {
  beneficiariosDiretos: number;
  beneficiariosIndiretos: number;
  ods: number[];
  segmento: string;
  lei: string;
};

type IdEscolhido = {
  id: string | null;
  idEscolhido: string; // se for do ultimoforms = ultimoForms se for do de projetos = projetos
};

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

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  async function buscarDadosEstado(
    estado: string
  ): Promise<dadosEstados | null> {
    const docRef = doc(db, "dadosEstados", estado);

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

  function somarDadosEstados(
    array: dadosEstados[],
    projRepetidos: Map<string, ProjetoInfo>
  ): dadosEstados {
    const maiorAporteGlobal = array
      .map((d) => d.maiorAporte)
      .reduce(
        (max, curr) => {
          if (!max || (curr && curr.valorAportado > max.valorAportado)) {
            return curr;
          }
          return max;
        },
        null as { nome: string; valorAportado: number } | null
      ) ?? {
      nome: "",
      valorAportado: 0,
    };

    const initialValue: dadosEstados = {
      nomeEstado: "Todos",
      valorTotal: 0,
      maiorAporte: maiorAporteGlobal,
      qtdProjetos: 0,
      beneficiariosDireto: 0,
      beneficiariosIndireto: 0,
      qtdOrganizacoes: 0,
      qtdMunicipios: 0,
      lei: [],
      segmento: [],
      municipios: [],
      idProjects: [],
    };

    return array.reduce((acc, curr) => {
      for (const id of curr.idProjects ?? []) {
        if (projRepetidos.has(id)) {
          const info = projRepetidos.get(id)!;
          info.vezes += 1;
          info.repetiu = true;
        } else {
          projRepetidos.set(id, { id, repetiu: false, vezes: 1 });
        }
      }
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
          : (curr.projetosODS ?? []),
        lei: [] as { nome: string; qtdProjetos: number }[],
        segmento: [] as { nome: string; qtdProjetos: number }[],
        municipios: [...(acc.municipios ?? []), ...(curr.municipios ?? [])],
        idProjects: [...(acc.idProjects ?? []), ...(curr.idProjects ?? [])], // nao precisamos desse campo, entao nao importa o que estiver aq
      };

      // Agora agrupa e soma os segmentos

      const segmentosCombinados = [
        ...(acc.segmento || []),
        ...(curr.segmento || []),
      ];
      const leiCombinada = [...(acc.lei || []), ...(curr.lei || [])];

      const segmentoAgrupado = segmentosCombinados.reduce(
        (segAcc, segCurr) => {
          const index = segAcc.findIndex((item) => item.nome === segCurr.nome);
          if (index >= 0) {
            segAcc[index].qtdProjetos += segCurr.qtdProjetos || 0;
          } else {
            segAcc.push({ ...segCurr });
          }
          return segAcc;
        },
        [] as { nome: string; qtdProjetos: number }[]
      );

      novoAcc.segmento = segmentoAgrupado;

      const leiAgrupada = leiCombinada.reduce(
        (leiAcc, leiCurr) => {
          const index = leiAcc.findIndex((item) => item.nome === leiCurr.nome);
          if (index >= 0) {
            leiAcc[index].qtdProjetos += leiCurr.qtdProjetos || 0;
          } else {
            leiAcc.push({ ...leiCurr });
          }
          return leiAcc;
        },
        [] as { nome: string; qtdProjetos: number }[]
      );

      novoAcc.lei = leiAgrupada;

      return novoAcc;
    }, initialValue);
  }

  async function buscarProjetosEmLote(
    projetoIds: string[]
  ): Promise<Record<string, Projetos>> {
    const resultado: Record<string, Projetos> = {};

    // Se não há IDs, retorna objeto vazio
    if (projetoIds.length === 0) {
      return resultado;
    }

    // Firestore limita a 10 documentos por consulta com "in"
    const batchSize = 10;

    for (let i = 0; i < projetoIds.length; i += batchSize) {
      const batchIds = projetoIds.slice(i, i + batchSize);

      // ✅ CORREÇÃO: batchIds é um array de strings
      const projetosQuery = query(
        collection(db, "projetos"),
        where("__name__", "in", batchIds)
      );

      const snapshot = await getDocs(projetosQuery);
      snapshot.forEach((doc) => {
        resultado[doc.id] = doc.data() as Projetos;
      });

      // Pequena pausa para evitar limites do Firestore
      if (i + batchSize < projetoIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return resultado;
  }

  async function correcaoSoma(id: IdEscolhido): Promise<CorrecaoDadosGerais> {
    const correcao: CorrecaoDadosGerais = {
      beneficiariosDiretos: 0,
      beneficiariosIndiretos: 0,
      ods: [],
      lei: "",
      segmento: ""
    };

    try {
      // como esse id é do ultimo formulario ele pode nao existir, pois so é criado se ja preenchemos o forms de acompanhamento
      if (id.idEscolhido == "projetos") {
        // ou seja so tem forms de cadastro obrigatoriamente
        const formCadastro = query(
          collection(db, "forms-cadastro"),
          where("projetoID", "==", id.id)
        );
        const cadastroSnapshot = await getDocs(formCadastro);

        if (!cadastroSnapshot.empty) {
          // ✅ CORREÇÃO: Acessar o primeiro documento corretamente
          const doc = cadastroSnapshot.docs[0];
          const data = doc.data();

          correcao.beneficiariosDiretos = data?.beneficiariosDiretos ?? 0;
          correcao.ods = data?.ods ?? [];
          correcao.lei = data?.lei ?? ""
          correcao.segmento = data?.segmento ?? ""
          return correcao;
        }
      }
      // ✅ CORREÇÃO: Tratar campos inconsistentes entre formulários
      const refAcompanhamento = doc(db, "forms-acompanhamento", id.id!);
      const acompanhamentoSnapshot = await getDoc(refAcompanhamento);

      if (acompanhamentoSnapshot.exists()) {
        const data = acompanhamentoSnapshot.data();
        correcao.beneficiariosDiretos =
          data?.beneficiariosDireto ?? data?.beneficiariosDiretos ?? 0;
        correcao.beneficiariosIndiretos =
          data?.beneficiariosIndireto ?? data?.beneficiariosIndiretos ?? 0;
        correcao.ods = data?.ods ?? [];
        correcao.lei = data?.lei ?? ""
        correcao.segmento = data?.segmento ?? ""
        return correcao;
      }
      else{ // ESSE CENARIO PARECE NAO OCORRER, MAS POR PRECAUCAO: caso que possui o id do ultimo formulario (logo ja criou pelo menos um forms de acompanhamento) mas por algum motivo é o id do de cadastro que foi atualizado por ultimo
        const refCadastro = doc(db, "forms-cadastro", id.id!);
        const cadastroSnapshot = await getDoc(refCadastro);

        if (cadastroSnapshot.exists()) {
          const data = cadastroSnapshot.data();
          correcao.beneficiariosDiretos =
            data?.beneficiariosDireto ?? data?.beneficiariosDiretos ?? 0;
          correcao.ods = data?.ods ?? [];
          correcao.lei = data?.lei ?? ""
          correcao.segmento = data?.segmento ?? ""
          return correcao;
        }
      }


      return correcao;
    } catch (error) {
      console.error(`Erro ao buscar dados do forms com id ${id.id}:`, error);
      return correcao;
    }
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

    // inicialização
    const projRepetidos = new Map<string, ProjetoInfo>();

    // passando o projRepetidos por parametro para a soma
    const dadosSomados = somarDadosEstados(todosDados, projRepetidos);
    const projetosRepetidosIds = Array.from(projRepetidos.entries())
      .filter(([, info]) => info.repetiu)
      .map(([id]) => id);

    if (projetosRepetidosIds.length > 0) {
      const projetosRepetidosData =
        await buscarProjetosEmLote(projetosRepetidosIds);

      for (const [id, info] of projRepetidos) {
        if (info.repetiu && projetosRepetidosData[id]) {
          const projetoData = projetosRepetidosData[id];

          // CORREÇÃO: Aplicar todas as correções
          dadosSomados.qtdProjetos -= info.vezes - 1;
          // CORREÇÃO: esses dados vem da colecao projeto
          const valorProjeto = projetoData.valorAprovado ?? 0;
          dadosSomados.valorTotal -= valorProjeto * (info.vezes - 1);
          dadosSomados.qtdOrganizacoes -= projetoData.empresas.length * (info.vezes - 1)

          // CORREÇÃO: Buscar e subtrair dados que obtemos do forms de cadastro ou do de acompanhamento
          const escolhaDoId: IdEscolhido = {
            id: projetoData.ultimoFormulario ?? null, // se nao existir sera null
            idEscolhido: "ultimoForms",
          };
          if ( escolhaDoId.id === null|| escolhaDoId.id === "" ||escolhaDoId.id === undefined ) {
            escolhaDoId.id = id; // esse id é que esta na colecao dadosEstados para cada estado dentro do array idProjects que estamos percorrendo, e ele é id do projeto na colecao projetos
            escolhaDoId.idEscolhido = "projetos";
          }
          const correcao = await correcaoSoma(escolhaDoId);
          dadosSomados.beneficiariosDireto -= correcao.beneficiariosDiretos * (info.vezes - 1);
          dadosSomados.beneficiariosIndireto -= correcao.beneficiariosIndiretos * (info.vezes - 1);
          // Correcao da lei em dadosSomados
          for (const l of dadosSomados.lei) {
            if (l.nome === correcao.lei) {
              l.qtdProjetos -= (info.vezes - 1); 
              break; // já achou a lei, pode sair do loop
            }
          }

          for (const seg of dadosSomados.segmento) {
            if (seg.nome === correcao.segmento) {
              seg.qtdProjetos -= (info.vezes - 1); 
              break; // já achou a lei, pode sair do loop
            }
          }

          // CORREÇÃO: Subtrair ODS
          if (dadosSomados.projetosODS && correcao.ods.length > 0) {
            dadosSomados.projetosODS = dadosSomados.projetosODS.map(
              (valor, index) => {
                // Se este ODS está no projeto, subtrai 1 para cada repetição
                const shouldSubtract =
                  correcao.ods.includes(index + 1) ||
                  correcao.ods.includes(index);
                return shouldSubtract
                  ? Math.max(0, valor - (info.vezes - 1))
                  : valor;
              }
            );
          }
        }
      }
    }

    const totalEstadosAtendidos = todosDados.length;

    return {
      dados: dadosSomados,
      dadosMapa: dadosMapaTemp,
      estadosAtendidos: totalEstadosAtendidos,
    };
  }

  function somarDadosMunicipios(array: dadosProjeto[]): dadosEstados {
    const maiorAporteGlobal = array
      .map((d) => d.valorAprovado)
      .reduce(
        (max, curr) => {
          if (!max || (curr && curr.valorAportado > max.valorAportado)) {
            return curr;
          }
          return max;
        },
        null as { nome: string; valorAportado: number } | null
      ) ?? {
      nome: "",
      valorAportado: 0,
    };

    const organizacoes = Array.from(new Set(array.map((d) => d.instituicao)));

    const leisAgrupadas: Record<string, number> = {};

    // ✅ Correto
    array.forEach((d) => {
      segmentosAgrupados[d.segmento.nome] =
        (segmentosAgrupados[d.segmento.nome] ?? 0) + d.segmento.qtdProjetos;
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
      idProjects: [], // nunca sera preenchido aq
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
        // verifica se o forms de acompanhamento existe, pois se existir os dados vem dele
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
  const estado = Array.isArray(estadoParam)
    ? (estadoParam[0] ?? "")
    : (estadoParam ?? "");
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

 // fazer um if pois so vai buscar dessa forma se nao houver proj repetidos 
  const leisSiglas = await getLeisSiglas();
  const segmentoNomes: string[] =
    dados?.segmento.map((item) => item.nome) ?? [];
  const segmentoValores: number[] =
    dados?.segmento.map((item) => item.qtdProjetos) ?? [];
  const leiNomes: string[] = dados?.lei.map((item) => item.nome) ?? [];
  const leiSiglas: string[] =
    dados?.lei.map((item) => leisSiglas[item.nome]) ?? [];
  const leiValores: number[] = dados?.lei.map((item) => item.qtdProjetos) ?? [];

  // console.log(dados);
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
