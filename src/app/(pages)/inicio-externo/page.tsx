'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFileAlt, FaClipboardCheck, FaEdit, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import Footer from '@/components/footer/footer';
import { useTheme } from '@/context/themeContext';

// Componente de card para projeto
// Define the Project type
interface Project {
  id: number;             //id do projeto
  name: string;           //nome do projeto
  institution: string;    //nome da instituição
  status: string;         //status do projeto (aprovado, pendente, reprovado)
  value: string;          //valor aprovado
  incentiveLaw: string;   //lei de incentivo
  pendingForm: boolean;   //indica se o formulário de acompanhamento está pendente
}
//cartão de cada projeto
const ProjectCard = ({ project }: { project: Project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 dark:bg-green-500 text-green-800 dark:text-white';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-500 text-yellow-800 dark:text-white';
      case 'rejected': return 'bg-red-100 dark:bg-red-500 text-red-800 dark:text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Em análise';
      case 'rejected': return 'Não aprovado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white dark:bg-blue-fcsn3 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-blue-fcsn dark:text-white-off">{project.name}</h3>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">{project.institution}</p>
        </div>
        <span className={`px-3 py-1 rounded-full whitespace-nowrap text-xs ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-300">Valor aprovado:</p>
          <p className="font-medium dark:text-white-off">{project.value}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-300">Lei de incentivo:</p>
          <p className="font-medium">{project.incentiveLaw}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Link href={`/projetos/${project.id}`} className="text-pink-fcsn dark:text-pink-light hover:underline text-sm">
          Ver detalhes
        </Link>
      </div>
      
      {project.pendingForm && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-[#5A5A72] rounded-lg flex items-center">
          <FaExclamationCircle className="text-yellow-500 mr-2" />
          <p className="text-sm text-yellow-700 dark:text-yellow-500">
            Formulário de acompanhamento pendente
            <Link href={`/formulario/${project.id}`} className="ml-2 text-pink-fcsn dark:text-pink-light hover:underline">
              Preencher agora
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

//Componente principal da página
export default function ExternalUserHomePage() {
  const [userName, setUserName] = useState('João Silva');   //exemplo de usuário externo
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const { darkMode } = useTheme();
  
  // Dados de exemplo para projetos e notificações
  const userProjects = [
    { 
      id: 1, 
      name: "Esporte na Comunidade", 
      institution: "Associação Viva Esporte", 
      status: "approved", 
      value: "R$ 250.000,00", 
      incentiveLaw: "Lei de Incentivo ao Esporte",
      pendingForm: true
    },
    { 
      id: 2, 
      name: "Música para Todos", 
      institution: "Associação Viva Esporte", 
      status: "pending", 
      value: "R$ 180.000,00", 
      incentiveLaw: "Lei de Incentivo à Cultura",
      pendingForm: false
    },
    { 
      id: 3, 
      name: "Saúde na Terceira Idade", 
      institution: "Associação Viva Esporte", 
      status: "rejected", 
      value: "R$ 320.000,00", 
      incentiveLaw: "Lei da Pessoa Idosa",
      pendingForm: false
    }
  ];
  
  const notifications = [
    {
      id: 1,
      type: 'form',
      title: 'Formulário pendente',
      message: 'O formulário de acompanhamento do projeto "Esporte na Comunidade" está pendente.',
      time: '2h atrás'
    },
    {
      id: 2,
      type: 'approval',
      title: 'Projeto aprovado',
      message: 'Seu projeto "Música para Todos" foi aprovado! Parabéns!',
      time: '1d atrás'
    },
    {
      id: 3,
      type: 'info',
      title: 'Lembrete de prazo',
      message: 'O prazo para envio do relatório final do projeto "Saúde na Terceira Idade" é em 15 dias.',
      time: '3d atrás'
    }
  ];
  
  useEffect(() => {
    // Atualizar data e hora
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`} >      
      <main className="flex flex-col px-4 p-10 md:mx-20">
        {/* Seção de boas-vindas */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {userName}!</h1>
            <p className="text-gray-500 dark:text-gray-300">{currentTime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-300">Meus projetos</p>
            <p className="text-2xl font-bold text-pink-fcsn dark:text-pink-light">{userProjects.length}</p>
          </div>
        </div>
        
        {/* Layout principal */}
        <div className=""> 
          {/* Coluna principal*/}
          <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-fcsn dark:text-white-off">Meus Projetos</h2>
              <Link href="/projetos/novo" className="px-4 py-2 bg-pink-fcsn dark:bg-pink-light2 text-white-off rounded-lg hover:bg-[#a06a86] transition-colors duration-200">
                Novo Projeto
              </Link>
            </div>

            <div className="space-y-6">
              {userProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/meus-projetos" className="text-pink-fcsn dark:text-pink-light hover:underline">
                Ver todos os projetos
              </Link>
            </div>
          </div>
        </div>
      </main>
  
      <Footer />
    </div>
  );
}
