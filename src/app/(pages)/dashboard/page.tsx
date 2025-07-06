"use client";
import Footer from "@/components/footer/footer";
import BarChart from "@/components/chart/barchartClient";
import BarChartLeis from "@/components/chart/barchartLeisClient"
import PieChart from "@/components/chart/piechartClient";
import BrazilMap from "@/components/map/brazilMap";
import { FaCaretDown } from "react-icons/fa";
import { useCallback, useEffect, useState, useRef } from "react";
import GeradorPDF from "@/components/pdf/geradorPDF";
import { EstadoInputDashboard, CidadeInputDashboard } from "@/components/inputs/inputs";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { dadosEstados, dadosProjeto } from "@/firebase/schema/entities";
import { usePDF } from "@/context/pdfContext";

const estadosSiglas: {[key:string]: string} = {
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

export const leisSiglas: { [key: string]: string } = {
  "Lei de Incentivo à Cultura": "LIC",
  "PROAC - Programa de Ação Cultural": "PROAC",
  "FIA - Lei Fundo para a Infância e Adolescência": "FIA",
  "LIE - Lei de Incentivo ao Esporte": "LIE",
  "Lei da Pessoa Idosa": "LPI",
  "Pronas - Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência": "Pronas",
  "Pronon - Programa Nacional de Apoio à Atenção Oncológica": "Pronon",
  "Promac - Programa de Incentivo à Cultura do Município de São Paulo": "Promac",
  "ICMS - MG Imposto sobre Circulação de Mercadoria e Serviços": "ICMS - MG",
  "ICMS - RJ Imposto sobre Circulação de Mercadoria e Serviços": "ICMS - RJ",
  "PIE - Lei Paulista de Incentivo ao Esporte": "PIE",
};

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

    const projetosODS:number[] = Array(17).fill(0)
    
    array.forEach(d => {
      d.ods.forEach(element => {
        projetosODS[element] += 1
      })
    })


  
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
  };

  return array.reduce((acc, curr) => ({
    ...acc,
    valorTotal: (acc.valorTotal ?? 0) + (curr.valorAportadoReal?.valorAportado ?? 0),
    maiorAporte: maiorAporteGlobal,
    qtdProjetos: array.length,
    qtdOrganizacoes: organizacoes.length,
    beneficiariosDireto: (acc.beneficiariosDireto ?? 0) + (curr.beneficiariosDireto ?? 0),
    beneficiariosIndireto: (acc.beneficiariosIndireto ?? 0) + (curr.beneficiariosIndireto ?? 0),
    projetosODS: projetosODS,
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

    const buscarDadosMunicipios = useCallback(async ( municipios:string[]): Promise<dadosEstados> => {
      const idsUltimosForms: string[] = [];
      const valoresAportados: Record<string, number> = {};
      const nomesProjetos: Record<string, string> = {};
      const todosDados: dadosProjeto[] = [] as dadosProjeto[];

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
        } else {
            const refFormsCadastro = doc(db, 'forms-cadastro', id)
            const formsCadastroSnapshot = await getDoc(refFormsCadastro)

            if (formsCadastroSnapshot.exists()) {
              const dado = formsCadastroSnapshot.data();
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
    }
      return somarDadosMunicipios(todosDados)
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

  const refConteudo = useRef<HTMLDivElement>(null);
  const { isPdfMode } = usePDF();

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
  const leiSiglas: string[] = dados?.lei.map((item) => leisSiglas[item.nome]) ?? [];
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
        if (dado) setDados(dado)
      })
    }
  }, [estado, buscarDadosGerais, cidades, buscarDadosMunicipios]);

  //começo do código em si
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-blue-fcsn text-blue-fcsn dark:text-white-off">
      <main ref={refConteudo} className="flex flex-col space-y-5 p-4 sm:p-6 md:p-10">
        <div className="flex flex-row items-center w-full justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              <GeradorPDF refConteudo={refConteudo} nomeArquivo="dashboard-relatorio" />
              <div className="relative"> 
                <button
                  className={`flex items-center gap-2 text-blue-fcsn dark:text-white-off bg-white-off dark:bg-blue-fcsn2 hover:bg-stone-300 dark:hover:bg-blue-fcsn3 rounded-xl text-lg font-bold px-5 py-3 cursor-pointer ${isPdfMode ? 'hidden' : ''}`}
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
          </div>
        </div>

        {/* Section 1: Summary Cards*/}
        <section className={`my-2 text-right ${isPdfMode ? 'pdf-parent-float-container' : 'flex'}`}>
          <div className={isPdfMode ? 'pdf-float-left pdf-w-50 pdf-px-2' : 'w-full sm:w-1/2 lg:w-1/2 p-2'}>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full">
              <div className="mb-2">
                <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                  Valor total investido em projetos
                </h1>
              </div>
              <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
                R$ {dados?.valorTotal},00
              </h1>
              <h1 className="text-base text-blue-fcsn dark:text-white-off font-light">
                Investido em Projeto {dados?.maiorAporte.nome}
              </h1>
            </div>
          </div>
          <div className={isPdfMode ? 'pdf-float-left pdf-w-50 pdf-px-2' : 'w-full sm:w-1/2 lg:w-1/2 p-2'}>
            <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full">
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
          </div>
        </section>

        {/* Section 2: Stats*/}
        {cidades.length > 0 && (
          <section className="flex flex-wrap my-2.5 text-left">
            <div className="w-full md:w-1/4 pb-2.5 pr-2.5">
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{dados?.qtdProjetos}</p>
                <h2 className="text-lg mb-2">Projetos no total</h2>
              </div>
            </div>
            <div className="w-full md:w-1/4 pb-2.5 pr-2.5">
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{dados?.beneficiariosDireto}</p>
                <h2 className="text-lg">Beneficiários diretos</h2>
              </div>
            </div>
            <div className="w-full md:w-1/4 pb-2.5 pr-2.5">
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{dados?.beneficiariosIndireto}</p>
                <h2 className="text-lg">Beneficiários indiretos</h2>
              </div>
            </div>
            <div className="w-full md:w-1/4 pb-2.5">
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{dados?.qtdOrganizacoes}</p>
                <h2 className="text-lg">Organizações envolvidas</h2>
              </div>
            </div>
          </section>
        )}

        {cidades.length === 0 && (
          <section className="space-y-5 text-left">
            <div className="flex flex-wrap -m-2.5">
              <div className="w-full md:w-1/3 p-2.5">
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{dados?.qtdProjetos}</p>
                  <h2 className="text-lg mb-2">Projetos no total</h2>
                </div>
              </div>
              <div className="w-full md:w-1/3 p-2.5">
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{dados?.beneficiariosDireto}</p>
                  <h2 className="text-lg">Beneficiários diretos</h2>
                </div>
              </div>
              <div className="w-full md:w-1/3 p-2.5">
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{dados?.beneficiariosIndireto}</p>
                  <h2 className="text-lg">Beneficiários indiretos</h2>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap -m-2.5">
              <div className={`p-2.5 ${estado === '' ? 'w-full md:w-1/3' : 'w-full md:w-1/2'}`}>
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{dados?.qtdOrganizacoes}</p>
                  <h2 className="text-lg">Organizações envolvidas</h2>
                </div>
              </div>
              <div className={`p-2.5 ${estado === '' ? 'w-full md:w-1/3' : 'hidden'}`}>
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{estadosAtendidos}</p>
                  <h2 className="text-lg">Estados atendidos</h2>
                </div>
              </div>
              <div className={`p-2.5 ${estado === '' ? 'w-full md:w-1/3' : 'w-full md:w-1/2'}`}>
                <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                  <p className="text-xl font-bold">{dados?.qtdMunicipios}</p>
                  <h2 className="text-lg">Municípios atendidos</h2>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 3: ODS Chart */}
        <section className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
          <h2 className="text-2xl font-bold mb-5">
            Objetivos de Desenvolvimento Sustentável
          </h2>
          <div className="w-full sm:overflow-x-auto md:overflow-x-hidden">
            <div className="min-h-96 h-fit min-w-[600]px md:min-w-0">
              <BarChart
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

        {/* Section 4: Map and Chart*/}
        {estado === "" && (
          <section className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap -m-2">
                <div className={`w-full ${ehCelular ? 'hidden' : 'lg:w-1/2'} p-2`}>
                    <h2 className="text-2xl font-bold mb-4">Estados de atuação</h2>
                    <div className="lg:h-120 md:h-100 sm:h-80 w-full p-3">
                        <BrazilMap data={dadosMapa} />
                    </div>
                </div>
                <div className={`w-full ${ehCelular ? '' : 'lg:w-1/2'} p-2`}>
                    <div className="min-h-96 h-fit w-full">
                        <BarChart
                        data={Object.values(dadosMapa)}
                        labels={Object.keys(dadosMapa).map(nome => estadosSiglas[nome] ?? nome)}
                        colors={["#b37b97"]}
                        horizontal={true}
                        useIcons={false}
                        />
                    </div>
                </div>
            </div>
          </section>
        )}

  {/* Section 5: Pie and Bar Charts*/}  
  <section className={isPdfMode ? 'pdf-parent-float-container' : 'flex flex-wrap -m-4'}>
    <div className={isPdfMode ? 'pdf-float-left pdf-w-50 pdf-px-4 h-[700px]' : 'w-full md:w-1/2 p-4'}>
      <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-10 h-full">
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
    </div>
    <div className={isPdfMode ? 'pdf-float-left pdf-w-50 pdf-px-4 h-[700px]' : 'w-full md:w-1/2 p-4'}>
      <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Lei de Incentivo</h2>
        <div className="flex-grow w-full overflow-x-auto">
          <div className="">
            <BarChartLeis
              colors={["#b37b97"]}
              data={leiValores}
              siglas={leiSiglas}
              labels={leiNomes}
              horizontal={true}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
      </main>
      <Footer />
    </div>
  );
}