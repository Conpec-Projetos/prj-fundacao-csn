"use client";

import Footer from "@/components/footer/footer";
import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaCheckCircle, FaFilter, FaSearch } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebase-config";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import logo from "@/assets/fcsn-logo.svg";
import Image from "next/image";
import { useTheme } from "@/context/themeContext";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

// Caminho para o seu componente de botão, que gerencia todo o fluxo
import BotaoAprovarProj from "@/components/botoes/botoes_todos-proj/BotaoAprovarProj"; 

// Interface com todos os campos necessários para definir o estado de um projeto
interface ProjectComponentProps {
  id: string; // ID da forms-cadastro
  name: string;
  finalStatus: "aprovado" | "pendente"; // Status final (da coleção projetos)
  projetosComplianceStatus: boolean; // Status da compliance (da coleção projetos)
  value: number;
  incentiveLaw: string;
  description: string;
  ODS: ODS[];
  complianceDocUrl: string | null;
  additionalDocsUrl: string | null;
  onApprovalSuccess: () => void; // Callback para recarregar os dados
}

interface ODS { numberODS: number; src: string; }

// Componente Project: Apenas exibe os dados e o botão de ação
const Project: React.FC<ProjectComponentProps> = (props) => (
  <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0">
    <section className="flex flex-col col-span-2 mr-2">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <div className="text-2xl font-bold">{props.name}</div>
        <div className="mt-1">
          {props.finalStatus === "aprovado" ? (
            <FaCheckCircle className="text-green-600 dark:text-green-500" size={22} />
          ) : (
            <FaClockRotateLeft color="darkOrange" size={22} />
          )}
        </div>
        
        {/* O botão de ação só aparece se o projeto não estiver totalmente aprovado */}
        {props.finalStatus !== 'aprovado' && (
           <BotaoAprovarProj
             projectId={props.id}
             projectName={props.name}
             projetosComplianceStatus={props.projetosComplianceStatus}
             complianceDocUrl={props.complianceDocUrl}
             additionalDocsUrl={props.additionalDocsUrl}
             onApprovalSuccess={props.onApprovalSuccess}
           />
        )}
      </div>
      <p className="mb-2 text-lg">{props.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      <div className="bg-pink-fcsn dark:bg-pink-light2 rounded-2xl px-4 py-2 size-fit text-base text-center mb-2 text-white">{props.incentiveLaw}</div>
      <p className="mr-2 mt-3 text-base text-justify">{props.description}</p>
    </section>
    <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 col-span-1">
      {props.ODS.map((img) => <img key={img.numberODS} src={img.src} alt={`ODS ${img.numberODS}`} className="w-28 h-28" />)}
    </section>
  </div>
);

interface Filters {
  status: { situation: "aprovado" | "pendente"; state: boolean }[];
  value: { initialValue: number; finalValue: number | undefined; state: boolean }[];
  incentiveLaw: { law: string; state: boolean }[];
  ODS: { numberODS: number; state: boolean }[];
}

export default function TodosProjetos() {
  const [allProjects, setAllProjects] = useState<ProjectComponentProps[]>([]);
  const [refreshData, setRefreshData] = useState(false);
  
  const handleApprovalSuccess = () => {
    // Força uma nova busca de dados para garantir que a UI reflita o estado mais recente
    setRefreshData(prev => !prev);
  };

  // Lógica de busca de dados, lendo os dois campos de status da coleção 'projetos'
  useEffect(() => {
    async function fetchAllProjects() {
      const formsSnapshot = await getDocs(collection(db, "forms-cadastro"));
      const projectsPromises = formsSnapshot.docs.map(async (formDoc) => {
        const rawData = formDoc.data();
        const formId = formDoc.id;
        const projectName = rawData.nomeProjeto;

        // **IMPORTANTE**: Verifique se os nomes destes campos estão corretos no seu Firebase
        const complianceUrl = rawData.compliance || null;
        const additionalUrl = rawData.documentos || null;

        // Padrões
        let projectFinalStatus: "aprovado" | "pendente" = "pendente";
        let projetosCompliance = false; // booleano

        if (projectName) {
          const projetosQuery = query(collection(db, "projetos"), where("nome", "==", projectName));
          const projetosSnapshot = await getDocs(projetosQuery);
          if (!projetosSnapshot.empty) {
            const projectData = projetosSnapshot.docs[0].data();
            // Lê ambos os campos da coleção 'projetos'
            projetosCompliance = projectData.compliance === true;
            if (projectData.status === "aprovado") {
              projectFinalStatus = "aprovado";
            }
          }
        }
        
        const processedODS: ODS[] = [];
        if (rawData.ods && Array.isArray(rawData.ods)) {
          rawData.ods.forEach((odsItem: any) => {
            processedODS.push({ numberODS: odsItem, src: `/ods/ods${odsItem + 1}.png` });
          });
        }

        return {
          id: formId,
          name: projectName || "Nome Indisponível",
          finalStatus: projectFinalStatus,
          projetosComplianceStatus: projetosCompliance,
          value: rawData.valorApto || 0,
          incentiveLaw: rawData.lei ? rawData.lei.split('-')[0].trim() : "Não informada",
          description: rawData.descricao || "Sem descrição.",
          ODS: processedODS,
          complianceDocUrl: complianceUrl,
          additionalDocsUrl: additionalUrl,
        };
      });

      const resolvedProjects = await Promise.all(projectsPromises);
      setAllProjects(resolvedProjects as ProjectComponentProps[]);
    }
    fetchAllProjects();
  }, [refreshData]); // Roda novamente sempre que uma aprovação ocorrer
  
  // Estados e Funções para Filtros e Busca
  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectComponentProps[]>([]);
  const [ctrl, setCtrl] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  
  const resSearch = allProjects.filter((project) =>
    project.name.toLowerCase().startsWith(search.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;
    function handleCliqueFora(event: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleCliqueFora);
    return () => {
      document.removeEventListener("mousedown", handleCliqueFora);
    };
  }, [isOpen]);
  
  const [filters, setFilters] = useState<Filters>({
    status: [{ situation: "aprovado", state: false }, { situation: "pendente", state: false }],
    value: [{ initialValue: 0, finalValue: 1000, state: false }, { initialValue: 1000.01, finalValue: 100000, state: false }, { initialValue: 100000.01, finalValue: 1000000, state: false }, { initialValue: 1000000.01, finalValue: undefined, state: false }],
    incentiveLaw: [{ law: "CULTURA", state: false }, { law: "PROAC", state: false }, { law: "FIA", state: false }, { law: "LIE", state: false }, { law: "IDOSO", state: false }, { law: "PRONAS", state: false }, { law: "PRONON", state: false }, { law: "PROMAC", state: false }, { law: "ICMS-MG", state: false }, { law: "ICMS-RJ", state: false }, { law: "PIE", state: false }],
    ODS: [{ numberODS: 1, state: false }, { numberODS: 2, state: false }, { numberODS: 3, state: false }, { numberODS: 4, state: false }, { numberODS: 5, state: false }, { numberODS: 6, state: false }, { numberODS: 7, state: false }, { numberODS: 8, state: false }, { numberODS: 9, state: false }, { numberODS: 10, state: false }, { numberODS: 11, state: false }, { numberODS: 12, state: false }, { numberODS: 13, state: false }, { numberODS: 14, state: false }, { numberODS: 15, state: false }, { numberODS: 16, state: false }, { numberODS: 17, state: false }],
  });

  function situationFilters(situacao: "aprovado" | "pendente") { setFilters((prevFilters) => ({ ...prevFilters, status: prevFilters.status.map((item) => item.situation === situacao ? { ...item, state: !item.state } : item ) })); }
  function valueFilters(value1: number, value2: number | undefined) { setFilters((prevFilters) => ({ ...prevFilters, value: prevFilters.value.map((item) => item.initialValue === value1 && item.finalValue === value2 ? { ...item, state: !item.state } : item ) })); }
  function incentiveLawFilters(law: string) { setFilters((prevFilters) => ({ ...prevFilters, incentiveLaw: prevFilters.incentiveLaw.map((item) => item.law === law ? { ...item, state: !item.state } : item ) })); }
  function ODSFilters(number: number) { setFilters((prevFilters) => ({ ...prevFilters, ODS: prevFilters.ODS.map((item) => item.numberODS === number ? { ...item, state: !item.state } : item ) })); }
  
  function applyFilters() {
    const activeStatus = filters.status.filter((f) => f.state).map((f) => f.situation);
    const activeValues = filters.value.filter((f) => f.state);
    const activeLaws = filters.incentiveLaw.filter((f) => f.state).map((f) => f.law);
    const activeODS = filters.ODS.filter((f) => f.state).map((f) => f.numberODS);
    
    const filtered = allProjects.filter((project) => {
      const matchStatus = activeStatus.length === 0 || activeStatus.includes(project.finalStatus);
      const matchValue = activeValues.length === 0 || activeValues.some((range) => project.value >= range.initialValue && (range.finalValue === undefined || project.value <= range.finalValue));
      const matchLaw = activeLaws.length === 0 || activeLaws.includes(project.incentiveLaw);
      const matchODS = activeODS.length === 0 || project.ODS.some((ods) => activeODS.includes(ods.numberODS));
      return matchStatus && matchValue && matchLaw && matchODS;
    });
    
    setFilteredProjects(filtered);
    setCtrl(true);
    if (filtered.length > 0) {
      setSearch("");
    }
  }

  function clearFilters() {
    setFilters((prevFilters) => ({
      status: prevFilters.status.map((item) => ({ ...item, state: false })),
      value: prevFilters.value.map((item) => ({ ...item, state: false })),
      incentiveLaw: prevFilters.incentiveLaw.map((item) => ({ ...item, state: false })),
      ODS: prevFilters.ODS.map((item) => ({ ...item, state: false })),
    }));
    setFilteredProjects([]);
    setCtrl(false);
  }

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const emailDomain = user.email.split("@")[1];
        if (emailDomain === "conpec.com.br" && user.emailVerified) {
          setIsLoading(false);
        } else {
          router.push("./inicio-externo");
        }
      } else {
        router.push("./login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center h-screen bg-white dark:bg-blue-fcsn2 dark:bg-opacity-80">
        <Image src={darkMode ? darkLogo : logo} alt="csn-logo" width={600} priority />
        <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-6 text-center">
          Verificando sessão...
        </div>
      </div>
    );
  }

  const projectsToRender = search ? resSearch : (ctrl ? filteredProjects : allProjects);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col px-4 sm:px-8 md:px-20 lg:px-32 py-4 gap-y-10 ">
        <section>
          <h1 className="text-xl md:text-3xl font-bold text-blue-fcsn dark:text-white mt-3">
            Projetos
          </h1>
          <div className="flex flex-row gap-x-4 mt-3">
            <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
              <FaSearch size={24} />
            </div>
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-white-off dark:bg-blue-fcsn2 px-3 flex-1 rounded-lg shadow-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-row gap-x-4 mt-3">
            <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
              <FaFilter size={24} />
            </div>
            <div
              onMouseEnter={() => setIsOpen(true)}
              className="relative z-10"
            >
              <div className="bg-white-off dark:bg-blue-fcsn2 p-2 px-4 rounded-lg shadow-md text-lg cursor-pointer flex items-center gap-2">
                Aplicar filtros <FaCaretDown />
              </div>
              {isOpen && (
                <div
                  ref={caixaRef}
                  className="absolute top-full left-0 w-[90vw] md:w-[700px] lg:w-[768px] xl:w-[768px] bg-white dark:bg-blue-fcsn2 p-4 rounded shadow-md z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <p className="py-2 text-xl font-semibold">Situação</p>
                    {filters.status.map(filter => (
                      <label key={filter.situation} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={filter.state} onChange={() => situationFilters(filter.situation)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300"/>
                        <span>{filter.situation.charAt(0).toUpperCase() + filter.situation.slice(1)}</span>
                      </label>
                    ))}
                    <p className="py-2 mt-4 text-xl font-semibold">Valor</p>
                    {filters.value.map(filter => (
                      <label key={filter.initialValue} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={filter.state} onChange={() => valueFilters(filter.initialValue, filter.finalValue)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300"/>
                        <span>{`De ${filter.initialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${filter.finalValue ? `a ${filter.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'acima'}`}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <p className="py-2 text-xl font-semibold">Lei de Incentivo</p>
                    {filters.incentiveLaw.map(filter => (
                      <label key={filter.law} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={filter.state} onChange={() => incentiveLawFilters(filter.law)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300"/>
                        <span>{filter.law}</span>
                      </label>
                    ))}
                  </div>

                  <div className="lg:col-span-2">
                    <p className="py-2 text-xl font-semibold">ODS</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      {filters.ODS.map(filter => (
                        <label key={filter.numberODS} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={filter.state} onChange={() => ODSFilters(filter.numberODS)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300"/>
                          <span>ODS {filter.numberODS}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-full flex justify-end gap-4 mt-4">
                    <button
                      className="bg-gray-500 hover:bg-gray-600 rounded-lg p-2 px-4 text-white cursor-pointer"
                      onClick={clearFilters}
                    >
                      Limpar filtros
                    </button>
                    <button
                      className="bg-blue-fcsn hover:bg-blue-800 rounded-lg p-2 px-4 text-white cursor-pointer"
                      onClick={applyFilters}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          {projectsToRender.length > 0 ? (
            projectsToRender.map((project) => (
              <Project 
                key={project.id} 
                {...project} 
                onApprovalSuccess={handleApprovalSuccess} 
              />
            ))
          ) : (
            <p className="text-blue-fcsn dark:text-white-off text-xl mt-4">
              Nenhum projeto encontrado.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}