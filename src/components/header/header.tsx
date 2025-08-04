"use client";

import { useRouter } from "next/navigation";
import { Sun, Moon } from 'lucide-react';
import { FaBars } from 'react-icons/fa';
import { useTheme } from '@/context/themeContext';
import { useEffect, useState, useRef } from "react";
import Botao_Logout from "../botoes/Botao_Logout";
import HeaderSecundario from "./headerSecundario";

export default function Header() {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [adm, setAdm] = useState<boolean | null>(null);

    const [isPlanilhasOpen, setIsPlanilhasOpen] = useState(false);
    
    const planilhasRef = useRef<HTMLDivElement>(null);

    // Pega o usuário logado e verifica se é admin
    useEffect(() => {
        async function fetchUser() {
            const res = await fetch('/api/auth/session', { method: 'GET' });
            if (!res.ok) {
                setAdm(false);
                return;
            }
            const data = await res.json();
            if (data.user?.userIntAdmin) {
                setAdm(true);
            } else {
                setAdm(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (planilhasRef.current && !planilhasRef.current.contains(event.target as Node)) {
                setIsPlanilhasOpen(false);
            }
        }
        // Adiciona o listener se o pop-up estiver aberto
        if (isPlanilhasOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        // Remove o listener ao limpar
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPlanilhasOpen]);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsOpen(false);
        setIsPlanilhasOpen(false);
    };

    // Enquanto `adm` ainda não foi definido (null), não renderiza nada
    if (adm === null) return null;

    // Se for admin, renderiza o Header padrão
    if (adm) {
        return (
            <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
                <header className="fixed top-0 flex flex-row justify-between w-full h-[10vh] bg-blue-fcsn2 z-50 shadow-md/20 px-10 mb-56 shadow-lg " >
                    {/* --- MENU DESKTOP --- */}
                    <nav className="hidden md:flex flex-row justify-start items-center w-[85%] text-white dark:text-white-off text-xl gap-4 sm:w-3/4 lg:w-1/2 lg:text-2xl font-bold ml-1">
                        <button onClick={() => handleNavigate("/")} className="cursor-pointer">Início</button>
                        <div className="h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>
                        <button onClick={() => handleNavigate("/dashboard")} className="cursor-pointer">Dashboard</button>
                        <div className="h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>
                        
                        <div className="relative" ref={planilhasRef}>
                            <button onClick={() => setIsPlanilhasOpen(!isPlanilhasOpen)} className="cursor-pointer">
                                Planilhas
                            </button>
                            {isPlanilhasOpen && (
                                <div className="absolute top-full mt-2 w-48 bg-blue-fcsn dark:bg-blue-fcsn3 rounded-lg shadow-xl p-2 flex flex-col gap-2">
                                    <button onClick={() => handleNavigate("/planilha-aprovacao")} className="text-left p-2 rounded-md hover:bg-blue-fcsn2">Aprovação</button>
                                    <button onClick={() => handleNavigate("/planilha-monitoramento")} className="text-left p-2 rounded-md hover:bg-blue-fcsn2">Monitoramento</button>
                                    <button onClick={() => handleNavigate("/planilha-historico")} className="text-left p-2 rounded-md hover:bg-blue-fcsn2">Histórico</button>
                                </div>
                            )}
                        </div>

                        <div className="h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>
                        <button onClick={() => handleNavigate("/gerenciamento")} className="cursor-pointer">Gerenciamento</button>
                    </nav>

                  <div className="flex flex-row items-center w-full justify-between md:justify-end">
                        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                            <FaBars size={20} className="text-white" />
                        </button>

                        {/* --- MENU MOBILE --- */}
                        {isOpen && (
                            <nav className="md:hidden absolute top-[10vh] left-1 w-[50%] h-fit bg-blue-fcsn dark:bg-blue-fcsn2 rounded shadow-md text-white-off text-lg font-bold flex flex-col items-center gap-4 p-4">
                                <button onClick={() => handleNavigate("/")} className="cursor-pointer">Início</button>
                                <button onClick={() => handleNavigate("/dashboard")} className="cursor-pointer">Dashboard</button>
                                
                                <div className="w-full text-center">
                                    <button onClick={() => setIsPlanilhasOpen(!isPlanilhasOpen)} className="cursor-pointer w-full">
                                        Planilhas
                                    </button>
                                    {isPlanilhasOpen && (
                                        <div className="flex flex-col gap-3 mt-3 bg-blue-fcsn3 bg-opacity-20 rounded-lg p-2">
                                            <button onClick={() => handleNavigate("/planilha-aprovacao")} className="cursor-pointer">Aprovação</button>
                                            <button onClick={() => handleNavigate("/planilha-monitoramento")} className="cursor-pointer">Monitoramento</button>
                                            <button onClick={() => handleNavigate("/planilha-historico")} className="cursor-pointer">Histórico</button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => handleNavigate("/gerenciamento")} className="cursor-pointer">Gerenciamento</button>
                            </nav>
                        )}

                        <div className="flex flex-row gap-6 ">
                        <div className="w-[15%] flex justify-end items-center mr-1 sm:mr-3">
                            <button className="cursor-pointer transition-all duration-300" onClick={toggleDarkMode}>
                                {darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
                            </button>
                        </div>

                        <div className="pt-2 md:pt-1">
                            <Botao_Logout />
                        </div>
                        </div>
                    </div>
                </header>
            </div>
        );
    }

    // Se nao for admin (é apenas interno ou externo), renderiza outro header
    return <HeaderSecundario />;
}