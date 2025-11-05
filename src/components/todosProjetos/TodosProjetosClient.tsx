"use client";

import { ProjectComponentProps } from "@/app/actions/todosProjetosActions";
import BotaoAprovarProj from "@/components/botoes/botoes_todos-proj/BotaoAprovarProj";
import { db } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, formsCadastroDados, Lei, Projetos } from "@/firebase/schema/entities";
import { normalizeStoredUrl } from "@/lib/utils";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaCheckCircle, FaFilter, FaSearch, FaSpinner } from "react-icons/fa";

interface ODS {
    numberODS: number;
    src: string;
}

const Project: React.FC<ProjectComponentProps> = props => (
    <div
        className={`bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-md p-6 my-8 grid grid-cols-3 gap-2 mt-0 ${!props.isActive ? "grayscale opacity-70" : ""}`}
    >
        <section className="flex flex-col col-span-2 mr-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="text-2xl font-bold">{props.name}</div>

                {props.finalStatus === "aprovado" && props.isActive && (
                    <FaCheckCircle className="text-green-500 text-2xl" title="Aprovado" />
                )}

                {props.finalStatus !== "aprovado" && props.isActive && (
                    <BotaoAprovarProj
                        projectId={props.id}
                        projectName={props.name}
                        projetosComplianceStatus={props.projetosComplianceStatus}
                        complianceDocUrl={props.complianceUrl}
                        additionalDocsUrls={props.additionalDocsUrls}
                    />
                )}
            </div>
            <p className="mb-2 text-lg">
                {props.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <div className="bg-pink-fcsn dark:bg-pink-light2 rounded-2xl px-4 py-2 size-fit text-base text-center mb-2 text-white">
                {props.incentiveLaw}
            </div>
            <p className="mr-2 mt-3 text-base text-justify">{props.description}</p>
            <div className="mt-4 flex w-fit justify-between items-center">
                <Link
                    href={`/detalhes-projeto/${props.id}`}
                    className="text-pink-fcsn dark:text-pink-light hover:underline text-sm"
                >
                    Ver detalhes
                </Link>
            </div>
        </section>
        <section className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 col-span-1">
            {props.ODS.map(img => (
                <Image
                    key={img.numberODS}
                    src={img.src}
                    width={100}
                    height={100}
                    alt={`ODS ${img.numberODS}`}
                    className="w-28 h-28"
                />
            ))}
        </section>
    </div>
);

interface Filters {
    minValue: string;
    maxValue: string;
    incentiveLaw: { law: string; state: boolean }[];
    ODS: { numberODS: number; state: boolean }[];
}

export default function TodosProjetosClient() {
    const [allProjects, setAllProjects] = useState<ProjectComponentProps[]>([]);
    const [incentiveLaws, setIncentiveLaws] = useState<Lei[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Pendentes" | "Aprovados" | "Finalizados" | "Todos">("Pendentes");
    const [search, setSearch] = useState("");
    const [filteredProjects, setFilteredProjects] = useState<ProjectComponentProps[]>([]);
    const [ctrl, setCtrl] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const caixaRef = useRef<HTMLDivElement>(null);

    // Effect para buscar projetos em tempo real
    useEffect(() => {
        const q = query(collection(db, "projetos"));
        const unsubscribe = onSnapshot(q, async querySnapshot => {
            const projectsPromises = querySnapshot.docs.map(async projectDoc => {
                const projectData = projectDoc.data() as Projetos;
                const projectId = projectDoc.id;

                let description = "Sem descrição.";
                let ods: number[] = [];
                let complianceUrl: string | null = null;
                const additionalDocsUrls: {
                    estatuto: string[];
                    ata: string[];
                    contrato: string[];
                } = {
                    estatuto: [],
                    ata: [],
                    contrato: [],
                };

                const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", projectId));
                const cadastroSnapshot = await getDocs(cadastroQuery);
                const cadastroDoc = cadastroSnapshot.docs.length > 0 ? cadastroSnapshot.docs[0] : null;

                if (cadastroDoc) {
                    const cadastroData = cadastroDoc.data() as formsCadastroDados;
                    complianceUrl = cadastroData.compliance?.[0] || null;
                        additionalDocsUrls.estatuto = cadastroData.documentos?.estatuto || [];
                        additionalDocsUrls.ata = cadastroData.documentos?.ata || [];
                        additionalDocsUrls.contrato = cadastroData.documentos?.contrato || [];
                }

                const latestFormId = projectData.ultimoFormulario;
                let latestFormData: formsAcompanhamentoDados | formsCadastroDados | null = null;

                if (latestFormId) {
                    if (cadastroDoc && cadastroDoc.id === latestFormId) {
                        latestFormData = cadastroDoc.data() as formsCadastroDados;
                    } else {
                        const acompanhamentoDocRef = doc(db, "forms-acompanhamento", latestFormId);
                        const acompanhamentoDocSnap = await getDoc(acompanhamentoDocRef);
                        if (acompanhamentoDocSnap.exists()) {
                            latestFormData = acompanhamentoDocSnap.data() as formsAcompanhamentoDados;
                        }
                    }
                }

                if (!latestFormData && cadastroDoc) {
                    latestFormData = cadastroDoc.data() as formsCadastroDados;
                }

                if (latestFormData) {
                    description = latestFormData.descricao || "Sem descrição.";
                    ods = latestFormData.ods || [];
                }

                const processedODS: ODS[] = (ods || []).map((odsItem: number) => ({
                    numberODS: odsItem,
                    src: `/ods/ods${odsItem + 1}.png`,
                }));

                return {
                    id: projectId,
                    name: projectData.nome || "Nome Indisponível",
                    finalStatus: projectData.status,
                    projetosComplianceStatus: projectData.compliance === true,
                    value: projectData.valorAprovado || 0,
                    incentiveLaw: projectData.lei ? projectData.lei.split("-")[0].trim() : "Não informada",
                    description: description,
                    ODS: processedODS,
                    complianceUrl: normalizeStoredUrl(complianceUrl) || null,
                    // esta juntando tudo em um unico array, pois esses documentos sao exibidos no botao aprovar compliance (entao juntamos todos aq para facilitar)
                    additionalDocsUrls: additionalDocsUrls
                    ? [
                        ...additionalDocsUrls.estatuto.map(u => normalizeStoredUrl(u) || u),
                        ...additionalDocsUrls.ata.map(u => normalizeStoredUrl(u) || u),
                        ...additionalDocsUrls.contrato.map(u => normalizeStoredUrl(u) || u),
                        ]
                    : [],

                    isActive: projectData.ativo,
                };
            });

            const resolvedProjects = await Promise.all(projectsPromises);
            setAllProjects(resolvedProjects.sort((a, b) => Number(b.isActive) - Number(a.isActive)));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Effect para buscar leis em tempo real
    useEffect(() => {
        const q = query(collection(db, "leis"));
        const unsubscribe = onSnapshot(q, querySnapshot => {
            const laws = querySnapshot.docs.map(doc => doc.data() as Lei);
            laws.sort((a, b) => a.nome.localeCompare(b.nome));
            setIncentiveLaws(laws);
        });

        return () => unsubscribe();
    }, []);

    const [filters, setFilters] = useState<Filters>({
        minValue: "",
        maxValue: "",
        incentiveLaw: [],
        ODS: Array.from({ length: 17 }, (_, i) => ({ numberODS: i + 1, state: false })),
    });

    // Effect para atualizar os filtros quando as leis são carregadas
    useEffect(() => {
        if (incentiveLaws.length > 0) {
            setFilters(prevFilters => ({
                ...prevFilters,
                incentiveLaw: incentiveLaws.map(law => ({ law: law.sigla, state: false })),
            }));
        }
    }, [incentiveLaws]);

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
    };

    const projectsToRender = search
        ? projectsByTab(activeTab).filter(project => project.name.toLowerCase().startsWith(search.toLowerCase()))
        : ctrl
          ? filteredProjects
          : projectsByTab(activeTab);

    function incentiveLawFilters(law: string) {
        setFilters(prevFilters => ({
            ...prevFilters,
            incentiveLaw: prevFilters.incentiveLaw.map(item =>
                item.law === law ? { ...item, state: !item.state } : item
            ),
        }));
    }

    function ODSFilters(number: number) {
        setFilters(prevFilters => ({
            ...prevFilters,
            ODS: prevFilters.ODS.map(item => (item.numberODS === number ? { ...item, state: !item.state } : item)),
        }));
    }

    function applyFilters() {
        const { minValue, maxValue, incentiveLaw, ODS } = filters;
        const min = parseFloat(minValue) || 0;
        const max = parseFloat(maxValue) || Infinity;

        const activeLawAcronyms = incentiveLaw.filter(f => f.state).map(f => f.law);

        const activeLawNames = incentiveLaws.filter(law => activeLawAcronyms.includes(law.sigla)).map(law => law.nome);

        const activeODS = ODS.filter(f => f.state).map(f => f.numberODS);

        const filtered = projectsByTab(activeTab).filter(project => {
            const matchValue = project.value >= min && project.value <= max;
            const matchLaw = activeLawNames.length === 0 || activeLawNames.includes(project.incentiveLaw);
            const matchODS = activeODS.length === 0 || project.ODS.some(ods => activeODS.includes(ods.numberODS));
            return matchValue && matchLaw && matchODS;
        });

        setFilteredProjects(filtered);
        setCtrl(true);
        if (filtered.length > 0) {
            setSearch("");
        }
    }

    function clearFilters() {
        setFilters({
            minValue: "",
            maxValue: "",
            incentiveLaw: incentiveLaws.map(law => ({ law: law.sigla, state: false })),
            ODS: Array.from({ length: 17 }, (_, i) => ({ numberODS: i + 1, state: false })),
        });
        setFilteredProjects([]);
        setCtrl(false);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <section>
            <h1 className="text-xl md:text-3xl font-bold text-blue-fcsn dark:text-white mt-3">Projetos</h1>
            <div className="flex flex-row gap-x-4 mt-3">
                <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
                    <FaSearch size={24} />
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="bg-white-off dark:bg-blue-fcsn2 px-3 flex-1 rounded-lg shadow-md"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-row gap-x-4 mt-3">
                <div className="bg-white-off dark:bg-blue-fcsn2 p-2 rounded-lg shadow-md">
                    <FaFilter size={24} />
                </div>
                <div className="relative z-10">
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white-off dark:bg-blue-fcsn2 p-2 px-4 rounded-lg shadow-md text-lg cursor-pointer flex items-center gap-2"
                    >
                        Aplicar filtros <FaCaretDown />
                    </div>
                    {isOpen && (
                        <div
                            ref={caixaRef}
                            className="absolute top-full left-0 min-w-[280px] max-w-[800px] w-[280px] sm:w-[350px] md:w-[420px] lg:w-[820px] bg-white dark:bg-blue-fcsn2 p-4 rounded shadow-md z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto"
                        >
                            <div className="col-span-1 px-4">
                                <p className="py-2 text-xl font-semibold">Valor</p>
                                <div className="flex flex-col min-w-[150px] max-w-[200px] items-center space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Mínimo"
                                        value={filters.minValue}
                                        onChange={e => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                                        className="w-full p-2 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Máximo"
                                        value={filters.maxValue}
                                        onChange={e => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                                        className="w-full p-2 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 pl-4">
                                <p className="py-2 text-xl font-semibold">Lei de Incentivo</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2">
                                    {filters.incentiveLaw.map(filter => (
                                        <label key={filter.law} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filter.state}
                                                onChange={() => incentiveLawFilters(filter.law)}
                                                className="w-5 h-5 min-w-[20px] min-h-[20px] text-blue-fcsn rounded border-gray-300"
                                            />
                                            <span>{filter.law}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2 pl-4">
                                <p className="py-2 text-xl font-semibold">ODS</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2">
                                    {filters.ODS.map(filter => (
                                        <label
                                            key={filter.numberODS}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filter.state}
                                                onChange={() => ODSFilters(filter.numberODS)}
                                                className="w-5 h-5 text-blue-fcsn rounded border-gray-300"
                                            />
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
                <button
                    className={`py-2 px-4  cursor-pointer ${activeTab === "Pendentes" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`}
                    onClick={() => setActiveTab("Pendentes")}
                >
                    Pendentes
                </button>
                <button
                    className={`py-2 px-4  cursor-pointer ${activeTab === "Aprovados" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`}
                    onClick={() => setActiveTab("Aprovados")}
                >
                    Aprovados
                </button>
                <button
                    className={`py-2 px-4  cursor-pointer ${activeTab === "Finalizados" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`}
                    onClick={() => setActiveTab("Finalizados")}
                >
                    Finalizados
                </button>
                <button
                    className={`py-2 px-4  cursor-pointer ${activeTab === "Todos" ? "border-b-2 border-blue-fcsn dark:border-white-off" : ""}`}
                    onClick={() => setActiveTab("Todos")}
                >
                    Todos
                </button>
            </div>

            <section>
                {projectsToRender.length > 0 ? (
                    projectsToRender.map(project => <Project key={project.id} {...project} />)
                ) : (
                    <p className="text-blue-fcsn dark:text-white-off text-xl mt-4">Nenhum projeto encontrado.</p>
                )}
            </section>
        </section>
    );
}
