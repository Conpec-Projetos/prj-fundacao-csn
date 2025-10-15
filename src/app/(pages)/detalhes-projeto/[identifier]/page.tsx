"use client";
import Footer from "@/components/footer/footer";
import IconButton from "@/components/ui/IconButton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { db, storage } from "@/firebase/firebase-config";
import { saveAs } from "file-saver";
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { getDownloadURL, listAll, ref, StorageReference, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaPencilAlt } from "react-icons/fa";
import { FaFolderOpen, FaRegFileLines } from "react-icons/fa6";
import { toast, Toaster } from "sonner";
import link from "src/assets/Link-svg.svg";
import presentation from "src/assets/Presentation-svg.svg";
import atencao from "src/assets/atencao-svg.svg";
import negativo from "src/assets/negativo-svg.svg";
import positivo from "src/assets/positivo-svg.svg";

interface ProjectData {
    nome?: string;
    nomeProjeto?: string;
    instituicao?: string;
    lei?: string;
    numeroLei?: string;
    publico?: string[];
    segmento?: string;
    ambito?: string;
    website?: string;
    links?: string;
    apresentacao?: string;
    ods?: number[];
    valorAprovado?: number;
    valorApto?: number;
    periodoCaptacao?: string;
    descricao?: string;
    indicacao?: string;
    municipios?: string[];
    especificacoes?: string;
    especificacoesTerritorio?: string;
    beneficiariosDiretos?: number;
    beneficiariosIndiretos?: number;
    dataInicial?: string | Timestamp;
    dataFinal?: string | Timestamp;
    contrapartidasProjeto?: string;
    pontosPositivos?: string;
    contrapartidasExecutadas?: string;
    pontosNegativos?: string;
    pontosAtencao?: string;
    politicasDiversidade?: boolean;
    diversidade?: boolean;
    etnia?: { branca: number; amarela: number; indigena: number; parda: number; preta: number };
    genero?: { mulherCis: number; mulherTrans: number; homemCis: number; homemTrans: number; naoBinario: number };
    outros?: { pcd: number; lgbt: number };
    relato?: string;
    relatoBeneficiario?: string;
    responsavel?: string;
    imagensCarrossel?: string[];
    fotos?: { [key: string]: string };
    cnpj?: string;
    representante?: string;
    telefone?: string;
    emailResponsavel?: string;
    endereco?: string;
    numeroEndereco?: number;
    cidade?: string;
    estado?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    observacoes?: string;
    dataPreenchido?: Timestamp | string;
    dataResposta?: Timestamp | string;
    projetoID?: string;
    qtdBrancas?: number;
    qtdAmarelas?: number;
    qtdIndigenas?: number;
    qtdPardas?: number;
    qtdPretas?: number;
    qtdMulherCis?: number;
    qtdMulherTrans?: number;
    qtdHomemCis?: number;
    qtdHomemTrans?: number;
    qtdNaoBinarios?: number;
    qtdPCD?: number;
    qtdLGBT?: number;
    periodoExecucao?: string;
    anotacoes?: { [key: string]: string };
}

const formatFirebaseDate = (dateValue: string | Timestamp | null | undefined): string => {
    if (!dateValue) return "N/A";
    if (typeof (dateValue as Timestamp).toDate === "function")
        return (dateValue as Timestamp).toDate().toLocaleDateString("pt-BR", { timeZone: "UTC" });
    try {
        return new Date(dateValue as string).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    } catch (e) {
        console.log(e);
        return "Data inválida";
    }
};

