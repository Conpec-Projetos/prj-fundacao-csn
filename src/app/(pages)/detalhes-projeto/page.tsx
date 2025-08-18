"use client";

import Footer from "@/components/footer/footer";
import { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "sonner";
import link from "src/assets/Link-svg.svg";
import presentation from "src/assets/Presentation-svg.svg";
import positivo from "src/assets/positivo-svg.svg";
import negativo from "src/assets/negativo-svg.svg";
import atencao from "src/assets/atencao-svg.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaPencilAlt } from "react-icons/fa";
import { writeBatch, arrayUnion } from "firebase/firestore";
import { doc, getDoc, query, collection, where, getDocs, DocumentSnapshot, Timestamp, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { useTheme } from "@/context/themeContext";
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase-config";

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
  etnia?: { branca: number, amarela: number, indigena: number, parda: number, preta: number };
  genero?: { mulherCis: number, mulherTrans: number, homemCis: number, homemTrans: number, naoBinario: number };
  outros?: { pcd: number, lgbt: number };
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

const formatFirebaseDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  if (typeof dateValue.toDate === 'function') return dateValue.toDate().toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  try {
    return new Date(dateValue).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    return 'Data inválida';
  }
};

const formatExternalUrl = (url: string | undefined | null): string | undefined => {
  if (!url) {
    return undefined; // Retorna undefined para que o href seja omitido
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // A URL já está no formato correto
  }
  // Adiciona https:// se estiver faltando
  return `https://${url}`;
};

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const identifier = params.identifier as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionCount, setSubmissionCount] = useState({ current: 0, total: 0 });
  const { darkMode } = useTheme();
  const [adm, setAdm] = useState<boolean | null>(null); // Inicia como nulo para sabermos que ainda está carregando
  const [formCadastroId, setFormCadastroId] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isEditingResponsavel, setIsEditingResponsavel] = useState(false);
  const [editResponsavel, setEditResponsavel] = useState<string>("");
  const [isEditingValorAprovado, setIsEditingValorAprovado] = useState(false);
  const [editValorAprovado, setEditValorAprovado] = useState<number | undefined>(undefined);
  const [isEditingDadosBancarios, setIsEditingDadosBancarios] = useState(false);
  const [editBanco, setEditBanco] = useState<string>("");
  const [editAgencia, setEditAgencia] = useState<string>("");
  const [editConta, setEditConta] = useState<string>("");

  // Pega o usuário logado e verifica se é admin
  useEffect(() => {
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/session', { method: 'GET' });
            if (!res.ok) {
                setAdm(false);
                return;
            }
            const data = await res.json();
            if (data.user?.userIntAdmin) { // Aqui verificamos se é ADM
                setAdm(true);
            } else {
                setAdm(false);
            }
        } catch (error) {
            console.error("Falha ao buscar sessão do usuário:", error);
            setAdm(false);
        }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!identifier) return;

    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        // Try to get project from "projetos"
        const projectDocRef = doc(db, "projetos", identifier);
        const projectDocSnap = await getDoc(projectDocRef);

        let projectCoreData: Partial<ProjectData> = {};
        let formData: Partial<ProjectData> = {};
        let latestAcompanhamentoData: Partial<ProjectData> = {};
        let numAcompanhamentos = 0;

        if (projectDocSnap.exists()) {
          projectCoreData = projectDocSnap.data();
          const projectName = projectCoreData.nome;
          if (projectName) {
            const q = query(collection(db, "forms-cadastro"), where("nomeProjeto", "==", projectName));
            const formQuerySnap = await getDocs(q);
            if (!formQuerySnap.empty) {
              formData = formQuerySnap.docs[0].data();
              setFormCadastroId(formQuerySnap.docs[0].id);
            }
          }
        } else {
          // Try to find in "forms-cadastro" by identifier as document id
          const formDocRef = doc(db, "forms-cadastro", identifier);
          const formDocSnap = await getDoc(formDocRef);
          if (formDocSnap.exists()) {
            formData = formDocSnap.data();
            setFormCadastroId(formDocSnap.id);
          } else {
            // Try to find by nomeProjeto
            const decodedIdentifier = decodeURIComponent(identifier.replace(/\+/g, ' '));
            const q = query(collection(db, "forms-cadastro"), where("nomeProjeto", "==", decodedIdentifier));
            const formQuerySnap = await getDocs(q);
            if (!formQuerySnap.empty) {
              formData = formQuerySnap.docs[0].data();
              setFormCadastroId(formQuerySnap.docs[0].id);
            }
          }
        }

        // Always try to get acompanhamentos by identifier (projetoID)
        const acompanhamentoQuery = query(
          collection(db, "forms-acompanhamento"),
          where("projetoID", "==", identifier),
          orderBy("dataResposta", "desc")
        );
        const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
        numAcompanhamentos = acompanhamentoSnapshot.size;
        if (!acompanhamentoSnapshot.empty) {
          latestAcompanhamentoData = acompanhamentoSnapshot.docs[0].data();
        }

        const combinedData: ProjectData = {
          ...formData,
          ...projectCoreData,
          ...latestAcompanhamentoData
        };

        combinedData.etnia = {
          branca: combinedData.qtdBrancas ?? 0,
          amarela: combinedData.qtdAmarelas ?? 0,
          indigena: combinedData.qtdIndigenas ?? 0,
          parda: combinedData.qtdPardas ?? 0,
          preta: combinedData.qtdPretas ?? 0,
        };
        combinedData.genero = {
          mulherCis: combinedData.qtdMulherCis ?? 0,
          mulherTrans: combinedData.qtdMulherTrans ?? 0,
          homemCis: combinedData.qtdHomemCis ?? 0,
          homemTrans: combinedData.qtdHomemTrans ?? 0,
          naoBinario: combinedData.qtdNaoBinarios ?? 0,
        };
        combinedData.outros = {
          pcd: combinedData.qtdPCD ?? 0,
          lgbt: combinedData.qtdLGBT ?? 0,
        };
        if (combinedData.fotos && typeof combinedData.fotos === 'object') {
          combinedData.imagensCarrossel = Object.values(combinedData.fotos);
        }
        
        setProjectData(combinedData);
        setSubmissionCount({ current: 1 + numAcompanhamentos, total: 1 + numAcompanhamentos });

      } catch (error) {
        console.error("Erro ao buscar dados do projeto:", error);
        setProjectData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [identifier]);

  const handleDeleteProject = async () => {
    // Use formCadastroId if available, otherwise identifier
    const formId = formCadastroId || identifier;
    const projetoId = identifier;

    if (!formId && !projetoId) {
      toast.error("IDs do projeto não encontrados. Não é possível excluir.");
      return;
    }

    toast.info("Excluindo projeto, por favor aguarde...");

    try {
      const batch = writeBatch(db);

      // Delete from "projetos" only if exists
      if (projetoId) {
        const projetoRef = doc(db, "projetos", projetoId);
        const projetoSnap = await getDoc(projetoRef);
        if (projetoSnap.exists()) {
          batch.delete(projetoRef);
        }
      }

      // Delete from "forms-cadastro" only if exists
      if (formId) {
        const formCadastroRef = doc(db, "forms-cadastro", formId);
        const formSnap = await getDoc(formCadastroRef);
        if (formSnap.exists()) {
          batch.delete(formCadastroRef);
        }
      }

      // Delete all "forms-acompanhamento" with projetoID
      const acompanhamentoQuery = query(collection(db, "forms-acompanhamento"), where("projetoID", "==", projetoId));
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
      [`anotacoes.${noteKey}`]: newNoteText
    };

    try {
      const projectDocRef = doc(db, "projetos", identifier);
      await updateDoc(projectDocRef, updatePayload);

      setProjectData(prevData => {
        if (!prevData) return null;
        const updatedAnotacoes = {
          ...(prevData.anotacoes || {}),
          [noteKey]: newNoteText
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
  const handleUploadDocuments = async () => {
    if (!formCadastroId || documentFiles.length === 0) {
      toast.error("Selecione ao menos um arquivo para enviar.");
      return;
    }
    setIsUploadingDocuments(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of documentFiles) {
        const storageRef = ref(storage, `forms-cadastro/${formCadastroId}/documentos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      // Adiciona os novos arquivos ao array existente usando arrayUnion
      const formDocRef = doc(db, "forms-cadastro", formCadastroId);
      await updateDoc(formDocRef, {
        documentos: arrayUnion(...uploadedUrls),
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

  // Funções para salvar edição
  const handleSaveResponsavel = async () => {
    if (!formCadastroId) return;
    try {
      await updateDoc(doc(db, "forms-cadastro", formCadastroId), { responsavel: editResponsavel });
      setProjectData(prev => prev ? { ...prev, responsavel: editResponsavel } : prev);
      setIsEditingResponsavel(false);
      toast.success("Responsável atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar responsável.");
    }
  };

  const handleSaveValorAprovado = async () => {
    // Agora atualiza na coleção "projetos" e não mais em "forms-cadastro"
    if (!identifier) return;
    try {
      await updateDoc(doc(db, "projetos", identifier), { valorAprovado: editValorAprovado });
      setProjectData(prev => prev ? { ...prev, valorAprovado: editValorAprovado } : prev);
      setIsEditingValorAprovado(false);
      toast.success("Valor aprovado atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar valor aprovado.");
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
      setProjectData(prev => prev ? { ...prev, banco: editBanco, agencia: editAgencia, conta: editConta } : prev);
      setIsEditingDadosBancarios(false);
      toast.success("Dados bancários atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar dados bancários.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-xl dark:bg-blue-fcsn dark:text-white-off">Carregando dados do projeto...</div>;
  }

  if (!projectData) {
    return <div className="flex justify-center items-center h-screen text-xl dark:bg-blue-fcsn dark:text-white-off">Projeto não encontrado.</div>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-blue-fcsn dark:text-white-off">
      <div className="w-full max-w-4xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start">
          <div className="space-y-2 flex-1">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">{projectData.nome ?? projectData.nomeProjeto ?? 'N/A'}</h1>
            <h2 className="text-2xl text-gray-700 font-medium dark:text-gray-300">{projectData.instituicao ?? 'N/A'}</h2>
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
                  <span>{projectData.responsavel ?? 'N/A'}</span>
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
            <p className="text-gray-600 dark:text-gray-400">
              Via {projectData.lei ?? 'N/A'}, projeto n. {projectData.numeroLei ?? 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Público beneficiado:{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">{projectData.publico?.join(', ') ?? 'N/A'}</span>
            </p>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-auto flex flex-col gap-3">
            <div className="flex flex-row gap-5 justify-end">
              <div className="bg-red-fcsn text-white text-sm w-28 text-center py-1 flex justify-center items-center rounded-2xl">{projectData.ambito ?? 'N/A'}</div>
              <div className="bg-blue-fcsn w-28 text-white text-sm flex justify-center items-center rounded-2xl dark:border-1 dark:border-white">{projectData.segmento ?? 'N/A'}</div>
            </div>
            <div className="flex flex-row justify-end gap-5">
              <div className="flex flex-row justify-end gap-5">
              {/* Botão WEBSITE */}
              <a 
                href={formatExternalUrl(projectData.website) || undefined} // Remove o href se a URL não existir
                target="_blank" 
                rel="noopener noreferrer" 
                className={`items-center text-sm w-28 flex justify-center rounded-2xl border-2 darK:border-white dark:text-white font-bold transition-opacity ${!projectData.website ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                WEBSITE
              </a>
              
              {/* Ícone de Link */}
              <a 
                href={formatExternalUrl(projectData.links) || undefined} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`p-1 rounded-2xl border-2 dark:border-white transition-opacity ${!projectData.website ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                <Image src={link} alt="Link" className="dark:brightness-0 dark:invert" />
              </a>
              
              {/* Ícone de Apresentação */}
              <a 
                href={projectData.apresentacao ?? projectData.apresentacao ?? undefined} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`p-1 rounded-2xl border-2 dark:border-white transition-opacity ${!(projectData.links || projectData.apresentacao) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                <Image src={presentation} alt="Apresentação" className="dark:brightness-0 dark:invert" />
              </a>
          </div>
          
            </div>
          </div>
          
        </div>
        <hr className="border-gray-300 dark:border-gray-700 my-4" />
        <div className="flex flex-row gap-3">
          {projectData.ods?.map(odsNum => (
            <img key={odsNum + 1} src={`/ods/ods${odsNum + 1}.png`} alt={`ODS ${odsNum + 1}`} className="size-20" />
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
              {projectData.valorAprovado?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'N/A'}
            </p>
            <div>
              <p className="text-gray-500 dark:text-gray-400">valor apto para captar</p>
              <p className="text-2xl font-medium text-gray-800 dark:text-white-off">{projectData.valorApto?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">período de captação</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white-off">
              {formatFirebaseDate(projectData.dataInicial)} - {formatFirebaseDate(projectData.dataFinal)}
              </p>
            </div>
          </div>

          <div className="space-y-1 self-center bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <p className="text-gray-700 dark:text-gray-300">Breve descrição: {projectData.descricao ?? 'N/A'}</p>
            {adm && (
              <p className="font-semibold text-gray-800 dark:text-white-off">Indicado por: {projectData.indicacao ?? 'N/A'}</p>
            )}
          </div>

          

          <div className="md:col-span-1 flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">LOCAIS DE ATUAÇÃO</h3>
            <p className="text-gray-700 font-medium dark:text-gray-300">{projectData.municipios?.join(', ')}</p>
            <p className="text-gray-700 dark:text-gray-400 mt-2">Especificações do território de atuação: {projectData.especificacoes ?? projectData.especificacoesTerritorio ?? 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-5">
              <div className="flex-1 flex flex-col gap-1 items-end bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{projectData.beneficiariosDiretos ?? 0}</span>
                <span className="text-gray-700 dark:text-gray-300">beneficiários diretos</span>
              </div>
              <div className="flex-1 flex flex-col gap-1 items-end bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{projectData.beneficiariosIndiretos ?? 0}</span>
                <span className="text-gray-700 dark:text-gray-300">beneficiários indiretos</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end font-medium text-xl bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
              <span className="text-gray-800 dark:text-white-off">Período de execução</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFirebaseDate(projectData.dataInicial)} - {formatFirebaseDate(projectData.dataFinal)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">CONTRAPARTIDAS</h3>
            <p className="text-gray-700 dark:text-gray-300">{projectData.contrapartidasProjeto ?? 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-white">PONTOS POSITIVOS <Image src={positivo} alt="" className="size-6" /></h3>
            <p className="text-gray-700 dark:text-gray-300">{projectData.pontosPositivos ?? 'N/A'}</p>
          </div>
          
          <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">CONTRAPARTIDAS EXECUTADAS</h3>
            <p className="text-gray-700 dark:text-gray-300">{projectData.contrapartidasExecutadas ?? 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-white">PONTOS NEGATIVOS <Image src={negativo} alt="" className="size-6" /></h3>
            <p className="text-gray-700 dark:text-gray-300">{projectData.pontosNegativos ?? 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-3 bg-yellow-50 dark:bg-yellow-900/50 dark:border dark:border-yellow-700 p-5 rounded-2xl h-full">
            <h3 className="flex flex-row justify-between text-xl font-bold mb-2 text-gray-900 dark:text-yellow-200">PONTOS DE ATENÇÃO <Image src={atencao} alt="" className="size-6" /></h3>
            <p className="text-gray-700 dark:text-yellow-100">{projectData.pontosAtencao ?? 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-3 bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl h-full">
            <div className="flex flex-row justify-between">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">DIVERSIDADE</h3>
              <div className="flex flex-col items-end">
                <p className="text-sm text-gray-800 dark:text-gray-200">PROJETO <span className="font-bold">{projectData.diversidade ? "ADOTA" : "NÃO ADOTA"}</span></p>
                <p className="text-sm text-gray-800 dark:text-gray-200">POLÍTICAS DE DIVERSIDADE</p>
              </div>
            </div>
            <div className="flex flex-row gap-1">
              <div className="w-1/3 border-2 border-[var(--cultura)] rounded-2xl p-2">
                <h4 className="font-bold text-gray-900 dark:text-white">ETNIA</h4>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">branca</p><p className="font-bold">{projectData.etnia?.branca ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">amarela</p><p className="font-bold">{projectData.etnia?.amarela ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">indígena</p><p className="font-bold">{projectData.etnia?.indigena ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">parda</p><p className="font-bold">{projectData.etnia?.parda ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">preta</p><p className="font-bold">{projectData.etnia?.preta ?? 0}</p></div>
              </div>
              <div className="w-1/3 border-2 border-[var(--cultura)] rounded-2xl p-2">
                <h4 className="font-bold text-gray-900 dark:text-white">GÊNERO</h4>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">mulher cis</p><p className="font-bold">{projectData.genero?.mulherCis ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">mulher trans</p><p className="font-bold">{projectData.genero?.mulherTrans ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">homem cis</p><p className="font-bold">{projectData.genero?.homemCis ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">homem trans</p><p className="font-bold">{projectData.genero?.homemTrans ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">não-binário</p><p className="font-bold">{projectData.genero?.naoBinario ?? 0}</p></div>
              </div>
              <div className="w-1/3 h-3/4 border-2 border-[var(--cultura)] rounded-2xl p-2 self-end">
                <h4 className="font-bold"></h4>
                <div className="flex flex-row justify-between mt-14 text-gray-700 dark:text-gray-300"><p>PCD&#39;s</p><p className="font-bold">{projectData.outros?.pcd ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p>LGBT+</p><p className="font-bold">{projectData.outros?.lgbt ?? 0}</p></div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">RELATO DE BENEFICIÁRIO</h3>
            <p className="text-gray-700 dark:text-gray-300">{projectData.relato ?? 'N/A'}</p>
          </div>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 my-4" />
        <div className="flex justify-center relative">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {projectData.imagensCarrossel?.map((url, index) => (
                  <CarouselItem key={index} className="basis-1/3">
                    <div className="flex justify-center">
                      <img src={url} alt={`Imagem do projeto ${index + 1}`} className="rounded-lg"/>
                    </div>
                  </CarouselItem>
                )) ?? <CarouselItem><p className="flex justify-center w-full">Nenhuma imagem disponível.</p></CarouselItem>}
              </CarouselContent>
              <CarouselPrevious className="absolute left-5 bg-transparent cursor-pointer text-black dark:text-white" />
              <CarouselNext className="absolute right-5 bg-transparent cursor-pointer text-black dark:text-white" />
            </Carousel>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 my-4" />

        <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl text-gray-800 dark:text-white-off">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">SOBRE A INSTITUIÇÃO</h3>
          <p><span className="font-bold">CNPJ:</span> {projectData.cnpj ?? 'N/A'}</p>
          <p><span className="font-bold">Representante legal:</span> {projectData.representante ?? 'N/A'}</p>
          <p><span className="font-bold">Contato:</span> {projectData.telefone ?? 'N/A'} | {projectData.emailResponsavel ?? 'N/A'}</p>
          <p><span className="font-bold">Endereço:</span> {`${projectData.endereco ?? ''}, ${projectData.numeroEndereco ?? ''} - ${projectData.cidade ?? ''}, ${projectData.estado ?? ''}`}</p>
          {/* Dados bancários + Edit (repete para o bloco de instituição) */}
          <div className="flex items-center gap-2">
            <p><span className="font-bold">Dados bancários:</span> {`${projectData.banco ?? ''}, Agência ${projectData.agencia ?? ''}, CC ${projectData.conta ?? ''}`}</p>
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
          <p><span className="font-bold">Observações:</span> {projectData.observacoes ?? 'N/A'}</p>
        </div>
        <hr className="border-gray-300 dark:border-gray-700 my-4" />
        {adm && (
          <>
            <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">ANOTAÇÕES DO ADMINISTRADOR</h3>
              <ul className="list-disc pl-5 space-y-2">
                {projectData.anotacoes && Object.keys(projectData.anotacoes).length > 0 ? (
                  Object.keys(projectData.anotacoes).sort((a, b) => Number(b) - Number(a)).map(key => (
                    <li key={key} className="text-gray-700 dark:text-gray-300">
                      {projectData.anotacoes?.[key]}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma anotação adicionada ainda.</p>
                )}
              </ul>
              <textarea
                className="w-full bg-white dark:bg-gray-800 mt-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white-off dark:placeholder-gray-400"
                rows={3}
                placeholder="Adicionar novas anotações..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AÇÕES DO ADMINISTRADOR</h3>
              <div className="flex flex-row mt-4 gap-4">
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
              </div>
              <div className="flex justify-center mt-2">
              </div>
            </div>
              )}
          </>
                
        
        <div className="flex justify-center mt-6 text-gray-800 dark:text-gray-300">
          <div>
            <p>Última submissão: <span className="font-bold">{formatFirebaseDate(projectData.dataResposta ?? projectData.dataPreenchido)}</span></p>
            <p className="text-center">submissão: <span className="font-bold">{submissionCount.current}/{submissionCount.total}</span></p>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors/>
      <Footer />
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg text-center mx-4">
              <h2 className="text-xl font-bold text-black mb-4">Confirmar Exclusão</h2>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir este projeto? Esta ação é irreversível e removerá todos os dados das coleções.
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
              <h2 className="text-xl font-bold text-black mb-4">Adicionar Documentos</h2>
              <p className="text-gray-700 mb-4">
                Selecione os arquivos para anexar ao campo "documentos" deste projeto.
              </p>
              <input
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png"
                onChange={e => setDocumentFiles(Array.from(e.target.files ?? []))}
                className="mb-4"
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
                  onClick={handleUploadDocuments}
                  className="bg-blue-fcsn text-white px-4 py-2 rounded-md hover:bg-blue-fcsn3"
                  disabled={isUploadingDocuments}
                >
                  {isUploadingDocuments ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}