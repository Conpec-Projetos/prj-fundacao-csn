"use client";
import { useRouter } from "next/navigation";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/themeContext';



export default function Header(){
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme();

    return(
        <div className={`${darkMode ? "dark" : ""}`} suppressHydrationWarning={true}>
            <header className="fixed flex flex-row justify-evenly w-full h-[10vh] bg-blue-fcsn z-50">
                
                <div className="flex flex-row justify-start items-center w-[85%] text-white dark:text-white-off text-xl gap-4 sm:w-3/4 lg:w-1/2 lg:text-2xl font-bold ml-1">
                    
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
                <div className="w-[15%] flex justify-end items-center mr-1 sm:mr-3">
                    <button className="cursor-pointer transition-all duration-300" 
                    onClick={toggleDarkMode}>{darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
                    </button>
                </div>

            </header>
        </div>
    );
}