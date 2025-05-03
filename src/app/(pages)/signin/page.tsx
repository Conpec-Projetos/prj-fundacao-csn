'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"

export default function Signin(){
    const router = useRouter();
    const [visibleFirst, setVisibleFirst] = useState(false);
    const [visibleSecond, setVisibleSecond] = useState(false);

    return(
        <main className="flex flex-col justify-between items-center w-screen min-h-screen bg-pink-fcsn dark:bg-blue-fcsn">
            <Toaster richColors closeButton/>

            <form
                className="flex flex-col justify-between w-full max-w-[1100px] 
                        h-auto min-h-[600px] my-4 md:my-8
                        bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md
                        p-4 md:p-8"
                onSubmit={(event) => event.preventDefault()}>
                
                {/* Logo */}
                <div className="flex flex-col justify-center items-center h-auto py-4">
                    <Image
                        src={logo}
                        alt="csn-logo"
                        className=""
                        priority
                    />
                    <h1 className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-4xl mt-4">
                        Fazer Cadastro
                    </h1>
                </div>

                {/* Inputs */}
                <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full">
                    {/* Input do nome */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                            Nome
                        </label>                        
                        <input
                            type="text"
                            className="w-full h-12 md:h-14 mt-1
                                    bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn2
                                    transition-all duration-300 px-4
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn"
                        />
                    </div>

                    {/* Input do email */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                            Email
                        </label>                        
                        <input
                            type="email"
                            className="w-full h-12 md:h-14 mt-1
                                    bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn
                                    transition-all duration-300 px-4
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn"
                        />
                    </div>
                    
                    {/* Senhas */}
                    <div className="w-full max-w-[600px] flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                        {/* Primeira senha */}
                        <div className="w-full md:w-1/2">
                            <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                                Senha
                            </label>
                            <div className="relative mt-1">
                                <input 
                                    type={visibleFirst ? "text" : "password"}
                                    className="w-full h-12 md:h-14
                                            bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn
                                            transition-all duration-300 px-4 pr-10
                                            focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn"
                                />
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2
                                            text-gray-400 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setVisibleFirst(prev => !prev);
                                    }}>
                                    {visibleFirst ? <Eye size={20}/> : <EyeOff size={20}/>}
                                </button>
                            </div>
                        </div>

                        {/* Segunda senha */}
                        <div className="w-full md:w-1/2">
                            <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                                Confirme a senha
                            </label>
                            <div className="relative mt-1">
                                <input 
                                    type={visibleSecond ? "text" : "password"}
                                    className="w-full h-12 md:h-14
                                            bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn
                                            transition-all duration-300 px-4 pr-10
                                            focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn"
                                />
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2
                                            text-gray-400 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setVisibleSecond(prev => !prev);
                                    }}>
                                    {visibleSecond ? <Eye size={20}/> : <EyeOff size={20}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="flex flex-row justify-center items-center text-sm md:text-base mt-4">
                    <span>Já tem uma conta?</span>
                    <button
                        onClick={() => router.push("./login")}
                        className="text-pink-fcsn dark:text-pink-light hover:text-[#A25D80] hover:dark:text-pink-light2 mx-1 underline cursor-pointer"
                    >
                        Faça o seu login.
                    </button>
                </div>

                <div className="flex justify-center items-center py-6">
                    <button
                        type="submit"
                        className="w-full max-w-[250px] h-12 md:h-14
                                bg-blue-fcsn rounded-xl
                                text-white text-lg md:text-xl font-bold
                                cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors"
                    >
                        Cadastrar
                    </button>
                </div>
            </form>
            
            <Footer/>
        </main>
    );
}