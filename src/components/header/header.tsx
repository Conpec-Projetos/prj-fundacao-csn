"use client";
import { useRouter } from "next/navigation";
import { Sun, Moon } from 'lucide-react';
import { FaBars } from 'react-icons/fa';
import { useTheme } from '@/context/themeContext';
import { useState } from "react";

interface promoteAdminProps {
    id: number;
    name: string;
}

const PromoteAdmin = ({ id, name }: promoteAdminProps) => (
    <div className="flex flex-col items-center justify-center w-fit h-fit bg-blue-fcsn3 rounded shadow-md text-white-off text-lg font-bold m-2 text-center">
        Você deseja promover o colaborador {name} a administrador?
        <div className="flex flex-row gap-2">
            <button className="bg-green-500 text-white rounded-full px-4 py-2 mt-2 mb-2">
                Promover
            </button>
            <button className="bg-red-500 text-white rounded-full px-4 py-2 mt-2 mb-2">
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

    return(
        <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
            <header className="fixed flex flex-row justify-evenly w-full h-[10vh] bg-blue-fcsn z-50">
                
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
                        className="
                            cursor-pointer">Dashboard</button>
                    
                    <div className="hidden sm:block h-[2vh] w-px bg-white dark:bg-white-off my-5"></div>

                    <button className="
                        cursor-pointer">Projetos</button>
                </div>

                <button className="sm:hidden" onClick={() => setIsOpen(!isOpen)}>
                    <FaBars size={20} className="text-white" />
                </button>

                { isOpen && (
                    <div className="absolute top-[10.5vh] left-0 w-[50%] h-fit bg-blue-fcsn dark:bg-blue-fcsn2 rounded shadow-md text-white-off text-lg font-bold flex flex-col items-center gap-4 p-4">
                        <button
                        onClick={(event) => {
                            event.preventDefault();
                            router.push("/")
                        }}
                        
                        className="cursor-pointer">Início</button> 
                        
                        <button onClick={(event) => {
                            event.preventDefault();
                            router.push("/dashboard")
                        }}
                        className="cursor-pointer">Dashboard</button>

                        <button className="cursor-pointer">Projetos</button>

                        <button onClick={() => setIsPopUpOpen(!isPopUpOpen)}
                        className="cursor-pointer">Promover Colaborador</button>
                    </div>
                )}

                {isPopUpOpen && isOpen && (
                            <div className="absolute top-80 left-1 rounded shadow-md bg-blue-fcsn2 max-w-[90%] w-fit h-fit">
                                {PromoteAdmin({ id: 1, name: "Teste da Silva" })}
                            </div>
                        )}

                
                <div className="w-[15%] flex justify-end items-center mr-1 sm:mr-3">
                    <button className="cursor-pointer transition-all duration-300" 
                    onClick={toggleDarkMode}>{darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
                    </button>
                </div>

            </header>
        </div>
    );
}