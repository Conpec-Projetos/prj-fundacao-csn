"use client";

import { useAppContext } from "@/context/AppContext";
import CadastroForm from "@/components/forms/CadastroForm";
import logo from "@/assets/fcsn-logo.svg"
import Image from "next/image";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import { useTheme } from "@/context/themeContext";
import { PiSmileySad } from "react-icons/pi";

type Props = { usuarioAtualID: string | null };

export default function FormsCadastroWrapper({ usuarioAtualID }: Props) {
    const { darkMode } = useTheme();
    const { paginaDesabilitada } = useAppContext();

  if (paginaDesabilitada) {
    return (
                <div className="fixed inset-0 z-[2] flex flex-col justify-center items-center h-screen bg-white dark:bg-blue-fcsn2 ">
                    <Image
                        src={darkMode ? darkLogo : logo}
                        alt="csn-logo"
                        width={600}
                        className=""
                        priority
                    />
                    <div className="flex flex-row gap-3 text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-20 text-center">
                        <div>
                            Inscrições encerradas temporariamente
                        </div>
                        <PiSmileySad size={40} />
                    </div>
                </div>
    );
  }

  return <CadastroForm usuarioAtualID={usuarioAtualID} />;
}
