'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';

interface ProjetoExt {
  id: string;
  nome: string;
  instituicao: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  valorTotal: string;
  lei: string;
  formularioPendente: boolean;
  ativo: boolean;
}

const getEffectiveStatus = (project: ProjetoExt): string => {
  if (!project.ativo) {
    return 'finalizado';
  }
  return project.status;
};

const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 dark:bg-green-500 text-green-800 dark:text-white';
      case 'pendente': return 'bg-yellow-100 dark:bg-yellow-500 text-yellow-800 dark:text-white';
      case 'reprovado': return 'bg-red-100 dark:bg-red-500 text-red-800 dark:text-white';
      case 'finalizado': return 'bg-blue-100 dark:bg-blue-fcsn text-blue-800 dark:text-white-off';
      default: return 'bg-gray-100 text-gray-800';
    }
};
  
const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Em análise';
      case 'reprovado': return 'Não aprovado';
      case 'finalizado': return 'Finalizado';
      default: return 'Desconhecido';
    }
};

const ProjectCard = ({ project }: { project: ProjetoExt }) => {
    const effectiveStatus = getEffectiveStatus(project);

    return (
        <div className="bg-white dark:bg-blue-fcsn3 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-blue-fcsn dark:text-white-off">{project.nome}</h3>
              <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">{project.instituicao}</p>
            </div>
            {/* Usar as variáveis de status para renderizar o componente */}
            <span className={`px-3 py-1 rounded-full whitespace-nowrap text-xs ${getStatusColor(effectiveStatus)}`}>
              {getStatusText(effectiveStatus)}
            </span>
          </div>
           <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-300">Valor aprovado:</p>
              <p className="font-medium dark:text-white-off">{project.valorTotal}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-300">Lei de incentivo:</p>
              <p className="font-medium text-blue-fcsn dark:text-white-off">{project.lei}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Link href={`/detalhes-projeto?id=${project.id}`} className="text-pink-fcsn dark:text-pink-light hover:underline text-sm">
              Ver detalhes
            </Link>
          </div>
          {project.formularioPendente && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-[#5A5A72] rounded-lg flex items-center">
              <FaExclamationCircle className="text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                Formulário de acompanhamento pendente
                <Link href={`/forms-acompanhamento/${project.id}`} className="ml-2 text-pink-fcsn dark:text-pink-light hover:underline">
                  Preencher agora
                </Link>
              </p>
            </div>
          )}
        </div>
    );
};


interface DashboardProps {
  userName: string;
  userProjects: ProjetoExt[];
}

export default function ExternalUserDashboard({ userName, userProjects }: DashboardProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
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
    <main className="flex flex-col flex-grow px-4 p-10 md:mx-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-blue-fcsn dark:text-white font-bold">{greeting}, {userName}!</h1>
          <p className="text-gray-500 dark:text-gray-300">{currentTime}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-300">Total de projetos</p>
          <p className="text-2xl font-bold text-pink-fcsn dark:text-pink-light">{userProjects.length}</p>
        </div>
      </div>

      <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-fcsn dark:text-white-off">Meus Projetos</h2>
          <Link href="/forms-cadastro" className="px-4 py-2 bg-pink-fcsn dark:bg-pink-light2 text-white-off rounded-lg hover:bg-pink-light2 dark:hover:bg-pink-fcsn transition-colors duration-200">
            Novo Projeto
          </Link>
        </div>
        <div className="space-y-6">
          {userProjects.length > 0 ? (
            userProjects.map(project => <ProjectCard key={project.id} project={project} />)
          ) : (
            <p>Você ainda não está associado a nenhum projeto.</p>
          )}
        </div>
      </div>
    </main>
  );
}