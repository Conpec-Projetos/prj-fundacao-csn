'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationCircle } from 'react-icons/fa';
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

interface ProjetoExt {
  id: string;
  nome: string;
  instituicao: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  valorTotal: string;
  lei: string;
  formularioPendente: boolean;
}

const ProjectCard = ({ project }: { project: ProjetoExt }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 dark:bg-green-500 text-green-800 dark:text-white';
      case 'pendente': return 'bg-yellow-100 dark:bg-yellow-500 text-yellow-800 dark:text-white';
      case 'reprovado': return 'bg-red-100 dark:bg-red-500 text-red-800 dark:text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Em análise';
      case 'reprovado': return 'Não aprovado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white dark:bg-blue-fcsn3 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-blue-fcsn dark:text-white-off">{project.nome}</h3>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">{project.instituicao}</p>
        </div>
        <span className={`px-3 py-1 rounded-full whitespace-nowrap text-xs ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
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
        {/* O link de detalhes agora usa o ID do projeto */}
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

// Componente principal da página
export default function ExternalUserHomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const [userProjects, setUserProjects] = useState<ProjetoExt[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && user.email) {
            // Redireciona se o e-mail não estiver verificado
            if (!user.emailVerified) {
                router.push("./login");
                return;
            }

            // Verifica se o usuário é interno
            const userIntRef = doc(db, 'usuarioInt', user.uid);
            const userIntSnap = await getDoc(userIntRef);

            if (userIntSnap.exists()) {
                // Se for usuário interno, redireciona para a página principal
                router.push("/");
                return;
            }

            // Se não for interno, assume que é externo e busca os dados
            const userExtRef = doc(db, 'usuarioExt', user.uid);
            const userExtSnap = await getDoc(userExtRef);

            if (userExtSnap.exists()) {
                const userData = userExtSnap.data();
                setUserName(userData.nome.split(" ")[0]);
            }
            setIsLoading(false); // Permite a renderização da página para o usuário externo

            // Inicia o carregamento dos projetos do usuário
            setIsLoadingProjects(true);
            try {
                const associacaoRef = collection(db, 'associacao');
                const qAssociacao = query(associacaoRef, where('usuarioID', '==', user.uid));
                const associacaoSnapshot = await getDocs(qAssociacao);

                if (associacaoSnapshot.empty) {
                    setUserProjects([]);
                    return;
                }

                const associacaoDoc = associacaoSnapshot.docs[0].data() as Associacao;
                const projetosIDs = associacaoDoc.projetosIDs || [];

                if (projetosIDs.length === 0) {
                    setUserProjects([]);
                    return;
                }

                // Busca os detalhes de cada projeto associado
                const projectsDataPromises = projetosIDs.map(async (projetoId): Promise<ProjetoExt | null> => {
                  let instituicao = '';
                  let lei = '';
                  let formularioPendente = false;

                  const acompanhamentoRef = collection(db, 'forms-acompanhamento');
                  const qAcompanhamento = query(acompanhamentoRef, where('projetoID', '==', projetoId));
                  const acompanhamentoSnap = await getDocs(qAcompanhamento);

                  if (!acompanhamentoSnap.empty) {
                    const acompanhamentoData = acompanhamentoSnap.docs[0].data() as formsAcompanhamentoDados;
                    instituicao = acompanhamentoData.instituicao;
                    lei = acompanhamentoData.lei;
                    formularioPendente = false;
                  } else {
                    formularioPendente = true;
                    const projetoDocRef = doc(db, 'projetos', projetoId);
                    const projetoDocSnap = await getDoc(projetoDocRef);

                    if (projetoDocSnap.exists()) {
                      const projetoDataForCadastro = projetoDocSnap.data() as Projetos;
                      if (projetoDataForCadastro.ultimoFormulario) {
                        const cadastroDocRef = doc(db, 'forms-cadastro', projetoDataForCadastro.ultimoFormulario);
                        const cadastroDocSnap = await getDoc(cadastroDocRef);
                        if (cadastroDocSnap.exists()) {
                          const cadastroData = cadastroDocSnap.data() as formsCadastroDados;
                          instituicao = cadastroData.instituicao;
                          lei = cadastroData.lei;
                        }
                      }
                    }
                  }

                  const projetoDocRef = doc(db, 'projetos', projetoId);
                  const projetoDocSnap = await getDoc(projetoDocRef);

                  if (!projetoDocSnap.exists()) {
                    return null;
                  }

                  const projetoData = projetoDocSnap.data() as Projetos;
                  const valorTotal = (projetoData.valorAportadoReal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                  
                  return {
                    id: projetoId,
                    nome: projetoData.nome,
                    instituicao: instituicao,
                    status: projetoData.status,
                    valorTotal: valorTotal,
                    lei: lei,
                    formularioPendente: formularioPendente,
                  };
                });

                const resolvedProjects = (await Promise.all(projectsDataPromises)).filter((p): p is ProjetoExt => p !== null);
                setUserProjects(resolvedProjects);

            } catch (error) {
                console.error("Erro ao buscar projetos do usuário:", error);
            } finally {
                setIsLoadingProjects(false);
            }

        } else {
            // Se não houver usuário logado, redireciona para a página de login
            router.push("./login");
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
            <h1 className="text-2xl text-blue-fcsn dark:text-white font-bold">{greeting}, {userName}!</h1>
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