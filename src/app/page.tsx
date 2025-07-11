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
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const { darkMode } = useTheme();

  // Para verificar se esta logado
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Atualizar data e hora
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long" as const,
        year: "numeric" as const,
        month: "long" as const,
        day: "numeric" as const,
        hour: "2-digit" as const,
        minute: "2-digit" as const,
      };
      setCurrentTime(now.toLocaleDateString("pt-BR", options));

      // Definir saudação com base na hora do dia
      const hour = now.getHours();
      if (hour < 12) setGreeting("Bom dia");
      else if (hour < 18) setGreeting("Boa tarde");
      else setGreeting("Boa noite");
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);

    return () => clearInterval(timer);
  }, []);

    // Vamos verificar se é ADM
    async function IsADM(email: string): Promise<boolean>{
      const usuarioInt = collection(db, "usuarioInt");
      const qADM = query(usuarioInt, where("email", "==", email), where("administrador", "==", true));
      const snapshotADM = await getDocs(qADM );
      return !snapshotADM.empty; // Se não estiver vazio, é um adm
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user || !user.email || !user.emailVerified) { // Checa se o usuário tem email verificado tambem
            router.push("/login"); // Como não está logado, permite que a página de login seja renderizada
            return;
          }
          const emailDomain = user.email.split('@')[1];
          const isAdm = await IsADM(user.email);

          // Verificamos se possui o dominio da csn (usamos afim de teste o dominio da conpec)
          // se o usuario verificou o email recebido e se é ADM
          if ((emailDomain === "conpec.com.br" || emailDomain === "csn.com.br" || emailDomain === "fundacaocsn.org.br") && isAdm ){ // Verificamos se possui o dominio da csn e se é ADM
            setIsLoading(false);
          } else if (emailDomain === "conpec.com.br" || emailDomain === "csn.com.br" || emailDomain === "fundacaocsn.org.br"){ // Se não for verificamos se possui o dominio da csn apenas
            router.push("/dashboard"); 
          } else { // Se chegar aqui significa que é um usuario externo
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {greeting}, {userName}!
            </h1>
            <p className="text-gray-500 dark:text-gray-300">{currentTime}</p>
          </div>
        </div>

        {/* Planilha e Grid de Métricas */}
        <div className="flex flex-col gap-4">
          {/* Grid de métricas */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <MetricCard
              title="Total de Projetos"
              value="800"
              icon={<FaClipboardList />}
              color="blue"
            />
            <MetricCard
              title="Valor Total Investido"
              value="R$987.654.321,00"
              icon={<FaChartPie />}
              color="green"
            />
            <MetricCard
              title="Estados Atendidos"
              value="13"
              icon={<FaMapMarkedAlt />}
              color="purple"
            />
            <MetricCard
              title="Organizações"
              value="750"
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