"use client";

import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaChartPie,
  FaMapMarkedAlt,
  FaFileAlt,
} from "react-icons/fa";
import Footer from "@/components/footer/footer";
import { useTheme } from "@/context/themeContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebase-config";
import { useRouter } from "next/navigation";
import logo from "@/assets/fcsn-logo.svg";
import Image from "next/image";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { collection, getDocs, query, where } from "firebase/firestore";
import Planilha from "@/components/planilha/planilha";
import { dadosEstados } from "@/firebase/schema/entities";
import Greetings from "@/components/greetings/greetings";

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
      qtdOrganizacoes: (acc.qtdOrganizacoes ?? 0) + (curr.qtdOrganizacoes ?? 0),
      qtdMunicipios: (acc.qtdMunicipios ?? 0) + (curr.qtdMunicipios ?? 0),
      projetosODS: acc.projetosODS
        ? acc.projetosODS.map((v, i) => v + (curr.projetosODS?.[i] ?? 0))
        : curr.projetosODS ?? [],
      lei: [] as { nome: string; qtdProjetos: number }[],
      segmento: [] as { nome: string; qtdProjetos: number }[],
      municipios: [...(acc.municipios ?? []), ...(curr.municipios ?? [])],
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

async function buscarDadosGerais(): Promise<{
  dados: dadosEstados;
  estadosAtendidos: number;
}> {
  const consulta = query(
    collection(db, "dadosEstados"),
    where("qtdProjetos", "!=", 0)
  );

  const consultaSnapshot = await getDocs(consulta);
  const todosDados: dadosEstados[] = [];

  consultaSnapshot.forEach((doc) => {
    const data = doc.data() as dadosEstados;
    todosDados.push(data);
  });

  const dadosSomados = somarDadosEstados(todosDados);
  const totalEstadosAtendidos = todosDados.length;

  return {
    dados: dadosSomados,
    estadosAtendidos: totalEstadosAtendidos,
  };
}

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
  <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-full w-full">
    <div className={`${colorMap[color]} text-2xl mb-2`}>{icon}</div>
    <h3 className="text-lg md:text-xl text-blue-fcsn dark:text-white-off font-medium mb-1 text-center ">
      {title}
    </h3>
    <p className="text-md md:text-xl whitespace-nowrap font-bold text-blue-fcsn dark:text-white-off">
      {value}
    </p>
  </div>
);

export default function AdminHomePage() {
  const router = useRouter();
  const userName = "Administrador";
  const { darkMode } = useTheme();

  // Para verificar se esta logado
  const [isLoading, setIsLoading] = useState(true);
  const [dadosGerais, setDadosGerais] = useState<{dados: dadosEstados, estadosAtendidos: number}>({} as {dados: dadosEstados, estadosAtendidos: number})

  // Vamos verificar se é ADM
  async function IsADM(email: string): Promise<boolean> {
    const usuarioInt = collection(db, "usuarioInt");
    const qADM = query(
      usuarioInt,
      where("email", "==", email),
      where("administrador", "==", true)
    );
    const snapshotADM = await getDocs(qADM);
    return !snapshotADM.empty; // Se não estiver vazio, é um adm
  }

  useEffect(() => {
    const fetchDadosGerais = async () => {
      const dados = await buscarDadosGerais();
      setDadosGerais(dados)
    };
    fetchDadosGerais()
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email || !user.emailVerified) {
        // Checa se o usuário tem email verificado tambem
        router.push("/login"); // Como não está logado, permite que a página de login seja renderizada
        return;
      }
      const emailDomain = user.email.split("@")[1];
      const isAdm = await IsADM(user.email);

      // Verificamos se possui o dominio da csn (usamos afim de teste o dominio da conpec)
      // se o usuario verificou o email recebido e se é ADM
      if (
        (emailDomain === "conpec.com.br" ||
          emailDomain === "csn.com.br" ||
          emailDomain === "fundacaocsn.org.br") &&
        isAdm
      ) {
        // Verificamos se possui o dominio da csn e se é ADM
        setIsLoading(false);
      } else if (
        emailDomain === "conpec.com.br" ||
        emailDomain === "csn.com.br" ||
        emailDomain === "fundacaocsn.org.br"
      ) {
        // Se não for verificamos se possui o dominio da csn apenas
        router.push("/dashboard");
      } else {
        // Se chegar aqui significa que é um usuario externo
        router.push("/inicio-externo");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center h-screen bg-white dark:bg-blue-fcsn2 dark:bg-opacity-80">
        <Image
          src={darkMode ? darkLogo : logo}
          alt="csn-logo"
          width={600}
          className=""
          priority
        />
        <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-6 text-center">
          Verificando sessão...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow min-h-[90vh]">
      <main className="flex flex-col gap-8 px-8 pb-8 flex-1 sm:mx-8 pt-12">
        {/* Seção de boas-vindas */}
        <Greetings userName={userName} />

        {/* Planilha e Grid de Métricas */}
        <div className="flex flex-col gap-4">
          {/* Grid de métricas */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <MetricCard
              title="Total de Projetos"
              value={`${dadosGerais.dados.qtdProjetos}`}
              icon={<FaClipboardList />}
              color="blue"
            />
            <MetricCard
              title="Valor Total Investido"
              value={`R$${dadosGerais.dados.valorTotal},00`}
              icon={<FaChartPie />}
              color="green"
            />
            <MetricCard
              title="Estados Atendidos"
              value={`${dadosGerais.estadosAtendidos}`}
              icon={<FaMapMarkedAlt />}
              color="purple"
            />
            <MetricCard
              title="Organizações"
              value={`${dadosGerais.dados.qtdOrganizacoes}`}
              icon={<FaFileAlt />}
              color="yellow"
            />
          </section>

          {/* Planilha */}
          <section className="w-full">
            <Planilha />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
