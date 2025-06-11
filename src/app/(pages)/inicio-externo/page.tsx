'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFileAlt, FaClipboardCheck, FaEdit, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import Footer from '@/components/footer/footer';
import { useTheme } from '@/context/themeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import logo from "@/assets/fcsn-logo.svg"
import Image from "next/image";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import Botao_Logout from '@/components/botoes/Botao_Logout';
import { Moon, Sun } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Projetos, formsAcompanhamentoDados, formsCadastroDados, Associacao } from '@/firebase/schema/entities';

interface Project {
  id: string;
  name: string;
  institution: string;
  status: 'approved' | 'pending' | 'rejected';
  value: string;
  incentiveLaw: string;
  pendingForm: boolean;
}

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
        {/* O link de detalhes agora usa o ID do projeto */}
        <Link href={`/detalhes-projeto?id=${project.id}`} className="text-pink-fcsn dark:text-pink-light hover:underline text-sm">
          Ver detalhes
        </Link>
      </div>
      
        {project.pendingForm && (
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

// Componente principal da página
export default function ExternalUserHomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        if (!user.emailVerified) {
          router.push("./login");
          return;
        }
        const emailDomain = user.email.split('@')[1];
        if (emailDomain !== "teste.com.br") {
          const usuarioExtRef = collection(db, 'usuarioExt');
          const qUsuarioExt = query(usuarioExtRef, where('email', '==', user.email))
          const usuarioExt = await getDocs(qUsuarioExt);
          setUserName(usuarioExt.docs[0].data().nome.split(" ")[0]);
          setIsLoading(false); // Autenticação verificada

          try {
            // Encontra o documento na coleção associacao
            const associacaoRef = collection(db, 'associacao');
            const qAssociacao = query(associacaoRef, where('usuarioID', '==', user.uid));
            const associacaoSnapshot = await getDocs(qAssociacao);

            if (associacaoSnapshot.empty) {
              console.log("Nenhuma associação encontrada para o usuário.");
              setUserProjects([]);
              setIsLoadingProjects(false);
              return;
            }

            const associacaoDoc = associacaoSnapshot.docs[0].data() as Associacao;
            const projetosIDs = associacaoDoc.projetosIDs || [];

            if (projetosIDs.length === 0) {
              setUserProjects([]);
              setIsLoadingProjects(false);
              return;
            }

            // Para cada ID, buscar os detalhes completos do projeto
            const projectsDataPromises = projetosIDs.map(async (projetoId): Promise<Project | null> => {
              let institution = '';
              let incentiveLaw = '';
              let pendingForm = false;

              // Tentar buscar informações do formulário de acompanhamento primeiro
              const acompanhamentoRef = collection(db, 'forms-acompanhamento');
              const qAcompanhamento = query(acompanhamentoRef, where('projetoID', '==', projetoId));
              const acompanhamentoSnap = await getDocs(qAcompanhamento);

              if (!acompanhamentoSnap.empty) {
                // Se encontrou um formulário de acompanhamento, use seus dados
                const acompanhamentoData = acompanhamentoSnap.docs[0].data() as formsAcompanhamentoDados;
                institution = acompanhamentoData.instituicao;
                incentiveLaw = acompanhamentoData.lei;
                pendingForm = false; // Há um formulário de acompanhamento
              } else {
                // Se não há formulário de acompanhamento, o pendingForm é true
                pendingForm = true;

                // Buscar informações do formulário de cadastro como fallback
                const projetoDocRef = doc(db, 'projetos', projetoId);
                const projetoDocSnap = await getDoc(projetoDocRef);

                if (projetoDocSnap.exists()) {
                  const projetoDataForCadastro = projetoDocSnap.data() as Projetos;
                  if (projetoDataForCadastro.ultimoFormulario) {
                    const cadastroDocRef = doc(db, 'forms-cadastro', projetoDataForCadastro.ultimoFormulario);
                    const cadastroDocSnap = await getDoc(cadastroDocRef);
                    if (cadastroDocSnap.exists()) {
                      const cadastroData = cadastroDocSnap.data() as formsCadastroDados;
                      institution = cadastroData.instituicao;
                      incentiveLaw = cadastroData.lei;
                    }
                  }
                }
              }

              // Buscar informações do projeto na coleção 'projetos'
              const projetoDocRef = doc(db, 'projetos', projetoId);
              const projetoDocSnap = await getDoc(projetoDocRef);

              if (!projetoDocSnap.exists()) {
                console.warn(`Projeto com ID ${projetoId} não encontrado na coleção 'projetos'.`);
                return null;
              }

              const projetoData = projetoDocSnap.data() as Projetos;

              const status = projetoData.aprovado;
              const value = (projetoData.valorAportadoReal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
              const name = projetoData.nome;

              return {
                id: projetoId,
                name: name,
                institution: institution,
                status: status,
                value: value,
                incentiveLaw: incentiveLaw,
                pendingForm: pendingForm,
              };
            });

            const resolvedProjects = (await Promise.all(projectsDataPromises)).filter((p): p is Project => p !== null);
            setUserProjects(resolvedProjects);

          } catch (error) {
            console.error("Erro ao buscar projetos do usuário:", error);
          } finally {
            setIsLoadingProjects(false);
          }

        } else {
          setIsLoading(false);
          setIsLoadingProjects(false);
          router.push("/");
        }
      } else {
        router.push("./login"); // Usuário não logado
      }
    });

    return () => unsubscribe();
  }, [router]);
  
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
      
      // Definir saudação
      const hour = now.getHours();
      if (hour < 12) setGreeting('Bom dia');
      else if (hour < 18) setGreeting('Boa tarde');
      else setGreeting('Boa noite');
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(timer);
  }, []);

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
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`} >      
      <main className="flex flex-col px-4 p-10 md:mx-20">
        <div className='flex flex-row justify-between mb-5'>           
          <Image
            src={darkMode ? darkLogo : logo}
            alt="csn-logo"
            width={250}
            className=""
            priority
          />
          <div className="w-[15%] flex justify-end items-center gap-10">
            <button className="cursor-pointer transition-all duration-300 " 
              onClick={toggleDarkMode}>{darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20}  className="text-black" />}
            </button>
            <Botao_Logout />
          </div>
        </div>

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
          <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-fcsn dark:text-white-off">Meus Projetos</h2>
              <Link href="/forms-cadastro" className="px-4 py-2 bg-pink-fcsn dark:bg-pink-light2 text-white-off rounded-lg hover:bg-[#a06a86] transition-colors duration-200">
                Novo Projeto
              </Link>
            </div>

            <div className="space-y-6">
              {isLoadingProjects ? (
                <p>Carregando projetos...</p>
              ) : userProjects.length > 0 ? (
                userProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <p>Você ainda não está associado a nenhum projeto.</p>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/todos-projetos" className="text-pink-fcsn dark:text-pink-light hover:underline">
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