"use client";
import { useRouter } from "next/navigation";

export default function Footer(){
    const router = useRouter();

    return(
        <footer className="
            flex flex-row justify-between items-center
            w-screen
            h-[16vh]
            bg-blue-fcsn
            text-white-off">
                
            <div className="
                flex flex-col justify-center items-center
                w-1/2">

                <div className="
                    flex flex-col items-start">

                    <button
                        onClick={() => router.push("./politica-de-privacidade")}
                        className="
                            underline
                            cursor-pointer"
                        >Políticas de privacidade</button>
                    
                    <button
                        className="
                            underline
                            cursor-pointer"
                        >Termos e condições</button>
                    
                    <h1>© 2025 Fundação CSN. Todos os diretos reservados.</h1>
                    
                    <div className="
                        flex flex-row">
                        <h1>Site desenvolvido pela</h1>
                        <a
                            href="https://www.conpec.com.br/"
                            target="_blank"
                            // abrir em outra aba
                            rel="noopener noreferrer"
                            className="
                                cursor-pointer
                                underline   
                                mx-1"
                            >Conpec</a>
                    </div>
                </div>
            </div>

            <div className="
                flex flex-col justify-center items-center
                w-1/2
                h-full">
                
                <div className="
                    flex flex-col items-start">
                    <h1 className="
                        font-bold"
                    >Contato</h1>
                    
                    <h1>(xx) xxxxx-xxxx</h1>
                    <h1>contato@email.com</h1>
                </div>
            </div>
        </footer>
    );
}