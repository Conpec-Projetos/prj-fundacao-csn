import Footer from "@/components/footer/footer";
import CadastroForm from "@/components/forms/CadastroForm";
import { getCurrentUser } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function FormsCadastroPage() {
    // Verificação de autenticação no lado do servidor
    const user = await getCurrentUser();

    // O ID do usuário agora vem do token decodificado
    const usuarioAtualID = (user && user.email_verified)? user.uid : null;

    return (
        <main className="flex flex-col justify-between items-center w-screen min-h-screen">
            <div className="flex flex-col items-center justify-center w-full py-12 text-blue-fcsn dark:text-white-off">
                <h1 className="text-center text-blue-fcsn dark:text-white-off w-[90vw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                    Inscrição de Projeto
                </h1>
            </div>
            
            <CadastroForm usuarioAtualID={usuarioAtualID}/>

            <Toaster richColors closeButton />
            <Footer/>
        </main>
    );
}