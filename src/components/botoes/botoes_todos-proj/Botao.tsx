import { useEffect, useRef, useState } from "react";
import BotaoAprovarProj from "./BotaoAprovarProj";
import BotaoDownload from "./BotaoDownload";

export default function Botao() {
    // usado para exibir o dropdown
    const [isOpen, setIsOpen] = useState(false);

    // Quando a dupla confirmacao ocorrer usamos essa variavel para mudar o botao para aprovar projeto
    const [confirmar, setConfirmar] = useState(false);

    // usamos para controlar se o usuario clicou 2 vezes
    const [duplaConfirmacao, setDuplaConfirmacao] = useState(false);

    // Quando tudo for executado mudaremos o botao para ser apenas um conteudo visivel
    const [aprovado, setAprovado] = useState(false);

    // caixaRef é a referencia de um elemento html, no caso nosso dropdown
    const caixaRef = useRef<HTMLDivElement>(null);

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

    function Confirmar(){
      if(!duplaConfirmacao){
        setDuplaConfirmacao(true);
      }
      else{
        setConfirmar(true);
      } 
    };

  return (
    <div className="relative inline-block">
      {aprovado ? (
        <div className="border-2 border-green-400 text-black bg-white px-4 py-2 rounded-2xl">
          Projeto Aprovado
        </div>
      ) : confirmar ? (
        <BotaoAprovarProj setAprovado={setAprovado} />
      ) : duplaConfirmacao ? (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="border-2 border-red-600 bg-white text-black rounded-2xl px-4 py-2 w-50 h-10"
          >
            Aprovar Compliance
          </button>

          {isOpen && (
            <div
              ref={caixaRef}
              className="absolute top-full left-0 w-[250px] p-4 rounded shadow-md bg-white text-black"
            >
              <p className="mb-4 text-red-600 text-center text-lg">Clique novamente pra confirmar</p>
              <button
                onClick={Confirmar}
                className="bg-pink-fcsn text-white px-4 py-2 rounded border-2 border-red-600 ml-4"
              >
                Confirmar Aprovação
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="border-2 border-red-600 bg-white text-black rounded-2xl px-4 py-2 w-50 h-10"
          >
            Aprovar Compliance
          </button>

          {isOpen && (
            <div
              ref={caixaRef}
              className="absolute top-full left-0 w-[250px] p-4 rounded shadow-md bg-white text-black"
            >
              <p className="mb-4 text-center text-lg">Você deseja aprovar o Compliance do projeto?</p>

              <BotaoDownload />
              <button
                onClick={Confirmar}
                className="bg-pink-fcsn text-white px-4 py-2 rounded ml-4"
              >
                Confirmar Aprovação
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}