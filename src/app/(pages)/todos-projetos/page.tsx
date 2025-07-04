"use client";

import Footer from "@/components/footer/footer";
import { useEffect, useRef, useState } from "react";
import {
  FaCaretDown,
  FaCheckCircle,
  FaFilter,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebase-config";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import logo from "@/assets/fcsn-logo.svg";
import Image from "next/image";
import { useTheme } from "@/context/themeContext";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Importe o seu componente de botão (ajuste o caminho se necessário)
import BotaoAprovarProj from "../../../components/botoes/botoes_todos-proj/BotaoAprovarProj";

// --- INTERFACES ---
interface ODS {
  numberODS: number;
  src: string;
}

// Interface para os props do componente Project, incluindo o callback
interface ProjectComponentProps {
  id: string;
  name: string;
  status: "aprovado" | "pendente" | "reprovado";
  value: number;
  incentiveLaw: string;
  description: string;
  ODS: ODS[];
  onApprovalSuccess: (projectId: string) => void;
}

// --- COMPONENTE DE APRESENTAÇÃO 'PROJECT' ---
// Este componente apenas exibe os dados e passa as props para o botão
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
          {status === "reprovado" && <FaTimesCircle color="red" size={22} />}
        </div>
        
        {/* Renderiza o seu BotaoAprovarProj apenas se o status for 'pendente' */}
        {status === 'pendente' && (
           <BotaoAprovarProj
             projectId={id}
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
  status: { situation: string; state: boolean }[];
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
  // Estado para armazenar os projetos combinados
  const [allProjects, setAllProjects] = useState<ProjectComponentProps[]>([]);
  const [search, setSearch] = useState("");
  const resSearch = allProjects.filter((project) =>
    project.name.toLowerCase().startsWith(search.toLowerCase())
  );

  // --- LÓGICA DE BUSCA DE DADOS (COMBINANDO AS DUAS COLEÇÕES) ---
  useEffect(() => {
    async function fetchAllProjects() {
      const querySnapshot = await getDocs(collection(db, "forms-cadastro"));

      const projectsPromises = querySnapshot.docs.map(async (formDoc) => {
        const rawData = formDoc.data();
        const projectId = formDoc.id;

        const complianceDocRef = doc(db, "projetos", projectId);
        const complianceDoc = await getDoc(complianceDocRef);
        
        let complianceStatus: "aprovado" | "pendente" | "reprovado" = "pendente";
        if (complianceDoc.exists()) {
          const complianceData = complianceDoc.data();
          if (complianceData.compliance === true) {
            complianceStatus = "aprovado";
          } else if (complianceData.compliance === false) {
            complianceStatus = "reprovado";
          }
        }
        
        const processedODS: ODS[] = [];
        if (rawData.ods && Array.isArray(rawData.ods)) {
            for (let ODS of rawData.ods) {
                processedODS.push({
                    numberODS: ODS,
                    src: `/ods/ods${ODS + 1}.png`,
                });
            }
        }

        // Retorna o objeto combinado para cada projeto
        return {
          id: projectId,
          name: rawData.nomeProjeto || "Nome Indisponível",
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
  
  // --- FUNÇÃO DE CALLBACK PARA ATUALIZAR A UI APÓS APROVAÇÃO ---
  const handleApprovalSuccessOnParent = (approvedProjectId: string) => {
    setAllProjects(currentProjects => 
      currentProjects.map(p => 
        p.id === approvedProjectId ? { ...p, status: 'aprovado' } : p
      )
    );
  };

  // --- LÓGICA DE FILTROS E AUTENTICAÇÃO (SEU CÓDIGO ORIGINAL) ---
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

  const [filteredProjects, setFilteredProjects] = useState<ProjectComponentProps[]>([]);
  const [ctrl, setCtrl] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [{ situation: "aprovado", state: false }, { situation: "pendente", state: false }, { situation: "reprovado", state: false }],
    value: [{ initialValue: 0, finalValue: 1000, state: false }, { initialValue: 1000.01, finalValue: 100000, state: false }, { initialValue: 100000.01, finalValue: 1000000, state: false }, { initialValue: 1000000.01, finalValue: undefined, state: false }],
    incentiveLaw: [{ law: "CULTURA", state: false }, { law: "PROAC", state: false }, { law: "FIA", state: false }, { law: "LIE", state: false }, { law: "IDOSO", state: false }, { law: "PRONAS", state: false }, { law: "PRONON", state: false }, { law: "PROMAC", state: false }, { law: "ICMS-MG", state: false }, { law: "ICMS-RJ", state: false }, { law: "PIE", state: false }],
    ODS: [{ numberODS: 1, state: false }, { numberODS: 2, state: false }, { numberODS: 3, state: false }, { numberODS: 4, state: false }, { numberODS: 5, state: false }, { numberODS: 6, state: false }, { numberODS: 7, state: false }, { numberODS: 8, state: false }, { numberODS: 9, state: false }, { numberODS: 10, state: false }, { numberODS: 11, state: false }, { numberODS: 12, state: false }, { numberODS: 13, state: false }, { numberODS: 14, state: false }, { numberODS: 15, state: false }, { numberODS: 16, state: false }, { numberODS: 17, state: false }],
  });

  function situationFilters(situacao: string) { setFilters((prevFilters) => ({ ...prevFilters, status: prevFilters.status.map((item) => item.situation === situacao ? { ...item, state: !item.state } : item ) })); }
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

  // --- RENDERIZAÇÃO FINAL ---
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
          {/* O seu código de Filtros pode ir aqui, se desejar */}
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