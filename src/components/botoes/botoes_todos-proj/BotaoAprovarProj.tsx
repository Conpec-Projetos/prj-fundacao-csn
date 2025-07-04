import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/firebase-config";
// --- MUDANÇA 1: Importar 'setDoc' em vez de 'updateDoc' ---
import { doc, setDoc } from "firebase/firestore";

type BotaoAprovarProjProps = {
  projectId: string;
  onApprovalSuccess: (projectId: string) => void;
};

export default function BotaoAprovarProj({ projectId, onApprovalSuccess }: BotaoAprovarProjProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  const [valor, setValor] = useState("");
  const [empresa, setEmpresa] = useState("");

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

  async function aprovar(event: React.FormEvent) {
    event.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);

    const projectDocRef = doc(db, "projetos", projectId);

    try {
      // --- MUDANÇA 2: Usar setDoc com a opção { merge: true } ---
      // Isso irá CRIAR o documento se ele não existir, ou ATUALIZAR se já existir.
      await setDoc(projectDocRef, {
        compliance: true,
        valorAportado: valor,
        empresaVinculada: empresa,
      }, { merge: true }); // A opção 'merge' é importante para não apagar outros campos caso o doc já exista.

      setIsOpen(false);
      onApprovalSuccess(projectId);

    } catch (error) {
      console.error("Erro ao aprovar o projeto:", error);
      alert("Falha ao aprovar o projeto. Verifique o console.");
    } finally {
      setIsUpdating(false);
    }
  }

  // O restante do seu componente (o return com o JSX) continua exatamente o mesmo.
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(true)}
        className="border border-red-500 text-red-500 rounded-md px-4 py-1 text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors"
      >
        Aprovar Compliance
      </button>

      {isOpen && (
        <div
          ref={caixaRef}
          className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10"
        >
          <form onSubmit={aprovar}>
            <div className="mb-3">
              <label className="text-black block mb-1">Valor aportado:</label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="border-gray-400 w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="text-black block mb-1">Empresa vinculada:</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="border-gray-400 w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-pink-fcsn text-white px-4 py-2 rounded w-full disabled:opacity-50"
            >
              {isUpdating ? 'Confirmando...' : 'Confirmar Aprovação'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}