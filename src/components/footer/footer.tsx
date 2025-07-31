"use client";
import { useRouter } from "next/navigation";

export default function Footer(){
    const router = useRouter();

    return(
        <footer className="flex flex-row justify-between items-center w-full h-[20vh] lg:h-[20vh] bg-blue-fcsn2 text-white-off sm:text-sm md:text-base lg:text-lg">
                
            <div className="flex flex-col justify-center items-center w-1/2 ">

                <div className="flex flex-col items-start ml-5">

                    <button onClick={() => router.push("./politica-de-privacidade")} className="underline cursor-pointer mb:pb-1 ">Políticas de privacidade</button>
                    
                    <button className="underline cursor-pointer md:pb-2">Termos e condições</button>
                    
                    <h1 className="">© 2025 Fundação CSN. Todos os diretos reservados.</h1>
                    
                    <div className="flex flex-row">
                        <h1 className="">Site desenvolvido pela</h1>
                        <a href="https://www.conpec.com.br/" target="_blank"
                            // abrir em outra aba
                            rel="noopener noreferrer" className="cursor-pointer underline mx-1 ">Conpec</a>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center w-1/2 h-full">
                
                <div className="flex flex-col items-start">
                    
                    <h1 className="font-bold">Contato</h1>
                    
                    <h1 className="">(xx) xxxxx-xxxx</h1>
                    
                    <h1 className="">contato@email.com</h1>
                </div>
            </div>
        </footer>
    );
}