"use client";

import { useRouter } from "next/navigation";
import { Sun, Moon } from 'lucide-react';
import { FaBars } from 'react-icons/fa';
import { useTheme } from '@/context/themeContext';
import { useEffect, useState } from "react";
import Botao_Logout from "../botoes/Botao_Logout";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import HeaderSecundario from "./headerSecundario";

interface promoteAdminProps {
    id: number;
    name: string;
}

const PromoteAdmin = ({name }: promoteAdminProps) => ( //tirei o "id" para consertar o run build, mas pode ser usado se necessário no funturo
    <div className="flex flex-col items-center justify-center w-[98%] h-fit bg-white-off dark:bg-blue-fcsn3 rounded shadow-md text-white-off text-md m-2 text-center">
        <span className="m-2 text-blue-fcsn dark:text-white font-medium">
            Você deseja promover o colaborador {name} a administrador?
        </span>
        <div className="flex flex-row gap-4">
            <button className="bg-green-500 text-white font-medium rounded-full px-4 py-2 mt-2 mb-2 cursor-pointer text-sm">
                Promover
            </button>
            <button className="bg-red-500 text-white rounded-full px-4 py-2 mt-2 mb-2 cursor-pointer">
                Não promover
            </button>
        </div>
    </div>
);

// Usamos essa funcao IsADM pois nossa funcao que esta dentro da pasta lib utiliza o firebase-admin
async function IsADM(email: string | null): Promise<boolean> {
    if (!email) return false;
    const usuarioInt = collection(db, "usuarioInt");
    const qADM = query(usuarioInt, where("email", "==", email), where("administrador", "==", true));
    const snapshotADM = await getDocs(qADM);
    return !snapshotADM.empty;
}

export default function Header() {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [adm, setAdm] = useState<boolean | null>(null);
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isPromotePopUpOpen, setIsPromotePopUpOpen] = useState(false);

    const UsersToPromote: promoteAdminProps[] = [
        { id: 1, name: "Teste da Silva" },
        { id: 2, name: "Testão da Silva" },
        { id: 3, name: "Testinho da Silva" },
        { id: 4, name: "Testezinho da Silva" },
        { id: 5, name: "Testezão da Silva" },
        { id: 6, name: "Testezãozão da Silva" },
        { id: 7, name: "Testezinhozinho da Silva" },
    ];

    // Verifica se o usuário logado é admin
    useEffect(() => {
    async function fetchUser() {
        const res = await fetch('/api/auth/session', { method: 'GET' });
        const data = await res.json();
        if (data.user?.email) {
            const isAdmin = await IsADM(data.user.email);
            setAdm(isAdmin);
        } else {
            setAdm(false);
        }
    }
    fetchUser();
    }, []);

    if (adm === null) return null;

     // Se NÃO for admin, renderiza o Header padrão
    if (!adm) {
        return (
            <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
                <header className="fixed top-0 flex justify-between w-full h-[10vh] bg-blue-fcsn2 z-50 shadow-md/20 px-10">
                    <nav className="hidden sm:flex flex-row justify-start items-center w-[85%] text-white dark:text-white-off text-xl gap-4 lg:gap-7 sm:w-3/4 lg:w-1/2 lg:text-2xl font-bold ml-1">
                        <button onClick={() => router.push("/")} className="cursor-pointer">Início</button>
                        <button onClick={() => router.push("/dashboard")} className="cursor-pointer">Dashboard</button>
                        <button onClick={() => router.push("/todos-projetos")} className="cursor-pointer">Projetos</button>
                        <div className="relative">
                            <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="cursor-pointer">Ações ▾</button>
                            {isActionsOpen && (
                                <div className="absolute text-lg mt-2 w-48 bg-white dark:bg-blue-fcsn3 rounded shadow-lg z-10 text-blue-fcsn dark:text-white-off">
                                    <button
                                        onClick={() => setIsPromotePopUpOpen(!isPromotePopUpOpen)}
                                        className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-blue-fcsn2"
                                    >Promover colaborador</button>
                                    <button
                                        onClick={() => {router.push("/cadastro-leis"); setIsActionsOpen(false);}}
                                        className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-blue-fcsn2"
                                    >Cadastrar leis</button>
                                </div>
                            )}
                        </div>
                    </nav>

                    <div className="flex items-center gap-10">
                        <button className="sm:hidden" onClick={() => setIsOpen(!isOpen)}>
                            <FaBars size={20} className="text-white" />
                        </button>
                        <Botao_Logout />
                        <button onClick={toggleDarkMode} className="cursor-pointer">
                            {darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <nav className="sm:hidden absolute top-[10vh] left-0 w-full bg-blue-fcsn2 rounded shadow-lg text-white-off text-lg font-bold flex flex-col">
                            <button onClick={() => router.push("/")} className="px-4 py-3 text-left">Início</button>
                            <button onClick={() => router.push("/dashboard")} className="px-4 py-3 text-left">Dashboard</button>
                            <button onClick={() => router.push("/todos-projetos")} className="px-4 py-3 text-left">Projetos</button>
                            <div className="relative">
                                <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="w-full text-left px-4 py-3">Ações ▾</button>
                                {isActionsOpen && (
                                    <div className="mt-1 bg-white dark:bg-blue-fcsn3 text-black dark:text-white-off">
                                        <button
                                            onClick={() => setIsPromotePopUpOpen(!isPromotePopUpOpen)}
                                            className="cursor-pointer block w-full text-left px-4 py-2"
                                        >Promover colaborador</button>
                                        <button
                                            onClick={() => router.push("/cadastro-leis")}
                                            className="cursor-pointer block w-full text-left px-4 py-2"
                                        >Cadastrar leis</button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    )}

                        {/* Pop-up de promoção */}
                        {isPromotePopUpOpen && (
                            <div className="flex flex-col items-center absolute top-78 left-1 sm:top-[10.5vh] sm:left-135 rounded shadow-md bg-blue-fcsn2 max-w-[90%] w-fit h-fit max-h-[90svh] overflow-y-auto overflow-hidden">
                                {UsersToPromote.map(user => (
                                    <PromoteAdmin key={user.id} id={user.id} name={user.name} />
                                ))}
                            </div>
                        )}
                </header>
            </div>
        );
    }

    return <HeaderSecundario />;
}
