"use client";

import { useState } from "react";
import { EstadoInputDashboard, CidadeInputDashboard } from "../inputs/inputs";
import { FaCaretDown } from "react-icons/fa";
import { usePDF } from "@/context/pdfContext";
import { useRouter, usePathname } from "next/navigation";

interface FiltrosProps {
  estadoInicial?: string;
  cidadesIniciais?: string[];
}

const Filtros = ({
  estadoInicial = "",
  cidadesIniciais = [],
}: FiltrosProps) => {
  const { isPdfMode } = usePDF();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filtrarPorEstado, setFiltrarPorEstado] = useState<boolean>(
    !!estadoInicial && cidadesIniciais.length === 0
  );
  const [estado, setEstado] = useState<string>(estadoInicial);
  const [cidades, setCidades] = useState<string[]>(cidadesIniciais);

  const lidarAplicarFiltros = () => {
    const parametros = new URLSearchParams();

    if (estado) {
      parametros.set("estado", estado);
    }

    if (cidades.length > 0) {
      cidades.forEach((cidade) => parametros.append("cidades", cidade));
    }

    const stringBusca = parametros.toString();
		const urlFinal = `${pathname}?${stringBusca}`
    router.push(urlFinal);
    setTimeout(() => {setIsOpen(false)}, 100)
  };

  const lidarLimparFiltros = () => {
    router.push('/dashboard');
    setCidades([]);
    setEstado("");
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-2 text-blue-fcsn dark:text-white-off bg-white-off dark:bg-blue-fcsn2 hover:bg-stone-300 dark:hover:bg-blue-fcsn3 rounded-xl text-lg font-bold px-5 py-3 cursor-pointer ${
          isPdfMode ? "hidden" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCaretDown /> Filtros
      </button>
      {isOpen && (
        <div className="absolute right-4 top-full flex flex-col justify-center items-center mt-2 min-w-[250px] max-w-sm w-fit rounded-lg bg-white dark:bg-blue-fcsn2 shadow-lg">
          <button
            className="cursor-pointer bg-blue-fcsn dark:bg-blue-fcsn3 text-white-off rounded-md m-4 p-3 text-lg font-bold"
            onClick={() => setFiltrarPorEstado(!filtrarPorEstado)}
          >
            Filtrar por {filtrarPorEstado ? "estado" : "município"}
          </button>
          <div className="">
            <EstadoInputDashboard
              text="Filtre por estado"
              estado={estado}
              setEstado={setEstado}
              setCidades={setCidades}
            />
          </div>
          <div className={`${filtrarPorEstado ? "" : "hidden"}`}>
            <CidadeInputDashboard
              text="Filtre por cidade"
              estado={estado}
              cidades={cidades}
              setCidades={setCidades}
            />
          </div>
					<div className="flex flex-row">
						<button
							className="text-nowrap cursor-pointer bg-blue-fcsn dark:bg-blue-fcsn3 text-white-off rounded-md m-4 py-1.5 px-2.5 text-lg font-bold"
							onClick={lidarAplicarFiltros}
						>
							Aplicar
						</button>
						<button
							className="text-nowrap cursor-pointer bg-blue-fcsn dark:bg-blue-fcsn3 text-white-off rounded-md m-4 py-1.5 px-2.5 text-lg font-bold"
							onClick={lidarLimparFiltros}
						>
							Limpar
						</button>
					</div>
        </div>
      )}
    </div>
  );
};

export default Filtros;
