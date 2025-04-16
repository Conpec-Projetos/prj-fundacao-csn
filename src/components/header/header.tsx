import { useRouter } from "next/navigation";


export default function Header(){
    const router = useRouter();
    return(
    <header
        className="
            flex flex-col justify-center
            w-screen
            h-[10vh]
            bg-blue-fcsn">
        
        <div className="
            flex flex-row justify-evenly
            w-1/4
            text-white text-2xl font-bold">
            
            <button
                onClick={(event) => {
                    event.preventDefault();
                    router.push("/")
                }}
                
                className="
                    cursor-pointer">Início</button>
            <button
                className="
                    cursor-pointer">Dashboard</button>
            <button className="
                cursor-pointer">Projetos</button>
        </div>
    </header>
    );
}