const formatExternalUrl = (url: string | undefined | null): string | undefined => {
    if (!url) {
        return undefined;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    return `https://${url}`;
};

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const identifier = params.identifier as string;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notes, setNotes] = useState<string>("");

    const [allSubmissions, setAllSubmissions] = useState<ProjectData[]>([]);
    const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);

    const [adm, setAdm] = useState<boolean | null>(null);
    const [proponente, setProponente] = useState<boolean | null>(null);

    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use state para os documentos adicionais e recibos, usamos as variaveis para os dois
    const [formCadastroId, setFormCadastroId] = useState<string | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false); // Controle para selecionar um arquivo
    const [documentFiles, setDocumentFiles] = useState<File[]>([]);
    const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);

    // Use state para downloading
    const [showDownloadingModal, setShowDownloadingModal] = useState(false);

    const [isEditingResponsavel, setIsEditingResponsavel] = useState(false);
    const [editResponsavel, setEditResponsavel] = useState<string>("");
    const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState<string>("");
  const [isEditingValorAprovado, setIsEditingValorAprovado] = useState(false);
    const [editValorAprovado, setEditValorAprovado] = useState<number | undefined>(undefined);
    const [isEditingDadosBancarios, setIsEditingDadosBancarios] = useState(false);
    const [editBanco, setEditBanco] = useState<string>("");
    const [editAgencia, setEditAgencia] = useState<string>("");
    const [editConta, setEditConta] = useState<string>("");
    const [showApresentacaoMenu, setShowApresentacaoMenu] = useState(false);

    const toggleApresentacaoMenu = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e?.preventDefault();
        setShowApresentacaoMenu(prev => !prev);
    };

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/session", { method: "GET" });
                if (!res.ok) {
                    setAdm(false);
                    setProponente(false);
                    return;
                }
                const data = await res.json();
                setAdm(data.user?.userIntAdmin === true);
                setProponente(data.user?.userExt === true);
            } catch (error) {
                console.error("Falha ao buscar sessão do usuário:", error);
                setAdm(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!identifier) return;

        const fetchProjectSubmissions = async () => {
            setIsLoading(true);
            try {
                const projetoRef = doc(db, "projetos", identifier);
                const projetoSnap = await getDoc(projetoRef);

                if (!projetoSnap.exists()) {
                    toast.error("Projeto não encontrado.");
                    setProjectData(null);
                    setIsLoading(false);
                    return;
                }

                const projetoData = projetoSnap.data() as ProjectData;

                const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", identifier));
                const cadastroSnapshot = await getDocs(cadastroQuery);

                if (cadastroSnapshot.empty) {
                    toast.error("Formulário de cadastro do projeto não encontrado.");
                    setProjectData(null);
                    setIsLoading(false);
                    return;
                }

                const cadastroData = {
                    id: cadastroSnapshot.docs[0].id,
                    ...(cadastroSnapshot.docs[0].data() as ProjectData),
                };
                setFormCadastroId(cadastroSnapshot.docs[0].id);

                const acompanhamentoQuery = query(
                    collection(db, "forms-acompanhamento"),
                    where("projetoID", "==", identifier),
                    orderBy("dataResposta", "desc")
                );
                const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
                const acompanhamentoDocs = acompanhamentoSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as ProjectData),
                }));

                const submissions: ProjectData[] = [...acompanhamentoDocs, cadastroData].map(submission => {
                    let imagensCarrossel: string[] = [];
                    if (submission.fotos) {
                        imagensCarrossel = Object.values(submission.fotos);
                    } else if (submission.imagensCarrossel) {
                        imagensCarrossel = submission.imagensCarrossel;
                    }

                    return {
                        ...submission,
                        nome: projetoData.nome,
                        instituicao: projetoData.instituicao,
                        lei: projetoData.lei,
                        numeroLei: cadastroData.numeroLei,
                        publico: cadastroData.publico,
                        valorAprovado: projetoData.valorAprovado,
                        anotacoes: projetoData.anotacoes,
                        responsavel: cadastroData.responsavel,
                        valorApto: cadastroData.valorApto,
                        cnpj: cadastroData.cnpj,
                        representante: cadastroData.representante,
                        telefone: cadastroData.telefone,
                        emailResponsavel: cadastroData.emailResponsavel,
                        endereco: cadastroData.endereco,
                        cidade: cadastroData.cidade,
                        estado: cadastroData.estado,
                        numeroEndereco: cadastroData.numeroEndereco,
                        banco: cadastroData.banco,
                        agencia: cadastroData.agencia,
                        conta: cadastroData.conta,
                        observacoes: cadastroData.observacoes,
                        imagensCarrossel: imagensCarrossel,
                    };
                });
                setAllSubmissions(submissions);

                if (submissions.length > 0) {
                    setProjectData(submissions[0]);
                    setCurrentSubmissionIndex(0);
                } else {
                    setProjectData(null);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do projeto:", error);
                toast.error("Erro ao carregar os dados do projeto.");
                setProjectData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjectSubmissions();
    }, [identifier]);

    const handleNextSubmission = () => {
        if (currentSubmissionIndex > 0) {
            const newIndex = currentSubmissionIndex - 1;
            setCurrentSubmissionIndex(newIndex);
            setProjectData(allSubmissions[newIndex]);
        }
    };

    const handlePreviousSubmission = () => {
        if (currentSubmissionIndex < allSubmissions.length - 1) {
            const newIndex = currentSubmissionIndex + 1;
            setCurrentSubmissionIndex(newIndex);
            setProjectData(allSubmissions[newIndex]);
        }
    };

    const handleDeleteProject = async () => {
        const formId = formCadastroId || identifier;
        const projetoId = identifier;

        if (!formId && !projetoId) {
            toast.error("IDs do projeto não encontrados. Não é possível excluir.");
            return;
        }

        toast.info("Excluindo projeto, por favor aguarde...");

        try {
            const batch = writeBatch(db);

            if (projetoId) {
                const projetoRef = doc(db, "projetos", projetoId);
                const projetoSnap = await getDoc(projetoRef);
                if (projetoSnap.exists()) {
                    batch.delete(projetoRef);
                }
            }

            if (formId) {
                const formCadastroRef = doc(db, "forms-cadastro", formId);
                const formSnap = await getDoc(formCadastroRef);
                if (formSnap.exists()) {
                    batch.delete(formCadastroRef);
                }
            }

            const acompanhamentoQuery = query(
                collection(db, "forms-acompanhamento"),
                where("projetoID", "==", projetoId)
            );
            const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
            acompanhamentoSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            toast.success("Projeto excluído com sucesso!");
            router.push("/todos-projetos");
        } catch (error) {
            console.error("Erro ao excluir projeto:", error);
            toast.error("Falha ao excluir o projeto.");
        }
    };

    const handleAddNote = async () => {
        if (notes.trim() === "") {
            toast.error("A anotação não pode estar vazia.");
            return;
        }
        if (!identifier) {
            toast.error("ID do projeto não encontrado. Não é possível salvar a anotação.");
            return;
        }

        const noteKey = Date.now().toString();
        const newNoteText = notes;
        const updatePayload = {
            [`anotacoes.${noteKey}`]: newNoteText,
        };

        try {
            const projectDocRef = doc(db, "projetos", identifier);
            await updateDoc(projectDocRef, updatePayload);

            setProjectData(prevData => {
                if (!prevData) return null;
                const updatedAnotacoes = {
                    ...(prevData.anotacoes || {}),
                    [noteKey]: newNoteText,
                };
                return { ...prevData, anotacoes: updatedAnotacoes };
            });

            setNotes("");
            toast.success("Anotação adicionada com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar anotação:", error);
            toast.error("Falha ao salvar a anotação.");
        }
    };

    // Função para upload dos arquivos e atualização do campo "documentos" em forms-cadastro
    // Pri: No storage esta: forms-cadastro/id/documentos
    const handleUploadDocuments = async () => {
        if (!formCadastroId || documentFiles.length === 0) {
            toast.error("Selecione ao menos um arquivo para enviar.");
            return;
        }
        setIsUploadingDocuments(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of documentFiles) {
                const storageRef = ref(
                    storage,
                    `forms-cadastro/${formCadastroId}/documentos/${file.name}_${Date.now()}`
                );
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                uploadedUrls.push(url);
            }

            // Adiciona os novos arquivos ao array existente usando arrayUnion
            const formDocRef = doc(db, "forms-cadastro", formCadastroId);
            await updateDoc(formDocRef, {
                documentos: arrayUnion(...uploadedUrls), // Para documentos temos o array documentos
            });

            toast.success("Documentos enviados com sucesso!");
            setShowDocumentModal(false);
            setDocumentFiles([]);
        } catch (error) {
            console.error("Erro ao enviar documentos:", error);
            toast.error("Falha ao enviar documentos.");
        } finally {
            setIsUploadingDocuments(false);
        }
    };

    // Função para upload dos recibos pelo proponente
    // Pri: No storage esta: forms-cadastro/id/recibos
    const handleUploadReceipts = async () => {
        if (!formCadastroId || documentFiles.length === 0) {
            toast.error("Selecione ao menos um arquivo para enviar.");
            return;
        }
        setIsUploadingDocuments(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of documentFiles) {
                const storageRef = ref(storage, `forms-cadastro/${formCadastroId}/recibos/${file.name}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                uploadedUrls.push(url);
            }

            // Adiciona os novos arquivos ao array recibos que será criado pela primeira vez aqui
            const formDocRef = doc(db, "forms-cadastro", formCadastroId);
            await updateDoc(formDocRef, {
                recibos: arrayUnion(...uploadedUrls),
            });

            toast.success("Recibos enviados com sucesso!");
            setShowDocumentModal(false);
            setDocumentFiles([]);
        } catch (error) {
            console.error("Erro ao enviar recibos:", error);
            toast.error("Falha ao enviar recibos.");
        } finally {
            setIsUploadingDocuments(false);
        }
    };

    // -------------------------------------------------------------------------//
    const [currentPath, setCurrentPath] = useState("");
    const [folders, setFolders] = useState<StorageReference[]>([]);
    const [files, setFiles] = useState<StorageReference[]>([]);

    const ROOT_PATH = adm ? `forms-cadastro/${formCadastroId}/` : `forms-cadastro/${formCadastroId}/recibos/`;

    // Mostra apenas o trecho depois do ROOT_PATH
    const displayPath = currentPath.replace(ROOT_PATH, "") || "./";

    // Carrega conteúdo da pasta atual
    const loadFolder = async (path: string) => {
        const folderRef = ref(storage, path);
        const res = await listAll(folderRef); // Pegamos tudo que esta dentro desta pasta (arquivos e outras pastas)

        setFolders(res.prefixes); // subpastas
        setFiles(res.items); // arquivos que estao dentro desta pasta
    };

    useEffect(() => {
        if (formCadastroId) {
            // Definimos o path de acordo com o id
            const rootPath = adm ? `forms-cadastro/${formCadastroId}/` : `forms-cadastro/${formCadastroId}/recibos/`;

            setCurrentPath(rootPath);
            loadFolder(rootPath);
        }
    }, [formCadastroId, adm]);

    const handleDownload = async (filePath: string, fileName: string) => {
        try {
            const res = await fetch(`/api/downloads/download?filePath=${encodeURIComponent(filePath)}`);

            if (!res.ok) {
                // Tenta pegar mensagem de erro como texto, não JSON
                const errorText = await res.text();
                throw new Error(`Erro no servidor: ${errorText}`);
            }

            const blob = await res.blob(); // Aqui está o arquivo real (objeto do tipo arquivo)
            saveAs(blob, fileName); // Baixamos o arquivo no computador do client
        } catch (err) {
            console.error("Erro ao baixar arquivo:", err);
        }
    };

    const handleOpenFolder = (subFolderRef: StorageReference) => {
        // segurança: só deixa abrir se estiver dentro do ROOT_PATH
        if (!subFolderRef.fullPath.startsWith(ROOT_PATH)) return;
        const newPath = `${subFolderRef.fullPath}/`;
        setCurrentPath(newPath);
        loadFolder(newPath);
    };

    // Voltar para pasta anterior
    const handleGoBack = () => {
        if (currentPath === ROOT_PATH) return; // não volta além da raiz

        const parts = currentPath.split("/").filter(Boolean);
        parts.pop(); // remove a última parte (pasta atual)
        const newPath = parts.join("/") + "/";
        setCurrentPath(newPath);
        loadFolder(newPath);
    };

    //-------------------------------------------------------------------------//

    // Funções para salvar edição
    const handleSaveResponsavel = async () => {
        if (!formCadastroId) return;
        try {
            await updateDoc(doc(db, "forms-cadastro", formCadastroId), { responsavel: editResponsavel });
            setProjectData(prev => (prev ? { ...prev, responsavel: editResponsavel } : prev));
            setIsEditingResponsavel(false);
            toast.success("Responsável atualizado!");
        } catch (error) {
            toast.error("Erro ao atualizar responsável.");
            console.log(error);
        }
    };

    const handleSaveEmail = async () => {
    if (!formCadastroId) return;
    try {
      await updateDoc(doc(db, "forms-cadastro", formCadastroId), { emailResponsavel: editEmail });
      setProjectData(prev => prev ? { ...prev, emailResponsavel: editEmail } : prev);
      setIsEditingEmail(false);
      toast.success("Email atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar email.");
      console.log(error);
    }
  };

    const handleSaveValorAprovado = async () => {
        // Agora atualiza na coleção "projetos" e não mais em "forms-cadastro"
        if (!identifier) return;
        try {
            await updateDoc(doc(db, "projetos", identifier), { valorAprovado: editValorAprovado });
            setProjectData(prev => (prev ? { ...prev, valorAprovado: editValorAprovado } : prev));
            setIsEditingValorAprovado(false);
            toast.success("Valor aprovado atualizado!");
        } catch (error) {
            toast.error("Erro ao atualizar valor aprovado.");
            console.log(error);
        }
    };

    const handleSaveDadosBancarios = async () => {
        if (!formCadastroId) return;
        try {
            await updateDoc(doc(db, "forms-cadastro", formCadastroId), {
                banco: editBanco,
                agencia: editAgencia,
                conta: editConta,
            });
            setProjectData(prev =>
                prev ? { ...prev, banco: editBanco, agencia: editAgencia, conta: editConta } : prev
            );
            setIsEditingDadosBancarios(false);
            toast.success("Dados bancários atualizados!");
        } catch (error) {
            toast.error("Erro ao atualizar dados bancários.");
            console.log(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl dark:bg-blue-fcsn dark:text-white-off">
                Carregando dados do projeto...
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="flex justify-center items-center h-screen text-xl dark:bg-blue-fcsn dark:text-white-off">
                Projeto não encontrado.
            </div>
        );
    }

    // Normalize apresentacao to an array of strings so we never render an array directly into an href
    const apresentacaoUrls: string[] = projectData.apresentacao
        ? Array.isArray(projectData.apresentacao)
            ? projectData.apresentacao
            : [projectData.apresentacao]
        : [];

    // Read-time normalization for legacy/path-like stored values. Prefer explicit public base if available,
    // otherwise fall back to the current origin. This does NOT mutate stored Firestore values.
    const normalizeReadUrl = (u?: string | null): string | undefined => {
        if (!u) return undefined;

        let s = u.trim();

        // Strip surrounding quotes if the value was accidentally stored with extra quotes
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1).trim();
        }

        // If value was stored with a leading slash before a JSON-array like '/["https://..."]', remove the slash
        if (s.startsWith("/") && s.length > 1 && s[1] === "[") {
            s = s.slice(1);
        }

        // If stored value is a JSON-stringified array like '["https://..."]', parse it and use the first item.
        if (s.startsWith("[") && s.endsWith("]")) {
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
                    s = parsed[0].trim();
                }
            } catch {
                // fall back to treating s as raw
            }
        }

        if (!s) return undefined;
        if (s.startsWith("http://") || s.startsWith("https://")) return s;

        const base =
            typeof window !== "undefined" && process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL == null
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL ??
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined));
        if (!base) return s;
        return `${base.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
    };

    const normalizedApresentacaoUrls = apresentacaoUrls.map(u => normalizeReadUrl(u) as string).filter(Boolean);
    const hasApresentacao = normalizedApresentacaoUrls.length > 0;
    const firstApresentacaoUrl = hasApresentacao ? normalizedApresentacaoUrls[0] : undefined;

    return (
        <main className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-blue-fcsn dark:text-white-off">
            <div className="w-full max-w-4xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start">
                    <div className="space-y-2 flex-1">
                        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                            {projectData.nome ?? projectData.nomeProjeto ?? "N/A"}
                        </h1>
                        <h2 className="text-2xl text-gray-700 font-medium dark:text-gray-300">
                            {projectData.instituicao ?? "N/A"}
                        </h2>
                        {/* Responsável + Edit */}
                        <div className="flex items-center gap-2">
                            <p className="text-xl text-gray-700 font-medium dark:text-gray-300">
                                Responsável:{" "}
                                {isEditingResponsavel ? (
                                    <input
                                        type="text"
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off"
                                        value={editResponsavel}
                                        onChange={e => setEditResponsavel(e.target.value)}
                                    />
                                ) : (
                                    <span>{projectData.responsavel ?? "N/A"}</span>
                                )}
                            </p>
                            {adm && !isEditingResponsavel && (
                                <button
                                    className="ml-2 text-gray-500 hover:text-blue-fcsn"
                                    onClick={() => {
                                        setEditResponsavel(projectData.responsavel ?? "");
                                        setIsEditingResponsavel(true);
                                    }}
                                    title="Editar responsável"
                                >
                                    <FaPencilAlt />
                                </button>
                            )}
                            {adm && isEditingResponsavel && (
                                <>
                                    <button
                                        className="ml-2 bg-blue-fcsn text-white px-2 py-1 rounded"
                                        onClick={handleSaveResponsavel}
                                        title="Salvar"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        className="ml-2 bg-gray-300 text-black px-2 py-1 rounded"
                                        onClick={() => setIsEditingResponsavel(false)}
                                        title="Cancelar"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <p className="text-xl text-gray-700 font-medium dark:text-gray-300">
                                Email do responsável: {projectData.emailResponsavel}
                            </p>

            </div> */}

             {/* Email do responsável + Edit */}
            <div className="flex items-center gap-2">
              <p className="text-xl text-gray-700 font-medium dark:text-gray-300">
                Email do responsável:{" "}
                {isEditingEmail ? (
                  <input
                    type="text"
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                ) : (
                  <span>{projectData.emailResponsavel ?? 'N/A'}</span>
                )}
              </p>
              {adm && !isEditingEmail && (
                <button
                  className="ml-2 text-gray-500 hover:text-blue-fcsn"
                  onClick={() => {
                    setEditEmail(projectData.emailResponsavel ?? "");
                    setIsEditingEmail(true);
                  }}
                  title="Editar email do responsável"
                >
                  <FaPencilAlt />
                </button>
              )}
              {adm && isEditingEmail && (
                <>
                  <button
                    className="ml-2 bg-blue-fcsn text-white px-2 py-1 rounded"
                    onClick={handleSaveEmail}
                    title="Salvar"
                  >
                    Salvar
                  </button>
                  <button
                    className="ml-2 bg-gray-300 text-black px-2 py-1 rounded"
                    onClick={() => setIsEditingEmail(false)}
                    title="Cancelar"
                  >
                    Cancelar
                  </button>
                </>
              )}
                        </div>


                        <p className="text-gray-600 dark:text-gray-400">
                            Via{" "}
                            <span className="font-semibold text-blue-fcsn dark:text-white-off">
                                {projectData.lei ?? "N/A"}
                            </span>
                            , projeto n. <span className="font-semibold">{projectData.numeroLei ?? "N/A"}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Público beneficiado:{" "}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {projectData.publico?.join(", ") ?? "N/A"}
                            </span>
                        </p>
                    </div>
                    <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-auto flex flex-col gap-3">
                        <div className="flex flex-row gap-5 justify-end">
                            <div className="bg-red-fcsn text-white text-sm w-28 text-center py-1 flex justify-center items-center rounded-2xl">
                                {projectData.ambito ?? "N/A"}
                            </div>
                            <div className="bg-blue-fcsn w-28 text-white text-sm flex justify-center items-center rounded-2xl dark:border-1 dark:border-white">
                                {projectData.segmento ?? "N/A"}
                            </div>
                        </div>
                        <div className="flex flex-row justify-end gap-5">
                            <div className="flex flex-row justify-end gap-5">
                                {/* WEBSITE button */}
                                <IconButton
                                    href={formatExternalUrl(projectData.website) || undefined}
                                    disabled={!projectData.website}
                                    title={projectData.website ? "Abrir website" : "Nenhum website"}
                                    className="text-sm w-28 rounded-2xl border-2 dark:border-white dark:text-white font-bold px-3 py-1"
                                >
                                    WEBSITE
                                </IconButton>

                                {/* Link icon */}
                                <IconButton
                                    href={formatExternalUrl(projectData.links) || undefined}
                                    disabled={!projectData.links}
                                    title={projectData.links ? "Abrir link" : "Sem link"}
                                    className="p-1 rounded-2xl border-2 dark:border-white"
                                >
                                    <Image
                                        src={link}
                                        alt="Link"
                                        width={18}
                                        height={18}
                                        className="dark:brightness-0 dark:invert"
                                    />
                                </IconButton>

                                {/* Presentation icon / menu */}
                                <div className="relative">
                                    {normalizedApresentacaoUrls.length === 1 ? (
                                        <IconButton
                                            href={firstApresentacaoUrl || undefined}
                                            disabled={!firstApresentacaoUrl}
                                            title={firstApresentacaoUrl ? "Abrir apresentação" : "Nenhuma apresentação"}
                                            className="p-1 rounded-2xl border-2 dark:border-white"
                                        >
                                            <Image
                                                src={presentation}
                                                alt="Apresentação"
                                                width={20}
                                                height={20}
                                                className="dark:brightness-0 dark:invert"
                                            />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            onClick={toggleApresentacaoMenu}
                                            disabled={!hasApresentacao}
                                            title={hasApresentacao ? "Abrir apresentações" : "Nenhuma apresentação"}
                                            className="p-1 rounded-2xl border-2 dark:border-white"
                                        >
                                            <Image
                                                src={presentation}
                                                alt="Apresentações"
                                                width={20}
                                                height={20}
                                                className="dark:brightness-0 dark:invert"
                                            />
                                        </IconButton>
                                    )}

                                    {normalizedApresentacaoUrls.length > 1 && showApresentacaoMenu && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border rounded shadow-lg z-40">
                                            <div className="p-2">
                                                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">
                                                    Apresentações
                                                </p>
                                                <ul className="max-h-48 overflow-auto space-y-1">
                                                    {normalizedApresentacaoUrls.map((url, idx) => {
                                                        const filename = url
                                                            ? new URL(url).pathname.split("/").pop() ||
                                                              `arquivo-${idx + 1}`
                                                            : `arquivo-${idx + 1}`;
                                                        return (
                                                            <li
                                                                key={idx}
                                                                className="flex items-center justify-between px-1 py-1"
                                                            >
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-blue-600 hover:underline truncate max-w-[70%]"
                                                                    title={url}
                                                                >
                                                                    {filename}
                                                                </a>
                                                                <a
                                                                    href={url}
                                                                    download
                                                                    title={`Baixar ${filename}`}
                                                                    className="text-sm text-gray-600 border rounded-full p-1 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 ml-2 cursor-pointer"
                                                                >
                                                                    Baixar
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300 dark:border-gray-700 my-4" />
                <div className="flex flex-row gap-3">
                    {projectData.ods?.map(odsNum => (
                        <Image
                            key={odsNum + 1}
                            src={`/ods/ods${odsNum + 1}.png`}
                            alt={`ODS ${odsNum + 1}`}
                            width={48}
                            height={48}
                            className="size-20"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <div className="flex items-center gap-2">
                            <p className="text-gray-500 dark:text-gray-400">valor captado</p>
                            {adm && !isEditingValorAprovado && (
                                <button
                                    className="ml-2 text-gray-500 hover:text-blue-fcsn"
                                    onClick={() => {
                                        setEditValorAprovado(projectData.valorAprovado);
                                        setIsEditingValorAprovado(true);
                                    }}
                                    title="Editar valor aprovado"
                                >
                                    <FaPencilAlt />
                                </button>
                            )}
                            {adm && isEditingValorAprovado && (
                                <>
                                    <input
                                        type="number"
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off ml-2"
                                        value={editValorAprovado ?? ""}
                                        onChange={e => setEditValorAprovado(Number(e.target.value))}
                                    />
                                    <div className="flex flex-col gap-2 m-1">
                                        <button
                                            className="ml-2 bg-blue-fcsn text-white text-sm px-2 py-1 rounded"
                                            onClick={handleSaveValorAprovado}
                                            title="Salvar"
                                        >
                                            Salvar
                                        </button>
                                        <button
                                            className="ml-2 bg-gray-300 text-black text-sm px-2 py-1 rounded"
                                            onClick={() => setIsEditingValorAprovado(false)}
                                            title="Cancelar"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {projectData.valorAprovado?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }) ?? "N/A"}
                        </p>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">valor apto para captar</p>
                            <p className="text-2xl font-medium text-gray-800 dark:text-white-off">
                                {projectData.valorApto?.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }) ?? "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">período de captação</p>
                            <p className="text-xl font-semibold text-gray-800 dark:text-white-off">
                                {formatFirebaseDate(projectData.dataInicial)} -{" "}
                                {formatFirebaseDate(projectData.dataFinal)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1 self-center bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <p className="text-gray-700 dark:text-gray-300">
                            Breve descrição: {projectData.descricao ?? "N/A"}
                        </p>
                        {adm && (
                            <p className="font-semibold text-gray-800 dark:text-white-off">
                                Indicado por: {projectData.indicacao ?? "N/A"}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-1 flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">LOCAIS DE ATUAÇÃO</h3>
                        <p className="text-gray-700 font-medium dark:text-gray-300">
                            {projectData.municipios?.join(", ")}
                        </p>
                        <p className="text-gray-700 dark:text-gray-400 mt-2">
                            Especificações do território de atuação:{" "}
                            {projectData.especificacoes ?? projectData.especificacoesTerritorio ?? "N/A"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-5">
                            <div className="flex-1 flex flex-col gap-1 items-end bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {projectData.beneficiariosDiretos ?? 0}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">beneficiários diretos</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1 items-end bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {projectData.beneficiariosIndiretos ?? 0}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">beneficiários indiretos</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 items-end font-medium text-xl bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                            <span className="text-gray-800 dark:text-white-off">Período de execução</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatFirebaseDate(projectData.dataInicial)} -{" "}
                                {formatFirebaseDate(projectData.dataFinal)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">CONTRAPARTIDAS</h3>
                        <p className="text-gray-700 dark:text-gray-300">{projectData.contrapartidasProjeto ?? "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            PONTOS POSITIVOS <Image src={positivo} alt="" className="size-6" />
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">{projectData.pontosPositivos ?? "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            CONTRAPARTIDAS EXECUTADAS
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {projectData.contrapartidasExecutadas ?? "N/A"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            PONTOS NEGATIVOS <Image src={negativo} alt="" className="size-6" />
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">{projectData.pontosNegativos ?? "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-3 bg-yellow-50 dark:bg-yellow-900/50 dark:border dark:border-yellow-700 p-5 rounded-2xl h-full">
                        <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-yellow-200">
                            PONTOS DE ATENÇÃO <Image src={atencao} alt="" className="size-6" />
                        </h3>
                        <p className="text-gray-700 dark:text-yellow-100">{projectData.pontosAtencao ?? "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
                        <div className="flex flex-row justify-between">
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">DIVERSIDADE</h3>
                            <div className="flex flex-col items-end">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    PROJETO{" "}
                                    <span className="font-bold">{projectData.diversidade ? "ADOTA" : "NÃO ADOTA"}</span>
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">POLÍTICAS DE DIVERSIDADE</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-1">
                            <div className="w-1/3 border-2 border-[var(--cultura)] rounded-2xl p-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">ETNIA</h4>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">branca</p>
                                    <p className="font-bold">{projectData.qtdBrancas ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">amarela</p>
                                    <p className="font-bold">{projectData.qtdAmarelas ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">indígena</p>
                                    <p className="font-bold">{projectData.qtdIndigenas ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">parda</p>
                                    <p className="font-bold">{projectData.qtdPardas ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">preta</p>
                                    <p className="font-bold">{projectData.qtdPretas ?? 0}</p>
                                </div>
                            </div>
                            <div className="w-1/3 border-2 border-[var(--cultura)] rounded-2xl p-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">GÊNERO</h4>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">mulher cis</p>
                                    <p className="font-bold">{projectData.qtdMulherCis ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">mulher trans</p>
                                    <p className="font-bold">{projectData.qtdMulherTrans ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">homem cis</p>
                                    <p className="font-bold">{projectData.qtdHomemCis ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">homem trans</p>
                                    <p className="font-bold">{projectData.qtdHomemTrans ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p className="text-sm">não-binário</p>
                                    <p className="font-bold">{projectData.qtdNaoBinarios ?? 0}</p>
                                </div>
                            </div>
                            <div className="w-1/3 h-3/4 border-2 border-[var(--cultura)] rounded-2xl p-2 self-end">
                                <h4 className="font-bold"></h4>
                                <div className="flex flex-row justify-between mt-14 text-gray-700 dark:text-gray-300">
                                    <p>PCD&#39;s</p>
                                    <p className="font-bold">{projectData.qtdPCD ?? 0}</p>
                                </div>
                                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300">
                                    <p>LGBT+</p>
                                    <p className="font-bold">{projectData.qtdLGBT ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">RELATO DE BENEFICIÁRIO</h3>
                        <p className="text-gray-700 dark:text-gray-300">{projectData.relato ?? "N/A"}</p>
                    </div>
                </div>

                <hr className="border-gray-300 dark:border-gray-700 my-4" />
                <div className="flex justify-center relative">
                    {(() => {
                        // Build a normalized list of carousel image URLs using the same read-time normalizer
                        const normalizedCarouselUrls = (projectData.imagensCarrossel ?? [])
                            .map(u => normalizeReadUrl(u) as string)
                            .filter(Boolean);

                        if (normalizedCarouselUrls.length === 0) {
                            return (
                                <div className="w-full flex justify-center">
                                    <p className="flex justify-center w-full">Nenhuma imagem disponível.</p>
                                </div>
                            );
                        }

                        return (
                            <Carousel opts={{ align: "start", loop: true }} className="w-full">
                                <CarouselContent>
                                    {normalizedCarouselUrls.map((url, index) => (
                                        <CarouselItem key={index} className="basis-1/3">
                                            <div className="flex justify-center">
                                                <Image
                                                    src={url}
                                                    alt={`Imagem do projeto ${index + 1}`}
                                                    width={800}
                                                    height={450}
                                                    className="rounded-lg object-cover"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-5 bg-transparent cursor-pointer text-black dark:text-white" />
                                <CarouselNext className="absolute right-5 bg-transparent cursor-pointer text-black dark:text-white" />
                            </Carousel>
                        );
                    })()}
                </div>

                <hr className="border-gray-300 dark:border-gray-700 my-4" />

                <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl text-gray-800 dark:text-white-off">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">SOBRE A INSTITUIÇÃO</h3>
                    <p>
                        <span className="font-bold">CNPJ:</span> {projectData.cnpj ?? "N/A"}
                    </p>
                    <p>
                        <span className="font-bold">Representante legal:</span> {projectData.representante ?? "N/A"}
                    </p>
                    <p>
                        <span className="font-bold">Contato:</span> {projectData.telefone ?? "N/A"} |{" "}
                        {projectData.emailResponsavel ?? "N/A"}
                    </p>
                    <p>
                        <span className="font-bold">Endereço:</span>{" "}
                        {`${projectData.endereco ?? ""}, ${projectData.numeroEndereco ?? ""} - ${projectData.cidade ?? ""}, ${projectData.estado ?? ""}`}
                    </p>
                    {/* Dados bancários + Edit (repete para o bloco de instituição) */}
                    <div className="flex items-center gap-2">
                        <p>
                            <span className="font-bold">Dados bancários:</span>{" "}
                            {`${projectData.banco ?? ""}, Agência ${projectData.agencia ?? ""}, CC ${projectData.conta ?? ""}`}
                        </p>
                        {adm && !isEditingDadosBancarios && (
                            <button
                                className="ml-2 text-gray-500 hover:text-blue-fcsn"
                                onClick={() => {
                                    setEditBanco(projectData.banco ?? "");
                                    setEditAgencia(projectData.agencia ?? "");
                                    setEditConta(projectData.conta ?? "");
                                    setIsEditingDadosBancarios(true);
                                }}
                                title="Editar dados bancários"
                            >
                                <FaPencilAlt />
                            </button>
                        )}
                    </div>
                    {adm && isEditingDadosBancarios && (
                        <div className="flex flex-col gap-2 mt-2">
                            <input
                                type="text"
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off"
                                placeholder="Banco"
                                value={editBanco}
                                onChange={e => setEditBanco(e.target.value)}
                            />
                            <input
                                type="text"
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off"
                                placeholder="Agência"
                                value={editAgencia}
                                onChange={e => setEditAgencia(e.target.value)}
                            />
                            <input
                                type="text"
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white-off"
                                placeholder="Conta"
                                value={editConta}
                                onChange={e => setEditConta(e.target.value)}
                            />
                            <div className="flex gap-2 p-1">
                                <button
                                    className="bg-blue-fcsn text-white px-2 py-1 rounded"
                                    onClick={handleSaveDadosBancarios}
                                    title="Salvar"
                                >
                                    Salvar
                                </button>
                                <button
                                    className="bg-gray-300 text-black px-2 py-1 rounded"
                                    onClick={() => setIsEditingDadosBancarios(false)}
                                    title="Cancelar"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                    <p>
                        <span className="font-bold">Observações:</span> {projectData.observacoes ?? "N/A"}
                    </p>
                </div>
                <hr className="border-gray-300 dark:border-gray-700 my-4" />
                {adm && (
                    <>
                        <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                ANOTAÇÕES DO ADMINISTRADOR
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                                {projectData.anotacoes && Object.keys(projectData.anotacoes).length > 0 ? (
                                    Object.keys(projectData.anotacoes)
                                        .sort((a, b) => Number(b) - Number(a))
                                        .map(key => (
                                            <li key={key} className="text-gray-700 dark:text-gray-300">
                                                {projectData.anotacoes?.[key]}
                                            </li>
                                        ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                        Nenhuma anotação adicionada ainda.
                                    </p>
                                )}
                            </ul>
                            <textarea
                                className="w-full bg-white dark:bg-gray-800 mt-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white-off dark:placeholder-gray-400"
                                rows={3}
                                placeholder="Adicionar novas anotações..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                            <div className="flex justify-center mt-2">
                                <button
                                    onClick={handleAddNote}
                                    className="bg-[var(--cultura)] text-white px-10 py-2 rounded-md hover:bg-pink-fcsn transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </>
                )}
                <>
                    {adm && (
                        <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl sm:w-0.6">
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                AÇÕES DO ADMINISTRADOR
                            </h3>
                            <div className="flex flex-row mt-4 gap-4 flex-wrap">
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    EXCLUIR PROJETO
                                </button>
                                <button
                                    onClick={() => setShowDocumentModal(true)}
                                    className="bg-blue-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-fcsn3 transition-colors"
                                >
                                    ADICIONAR DOCUMENTOS
                                </button>
                                <button
                                    onClick={() => setShowDownloadingModal(true)}
                                    className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-pink-light2 transition-colors"
                                >
                                    VISUALIZAR DOCUMENTOS
                                </button>
                            </div>
                            <div className="flex justify-center mt-2"></div>
                        </div>
                    )}
                </>

                <>
                    {proponente && (
                        <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl sm:w-0.6">
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                AÇÕES DO PROPONENTE
                            </h3>
                            <div className="flex flex-row mt-4 gap-4 flex-wrap">
                                <button
                                    onClick={() => setShowDocumentModal(true)}
                                    className="bg-blue-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-fcsn3 transition-colors"
                                >
                                    ADICIONAR RECIBOS
                                </button>
                                <button
                                    onClick={() => setShowDownloadingModal(true)}
                                    className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-pink-light2 transition-colors"
                                >
                                    VISUALIZAR RECIBOS
                                </button>
                            </div>
                            <div className="flex justify-center mt-2"></div>
                        </div>
                    )}
                </>

                {/* NEW SUBMISSION NAVIGATION */}
                <div className="flex justify-center items-center mt-6 text-gray-800 dark:text-gray-300">
                    <button
                        onClick={handlePreviousSubmission}
                        disabled={currentSubmissionIndex === allSubmissions.length - 1}
                        className="disabled:opacity-50"
                    >
                        <FaArrowLeft size={24} />
                    </button>
                    <div className="mx-4 text-center">
                        <p>
                            Última submissão:{" "}
                            <span className="font-bold">
                                {formatFirebaseDate(projectData.dataResposta ?? projectData.dataPreenchido)}
                            </span>
                        </p>
                        <p>
                            submissão:{" "}
                            <span className="font-bold">
                                {allSubmissions.length - currentSubmissionIndex}/{allSubmissions.length}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={handleNextSubmission}
                        disabled={currentSubmissionIndex === 0}
                        className="disabled:opacity-50"
                    >
                        <FaArrowRight size={24} />
                    </button>
                </div>
            </div>
            <Toaster position="top-right" richColors />
            <Footer />
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg text-center mx-4">
                        <h2 className="text-xl font-bold text-black mb-4">Confirmar Exclusão</h2>
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir este projeto? Esta ação é irreversível e removerá todos os
                            dados das coleções.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para upload de documentos */}
            {showDocumentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg text-center mx-4 w-full max-w-md">
                        {adm ? (
                            <>
                                <h2 className="text-xl font-bold text-black mb-4">Adicionar Documentos</h2>
                                <p className="text-gray-700 mb-4">
                                    Selecione os arquivos para anexar ao campo &quot;documentos&quot; deste projeto.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-black mb-4">Adicionar Recibos</h2>
                                <p className="text-gray-700 mb-4">
                                    Selecione os arquivos para anexar ao campo &quot;recibos&quot; deste projeto.
                                </p>
                            </>
                        )}

                        <input
                            type="file"
                            multiple
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={e => setDocumentFiles(Array.from(e.target.files ?? []))}
                            className="dark:text-black mb-4 file:underline file:text-blue-600 file:cursor-pointer file:font-medium file:hover:text-blue-800"
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDocumentModal(false)}
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                                disabled={isUploadingDocuments}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={adm ? handleUploadDocuments : handleUploadReceipts}
                                className="bg-blue-fcsn text-white px-4 py-2 rounded-md hover:bg-blue-fcsn3"
                                disabled={isUploadingDocuments}
                            >
                                {isUploadingDocuments ? "Enviando..." : "Enviar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para baixar arquivos*/}
            {showDownloadingModal &&
                (adm ? (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg text-center  mx-4 w-4xl h-3/4">
                            <h2 className="text-xl font-bold text-black mb-4">BAIXAR DOCUMENTOS</h2>

                            <div className="flex flex-col gap-6 pt-6">
                                <div className="p-4 border rounded-md overflow-y-auto">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <FaFolderOpen size={20} color="rgb(255, 200, 0)" />
                                        <h2 className="font-bold mb-2 text-black"> {displayPath}</h2>
                                    </div>

                      {currentPath !== `forms-cadastro/${formCadastroId}/` && (
                        <button
                          onClick={handleGoBack}
                          className="mb-4 px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-300"
                        >
                          Voltar
                        </button>
                      )}

                                    <div className="space-y-4">
                                        {/* Subpastas */}
                                        {folders.map(sub => (
                                            <div key={sub.fullPath} className="flex items-center justify-between">
                                                <div className="flex flex-row items-center gap-2">
                                                    <FaFolderOpen size={20} color="rgb(255, 200, 0)" />
                                                    <span className="text-black">{sub.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenFolder(sub)}
                                                    className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                                                >
                                                    Abrir
                                                </button>
                                            </div>
                                        ))}

                                        {/* Arquivos */}
                                        {files.map(file => (
                                            <div key={file.fullPath} className="flex items-center justify-between">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <FaRegFileLines size={20} color="#b37b97" />
                                                    <span className="text-black">{file.name}</span>
                                                </div>{" "}
                                                <button
                                                    onClick={() => handleDownload(file.fullPath, file.name)}
                                                    className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                                                >
                                                    Baixar
                                                </button>
                                            </div>
                                        ))}

                                        {folders.length === 0 && files.length === 0 && (
                                            <p className="text-gray-600 py-4">Nenhum arquivo ou pasta aqui.</p>
                                        )}
                                    </div>
                                </div>
                                {/* Botão cancelar */}
                                <div>
                                    <button
                                        onClick={() => setShowDownloadingModal(false)}
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 mt-4"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg text-center mx-4 w-4xl h-3/4">
                            <h2 className="text-xl font-bold text-black mb-4">BAIXAR RECIBOS</h2>

                            <div className="flex flex-col gap-6 pt-6">
                                <div className="p-4 border rounded-md">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <FaFolderOpen size={20} color="rgb(255, 200, 0)" />
                                        <h2 className="font-bold mb-2 text-black"> {displayPath}</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Subpastas */}
                                        {folders.map(sub => (
                                            <div key={sub.fullPath} className="flex items-center justify-between">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <FaFolderOpen size={20} color="rgb(255, 200, 0)" />
                                                    <span className="text-black">{sub.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenFolder(sub)}
                                                    className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                                                >
                                                    Abrir
                                                </button>
                                            </div>
                                        ))}

                                        {/* Arquivos */}
                                        {files.map(file => (
                                            <div key={file.fullPath} className="flex items-center justify-between">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <FaRegFileLines size={20} color="#b37b97" />
                                                    <span className="text-black">{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(file.fullPath, file.name)}
                                                    className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                                                >
                                                    Baixar
                                                </button>
                                            </div>
                                        ))}

                                        {folders.length === 0 && files.length === 0 && (
                                            <p className="text-gray-600 py-4">Nenhum arquivo ou pasta aqui.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => setShowDownloadingModal(false)}
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 mt-4"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
        </main>
    );
}
