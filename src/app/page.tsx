'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClipboardList, FaChartPie, FaMapMarkedAlt, FaFileAlt} from 'react-icons/fa';
import Footer from '@/components/footer/footer';
import { useTheme } from '@/context/themeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import logo from "@/assets/fcsn-logo.svg"
import Image from "next/image";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import { collection, getDocs, query, where } from 'firebase/firestore';

// Componente de card para métricas
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const colorMap = { 
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  yellow: 'text-yellow-fcsn',
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-full">
    <div className={`${colorMap[color]} text-2xl mb-2`}>{icon}</div>
    <h3 className="text-lg md:text-xl text-blue-fcsn dark:text-white-off font-medium mb-1 text-center sm:whitespace-nowrap">{title}</h3>
    <p className="text-md md:text-xl whitespace-nowrap font-bold text-blue-fcsn dark:text-white-off">{value}</p>
  </div>
);

// Componente de card para projetos pendentes
interface Project {
  id: number;
  name: string;
  institution: string;
  submittedDate: string;
}

const PendingProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-white dark:bg-blue-fcsn3 rounded-lg shadow-md p-4 mb-3 hover:bg-slate-50 dark:hover:bg-blue-fcsn2 transition-colors">
    <div className="flex justify-between items-center">
      <h3 className="font-medium text-blue-fcsn dark:text-white">{project.name}</h3>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.institution}</p>
    <div className="flex justify-between mt-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">Submetido: {project.submittedDate}</span>
      <Link href={`/projetos/${project.id}`} className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 hover:underline">
        Ver detalhes
      </Link>
    </div>
  </div>
);

export default function AdminHomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Administrador');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const { darkMode } = useTheme();

  // Para verificar se esta logado
  const [isLoading, setIsLoading] = useState(true);
  
  // Dados de exemplo para as métricas
  const pendingProjects: Project[] = [
    { id: 1, name: "Projeto Educação para Todos", institution: "Instituto Futuro Brilhante", submittedDate: "18/04/2025" },
    { id: 2, name: "Esporte na Comunidade", institution: "Associação Viva Esporte", submittedDate: "15/04/2025" },
    { id: 3, name: "Arte e Cultura nas Escolas", institution: "Fundação Cultural Brasil", submittedDate: "12/04/2025" }
  ];
  
  useEffect(() => {
    // Atualizar data e hora
    const updateDateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long' as const, 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const
      };
      setCurrentTime(now.toLocaleDateString('pt-BR', options));
      
      // Definir saudação com base na hora do dia
      const hour = now.getHours();
      if (hour < 12) setGreeting('Bom dia');
      else if (hour < 18) setGreeting('Boa tarde');
      else setGreeting('Boa noite');
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
          if ((emailDomain === "conpec.com.br") && isAdm ){ // Verificamos se possui o dominio da csn e se é ADM
            setIsLoading(false);
          } else if (emailDomain === "conpec.com.br"){ // Se não for verificamos se possui o dominio da csn apenas
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
    <div className={`flex flex-col grow min-h-[90vh] ${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
      
      <main className="flex flex-col gap-8 px-8 pb-8 flex-1 sm:mx-12 md:mx-20"> 
        {/* Seção de boas-vindas */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{greeting}, {userName}!</h1>
              <p className="text-gray-500 dark:text-gray-300">{currentTime}</p>
            </div>
          </div>
        
        {/*Projetos Pendentes e Seção de métricas*/}
          {/* Grid de métricas */}
          <div className="flex flex-col sm:flex-row gap-4">
            <section className="grid grid-rows-2 gap-y-4 sm:flex sm:flex-col sm:w-[35%] order-1 sm:order-2">
              <div className="grid grid-cols-2 sm:flex row-start-1 gap-4 sm:flex-col">
                <div className="col-start-1">
                  <MetricCard
                  title="Total de Projetos" 
                  value="800" 
                  icon={<FaClipboardList />} 
                  color="blue"
                  />
                </div>
                <div className="col-start-2">
                  <MetricCard 
                  title="Valor Total Investido" 
                  value="R$987.654.321,00" 
                  icon={<FaChartPie />} 
                  color="green"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex row-start-2 sm:flex-col gap-4">
                <div className="col-start-1">
                  <MetricCard 
                    title="Estados Atendidos" 
                    value="13" 
                    icon={<FaMapMarkedAlt />} 
                    color="purple"
                  />
                </div>
                <div className="col-start-2">
                  <MetricCard 
                    title="Organizações" 
                    value="750" 
                    icon={<FaFileAlt />} 
                    color="yellow"
                  />
                </div>
              </div>
            </section>

            {/* Seção de projetos pendentes */}
            <section className="w-full sm:w-[65%] gap-4 order-2 sm:order-1">
              <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold text-blue-fcsn dark:text-white-off">Projetos Pendentes</h2>
                  <Link href="/projetos/pendentes" className="text-sm text-pink-fcsn dark:text-pink-light hover:underline">
                    Ver todos
                  </Link>
                </div>
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <PendingProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </section>
          </div>
      </main>
      
      <Footer />
    </div>
  );
}
