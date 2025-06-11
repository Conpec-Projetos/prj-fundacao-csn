"use client";
import Footer from "@/components/footer/footer";
import BarChart from "@/components/chart/barchartClient";
import PieChart from "@/components/chart/piechartClient";
import BrazilMap from "@/components/map/brazilMap";
import { FaCaretDown } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { EstadoInputDashboard, CidadeInputDashboard } from "@/components/inputs/inputs";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { dadosEstados, dadosProjeto } from "@/firebase/schema/entities";

export default function DashboardPage() {
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
    const maiorAporteGlobal = array.map(d => d.maiorAporte).reduce((max, curr) => {
      if (!max || (curr && curr.valorAportado > max.valorAportado)) {
        return curr;
      }
      return max;
      }, null as { nome: string; valorAportado: number} | null) ?? { nome: '', valorAportado: 0 };

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
    const maiorAporteGlobal = array.map(d => d.valorAportadoReal).reduce((max, curr) => {
      if (!max || (curr && curr.valorAportado > max.valorAportado)) {
        return curr;
      }
      return max;
      }, null as { nome: string; valorAportado: number} | null) ?? { nome: '', valorAportado: 0 };

    const organizacoes = Array.from(new Set(array.map(d => d.instituicao)));

    const leisAgrupadas: Record<string, number> = {}

    array.forEach(d => {
        leisAgrupadas[d.lei.nome] = (leisAgrupadas[d.lei.nome] ?? 0) + d.lei.qtdProjetos;
      });
    
    const resultLeis = Object.entries(leisAgrupadas).map(([nome, qtdProjetos]) => ({
      nome,
      qtdProjetos
    }));

    const segmentosAgrupados: Record<string, number> = {}

    array.forEach(d => {
        segmentosAgrupados[d.segmento.nome] = (leisAgrupadas[d.segmento.nome] ?? 0) + d.segmento.qtdProjetos;
      });
    
    const resultSegmentos = Object.entries(segmentosAgrupados).map(([nome, qtdProjetos]) => ({
      nome,
      qtdProjetos
    }));

    const somaODS = (array: { ods: number[] }[]): number[] => {
  return array.reduce((acc, curr) => {
    if (!acc.length) return curr.ods ?? [];
    return acc.map((v, i) => v + (curr.ods?.[i] ?? 0));
  }, [] as number[]);
};


  
    const initial: dadosEstados = {
    nomeEstado: "",
    valorTotal: 0,
    maiorAporte: maiorAporteGlobal,
    qtdProjetos: 0,
    beneficiariosDireto: 0,
    beneficiariosIndireto: 0,
    qtdOrganizacoes: organizacoes.length,
    qtdMunicipios: 0,
    projetosODS: [],
    lei: [],
    segmento: [],
  };

  return array.reduce((acc, curr) => ({
    ...acc,
    valorTotal: (acc.valorTotal ?? 0) + (curr.valorAportadoReal?.valorAportado ?? 0),
    maiorAporte: maiorAporteGlobal,
    qtdProjetos: array.length,
    qtdOrganizacoes: organizacoes.length,
    beneficiariosDireto: (acc.beneficiariosDireto ?? 0) + (curr.beneficiariosDireto ?? 0),
    beneficiariosIndireto: (acc.beneficiariosIndireto ?? 0) + (curr.beneficiariosIndireto ?? 0),
    projetosODS: resultODS,
    lei: resultLeis,
    segmento: resultSegmentos
    
  }), initial);
}


  const buscarDadosGerais =
    useCallback(async (): Promise<dadosEstados | null> => {
      const consulta = query(collection(db, 'dadosEstados'), where("qtdProjetos", "!=", 0))

      const consultaSnapshot = await getDocs(consulta);
      const todosDados: dadosEstados[] = [];
      const dadosMapaTemp: Record<string, number> = {} as Record<
        string,
        number
      >;

      consultaSnapshot.forEach((doc) => {
        todosDados.push(doc.data() as dadosEstados);
        dadosMapaTemp[doc.data().nomeEstado] = doc.data().qtdProjetos;
      });
      setDadosMapa(dadosMapaTemp);
      setEstadosAtendidos(todosDados.length)
      return somarDadosEstados(todosDados);
    }, []);

    const buscarDadosMunicipios = useCallback(async ( municipios:string[]): Promise<dadosProjeto> => {
      const idsUltimosForms: string[] = [];
      const valoresAportados: Record<string, number> = {};
      const nomesProjetos: Record<string, string> = {};
      const todosDados: dadosProjeto[] = {} as dadosProjeto[];

      //Procuro nos projetos quais atuam em cada municipio e armazeno os ids
      for (const municipio of municipios) {
        const consulta = query(collection(db, 'projetos'), where('municipios', 'array-contains', municipio));
        const consultaSnapshot = await getDocs(consulta);

        consultaSnapshot.forEach((doc) => {
          idsUltimosForms.push(doc.data().ultimoFormulario)
          valoresAportados[doc.data().ultimoFormulario] = doc.data().valorAportadoReal
          nomesProjetos[doc.data().ultimoFormulario] = doc.data().nome
        })
      }
      //Evito ids repetidos
      const idsUltimosFormsUnicos = Array.from(new Set(idsUltimosForms));

      //Pego os dados do forms de acompanhamento e armazeno em um array com todos os dados
      for (const id of idsUltimosFormsUnicos) {
        const refForms = doc(db, 'forms-acompanhamento', id)
        const formsSnapshot = await getDoc(refForms)

        if (formsSnapshot.exists()) {
          const dado = formsSnapshot.data();
          const dadoFiltrado: dadosProjeto = {
            instituicao: dado.instituicao,
            qtdProjetos: dado.qtdProjetos,
            valorAportadoReal: {valorAportado: valoresAportados[id], nome:nomesProjetos[id]},
            beneficiariosDireto: dado.beneficiariosDiretos,
            beneficiariosIndireto: dado.beneficiariosIndiretos,
            ods: dado.ods,
            segmento: {nome: dado.segmento, qtdProjetos: 1},
            lei: {nome:dado.lei, qtdProjetos: 1}
          }
          todosDados.push(dadoFiltrado)
        }
      }
      return todosDados
    }, [])



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
  // Sample Estados de Atuação data
  const estadosSiglas = {
    "Acre" : "AC",
    "Alagoas" : "AL",
    "Amapá" : "AP",
    "Amazonas" : "AM",
    "Bahia" : "BA",
    "Ceará" : "CE",
    "Distrito Federal" : "DF",
    "Espírito Santo" : "ES",
    "Goiás" : "GO",
    "Maranhão" : "MA",
    "Mato Grosso" : "MT",
    "Mato Grosso do Sul" : "MS",
    "Minas Gerais" : "MG",
    "Pará" : "PA",
    "Paraíba" : "PB",
    "Paraná" : "PR",
    "Pernambuco" : "PE",
    "Piauí" : "PI",
    "Rio de Janeiro" : "RJ",
    "Rio Grande do Norte" : "RN",
    "Rio Grande do Sul" : "RS",
    "Rondônia" : "RO",
    "Roraima" : "RR",
    "Santa Catarina" : "SC",
    "São Paulo" : "SP",
    "Sergipe" : "SE",
    "Tocantins" : "TO",
  };

  const [ehCelular, setEhCelular] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [estado, setEstado] = useState<string>("");
  const [dados, setDados] = useState<dadosEstados | null>(null);
  const [dadosMapa, setDadosMapa] = useState<Record<string, number>>({});
  const [estadosAtendidos, setEstadosAtendidos] = useState<number>(0);
  const [cidades, setCidades] = useState<string[]>([]);
  const [filtrarPorEstado, setFiltrarPorEstado] = useState<boolean>(false);

  const segmentoNomes: string[] =
    dados?.segmento.map((item) => item.nome) ?? [];
  const segmentoValores: number[] =
    dados?.segmento.map((item) => item.qtdProjetos) ?? [];
  const leiNomes: string[] = dados?.lei.map((item) => item.nome) ?? [];
  const leiValores: number[] = dados?.lei.map((item) => item.qtdProjetos) ?? [];

  useEffect(() => {
    const lidarRedimensionamento = () => {
      setEhCelular(window.innerWidth < 640);
    };
    lidarRedimensionamento();
    window.addEventListener("resize", lidarRedimensionamento);
    return () => {
      window.removeEventListener("resize", lidarRedimensionamento);
    };
  }, []);

  useEffect(() => {
    if (estado != "" && cidades.length === 0) {
      buscarDadosEstado(estado).then((dado) => {
        if (dado) setDados(dado);
      });
    } else if(estado === '' && cidades.length === 0) {
      buscarDadosGerais().then((dado) => {
        if (dado) setDados(dado);
      }
    );
    } else if (estado != '' && cidades.length > 0) {
      buscarDadosMunicipios(cidades).then((dado) => {
        if (dado) 
      })
    }
  }, [estado, buscarDadosGerais, cidades, buscarDadosMunicipios]);

  //começo do código em si
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-blue-fcsn text-blue-fcsn dark:text-white-off">
      <main className="flex flex-col gap-5 p-4 sm:p-6 md:p-10">
        <div className="flex flex-row items-center w-full justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <div className="relative">
            {" "}
            {/* <-- Add relative here */}
            <button
              className="flex items-center gap-2 text-blue-fcsn dark:text-white-off bg-white-off dark:bg-blue-fcsn2 rounded-xl text-lg font-bold px-5 py-3 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FaCaretDown /> Aplicar Filtros
            </button>
            {isOpen && (
              <div className="absolute right-4 top-full flex flex-col justify-center items-center mt-2 min-w-[250px] max-w-sm w-fit rounded-lg bg-white dark:bg-blue-fcsn2 shadow-lg">
                <button className="cursor-pointer bg-blue-fcsn dark:bg-blue-fcsn3 text-white-off rounded-md m-4 p-3 text-lg font-bold"
                onClick={() => setFiltrarPorEstado(!filtrarPorEstado)}>
                  Filtrar por {filtrarPorEstado ? 'estado' : 'município'}
                </button>
                <div className=''>
                  <EstadoInputDashboard
                    text="Filtre por estado"
                    estado={estado}
                    setEstado={setEstado}
                    setCidades={setCidades}
                  />
                </div>
                <div className={`${filtrarPorEstado ? '' : 'hidden'}`}> 
                  <CidadeInputDashboard
                  text="Filtre por cidade"
                  estado={estado}
                  cidades={cidades}
                  setCidades={setCidades}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Summary Cards */}
        <section className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-right">
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
            <div className="mb-2">
              <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                Valor total investido em projetos
              </h1>
            </div>
            <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
              R$ {dados?.valorTotal},00
            </h1>
          </div>
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
            <div className="mb-2">
              <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                Maior Aporte
              </h1>
            </div>
            <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
              R$ {dados?.maiorAporte.valorAportado},00
            </h1>
            <h1 className="text-base text-blue-fcsn dark:text-white-off font-light">
              Investido em Projeto {dados?.maiorAporte.nome}
            </h1>
          </div>
        </section>

        <section className="grid grid-rows-2 gap-5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3">
              <p className="text-xl font-bold">{dados?.qtdProjetos}</p>
              <h2 className="text-lg mb-2">Projetos no total</h2>
            </div>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3">
              <p className="text-xl font-bold">{dados?.beneficiariosDireto}</p>
              <h2 className="text-lg">Beneficiários diretos</h2>
            </div>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3">
              <p className="text-xl font-bold">
                {dados?.beneficiariosIndireto}
              </p>
              <h2 className="text-lg">Beneficiários indiretos</h2>
            </div>
          </div>
          <div className={`grid gap-5 ${estado === '' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3">
              <p className="text-xl font-bold">{dados?.qtdOrganizacoes}</p>
              <h2 className="text-lg">Organizações envolvidas</h2>
            </div>
            <div className={`bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 ${estado === '' ? '' : 'hidden'}`}>
              <p className="text-xl font-bold">{estadosAtendidos}</p>
              <h2 className="text-lg">Estados atendidos</h2>
            </div>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3">
              <p className="text-xl font-bold">{dados?.qtdMunicipios}</p>
              <h2 className="text-lg">Municípios atendidos</h2>
            </div>
          </div>
        </section>
        {/* Section 2: ODS Chart */}
        <section className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
          <h2 className="text-2xl font-bold mb-5">
            Objetivos de Desenvolvimento Sustentável
          </h2>
          <div className="w-full sm:overflow-x-auto md:overflow-x-hidden">
            <div className="min-h-96 h-fit min-w-[600]px md:min-w-0">
              <BarChart
                title=""
                data={dados?.projetosODS ?? []}
                labels={odsData.labels}
                colors={["#b37b97"]}
                horizontal={ehCelular}
                celular={ehCelular}
                useIcons={true}
              />
            </div>
          </div>
        </section>
        {/* Section 3: Map and Chart */}
        {estado === "" && (
          <section
            className={`grid ${
              ehCelular ? "" : "grid-cols-2"
            } gap-4 bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5`}
          >
            <div className="flex flex-col overflow-x-auto md:overflow-x-hidden">
              <h2 className="text-2xl font-bold mb-4">Estados de atuação</h2>
              <div
                className={`lg:h-120 md:h-100 sm:h-80 w-full p-3 ${
                  ehCelular ? "hidden" : ""
                }`}
              >
                <BrazilMap data={dadosMapa} />
              </div>
            </div>
            <div className="flex flex-col">
              {/* box for the bar chart */}
              <div className="min-h-96 h-fit w-full">
                <BarChart
                  title=""
                  data={Object.values(dadosMapa)}
                  labels={Object.keys(dadosMapa).map(nome => estadosSiglas[nome] ?? nome)}
                  colors={["#b37b97"]}
                  horizontal={true}
                  useIcons={false}
                />
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-10">
            <h2 className="text-2xl font-bold mb-4">Segmento do projeto</h2>
            <div className="sm:h-120 h-fit">
              <PieChart
                data={segmentoValores}
                labels={segmentoNomes}
                colors={["#e74c3c", "#8e44ad", "#39c2e0", "#2ecc40", "#f1c40f"]}
                ehCelular={ehCelular}
              />
            </div>
          </div>
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Lei de Incentivo</h2>
            <div className="flex-grow w-full overflow-x-auto">
              <div className="min-w-[1000px]">
                {" "}
                {/* Adjust min-width as needed */}
                <BarChart
                  title=""
                  colors={["#b37b97"]}
                  data={leiValores}
                  labels={leiNomes}
                  horizontal={true}
                  useIcons={false}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
