"use client";
import { useRouter } from "next/navigation";


export default function Header(){
    const router = useRouter();
    return(
    <header
        className="flex flex-col justify-center w-screen h-[10vh] bg-blue-fcsn">
        
        <div className="flex flex-row justify-evenly w-[85%] text-xl sm:w-3/4 lg:w-1/2 lg:text-2xl text-white font-bold">
            
            <button
                onClick={(event) => {
                    event.preventDefault();
                    router.push("/")
                }}
                
                className="
                    cursor-pointer">Início</button> 
                
            <div className="h-[4vh] w-px bg-gray-300"></div>

            <button
                className="
                    cursor-pointer">Dashboard</button>
            
            <div className="h-[4vh] w-px bg-gray-300"></div>

            <button className="
                cursor-pointer">Projetos</button>
        </div>
    </header>
    );
}