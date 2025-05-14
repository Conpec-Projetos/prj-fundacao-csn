'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

export default function Signin(){
    const router = useRouter();
    const [visibleFirst, setVisibleFirst] = useState(false);
    const [visibleSecond, setVisibleSecond] = useState(false);
    const { darkMode } = useTheme()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(""); // Limpa a mensagem de erro anterior
        // Verifica se os campos estão preenchidos
        if (!name || !email || !password || !confirmPassword) {
            setFormError("Preencha todos os campos.");
            return;
        }
        // Verifica se as senhas são iguais
        if (password !== confirmPassword) {
            setFormError("As senhas não coincidem.");
            return;
        }
        setLoading(true);
        const auth = getAuth();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success("Conta criada com sucesso!");
            router.push("/");
        } catch (error: any) {
            let message = "Erro ao criar conta.";
            if (error.code === "auth/email-already-in-use") {
                message = "Este email já está em uso.";
                toast.error(message);
            } else if (error.code === "auth/invalid-email") {
                message = "Email inválido.";
                setFormError(message);
                return;
            } else if (error.code === "auth/weak-password") {
                message = "A senha deve ter pelo menos 6 caracteres.";
                toast.error(message);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return(
        <main className="flex flex-col justify-between items-center w-screen min-h-screen bg-pink-fcsn dark:bg-blue-fcsn">
            <Toaster richColors closeButton/>

            <form
                className="flex flex-col items-center justify-between w-full max-w-[1100px] 
                        h-auto min-h-[600px] my-4 md:my-8
                        bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md
                        p-4 md:p-8"
                onSubmit={handleSubmit}>
                
                {/* Logo */}
                <div className="flex flex-col justify-center items-center h-auto py-4">
                    <Image
                        src={darkMode ? darkLogo : logo}
                        alt="csn-logo"
                        width={600}
                        className=""
                        priority
                    />
                    <h1 className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-4xl mt-4">
                        Fazer cadastro
                    </h1>
                </div>

                {/* Error message */}
                {formError && (
                    <div className="w-full max-w-[300px] flex justify-center items-center bg-red-100 dark:bg-red-fcsn rounded-md mb-2">
                        <span className="text-red-600 dark:text-red-100 font-semibold">{formError}</span>
                    </div>
                )}

                {/* Inputs */}
                <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full">
                    {/* Input do nome */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                            Nome
                        </label>                        
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
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
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
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
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
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

                <div className="flex justify-center w-full items-center py-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full max-w-[250px] h-12 md:h-14
                                bg-blue-fcsn rounded-xl
                                text-white text-lg md:text-xl font-bold
                                cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors
                                disabled:opacity-60"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
            
            <Footer/>
        </main>
    );
}