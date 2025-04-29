"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';



export default function Header(){
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        let savedMode = localStorage.getItem("displayMode");
        if(!savedMode) {
            const newMode = "light"
            setDarkMode(false)
            localStorage.setItem("displayMode", newMode)
        }
        setDarkMode(savedMode === 'dark' ? true : false);   
    }, [])

    const toggleDisplayMode = () => {
        setDarkMode(!darkMode);
    }

    return(
    <body className={`${darkMode ? "dark" : ""}`}>
        <header className="fixed flex flex-row justify-evenly w-full h-[10vh] bg-blue-fcsn dark:bg-red-500">
            
            <div className="flex flex-row justify-start items-center w-[85%] text-xl gap-4 sm:w-3/4 lg:w-1/2 lg:text-2xl text-white font-bold ml-1">
                
                <button
                    onClick={(event) => {
                        event.preventDefault();
                        router.push("/")
                    }}
                    
                    className="
                        cursor-pointer">Início</button> 
                    
                <div className="hidden sm:block h-[4vh] w-px bg-gray-300 my-5"></div>

                <button
                    className="
                        cursor-pointer">Dashboard</button>
                
                <div className="hidden sm:block h-[4vh] w-px bg-gray-300 my-5"></div>

                <button className="
                    cursor-pointer">Projetos</button>
            </div>
            <div className="w-[15%] flex justify-end items-center">
                <button className="cursor-pointer" 
                onClick={()=>{toggleDisplayMode()}}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

        </header>
    </body>
    );
}