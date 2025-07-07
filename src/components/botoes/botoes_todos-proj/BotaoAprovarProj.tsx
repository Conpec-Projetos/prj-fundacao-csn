"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";

type BotaoAprovarProjProps = {
  projectId: string;
  projectName: string;
  onApprovalSuccess: (projectId: string) => void;
};

// --- COMPONENTE DE MODAL DE CONFIRMAÇÃO (Adicionado aqui para simplicidade) ---
const ConfirmationModal = ({ message, onConfirm, onCancel, isUpdating }: { message: string, onConfirm: () => void, onCancel: () => void, isUpdating: boolean }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
      <p className="text-black mb-4">{message}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isUpdating}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isUpdating ? 'Confirmando...' : 'Confirmar Definitivamente'}
        </button>
      </div>
    </div>
  </div>
);


export default function BotaoAprovarProj({ projectId, projectName, onApprovalSuccess }: BotaoAprovarProjProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  const [valor, setValor] = useState("");
  const [empresa, setEmpresa] = useState("");
  
  // --- Estados para o Modal e URL do Documento ---
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isFetchingDoc, setIsFetchingDoc] = useState(false);


  // --- Efeito para buscar a URL do documento quando o dropdown abre ---
  useEffect(() => {
    if (isOpen && !documentUrl && projectName) {
      const fetchDocumentUrl = async () => {
        setIsFetchingDoc(true);
        try {
          const q = query(collection(db, "projetos"), where("nome", "==", projectName));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const projectData = querySnapshot.docs[0].data();
            // **IMPORTANTE**: Assumindo que o campo se chama 'documentoComplianceURL'
            // Se o nome for outro, altere aqui.
            if (projectData.documentoComplianceURL) {
              setDocumentUrl(projectData.documentoComplianceURL);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar URL do documento:", error);
        } finally {
          setIsFetchingDoc(false);
        }
      };
      fetchDocumentUrl();
    }
  }, [isOpen, projectName, documentUrl]);

  useEffect(() => {
    if (!isOpen) return;
    function handleCliqueFora(event: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleCliqueFora);
    return () => {
      document.removeEventListener('mousedown', handleCliqueFora);
    };
  }, [isOpen]);

  // Função que abre o modal de confirmação
  const handleInitialSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  // Função final que executa a aprovação
  async function executeApproval() {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const q = query(collection(db, "projetos"), where("nome", "==", projectName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) throw new Error(`Nenhum registro de compliance encontrado para o projeto "${projectName}".`);
      if (querySnapshot.size > 1) throw new Error(`Múltiplos registros de compliance encontrados para "${projectName}".`);

      const projectToUpdateDoc = querySnapshot.docs[0];
      await updateDoc(projectToUpdateDoc.ref, {
        compliance: true,
        valorAportado: valor,
        empresaVinculada: empresa,
      });

      setIsOpen(false);
      setShowConfirmation(false);
      onApprovalSuccess(projectId);

    } catch (error) {
      console.error("Erro ao aprovar o projeto:", error);
      alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(true)}
        className="border-2 border-amber-400 bg-white text-black rounded-2xl px-4 py-2 w-50 h-10"
      >
        Aprovar Compliance
      </button>

      {isOpen && (
        <div ref={caixaRef} className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10">
          <form onSubmit={handleInitialSubmit}>
            {/* --- Seção de Download do Documento --- */}
            <div className="mb-4">
              <label className="text-black block mb-1 font-semibold">Documento de Compliance:</label>
              {isFetchingDoc ? (
                <p className="text-gray-500">Buscando documento...</p>
              ) : documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-blue-fcsn text-white w-full block text-center py-2 rounded hover:bg-blue-800"
                >
                  Baixar Documento
                </a>
              ) : (
                <p className="text-red-500">Nenhum documento encontrado.</p>
              )}
            </div>
            
            <div className="mb-3">
              <label className="text-black block mb-1">Valor aportado:</label>
              <input type="text" value={valor} onChange={(e) => setValor(e.target.value)} className="border-gray-400 w-full p-2 border rounded" required />
            </div>
            <div className="mb-3">
              <label className="text-black block mb-1">Empresa vinculada:</label>
              <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="border-gray-400 w-full p-2 border rounded" required />
            </div>
            <button type="submit" className="bg-pink-fcsn text-white px-4 py-2 rounded w-full">
              Confirmar Aprovação
            </button>
          </form>
        </div>
      )}

      {/* --- Renderização do Modal de Dupla Validação --- */}
      {showConfirmation && (
        <ConfirmationModal
          message={`Tem certeza que deseja aprovar o projeto "${projectName}"?`}
          onConfirm={executeApproval}
          onCancel={() => setShowConfirmation(false)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}