"use client";

import { usePDF } from "@/context/pdfContext";
import { useEhCelular } from "@/context/ehCelular";
import BarChart from "@/components/chart/barchartClient";
import BarChartLeis from "../chart/barchartLeisClient";
import PieChart from "../chart/piechartClient";
import BrazilMap from "../map/brazilMap";
import { dadosEstados } from "@/firebase/schema/entities";

interface odsData {
  labels: string[];
}

interface DashboardContentProps {
  dados: dadosEstados | null;
  dadosMapa: Record<string, number>;
  estadosAtendidos: number;
  estado: string;
  cidades: string[];
  odsData: odsData;
  segmentoNomes: string[];
  segmentoValores: number[];
  leiNomes: string[];
  leiSiglas: string[];
  leiValores: number[];
  estadosSiglas: Record<string, string>;
}

export default function DashboardContent({ // parametros, eles sao passados na page dashboard
  dados,
  dadosMapa,
  estadosAtendidos,
  estado,
  cidades,
  odsData,
  segmentoNomes,
  segmentoValores,
  leiNomes,
  leiSiglas,
  leiValores,
  estadosSiglas,
}: DashboardContentProps) {
  const { isPdfMode } = usePDF();
  const ehCelular = useEhCelular();

  const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

  return (
    <>
      <section
        className={`my-2 text-right ${
          isPdfMode ? "pdf-parent-float-container" : "flex"
        }`}
      >
        <div
          className={
            isPdfMode
              ? "pdf-float-left pdf-w-50 pdf-px-2"
              : "w-full sm:w-1/2 lg:w-1/2 p-2"
          }
        >
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full">
            <div className="mb-2">
              <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                Valor total investido em projetos
              </h1>
            </div>
            <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
              {formatador.format(dados?.valorTotal || 0)}
            </h1>
          </div>
        </div>
        <div
          className={
            isPdfMode
              ? "pdf-float-left pdf-w-50 pdf-px-2"
              : "w-full sm:w-1/2 lg:w-1/2 p-2"
          }
        >
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full">
            <div className="mb-2">
              <h1 className="text-lg text-blue-fcsn dark:text-white-off font-light mb-2">
                Maior Aporte
              </h1>
            </div>
            <h1 className="text-2xl text-blue-fcsn dark:text-white-off font-bold">
              {formatador.format(dados?.maiorAporte.valorAportado || 0)}
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
              <p className="text-xl font-bold">
                {dados?.beneficiariosIndireto}
              </p>
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
                <p className="text-xl font-bold">
                  {dados?.beneficiariosDireto}
                </p>
                <h2 className="text-lg">Beneficiários diretos</h2>
              </div>
            </div>
            <div className="w-full md:w-1/3 p-2.5">
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">
                  {dados?.beneficiariosIndireto}
                </p>
                <h2 className="text-lg">Beneficiários indiretos</h2>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap -m-2.5">
            <div
              className={`p-2.5 ${
                estado === "" ? "w-full md:w-1/3" : "w-full md:w-1/2"
              }`}
            >
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{dados?.qtdOrganizacoes}</p>
                <h2 className="text-lg">Organizações envolvidas</h2>
              </div>
            </div>
            <div
              className={`p-2.5 ${
                estado === "" ? "w-full md:w-1/3" : "hidden"
              }`}
            >
              <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-3 h-full">
                <p className="text-xl font-bold">{estadosAtendidos}</p>
                <h2 className="text-lg">Estados atendidos</h2>
              </div>
            </div>
            <div
              className={`p-2.5 ${
                estado === "" ? "w-full md:w-1/3" : "w-full md:w-1/2"
              }`}
            >
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
              data={dados?.projetosODS ?? []} // se nao tiver o array projetosODS passamos um array vazio
              labels={odsData.labels}
              colors={["#b37b97"]}
              horizontal={false}
              responsivo={true}
              useIcons={true}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Map and Chart*/}
      {estado === "" && (
        <section className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap -m-2">
            <div className={`w-full ${ehCelular ? "hidden" : "lg:w-1/2"} p-2`}>
              <h2 className="text-2xl font-bold mb-4">Estados de atuação</h2>
              <div className="lg:h-120 md:h-100 sm:h-80 w-full p-3">
                <BrazilMap data={dadosMapa} />
              </div>
            </div>
            <div className="w-full lg:w-1/2 p-2">
              <div className="min-h-96 h-fit w-full">
                <BarChart
                  data={Object.values(dadosMapa)}
                  labels={Object.keys(dadosMapa).map(
                    (nome) => estadosSiglas[nome] ?? nome
                  )}
                  colors={["#ff2377"]}
                  horizontal={true}
                  useIcons={false}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Pie and Bar Charts*/}
      <section
        className={
          isPdfMode ? "pdf-parent-float-container" : "flex flex-wrap -m-4"
        }
      >
        <div
          className={
            isPdfMode
              ? "pdf-float-left pdf-w-50 pdf-px-4 h-[700px]"
              : "w-full md:w-1/2 p-4"
          }
        >
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-10 h-full">
            <h2 className="text-2xl font-bold mb-4">Segmento do projeto</h2>
            <div className="sm:h-120 h-fit">
              <PieChart
                data={segmentoValores}
                labels={segmentoNomes}
                colors={["#e74c3c", "#8e44ad", "#39c2e0", "#2ecc40", "#f1c40f"]}
              />
            </div>
          </div>
        </div>
        <div
          className={
            isPdfMode
              ? "pdf-float-left pdf-w-50 pdf-px-4 h-[700px]"
              : "w-full md:w-1/2 p-4"
          }
        >
          <div className="bg-white-off dark:bg-blue-fcsn3 rounded-xl shadow-sm p-5 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Lei de Incentivo</h2>
            <div className="flex-grow w-full overflow-x-auto">
              <div className="">
                <BarChartLeis
                  colors={["#ff2377"]}
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
    </>
  );
}
