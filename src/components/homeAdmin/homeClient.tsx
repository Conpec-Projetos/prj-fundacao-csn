'use client';

import {
  FaClipboardList,
  FaChartPie,
  FaMapMarkedAlt,
  FaFileAlt,
} from "react-icons/fa";
import Footer from "@/components/footer/footer";
import Planilha from "@/components/planilha/planilha";
import Greetings from "@/components/greetings/greetings";
import { dadosEstados } from "@/firebase/schema/entities";

// Componente de card para métricas
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "yellow";
}

const colorMap = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  yellow: "text-yellow-fcsn",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="bg-white dark:bg-blue-fcsn text-gray-800 dark:text-white-off rounded-lg shadow-md p-6 flex flex-col justify-between">
    <div className={`${colorMap[color]} text-2xl mb-2`}>{icon}</div>
    <h3 className="text-lg font-semibold text-blue-fcsn dark:text-gray-300">
      {title}
    </h3>
    <p className="text-4xl font-bold text-pink-fcsn mt-2">
      {value}
    </p>
  </div>
);

export default function AdminHomeClient({ dados, estadosAtendidos }: { dados: dadosEstados; estadosAtendidos: number }) {
  const userName = "Administrador";

  const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});


  return (
    <div className="flex flex-col grow min-h-[90vh] bg-white-off dark:bg-blue-fcsn2">
      <main className="flex flex-col gap-8 px-8 pb-8 flex-1 sm:mx-8 pt-12">
        {/* Seção de boas-vindas */}
        <Greetings userName={userName} />

        {/* Planilha e Grid de Métricas */}
        <div className="flex flex-col gap-4">
          {/* Grid de métricas */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <MetricCard
              title="Total de Projetos"
              value={`${dados.qtdProjetos}`}
              icon={<FaClipboardList />}
              color="blue"
            />
            <MetricCard
              title="Valor Total Investido"
              value={formatador.format(dados?.valorTotal)}
              icon={<FaChartPie />}
              color="green"
            />
            <MetricCard
              title="Estados Atendidos"
              value={`${estadosAtendidos}`}
              icon={<FaMapMarkedAlt />}
              color="purple"
            />
            <MetricCard
              title="Organizações"
              value={`${dados.qtdOrganizacoes}`}
              icon={<FaFileAlt />}
              color="yellow"
            />
          </section>

          {/* Planilha */}
          <section className="w-full bg-white dark:bg-blue-fcsn p-2 sm:p-4 rounded-lg shadow-lg">
            <Planilha tipoPlanilha="monitoramento" />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}