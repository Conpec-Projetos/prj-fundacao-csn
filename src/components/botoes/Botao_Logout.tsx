'use client'

import { auth } from "@/firebase/firebase-config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState} from 'react';
import { CiLogout } from "react-icons/ci";
import logo from "@/assets/fcsn-logo.svg"
import Image from "next/image";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import { useTheme } from "@/context/themeContext";


export default function Botao_Logout() {
    const { darkMode } = useTheme();
    const [isLogOut, setLogOut] = useState(false);

    const router = useRouter();
    
    async function LogOut(){
        try {
            setLogOut(true);
            await signOut(auth); // 1. Faz logout no Firebase
            localStorage.removeItem('user'); // 2. Remove dados do localStorage
            router.push("./login");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);  
        } 
    }

    if(isLogOut){
            return (
                <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center h-screen bg-white dark:bg-black dark:bg-opacity-80">
                    <Image
                        src={darkMode ? darkLogo : logo}
                        alt="csn-logo"
                        width={600}
                        className=""
                        priority
                    />
                    <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-6 text-center">
                        Saindo...
                    </div>
                </div>
            );
        }

    return (
        <button
            onClick={() => LogOut()}
            className="bg-gray-100 border border-gray-300 text-black px-3 py-2 rounded flex items-center gap-1"
        >
            <CiLogout className="text-lg" />
            <span className="text-sm sm:text-base font-semibold">Sair</span>
        </button>
    );
}