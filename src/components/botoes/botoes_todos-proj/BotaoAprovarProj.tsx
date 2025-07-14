"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { collection, doc, getDocs, query, updateDoc, where, arrayUnion } from "firebase/firestore";

// --- MUDANÇA 1: Props atualizadas ---
type BotaoAprovarProjProps = {
  projectId: string;
  projectName: string;
  projetosComplianceStatus: boolean; // A fonte da verdade para o estado do botão
  complianceDocUrl: string | null;
  additionalDocsUrl: string | null;
  onApprovalSuccess: () => void;
};

// Componente de Modal (sem alterações)
const ConfirmationModal = ({ message, onConfirm, onCancel, isUpdating }: { message: string, onConfirm: () => void, onCancel: () => void, isUpdating: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center">
      <p className="text-black mb-4">{message}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">Cancelar</button>
        <button onClick={onConfirm} disabled={isUpdating} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          {isUpdating ? 'Confirmando...' : 'Confirmar Definitivamente'}
        </button>
      </div>
    </div>
    </div>
);

export default function BotaoAprovarProj(props: BotaoAprovarProjProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  
  const [valorAprovado, setValorAprovado] = useState("");
  const [empresas, setEmpresas] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => { setIsOpen(false); }, [props.projetosComplianceStatus]);
  
  useEffect(() => {
    if (!isOpen) return;
    function handleCliqueFora(event: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleCliqueFora);
    return () => document.removeEventListener('mousedown', handleCliqueFora);
  }, [isOpen]);

  // --- MUDANÇA 2: APROVAR COMPLIANCE AGORA ATUALIZA A COLEÇÃO 'projetos' ---
  const handleComplianceApproval = async () => {
    setIsUpdating(true);
    try {
      // Encontra o documento em 'projetos' pelo nome
      const q = query(collection(db, "projetos"), where("nome", "==", props.projectName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Registro do projeto não encontrado na coleção 'projetos'.");
      
      const projectDocRef = querySnapshot.docs[0].ref;
      // Atualiza o campo 'compliance' para true NESTA coleção
      await updateDoc(projectDocRef, { compliance: true });
      
      props.onApprovalSuccess(); // Avisa o pai para recarregar tudo
    } catch (error) {
      console.error("Erro ao aprovar compliance:", error);
      alert(error instanceof Error ? error.message : "Falha ao aprovar a etapa de compliance.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Lógica da segunda etapa (sem alterações, já estava correta)
  const handleProjectApprovalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  async function executeFinalApproval() {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const q = query(collection(db, "projetos"), where("nome", "==", props.projectName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Registro do projeto não encontrado.");
      
      const projectDocRef = querySnapshot.docs[0].ref;
      const empresasParaAdicionar = empresas.split(',').map(e => e.trim()).filter(e => e);

      await updateDoc(projectDocRef, {
        status: "aprovado",
        valorAprovado: valorAprovado,
        empresas: arrayUnion(...empresasParaAdicionar)
      });
      
      setShowConfirmation(false);
      props.onApprovalSuccess();
    } catch (error) {
      console.error("Erro na aprovação final do projeto:", error);
      alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsUpdating(false);
    }
  }

  // --- MUDANÇA 3: RENDERIZAÇÃO CONDICIONAL AGORA USA A PROP CORRETA ---
  const renderContent = () => {
    // Se 'projetos.compliance' for 'false', mostra a primeira etapa.
    if (!props.projetosComplianceStatus) {
      return (
        <div ref={caixaRef} className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10">
          <div className="space-y-3">
            <label className="text-black block font-semibold">Documentos para Análise:</label>
            <a href={props.complianceDocUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-full block text-center py-2 rounded ${props.complianceDocUrl ? 'bg-blue-fcsn text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              Baixar Doc. Compliance
            </a>
            <a href={props.additionalDocsUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-full block text-center py-2 rounded ${props.additionalDocsUrl ? 'bg-blue-fcsn text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              Baixar Docs. Adicionais
            </a>
            <hr className="my-3"/>
            <button onClick={handleComplianceApproval} disabled={isUpdating} className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {isUpdating ? 'Aprovando...' : 'Aprovar Compliance'}
            </button>
          </div>
        </div>
      );
    }
    
    // Se 'projetos.compliance' for 'true', mostra a segunda etapa.
    return (
      <div ref={caixaRef} className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10">
        <form onSubmit={handleProjectApprovalSubmit}>
          <div className="mb-3">
            <label className="text-black block mb-1">Valor aprovado:</label>
            <input type="text" value={valorAprovado} onChange={(e) => setValorAprovado(e.target.value)} className="border-gray-400 w-full p-2 border rounded text-black" required />
          </div>
          <div className="mb-3">
            <label className="text-black block mb-1">Empresas vinculadas (separadas por vírgula):</label>
            <input type="text" value={empresas} onChange={(e) => setEmpresas(e.target.value)} className="border-gray-400 w-full p-2 border rounded text-black" required />
          </div>
          <button type="submit" className="bg-pink-fcsn text-white px-4 py-2 rounded w-full">
            Aprovar Projeto
          </button>
        </form>
      </div>
    );
  };
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="border-2 border-amber-400 bg-white text-black rounded-2xl px-4 py-2 w-50 h-10"
      >
        {props.projetosComplianceStatus ? 'Aprovar Projeto' : 'Aprovar Compliance'}
      </button>
      {isOpen && renderContent()}
      {showConfirmation && (
        <ConfirmationModal
          message={`Tem certeza que deseja aprovar o projeto "${props.projectName}"?`}
          onConfirm={executeFinalApproval}
          onCancel={() => setShowConfirmation(false)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}