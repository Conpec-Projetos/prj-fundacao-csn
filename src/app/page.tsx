'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClipboardList, FaChartPie, FaMapMarkedAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { useTheme } from '@/context/ThemeContext';

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
  yellow: 'text-yellow-600',
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white-off rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-full">
    <div className={`${colorMap[color]} text-2xl mb-2`}>{icon}</div>
    <h3 className="text-lg md:text-xl text-blue-fcsn font-medium mb-1 text-center sm:whitespace-nowrap">{title}</h3>
    <p className="text-md md:text-xl whitespace-nowrap font-bold text-blue-fcsn">{value}</p>
  </div>
);

// Componente de card para projetos pendentes
interface Project {
  id: number;
  name: string;
  institution: string;
  status: 'urgent' | 'pending';
  submittedDate: string;
}

const PendingProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-white dark:bg-blue-fcsn3 rounded-lg shadow-md p-4 mb-3 hover:bg-slate-50 dark:hover:bg-blue-fcsn2 transition-colors">
    <div className="flex justify-between items-center">
      <h3 className="font-medium text-blue-fcsn dark:text-white">{project.name}</h3>
      <span className={`px-2 py-1 rounded-full text-xs ${
        project.status === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {project.status === 'urgent' ? 'Urgente' : 'Pendente'}
      </span>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.institution}</p>
    <div className="flex justify-between mt-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">Submetido: {project.submittedDate}</span>
      <Link href={`/projetos/${project.id}`} className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
        Ver detalhes
      </Link>
    </div>
  </div>
);

export default function AdminHomePage() {
  const [userName, setUserName] = useState('Administrador');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const { darkMode } = useTheme();
  
  // Dados de exemplo para as métricas
  const pendingProjects: Project[] = [
    { id: 1, name: "Projeto Educação para Todos", institution: "Instituto Futuro Brilhante", status: 'urgent', submittedDate: "18/04/2025" },
    { id: 2, name: "Esporte na Comunidade", institution: "Associação Viva Esporte", status: 'pending', submittedDate: "15/04/2025" },
    { id: 3, name: "Arte e Cultura nas Escolas", institution: "Fundação Cultural Brasil", status: 'pending', submittedDate: "12/04/2025" }
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

  return (
    <div className={`flex flex-col grow min-h-[90vh] ${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
      
      <main className="flex flex-col gap-8 p-8 flex-1 sm:mx-12 md:mx-20"> 
        {/* Seção de boas-vindas */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{greeting}, {userName}!</h1>
              <p className="text-gray-500">{currentTime}</p>
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
              <div className="bg-white-off rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold text-blue-fcsn">Projetos Pendentes</h2>
                  <Link href="/projetos/pendentes" className="text-sm text-[#b37b97] hover:underline">
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
