"use client";
import { useRouter } from "next/navigation";

export default function Footer(){
    const router = useRouter();

    return(
        <footer className="flex flex-row justify-between items-center w-full h-auto sm:h-[20vh] bg-blue-fcsn2 text-white-off text-xs sm:text-sm md:text-base lg:text-lg p-4">
                
            <div className="flex flex-col justify-center items-center w-4/5 md:w-1/2">

                <div className="flex flex-col items-start ml-5">

                    <button onClick={() => router.push("./politica-de-privacidade")} className="underline cursor-pointer mb:pb-1 ">Políticas de privacidade</button>
                    
                    <div className="flex flex-col sm:flex-row md:flex-row  lg:flex-row gap-2">
                    <h1 className="text-xs sm:text-sm md:text-base lg:text-lg">© 2025 Fundação CSN. </h1>
                    <h1 className="text-xs sm:text-sm md:text-base lg:text-lg">Todos os diretos reservados. </h1>
                    </div>

                    <div className="flex flex-row flex-wrap">
                        <h1 className="">Site desenvolvido pela</h1>
                        <a href="https://www.conpec.com.br/" target="_blank"
                            // abrir em outra aba
                            rel="noopener noreferrer" className="cursor-pointer underline">Conpec</a>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center w-1/2 h-full">
                
                <div className="flex flex-col items-start">
                    
                    <h1 className="font-bold">Contato</h1>
                    
                    <h1 className="">fundacao@csn.com.br</h1>
                </div>
            </div>
        </footer>
    );
}