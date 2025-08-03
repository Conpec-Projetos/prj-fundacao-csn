"use client";

import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaFilter, FaSearch, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import BotaoAprovarProj from "@/components/botoes/botoes_todos-proj/BotaoAprovarProj";
import { ProjectComponentProps } from "@/app/actions/todosProjetosActions";
import Image from "next/image";
import Link from "next/link";

const Project: React.FC<ProjectComponentProps & { onApprovalSuccess: () => void }> = (props) => (
    <div className={`bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0 ${!props.isActive ? 'grayscale opacity-70' : ''}`}>
        <section className="flex flex-col col-span-2 mr-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="text-2xl font-bold">{props.name}</div>
                
                {props.finalStatus === 'aprovado' && props.isActive && (
                    <FaCheckCircle className="text-green-500 text-2xl" title="Aprovado" />
                )}

                {props.finalStatus !== 'aprovado' && props.isActive && (
                    <BotaoAprovarProj
                        projectId={props.id}
                        projectName={props.name}
                        projetosComplianceStatus={props.projetosComplianceStatus}
                        complianceDocUrl={props.complianceUrl}
                        additionalDocsUrls={props.additionalDocsUrls}
                        onApprovalSuccess={props.onApprovalSuccess}
                    />
                )}
            </div>
            <p className="mb-2 text-lg">{props.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <div className="bg-pink-fcsn dark:bg-pink-light2 rounded-2xl px-4 py-2 size-fit text-base text-center mb-2 text-white">{props.incentiveLaw}</div>
            <p className="mr-2 mt-3 text-base text-justify">{props.description}</p>
            <div className="mt-4 flex w-fit justify-between items-center">
            <Link href={`/detalhes-projeto?id=${props.id}`} className="text-pink-fcsn dark:text-pink-light hover:underline text-sm">
              Ver detalhes
            </Link>
          </div>
        </section>
        <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 col-span-1">
            {props.ODS.map((img) => <Image key={img.numberODS} src={img.src} width={100} height={100} alt={`ODS ${img.numberODS}`} className="w-28 h-28" />)}
        </section>
    </div>
);

interface Filters {
    value: { initialValue: number; finalValue: number | undefined; state: boolean }[];
    incentiveLaw: { law: string; state: boolean }[];
    ODS: { numberODS: number; state: boolean }[];
}

export default function TodosProjetosClient({ allProjects }: { allProjects: ProjectComponentProps[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"Pendentes" | "Aprovados" | "Finalizados" | "Todos">("Pendentes");
    const [search, setSearch] = useState("");
    const [filteredProjects, setFilteredProjects] = useState<ProjectComponentProps[]>([]);
    const [ctrl, setCtrl] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const caixaRef = useRef<HTMLDivElement>(null);

    const handleApprovalSuccess = () => {
        router.refresh();
    };
    
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
        value: [
            { initialValue: 0, finalValue: 1000, state: false },
            { initialValue: 1000.01, finalValue: 100000, state: false },
            { initialValue: 100000.01, finalValue: 1000000, state: false },
            { initialValue: 1000000.01, finalValue: undefined, state: false }
        ],

        incentiveLaw: [
            { law: "CULTURA", state: false },
            { law: "PROAC", state: false },
            { law: "FIA", state: false },
            { law: "LIE", state: false },
            { law: "IDOSO", state: false },
            { law: "PRONAS", state: false },
            { law: "PRONON", state: false },
            { law: "PROMAC", state: false },
            { law: "ICMS-MG", state: false },
            { law: "ICMS-RJ", state: false },
            { law: "PIE", state: false }
        ],

        ODS: [
            { numberODS: 1, state: false },
            { numberODS: 2, state: false },
            { numberODS: 3, state: false },
            { numberODS: 4, state: false },
            { numberODS: 5, state: false },
            { numberODS: 6, state: false },
            { numberODS: 7, state: false },
            { numberODS: 8, state: false },
            { numberODS: 9, state: false },
            { numberODS: 10, state: false },
            { numberODS: 11, state: false },
            { numberODS: 12, state: false },
            { numberODS: 13, state: false },
            { numberODS: 14, state: false },
            { numberODS: 15, state: false },
            { numberODS: 16, state: false },
            { numberODS: 17, state: false }
        ],
    });

    const projectsByTab = (tab: typeof activeTab) => {
        switch (tab) {
            case "Pendentes":
                return allProjects.filter(p => p.finalStatus === "pendente");
            case "Aprovados":
                return allProjects.filter(p => p.finalStatus === "aprovado" && p.isActive);
            case "Finalizados":
                return allProjects.filter(p => p.finalStatus === "aprovado" && !p.isActive);
            case "Todos":
                return allProjects;
        }
    }

    const projectsToRender = search ? projectsByTab(activeTab).filter((project) =>
        project.name.toLowerCase().startsWith(search.toLowerCase())
    ) : (ctrl ? filteredProjects : projectsByTab(activeTab));

    function valueFilters(value1: number, value2: number | undefined) { setFilters((prevFilters) => ({ ...prevFilters, value: prevFilters.value.map((item) => item.initialValue === value1 && item.finalValue === value2 ? { ...item, state: !item.state } : item ) })); }

    function incentiveLawFilters(law: string) { setFilters((prevFilters) => ({ ...prevFilters, incentiveLaw: prevFilters.incentiveLaw.map((item) => item.law === law ? { ...item, state: !item.state } : item ) })); }
    
    function ODSFilters(number: number) { setFilters((prevFilters) => ({ ...prevFilters, ODS: prevFilters.ODS.map((item) => item.numberODS === number ? { ...item, state: !item.state } : item ) })); }

    function applyFilters() {
        const activeValues = filters.value.filter((f) => f.state);
        const activeLaws = filters.incentiveLaw.filter((f) => f.state).map((f) => f.law);
        const activeODS = filters.ODS.filter((f) => f.state).map((f) => f.numberODS);

        const filtered = projectsByTab(activeTab).filter((project) => {
            const matchValue = activeValues.length === 0 || activeValues.some((range) => project.value >= range.initialValue && (range.finalValue === undefined || project.value <= range.finalValue));
            const matchLaw = activeLaws.length === 0 || activeLaws.includes(project.incentiveLaw);
            const matchODS = activeODS.length === 0 || project.ODS.some((ods) => activeODS.includes(ods.numberODS));
            return matchValue && matchLaw && matchODS;
        });

        setFilteredProjects(filtered);
        setCtrl(true);
        if (filtered.length > 0) {
            setSearch("");
        }
    }

    function clearFilters() {
        setFilters((prevFilters) => ({
            value: prevFilters.value.map((item) => ({ ...item, state: false })),
            incentiveLaw: prevFilters.incentiveLaw.map((item) => ({ ...item, state: false })),
            ODS: prevFilters.ODS.map((item) => ({ ...item, state: false })),
        }));
        setFilteredProjects([]);
        setCtrl(false);
    }

    return (
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
                    className="relative z-10"
                >
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white-off dark:bg-blue-fcsn2 p-2 px-4 rounded-lg shadow-md text-lg cursor-pointer flex items-center gap-2"
                    >
                        Aplicar filtros <FaCaretDown />
                    </div>
                    {isOpen && (
                        <div
                            ref={caixaRef}
                            className="absolute top-full left-0 w-[90vw] md:w-[700px] lg:w-[768px] xl:w-[768px] bg-white dark:bg-blue-fcsn2 p-4 rounded shadow-md z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            <div>
                                <p className="py-2 mt-4 text-xl font-semibold">Valor</p>
                                {filters.value.map(filter => (
                                    <label key={filter.initialValue} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={filter.state} onChange={() => valueFilters(filter.initialValue, filter.finalValue)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300" />
                                        <span>{`De ${filter.initialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${filter.finalValue ? `a ${filter.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'acima'}`}</span>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <p className="py-2 text-xl font-semibold">Lei de Incentivo</p>
                                {filters.incentiveLaw.map(filter => (
                                    <label key={filter.law} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={filter.state} onChange={() => incentiveLawFilters(filter.law)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300" />
                                        <span>{filter.law}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="lg:col-span-2">
                                <p className="py-2 text-xl font-semibold">ODS</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                    {filters.ODS.map(filter => (
                                        <label key={filter.numberODS} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={filter.state} onChange={() => ODSFilters(filter.numberODS)} className="w-5 h-5 text-blue-fcsn rounded border-gray-300" />
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

            <div className="flex space-x-4 border-b my-8">
                <button className={`py-2 px-4  cursor-pointer ${activeTab === "Pendentes" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`} onClick={() => setActiveTab("Pendentes")}>Pendentes</button>
                <button className={`py-2 px-4  cursor-pointer ${activeTab === "Aprovados" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`} onClick={() => setActiveTab("Aprovados")}>Aprovados</button>
                <button className={`py-2 px-4  cursor-pointer ${activeTab === "Finalizados" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`} onClick={() => setActiveTab("Finalizados")}>Finalizados</button>
                <button className={`py-2 px-4  cursor-pointer ${activeTab === "Todos" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`} onClick={() => setActiveTab("Todos")}>Todos</button>
            </div>

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
        </section>
    );
}