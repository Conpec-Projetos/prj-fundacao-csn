"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { collection, doc, getDocs, query, updateDoc, where, arrayUnion } from "firebase/firestore";

// Importa a lista de empresas do seu arquivo JSON local
import listaDeEmpresasPermitidas from "./empresas.json";

// As props que o componente recebe do pai
type BotaoAprovarProjProps = {
  projectId: string;
  projectName: string;
  projetosComplianceStatus: boolean;
  complianceDocUrl: string | null;
  additionalDocsUrls: string[];
  onApprovalSuccess: () => void;
};

// Componente de Modal para a dupla confirmação final
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

// Interface para organizar os dados da empresa com seu valor
interface EmpresaComValor {
  nome: string;
  valorAportado: number;
}

export default function BotaoAprovarProj(props: BotaoAprovarProjProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  
  // Estados para o formulário de aprovação final por empresa
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [valorPorEmpresa, setValorPorEmpresa] = useState(""); 
  const [empresasList, setEmpresasList] = useState<EmpresaComValor[]>([]);
  
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fecha o dropdown se o estado de compliance mudar (após a primeira aprovação)
  useEffect(() => {
    setIsOpen(false);
  }, [props.projetosComplianceStatus]);
  
  // Lógica para fechar o dropdown ao clicar fora
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

  // Função para a primeira etapa: Aprovar Compliance
  const handleComplianceApproval = async () => {
    setIsUpdating(true);
    try {
      const q = query(collection(db, "projetos"), where("nome", "==", props.projectName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Registro do projeto não encontrado na coleção 'projetos'.");
      
      const projectDocRef = querySnapshot.docs[0].ref;
      await updateDoc(projectDocRef, { compliance: true });
      
      props.onApprovalSuccess();
    } catch (error) {
      console.error("Erro ao aprovar compliance:", error);
      alert(error instanceof Error ? error.message : "Falha ao aprovar a etapa de compliance.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para adicionar o par (empresa, valor) à lista
  const handleAddEmpresa = () => {
    if (!empresaSelecionada) {
      alert("Por favor, selecione uma empresa.");
      return;
    }
    const valorNumerico = parseFloat(valorPorEmpresa);
    if (valorPorEmpresa.trim() === "" || isNaN(valorNumerico)) {
      alert("Por favor, insira um valor numérico válido.");
      return;
    }
    if (empresasList.some(e => e.nome === empresaSelecionada)) {
      alert("Esta empresa já foi adicionada.");
      return;
    }
    
    const novaEmpresa: EmpresaComValor = {
      nome: empresaSelecionada,
      valorAportado: valorNumerico
    };
    
    setEmpresasList(prevList => [...prevList, novaEmpresa]);
    // Limpa os campos para a próxima adição
    setEmpresaSelecionada("");
    setValorPorEmpresa("");
  };

  // Função para remover uma empresa da lista
  const handleRemoveEmpresa = (indexToRemove: number) => {
    setEmpresasList(prevList => prevList.filter((_, index) => index !== indexToRemove));
  };

  // Função para a segunda etapa: Aprovar Projeto (abre o modal de confirmação)
  const handleProjectApprovalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (empresasList.length === 0) {
      alert("Adicione pelo menos uma empresa com seu respectivo valor aprovado.");
      return;
    }
    setShowConfirmation(true);
  };

  // Função final que executa a aprovação, construindo o 'map' para o Firestore
  async function executeFinalApproval() {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const q = query(collection(db, "projetos"), where("nome", "==", props.projectName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Registro do projeto não encontrado.");
      
      const projectDocRef = querySnapshot.docs[0].ref;

      // Calcula a soma total dos valores da lista de empresas
      const valorTotalAprovado = empresasList.reduce((sum, empresa) => sum + empresa.valorAportado, 0);

      // Prepara os dados para o Firebase
      await updateDoc(projectDocRef, {
        status: "aprovado",
        valorAprovado: valorTotalAprovado, // Salva a soma total no campo 'valorAprovado'
        empresas: arrayUnion(...empresasList) // Adiciona os objetos {nome, valor} ao array 'empresas'
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

  // Define o conteúdo do dropdown com base no status da compliance
  const renderContent = () => {
    // ESTADO 1: Compliance Pendente
    if (!props.projetosComplianceStatus) {
      return (
        <div ref={caixaRef} className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10">
          <div className="space-y-3">
            <label className="text-black block font-semibold">Documentos para Análise:</label>
            <a href={props.complianceDocUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-full block text-center py-2 rounded ${props.complianceDocUrl ? 'bg-blue-fcsn text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              Baixar Doc. Compliance
            </a>
            
            {props.additionalDocsUrls && props.additionalDocsUrls.length > 0 ? (
              props.additionalDocsUrls.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="w-full block text-center py-2 rounded bg-blue-fcsn text-white hover:bg-blue-800">
                  Baixar Doc. Adicional {index + 1}
                </a>
              ))
            ) : (
              <a className="w-full block text-center py-2 rounded bg-gray-300 text-gray-500 cursor-not-allowed">
                Nenhum Doc. Adicional
              </a>
            )}

            <hr className="my-3"/>
            <button onClick={handleComplianceApproval} disabled={isUpdating} className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {isUpdating ? 'Aprovando...' : 'Aprovar Compliance'}
            </button>
          </div>
        </div>
      );
    }
    
    // ESTADO 2: Compliance Aprovado, Projeto Pendente
    return (
      <div ref={caixaRef} className="absolute top-full left-0 w-[350px] p-4 rounded shadow-md bg-white z-10">
        <form onSubmit={handleProjectApprovalSubmit}>
          
          <div className="mb-3 p-3 border rounded border-gray-200">
            <p className="text-black font-semibold block mb-2">Adicionar Empresa e Valor</p>
            <div className="mb-2">
              <label className="text-black text-sm block mb-1">Empresa:</label>
              <select 
                value={empresaSelecionada} 
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                className="border-gray-400 w-full p-2 border rounded text-black bg-white"
              >
                <option value="">-- Selecione --</option>
                {listaDeEmpresasPermitidas.map(empresa => (
                  <option key={empresa} value={empresa}>{empresa}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="text-black text-sm block mb-1">Valor Aprovado:</label>
              <input 
                type="number" 
                placeholder="Ex: 50000.00"
                value={valorPorEmpresa} 
                onChange={(e) => {
                  if (e.target.value === '' || parseFloat(e.target.value) >= 0) {
                    setValorPorEmpresa(e.target.value);
                  }
                }}
                min="0"
                className="border-gray-400 w-full p-2 border rounded text-black" 
              />
            </div>
            <button 
              type="button" 
              onClick={handleAddEmpresa} 
              className="bg-blue-fcsn text-white w-full mt-1 py-2 rounded hover:bg-blue-800"
            >
              Adicionar
            </button>
          </div>

          {empresasList.length > 0 && (
            <div className="mb-4 p-2 border border-gray-200 rounded">
              <p className="text-sm font-semibold text-black mb-1">Empresas a serem aprovadas:</p>
              <div className="flex flex-col gap-2 mt-2">
                {empresasList.map((empresa, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-200 text-black rounded px-3 py-1 text-sm">
                    <div>
                      <span className="font-bold">{empresa.nome}: </span>
                      <span>{empresa.valorAportado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveEmpresa(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold">x</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="bg-pink-fcsn text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
            disabled={empresasList.length === 0 || isUpdating}
          >
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