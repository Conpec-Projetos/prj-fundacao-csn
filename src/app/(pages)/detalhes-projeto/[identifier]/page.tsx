"use client";
import { upload as vercelUpload } from "@vercel/blob/client";
import Footer from "@/components/footer/footer";
import { useEffect, useState } from "react";
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
import { FaPencilAlt, FaArrowLeft, FaArrowRight, FaFileAlt, FaSpinner} from "react-icons/fa";
import { writeBatch, arrayUnion } from "firebase/firestore";
import { doc, getDoc, query, collection, where, getDocs, Timestamp, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import { saveAs } from "file-saver";
import { normalizeStoredUrl } from "@/lib/utils";
import { Arquivo } from "@/app/api/downloads/[identifier]/route";

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

const formatFirebaseDate = (dateValue: string | Timestamp | null | undefined): string => {
  if (!dateValue) return 'N/A';
  if (typeof (dateValue as Timestamp).toDate === 'function') 
    return (dateValue as Timestamp).toDate().toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  try { 
    return new Date(dateValue as string).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    console.log(e)
    return 'Data inválida';
  }
};

const formatExternalUrl = (url: string | undefined | null): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function ProjectDetailsPage() {
  const [ativo, setAtivo] = useState<boolean>(false);
  const [showActivationConfirm, setShowActivationConfirm] = useState<boolean>(false);
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


  useEffect(() => {
    async function fetchUser() {
        try {
            const res = await fetch('/api/auth/session', { method: 'GET' });
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
        
        const data = projetoSnap.data();
        setAtivo(data.ativo === true); // define se está ativo
          

        const projetoData = projetoSnap.data() as ProjectData;

        const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", identifier));
        const cadastroSnapshot = await getDocs(cadastroQuery);

        if (cadastroSnapshot.empty) {
            toast.error("Formulário de cadastro do projeto não encontrado.");
            setProjectData(null);
            setIsLoading(false);
            return;
        }
        
        const cadastroData = { id: cadastroSnapshot.docs[0].id, ...cadastroSnapshot.docs[0].data() as ProjectData };
        setFormCadastroId(cadastroSnapshot.docs[0].id);

        const acompanhamentoQuery = query(
          collection(db, "forms-acompanhamento"),
          where("projetoID", "==", identifier),
          orderBy("dataResposta", "desc")
        );
        const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
        const acompanhamentoDocs = acompanhamentoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as ProjectData }));

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
  // Pri: No storage esta: forms-cadastro/id/documentos
  // const handleUploadDocuments = async () => {
  //   if (!formCadastroId || documentFiles.length === 0) {
  //     toast.error("Selecione ao menos um arquivo para enviar.");
  //     return;
  //   }
  //   setIsUploadingDocuments(true);
  //   try {
  //     const uploadedUrls: string[] = [];
  //     for (const file of documentFiles) {
  //       const storageRef = ref(storage, `forms-cadastro/${formCadastroId}/documentos/${file.name}_${Date.now()}`);
  //       await uploadBytes(storageRef, file);
  //       const url = await getDownloadURL(storageRef);
  //       uploadedUrls.push(url);
  //     }

  //     // Adiciona os novos arquivos ao array existente usando arrayUnion
  //     const formDocRef = doc(db, "forms-cadastro", formCadastroId);
  //     await updateDoc(formDocRef, {
  //       documentos: arrayUnion(...uploadedUrls), // Para documentos temos o array documentos
  //     });

  //     toast.success("Documentos enviados com sucesso!");
  //     setShowDocumentModal(false);
  //     setDocumentFiles([]);
  //   } catch (error) {
  //     console.error("Erro ao enviar documentos:", error);
  //     toast.error("Falha ao enviar documentos.");
  //   } finally {
  //     setIsUploadingDocuments(false);
  //   }
  // };
    // helper: upload a single file via Vercel Blob client upload
  const uploadFileToVercel = async (fieldName: string) => {
  if (!formCadastroId || documentFiles.length === 0) {
    toast.error("Selecione ao menos um arquivo para enviar.");
    return;
  }

  setIsUploadingDocuments(true);

  try {
    const uploadedUrls: string[] = [];

    for (const file of documentFiles) {
      const clientPayload = JSON.stringify({
        size: file.size,
        type: file.type,
      });

      const pathname = `${fieldName}/${Date.now()}-${file.name}`;

      const result = await vercelUpload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload,
        multipart: true,
      });

      type VercelResult = {
        url?: string;
        downloadUrl?: string;
        pathname?: string;
        key?: string;
      };

      const vr = result as VercelResult;

      const publicUrl =
        vr.url ??
        vr.downloadUrl ??
        (() => {
          const pathnameFromResult = vr.pathname ?? vr.key ?? null;
          if (!pathnameFromResult) return null;
          const base =
            process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL ??
            window.location.origin;
          return `${base.replace(/\/$/, "")}/${String(
            pathnameFromResult
          ).replace(/^\//, "")}`;
        })();

      if (!publicUrl) {
        throw new Error(
          "Upload ok, mas nenhuma URL pública foi retornada"
        );
      }

      // ✅ agora sim salvamos
      uploadedUrls.push(publicUrl);
    }

    // ✅ atualiza o Firestore UMA vez
    const formDocRef = doc(db, "forms-cadastro", formCadastroId);
    await updateDoc(formDocRef, {
      [fieldName]: arrayUnion(...uploadedUrls), // recibosProponente ou docsAdmin (será array)
    });

    toast.success("Documentos enviados com sucesso!");
    setShowDocumentModal(false);
  } catch (err) {
    console.error("Upload failed", err);
    toast.error("Erro ao enviar documentos");
  } finally {
    setIsUploadingDocuments(false);
  }
};
  // Função para upload dos recibos pelo proponente
  // Pri: No storage esta: forms-cadastro/id/recibos
  // const handleUploadReceipts = async () => {
  //   if (!formCadastroId || documentFiles.length === 0) {
  //     toast.error("Selecione ao menos um arquivo para enviar.");
  //     return;
  //   }
  //   setIsUploadingDocuments(true);
  //   try {
  //     const uploadedUrls: string[] = [];
  //     for (const file of documentFiles) {
  //       const storageRef = ref(storage, `forms-cadastro/${formCadastroId}/recibos/${file.name}_${Date.now()}`);
  //       await uploadBytes(storageRef, file);
  //       const url = await getDownloadURL(storageRef);
  //       uploadedUrls.push(url);
  //     }

  //     // Adiciona os novos arquivos ao array recibos que será criado pela primeira vez aqui
  //     const formDocRef = doc(db, "forms-cadastro", formCadastroId);
  //     await updateDoc(formDocRef, {
  //       recibos: arrayUnion(...uploadedUrls),
  //     });

  //     toast.success("Recibos enviados com sucesso!");
  //     setShowDocumentModal(false);
  //     setDocumentFiles([]);
  //   } catch (error) {
  //     console.error("Erro ao enviar recibos:", error);
  //     toast.error("Falha ao enviar recibos.");
  //   } finally {
  //     setIsUploadingDocuments(false);
  //   }
  // };

// -------------------------------------------------------------------------//

const [arquivos, setArquivos] = useState<Arquivo[]>([]);
const [loading, setLoading] = useState<boolean>(false);

async function buscarArquivos() {
  if (!identifier) {
    console.log("ID ainda não carregou");
    return;
  }

  const res = await fetch(`/api/downloads/${identifier}`);
  const data = await res.json();

  const listaBase: Arquivo[] = adm
    ? data.arquivos
    : data.arquivos.filter((arq: Arquivo) => arq.campo === "recibosProponente");

  // ---- NORMALIZAÇÃO DOS CAMPOS REPETIDOS ----
  const contador: Record<string, number> = {};

  const listaNumerada = listaBase.map((arq) => {
    const base = arq.campo;

    // já apareceu antes?
    if (contador[base] == null) {
      contador[base] = 0; // primeira vez
    } else {
      contador[base] += 1; // incrementa
    }

    // se for o primeiro (0), usa o nome original sem número
    const novoNome = contador[base] === 0 ? base : `${base}${contador[base]}`;

    return {
      ...arq,
      campo: novoNome,
    };
  });
  setLoading(false)
  setArquivos(listaNumerada);
}

//   function extrairPastaDaUrl(url: string): string {
//   try {
//     const path = new URL(url).pathname; // "/diario/arquivo.pdf"
//     const parts = path.split("/").filter(Boolean); // ["diario", "arquivo.pdf"]
//     return parts[0] || ""; // "diario"
//   } catch {
//     return "";
//   }
// }


  const handleOpenFile = (arquivo: string) => {
    const url = normalizeStoredUrl(arquivo);
    if (!url) {
      console.error("URL inválida:", arquivo);
      return;
    }

    window.open(url, "_blank");
  };


const handleDownloadFile = async (arquivo: string) => {
  const url = normalizeStoredUrl(arquivo);

  if (!url) {
    console.error("URL inválida:", arquivo);
    return;
  }

  try {
    let response: Response | null = null;

    // tenta Vercel Blob
    response = await fetch(
      `/api/downloads/especifico?url=${encodeURIComponent(url)}`
    );

    // se falhar, tenta Firebase
    if (!response.ok) {

      response = await fetch(
        `/api/downloads/firebase?filePath=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        const message = await response.text();
        toast.error(message || "Erro ao buscar arquivo");
        return; // para tudo
      }
    }

    // só chega aqui se alguma das duas deu certo
    const blob = await response.blob();

    const fileName =
      url.split("/").pop()?.split("?")[0] || "arquivo";

    saveAs(blob, fileName);
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    toast.error("Erro inesperado ao baixar arquivo");
  }
};

//-------------------------------------------------------------------------//

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
      setProjectData(prev => prev ? { ...prev, valorAprovado: editValorAprovado } : prev);
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
      setProjectData(prev => prev ? { ...prev, banco: editBanco, agencia: editAgencia, conta: editConta } : prev);
      setIsEditingDadosBancarios(false);
      toast.success("Dados bancários atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar dados bancários.");
      console.log(error);
    }
  };

  const handleActive = async () => {
    if (!identifier) return;

    const novoValor = !ativo; // calcula o novo estado antes, pois o useSate é assincrono e nao muda imediatamente
    setAtivo(novoValor);

    try {
      await updateDoc(doc(db, "projetos", identifier), { ativo: novoValor });
      toast.success(
        novoValor ? "Projeto ativado com sucesso!" : "Projeto desativado com sucesso!"
      );
    } catch (error) {
      toast.error("Erro ao atualizar valor de 'ativo'.");
      console.log(error);
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
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">branca</p><p className="font-bold">{projectData.qtdBrancas ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">amarela</p><p className="font-bold">{projectData.qtdAmarelas ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">indígena</p><p className="font-bold">{projectData.qtdIndigenas ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">parda</p><p className="font-bold">{projectData.qtdPardas ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">preta</p><p className="font-bold">{projectData.qtdPretas ?? 0}</p></div>
              </div>
              <div className="w-1/3 border-2 border-[var(--cultura)] rounded-2xl p-2">
                <h4 className="font-bold text-gray-900 dark:text-white">GÊNERO</h4>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">mulher cis</p><p className="font-bold">{projectData.qtdMulherCis ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">mulher trans</p><p className="font-bold">{projectData.qtdMulherTrans ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">homem cis</p><p className="font-bold">{projectData.qtdHomemCis ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">homem trans</p><p className="font-bold">{projectData.qtdHomemTrans ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p className="text-sm">não-binário</p><p className="font-bold">{projectData.qtdNaoBinarios ?? 0}</p></div>
              </div>
              <div className="w-1/3 h-3/4 border-2 border-[var(--cultura)] rounded-2xl p-2 self-end">
                <h4 className="font-bold"></h4>
                <div className="flex flex-row justify-between mt-14 text-gray-700 dark:text-gray-300"><p>PCD&#39;s</p><p className="font-bold">{projectData.qtdPCD ?? 0}</p></div>
                <div className="flex flex-row justify-between text-gray-700 dark:text-gray-300"><p>LGBT+</p><p className="font-bold">{projectData.qtdLGBT ?? 0}</p></div>
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
          <p><span className="font-bold">Observações:</span> {projectData.observacoes == '' ? 'N/A': projectData.observacoes }</p>
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
              <div className="flex flex-row mt-4 gap-4 flex-wrap">
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                  EXCLUIR PROJETO
                </button>
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-fcsn3 transition-colors"
                >
                  ADICIONAR DOCUMENTOS
                </button>
                <button 
                  onClick={() =>
                    { 
                    setShowDownloadingModal(true)
                    setLoading(true)
                    buscarArquivos();
                  }
                  } 
                  className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-pink-light2 transition-colors"
                  >
                  VISUALIZAR DOCUMENTOS
                </button>
                <button 
                  onClick={() =>  setShowActivationConfirm(true)} 
                  className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-pink-light2 transition-colors"
                  >
                  ATIVAR/DESATIVAR
                </button>
              </div>
              <div className="flex justify-center mt-2">
              </div>
            </div>
          )}
          </>

          <>
          {proponente && (
            <div className="w-full bg-white-off dark:bg-blue-fcsn2 p-5 rounded-2xl sm:w-0.6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AÇÕES DO PROPONENTE</h3>
              <div className="flex flex-row mt-4 gap-4 flex-wrap">

                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="bg-blue-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-fcsn3 transition-colors"
                >
                  ADICIONAR RECIBOS
                </button>
                <button 
                 onClick={() => {
                  setShowDownloadingModal(true);
                  setLoading(true)
                  buscarArquivos();
                }} 
                  className="bg-pink-fcsn text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-pink-light2 transition-colors"
                  >
                  VISUALIZAR RECIBOS
                </button>
              </div>
              <div className="flex justify-center mt-2">
              </div>
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
                <p>Última submissão: <span className="font-bold">{formatFirebaseDate(projectData.dataResposta ?? projectData.dataPreenchido)}</span></p>
                <p>submissão: <span className="font-bold">{allSubmissions.length - currentSubmissionIndex}/{allSubmissions.length}</span></p>
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

        {showActivationConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg text-center mx-4">
              <h2 className="text-xl font-bold text-black mb-4">Confirmar Ativação</h2>
              <p className="text-gray-700 mb-6">
                Atualmente esse projeto está {ativo ? "ativo" : "inativo"}. Tem certeza que deseja {ativo ? "desativar" : "ativar"} este projeto? 
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowActivationConfirm(false)} 
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleActive} 
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Sim, {ativo ? "desativar" : "ativar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para upload de documentos */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg text-center mx-4 w-full max-w-md">
              {adm ? 
              (<>
              <h2 className="text-xl font-bold text-black mb-4">Adicionar Documentos</h2>
                <p className="text-gray-700 mb-4">
                  Selecione os arquivos para anexar ao campo &quot;documentos&quot; deste projeto.
                </p>
              </>
              ):
              (
              <>
              <h2 className="text-xl font-bold text-black mb-4">Adicionar Recibos</h2>
                <p className="text-gray-700 mb-4">
                  Selecione os arquivos para anexar ao campo &quot;recibos&quot; deste projeto.
                </p>
                </>
                )
              }

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
                  onClick={() => adm ? uploadFileToVercel("docsAdmin") : uploadFileToVercel("recibosProponente")}
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
        {showDownloadingModal && (
          
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg text-center  mx-4 w-4xl h-3/4">
              <h2 className="text-xl font-bold text-black mb-4">BAIXAR DOCUMENTOS</h2>
              
              <div className="flex flex-col gap-6 pt-6">

                 <div className="p-4 border rounded-md overflow-y-auto max-h-[50vh]">

                  {loading && (
                    <div className="flex justify-center items-center">
                      <FaSpinner className="animate-spin text-4xl text-blue-fcsn dark:text-blue-fcsn"  />
                    </div>
                  )}


              <div className="space-y-4">
                {/* Arquivos */}
                {arquivos.map((arq, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-row items-center gap-2">
                      <FaFileAlt size={20} color="rgb(156, 163, 175)" />
                      <span className="text-black">{arq.campo}</span>
                    </div>

                    <div className="flex flex-row space-x-2.5">
                    <button
                      onClick={() => handleOpenFile(arq.url)}
                      className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={() => handleDownloadFile(arq.url)}
                      className="px-3 py-1 bg-pink-fcsn text-white rounded-md hover:opacity-70"
                    >
                      Baixar
                    </button>
                    </div>
                  </div>
                ))}

                {(arquivos.length === 0 && !loading)&& (
                  <p className="text-gray-600 py-4">Nenhum arquivo aqui.</p>
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
      )}
    </main>
  );
}