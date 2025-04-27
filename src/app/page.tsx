'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClipboardList, FaChartPie, FaMapMarkedAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';

// Componente de card para métricas
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white-off rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
    <div className={`text-${color} text-2xl mb-2`}>{icon}</div>
    <h3 className="text-xl text-blue-fcsn font-medium mb-1">{title}</h3>
    <p className="text-xl font-bold">{value}</p>
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
  <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-center">
      <h3 className="font-medium text-blue-fcsn">{project.name}</h3>
      <span className={`px-2 py-1 rounded-full text-xs ${
        project.status === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {project.status === 'urgent' ? 'Urgente' : 'Pendente'}
      </span>
    </div>
    <p className="text-sm text-gray-500 mt-1">{project.institution}</p>
    <div className="flex justify-between mt-3">
      <span className="text-sm text-gray-500">Submetido: {project.submittedDate}</span>
      <Link href={`/projetos/${project.id}`} className="text-sm text-blue-600 hover:underline">
        Ver detalhes
      </Link>
    </div>
  </div>
);

export default function AdminHomePage() {
  const [userName, setUserName] = useState('Administrador');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  
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
    <div className="flex flex-col min-h-screen bg-white text-blue-fcsn ">
      <Header />
      
      <main className="flex flex-col gap-8 p-10 mx-12 md:mx-20">
        {/* Seção de boas-vindas */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-fcsn">{greeting}, {userName}!</h1>
              <p className="text-gray-500">{currentTime}</p>
            </div>
          </div>

        {/* Grid de métricas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total de Projetos" 
            value="800" 
            icon={<FaClipboardList />} 
            color="blue-600"
          />
          <MetricCard 
            title="Valor Total Investido" 
            value="R$ 9.173.461.815,00" 
            icon={<FaChartPie />} 
            color="green-600"
          />
          <MetricCard 
            title="Estados Atendidos" 
            value="13" 
            icon={<FaMapMarkedAlt />} 
            color="purple-600"
          />
          <MetricCard 
            title="Organizações" 
            value="750" 
            icon={<FaFileAlt />} 
            color="yellow-600"
          />
        </section>
        
        {/* Seção de Ações Rápidas e Projetos Pendentes*/}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1">
          {/* Ações Rápidas */}
          <div className="bg-white-off rounded-lg shadow-md p-6 h-full">
            <h2 className="text-xl font-bold mb-2 text-blue-fcsn">Ações Rápidas</h2>
            <div className="flex flex-col gap-4 h-full">
              <Link href="/dashboard" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaChartPie className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h3 className="font-medium">Dashboard Completo</h3>
                  <p className="text-sm text-gray-500">Visualize todas as métricas</p>
                </div>
              </Link>
              <Link href="/projetos/pendentes" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <FaExclamationTriangle className="text-yellow-600 text-lg" />
                </div>
                <div>
                  <h3 className="font-medium">Aprovar Projetos</h3>
                  <p className="text-sm text-gray-500">Avalie projetos pendentes</p>
                </div>
              </Link>
              <Link href="/projetos/aprovados" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaCheckCircle className="text-green-600 text-lg" />
                </div>
                <div>
                  <h3 className="font-medium">Projetos Aprovados</h3>
                  <p className="text-sm text-gray-500">Veja os projetos em andamento</p>
                </div>
              </Link>
            </div>
          </div>
          {/* Projetos Pendentes */}
          <div className="bg-white-off rounded-lg shadow-md p-6 h-full">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold text-[#292944]">Projetos Pendentes</h2>
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
      </main>
      
      <Footer />
    </div>
  );
}
