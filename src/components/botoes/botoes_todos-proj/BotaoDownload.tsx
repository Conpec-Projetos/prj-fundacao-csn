import { FaCloudArrowDown } from "react-icons/fa6";

export default function BotaoDownload(){

    function Baixar_arq(){
        const link = document.createElement("a"); // Cria elemento ancora
        link.href = "Compliance.pdf"; // Caminho relativo à pasta public onde esta o arq teste
        link.download = "Compliance_teste.pdf"; // Nome para salvar o arquivo
        document.body.appendChild(link); // Adiciona o elemento ao corpo da pagina
        link.click();
        document.body.removeChild(link); // Remove o link do DOM
    }

    return (
    <button
      onClick={Baixar_arq}
      className="bg-gray-100 border-2 border-gray-300 text-black px-2 py-2 rounded ml-4 w-46 mb-4"
    >
        <div className="flex flex-row row-span-2 gap-2 ">
            <div className="mt-1"><FaCloudArrowDown /></div>
            <div>Baixar Compliance</div>
        </div>
    </button>
  );
}