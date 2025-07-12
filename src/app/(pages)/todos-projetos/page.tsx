"use client";

import Footer from "@/components/footer/footer";
import { useEffect, useRef, useState } from "react";

import {
  FaCaretDown,
  FaCheckCircle,
  FaFilter,
  FaSearch
} from "react-icons/fa";

import { FaClockRotateLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebase-config";

import darkLogo from "@/assets/fcsn-logo-dark.svg";
import logo from "@/assets/fcsn-logo.svg";
import Image from "next/image";
import { useTheme } from "@/context/themeContext";
import { collection, getDocs, query, where } from "firebase/firestore";


import BotaoAprovarProj from "@/components/botoes/botoes_todos-proj/BotaoAprovarProj"; 

// --- MUDANÇA 1: Simplificar a interface. 'reprovado' não existe mais ---
interface ProjectComponentProps {
  id: string;
  name: string;
  status: "aprovado" | "pendente"; // 'reprovado' removido
  value: number;
  incentiveLaw: string;
  description: string;
  ODS: ODS[];
  onApprovalSuccess: (projectId: string) => void;
}

interface ODS {
  numberODS: number;
  src: string;
}

// --- COMPONENTE DE APRESENTAÇÃO 'PROJECT' ---
const Project: React.FC<ProjectComponentProps> = ({
  id,
  name,
  status,
  value,
  incentiveLaw,
  description,
  ODS,
  onApprovalSuccess,
}) => (
  <div className="bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0">
    <section className="flex flex-col col-span-2 mr-2">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <div className="text-2xl font-bold">{name}</div>
        <div className="mt-1">
          {status === "aprovado" && (
            <FaCheckCircle
              className="text-green-600 dark:text-green-500"
              size={22}
            />
          )}
          {status === "pendente" && (
            <FaClockRotateLeft color="darkOrange" size={22} />
          )}
          {/* --- MUDANÇA 2: Lógica para o ícone 'reprovado' removida --- */}
        </div>
        
        {status === 'pendente' && (
           <BotaoAprovarProj
             projectId={id}
             projectName={name}
             onApprovalSuccess={onApprovalSuccess}
           />
        )}
      </div>
      <p className="mb-2 text-lg">
        {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
      <div className="bg-pink-fcsn dark:bg-pink-light2 rounded-2xl px-4 py-2 size-fit text-base text-center mb-2 text-white">
        {incentiveLaw}
      </div>
      <p className="mr-2 mt-3 text-base text-justify">{description}</p>
    </section>

    <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 col-span-1">
      {ODS.map((img) => (
        <img
          key={img.numberODS}
          src={img.src}
          alt={`ODS ${img.numberODS}`}
          className="w-28 h-28"
        />
      ))}
    </section>
  </div>
);

// --- INTERFACE PARA OS FILTROS ---
interface Filters {
  status: { situation: "aprovado" | "pendente"; state: boolean }[]; // 'reprovado' removido
  value: {
    initialValue: number;
    finalValue: number | undefined;
    state: boolean;
  }[];
  incentiveLaw: { law: string; state: boolean }[];
  ODS: { numberODS: number; state: boolean }[];
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function TodosProjetos() {
  const [allProjects, setAllProjects] = useState<ProjectComponentProps[]>([]);
  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectComponentProps[]>([]);
  const [ctrl, setCtrl] = useState(false);
  const resSearch = allProjects.filter((project) =>
    project.name.toLowerCase().startsWith(search.toLowerCase())
  );

  useEffect(() => {
    async function fetchAllProjects() {
      const querySnapshot = await getDocs(collection(db, "forms-cadastro"));
      const projectsPromises = querySnapshot.docs.map(async (formDoc) => {
        const rawData = formDoc.data();
        const formId = formDoc.id;
        const projectName = rawData.nomeProjeto;

        // --- MUDANÇA 3: Lógica de interpretação do status foi atualizada ---
        let complianceStatus: "aprovado" | "pendente" = "pendente"; // Padrão é pendente
        
        if (projectName) {
          const projetosQuery = query(collection(db, "projetos"), where("nome", "==", projectName));
          const complianceQuerySnapshot = await getDocs(projetosQuery);
          
          if (!complianceQuerySnapshot.empty) {
            const complianceData = complianceQuerySnapshot.docs[0].data();
            // `true` é Aprovado. `false` (ou qualquer outro valor/ausência) é Pendente.
            if (complianceData.compliance === true) {
              complianceStatus = "aprovado";
            }
          }
        }
        
        const processedODS: ODS[] = [];
        if (rawData.ods && Array.isArray(rawData.ods)) {
            for (const ODS of rawData.ods) {
                processedODS.push({
                    numberODS: ODS,
                    src: `/ods/ods${ODS + 1}.png`,
                });
            }
        }

        return {
          id: formId,
          name: projectName || "Nome Indisponível",
          status: complianceStatus,
          value: rawData.valorApto || 0,
          incentiveLaw: rawData.lei ? rawData.lei.split('-')[0].trim() : "Não informada",
          description: rawData.descricao || "Sem descrição.",
          ODS: processedODS,
        };
      });

      const resolvedProjects = await Promise.all(projectsPromises);
      setAllProjects(resolvedProjects as ProjectComponentProps[]);
    }
    fetchAllProjects();
  }, []);
  
  const handleApprovalSuccessOnParent = (approvedProjectId: string) => {
    setAllProjects(currentProjects => 
      currentProjects.map(p => 
        p.id === approvedProjectId ? { ...p, status: 'aprovado' } : p
      )
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

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
    // --- MUDANÇA 4: Estado inicial dos filtros atualizado sem 'reprovado' ---
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
      const matchStatus = activeStatus.length === 0 || activeStatus.includes(project.status);
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
  const projectsToRender = search ? resSearch : (ctrl ? filteredProjects : allProjects);

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

    // Vamos verificar se é ADM
    async function IsADM(email: string): Promise<boolean>{
      const usuarioInt = collection(db, "usuarioInt");
      const qADM = query(usuarioInt, where("email", "==", email), where("administrador", "==", true));
      const snapshotADM = await getDocs(qADM );
      return !snapshotADM.empty; // Se não estiver vazio, é um adm
    }

    const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET' });
        const data = await res.json();

        const user = data.user;

        if (!user || !user.email_verified || !user.email) {
          router.push('/login');
          return;
        }

        const emailDomain = user.email.split("@")[1];
        const allowedDomains = ["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"];
        const isInternalUser = allowedDomains.includes(emailDomain);
        const isAdmin = await IsADM(user.email);

        if (!isInternalUser) {
          router.push('/inicio-externo');
          return;
        }

        if (!isAdmin) {
          router.push('/dashboard');
          return;
        }

      } catch (err) {
        console.error("Erro ao buscar sessão:", err);
        router.push('/login');
      }
    }

    fetchUser();
  }, [router]);
  
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
                    {/* --- MUDANÇA 5: Filtro de 'reprovado' removido do JSX --- */}
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
                onApprovalSuccess={handleApprovalSuccessOnParent} 
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
