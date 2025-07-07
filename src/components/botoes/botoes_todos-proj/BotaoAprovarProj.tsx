import { useEffect, useRef, useState } from "react";

type BotaoAprovarProjProps = {
  setAprovado: (aprovado: boolean) => void;
};

export default function BotaoAprovarProj({ setAprovado }: BotaoAprovarProjProps) {
    // Usei esse estado para controlar o dropdown 
    const [isOpen, setIsOpen] = useState(false);

    // caixaRef é a referencia de um elemento html, no caso nosso dropdown
    const caixaRef = useRef<HTMLDivElement>(null);

    // variaveis dinamicas para o formulario
    const [valor, setValor] = useState("");
    const [empresa, setEmpresa] = useState("");

    //Usamos isso para fechar o dropdown quando clicarmos fora da caixa
    useEffect(() => {
    if (!isOpen) return;
    
    function handleCliqueFora(event: MouseEvent) {
        if (
        caixaRef.current &&
        event.target instanceof Node &&
        // Aqui verificaremos se o evento foi fora da nossa caixa de referencia 
        !caixaRef.current.contains(event.target)
        ) {
        setIsOpen(false);
        }
    }
    
    document.addEventListener('mousedown', handleCliqueFora);
    return () => {
        document.removeEventListener('mousedown', handleCliqueFora);
    };
    }, [isOpen]); 

    function aprovar(event: React.FormEvent){
        event.preventDefault();
        setIsOpen(false);
        setAprovado(true);
    }


    return (
        <div className="relative inline-block">
        <button
            onClick={() => setIsOpen(true)} // marca o dropdown para poder ser exibido
            className="border-2 border-amber-400 bg-white text-black rounded-2xl px-4 py-2 w-50 h-10"
        >
            Aprovar Projeto
        </button>

        {/* O dropdown é exibido se isOpen é true */}
        {isOpen && (
            <div
            ref={caixaRef} // Nossa referencia para podermos clicar "fora", ou seja, fora dessa referencia
            className="absolute top-full left-0 w-[300px] p-4 rounded shadow-md bg-white z-10"
            >
            <form onSubmit={aprovar}>
                <div className="mb-3">
                <label className="dark:text-black block mb-1">Valor aportado:</label>
                <input
                    type="text"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="dark:border-gray-400 border-gray-300  w-full p-2 border rounded"
                />
                </div>
                <div className="mb-3">
                <label className="dark:text-black block mb-1">Empresa vinculada:</label>
                <input
                    type="text"
                    value={empresa} // exibe a variavel considerando todas as insercoes de caractere
                    onChange={(e) => setEmpresa(e.target.value)} //muda a variavel a cada caractere inserido
                    className="dark:border-gray-400 w-full p-2 border border-gray-300 rounded"
                />
                </div>
                <button
                type="submit"
                className="bg-pink-fcsn text-white px-4 py-2 rounded  ml-10"
                >
                Confirmar Aprovação
                </button>
            </form>
            </div>
        )}
        </div>
    );
}