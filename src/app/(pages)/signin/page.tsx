'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react"; // Adicionado useEffect
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { auth } from "@/firebase/firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getUserIdFromLocalStorage } from "@/lib/utils"; // Importar a função

const schema = z.object({
    name: z.string().min(1, {message: "Nome inválido!"}),
    email: z.string().email({message: "Email inválido!"}).min(1),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas e minúsculas e números."}),
    confirmPassword: z.string().min(1, {message: "Confirmação de senha inválida!"})}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "As senhas não coincidem.",
            path: ["confirmPassword"],
        });
    }
});

type FormFields = z.infer<typeof schema>;

export default function Signin(){
    const router = useRouter();
    const [visibleFirst, setVisibleFirst] = useState(false);
    const [visibleSecond, setVisibleSecond] = useState(false);
    const { darkMode } = useTheme();
    const [loadingAuth, setLoadingAuth] = useState(false); // Renomeado para evitar conflito com o loading do form
    const [isCheckingUser, setIsCheckingUser] = useState(true); // Estado para verificar o login

    useEffect(() => {
        const userId = getUserIdFromLocalStorage();
        if (userId) {
            // Se o usuário já está logado, redireciona para a home
            router.push("/");
        } else {
            // Se não está logado, permite que a página de signin seja renderizada
            setIsCheckingUser(false);
        }
    }, [router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
     });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setLoadingAuth(true); // Inicia o loading do processo de autenticação
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = {...userCredential.user, timeout: Date.now() + (1000 * 60 * 60 * 12)}; // Desloga automaticamente depois de 12 horas
            
            if(user){
                localStorage.setItem('user', JSON.stringify(user));
                // Guarda o id do usuário no cache para facilitar o acesso na hora de enviar formulários
                router.push("/");
            }
            // auth está em firebase-config.ts
        } 
        catch (error: any) { // Adicionar tipo para error
            // Tratar erros específicos do Firebase aqui, se necessário
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Este e-mail já está em uso.');
            } else {
                toast.error('Erro ao criar conta. Tente novamente.');
            }
            console.error("Erro no cadastro:", error);
        }
        finally {
            setLoadingAuth(false); // Finaliza o loading do processo de autenticação
        }
    };

    if (isCheckingUser) {
        return <div className="flex justify-center items-center min-h-screen">Verificando sessão...</div>
    }

    return(
        <main className="flex flex-col justify-between items-center w-screen h-auto bg-pink-fcsn dark:bg-blue-fcsn overflow-auto">
            <Toaster richColors closeButton/>

            <form
                className="flex flex-col items-center justify-between w-full max-w-[1100px] 
                        h-auto min-h-[600px] my-4 md:my-8
                        bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md
                        p-4 md:p-8"
                onSubmit={handleSubmit(onSubmit)}>
                
                {/* Logo */}
                <div className="flex flex-col h-auto justify-center items-center py-4">
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
                {/* Mostra um erro por vez */}
                {(() => {
                    const firstError =
                        errors.name?.message ||
                        errors.email?.message ||
                        errors.password?.message ||
                        errors.confirmPassword?.message;
                    return firstError ? (
                        <div className="w-fit h-fit flex text-red-600 dark:text-zinc-50 text-lg bg-red-100 dark:bg-red-fcsn text-center items-center rounded-lg p-2 mb-3">{firstError}</div>
                    ) : null;
                })()}

                {/* Inputs */}
                <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full">
                    {/* Input do nome */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-blue-fcsn dark:text-white-off font-bold text-base md:text-lg">
                            Nome
                        </label>                        
                        <input
                            type="text"
                            {...register("name")}
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
                            {...register("email")}
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
                                    {...register("password")}
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
                                    {...register("confirmPassword")}
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
                        onClick={(e) => { // Adicionar 'e' e prevenir default se necessário
                            e.preventDefault();
                            router.push("./login");
                        }}
                        className="text-pink-fcsn dark:text-pink-light hover:text-[#A25D80] hover:dark:text-pink-light2 mx-1 underline cursor-pointer"
                    >
                        Faça o seu login.
                    </button>
                </div>

                <div className="flex justify-center w-full items-center py-6">
                    <button
                        type="submit"
                        disabled={loadingAuth}
                        className="w-full max-w-[250px] h-12 md:h-14
                                bg-blue-fcsn rounded-xl
                                text-white text-lg md:text-xl font-bold
                                cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors
                                disabled:opacity-60"
                    >
                        {loadingAuth ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </div>
            </form>
            
            <Footer/>
        </main>
    );
}