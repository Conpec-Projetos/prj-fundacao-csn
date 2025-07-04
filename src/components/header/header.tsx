"use client";
import { useRouter } from "next/navigation";
import { Sun, Moon } from 'lucide-react';
import { FaBars } from 'react-icons/fa';
import { useTheme } from '@/context/themeContext';
import { useState } from "react";
import Botao_Logout from "../botoes/Botao_Logout";

interface promoteAdminProps {
    id: number;
    name: string;
}

const PromoteAdmin = ({ id, name }: promoteAdminProps) => (
    <div className="flex flex-col items-center justify-center w-[98%] h-fit bg-white-off dark:bg-blue-fcsn3 rounded shadow-md text-white-off text-md m-2 text-center">
        <span className="m-2 text-blue-fcsn dark:text-white font-medium">Você deseja promover o colaborador {name} a administrador?</span>
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



export default function Header(){
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    const UsersToPromote: promoteAdminProps[] = [
        { id: 1, name: "Teste da Silva" },
        { id: 2, name: "Testão da Silva" },
        { id: 3, name: "Testinho da Silva" },
        { id: 4, name: "Testezinho da Silva" },
        { id: 5, name: "Testezão da Silva" },
        { id: 6, name: "Testezãozão da Silva" },
        { id: 7, name: "Testezinhozinho da Silva" },
    ]

    return(
        <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
            <header className="flex flex-row justify-between w-full h-[10vh] bg-blue-fcsn2 z-50 shadow-md/20 px-10">
                
                <div className="hidden sm:flex flex-row justify-start items-center w-[85%] text-white dark:text-white-off text-xl gap-4 sm:w-3/4 lg:w-1/2 lg:text-2xl font-bold ml-1">
                    
                    <button
                        onClick={(event) => {
                            event.preventDefault();
                            router.push("/")
                        }}
                        
                        className="
                            cursor-pointer">Início</button> 
                        
                    <div className="hidden sm:block h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>

                    <button
                        onClick={(event) => {
                                event.preventDefault();
                                router.push("./dashboard")
                            }}
                        className="
                            cursor-pointer">Dashboard</button>
                    
                    <div className="hidden sm:block h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>

                    <button 
                        onClick={(event) => {
                                event.preventDefault();
                                router.push("./todos-projetos")
                            }}
                        className="
                            cursor-pointer">Projetos</button>

                    <div className="hidden sm:block h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>

                    <button onClick={() => setIsPopUpOpen(!isPopUpOpen)}
                        className="cursor-pointer whitespace-nowrap">Promover Colaborador</button>
                </div>

            <div className="flex flex-row gap-10">
                <button className="sm:hidden" onClick={() => setIsOpen(!isOpen)}>
                    <FaBars size={20} className="text-white" />
                </button>

                <div className="py-4">
                    <Botao_Logout />
                </div>
                {/* Mobile Menu */}
                {isOpen && (
                    <div className="sm:hidden absolute top-[10.5vh] left-1 w-[50%] h-fit bg-blue-fcsn dark:bg-blue-fcsn2 rounded shadow-md text-white-off text-lg font-bold flex flex-col items-center gap-4 p-4">
                        <button
                            onClick={(event) => {
                                event.preventDefault();
                                router.push("/");
                            }}
                            className="cursor-pointer"
                        >
                            Início
                        </button>

                        <button
                            onClick={(event) => {
                                event.preventDefault();
                                router.push("./dashboard");
                            }}
                            className="cursor-pointer"
                        >
                            Dashboard
                        </button>

                        <button                 
                            onClick={(event) => {
                                event.preventDefault();
                                router.push("./todos-projetos");
                            }}
                        className="cursor-pointer">Projetos</button>

                        <button
                            onClick={() => setIsPopUpOpen(!isPopUpOpen)}
                            className="cursor-pointer"
                        >
                            Promover Colaborador
                        </button>
                    </div>
                )}

                {/* Promote user */}
                { isPopUpOpen && (
                    <div className="flex flex-col items-center absolute top-78 left-1 sm:top-[10.5vh] sm:left-135 rounded shadow-md bg-blue-fcsn2 max-w-[90%] w-fit h-fit max-h-[90svh] overflow-y-auto overflow-hidden">
                        {UsersToPromote.map(user => (
                            <PromoteAdmin key={user.id} id={user.id} name={user.name}/>
                        ))}
                    </div>
                )}
                
                <div className="w-[15%] flex justify-end items-center mr-1 sm:mr-3">
                    <button className="cursor-pointer transition-all duration-300" 
                    onClick={toggleDarkMode}>{darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
                    </button>
                </div>
            </div>
            </header>
        </div>
    );
}