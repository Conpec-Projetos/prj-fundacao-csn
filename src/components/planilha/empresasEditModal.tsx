import React, { useState, useEffect } from "react";
import { FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";

// Define a estrutura de uma empresa
interface Empresa {
    nome: string;
    valorAportado: number;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (empresas: Empresa[]) => void;
    initialData: Empresa[];
    projectName: string;
}

// Helper para converter o valor do input de volta para centavos
const parseInputToNumber = (value: string) => {
    const number = parseFloat(value.replace(",", ".")) || 0;
    return number;
};

export const EmpresasEditModal = ({ isOpen, onClose, onSave, initialData, projectName }: ModalProps) => {
    const [empresas, setEmpresas] = useState<Empresa[]>(initialData);

    useEffect(() => {
        // Garante que o estado do modal é atualizado se os dados iniciais mudarem
        setEmpresas(initialData);
    }, [initialData]);

    if (!isOpen) {
        return null;
    }

    const handleEmpresaChange = (index: number, field: keyof Empresa, value: string | number) => {
        const novasEmpresas = [...empresas];
        if (field === 'valorAportado' && typeof value === 'string') {
            novasEmpresas[index] = { ...novasEmpresas[index], [field]: parseInputToNumber(value) };
        } else {
            novasEmpresas[index] = { ...novasEmpresas[index], [field]: value };
        }
        setEmpresas(novasEmpresas);
    };

    const adicionarEmpresa = () => {
        setEmpresas([...empresas, { nome: "", valorAportado: 0 }]);
    };

    const removerEmpresa = (index: number) => {
        const novasEmpresas = empresas.filter((_, i) => i !== index);
        setEmpresas(novasEmpresas);
    };

    const handleSave = () => {
        onSave(empresas);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-blue-fcsn bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-blue-fcsn3 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-1 text-blue-fcsn dark:text-white-off">Editar Empresas</h2>
                <p className="text-sm mb-4 text-gray-500 dark:text-gray-300">Projeto: {projectName}</p>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {empresas.map((empresa, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-white-off dark:bg-blue-fcsn2">
                            <input
                                type="text"
                                placeholder="Nome da Empresa"
                                value={empresa.nome}
                                onChange={(e) => handleEmpresaChange(index, "nome", e.target.value)}
                                className="flex-grow p-2 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Valor Aportado"
                                    value={empresa.valorAportado}
                                    onChange={(e) => handleEmpresaChange(index, "valorAportado", e.target.value)}
                                    className="w-40 p-2 pl-8 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
                                />
                            </div>
                            <button onClick={() => removerEmpresa(index)} className="p-2 text-red-500 hover:text-red-700 cursor-pointer">
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={adicionarEmpresa}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-fcsn dark:text-white-off hover:underline cursor-pointer"
                >
                    <FaPlus /> Adicionar Empresa
                </button>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-white bg-blue-fcsn hover:bg-blue-fcsn2 cursor-pointer"
                    >
                        <FaTimes /> Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="py-2 px-4 rounded-lg flex items-center gap-2 transition-colors bg-blue-fcsn text-white hover:bg-blue-fcsn2 cursor-pointer"
                    >
                        <FaSave /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};