'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState} from "react"; // Adicionado useEffect
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import RecoverPassword from "./recoverPassword";
import { login } from "@/app/actions/login";

// zod é uma biblioteca para validar parâmetros, no caso o schema
const schema = z.object({
    email: z.string().email({message: "Email inválido!"}).min(1),
    // Verifica se possui estrutura de email
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas e minúsculas e números."}),
    // verifica se possui a estrutura de senha definida com regex
    });

type FormFields = z.infer<typeof schema>;
// define que o forms tem o tipo schema, declarado anteriormente

export default function LoginClient() {
    const router = useRouter();
    const { darkMode } = useTheme();
    const [visible, setVisible] = useState<boolean>(false);
    const [recoverPassword, setRecoverPassword] = useState(false);

    const {register,handleSubmit,formState: {  isSubmitting, errors },} = useForm<FormFields>({ resolver: zodResolver(schema),
            defaultValues: {
            email: "",
            password: ""
        },
        mode: "onChange" // atualizara valores conforme cada caractere digitado, o que permite que mensagens de erro nao sejam exibidas só ao enviar o form
     });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const result = await login(data.email, data.password);
            if (!result.success) {
                if (result.firebaseErrorCode === "email-nao-verificado") {
                    toast.error("Por favor, verifique seu e-mail antes de fazer login.");
                } else {
                    toast.error(result.error);
                }
                return;
            }
            
            if (!result.idToken || !result.user) {
                toast.error("Erro ao autenticar usuário.");
                return;
            }

            // Envia o idToken para a rota que tenta criar o cookie (pode ou não precisar renovar o token)
            const res1 = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify({ idToken: result.idToken }),
            });

            const sessionResponse = await res1.json();

            // Se precisar renovar o token com os claims atualizados (usamos claim para saber se o user é ADM e/ou interno ou externo)
            if (sessionResponse.mustRefreshToken) {
                if (!result.user) {
                    toast.error("Usuário não encontrado para renovar token.");
                    return;
                }
        
                // Aguarda um pouco para o Firebase aplicar as claims
                await new Promise((res) => setTimeout(res, 500));
                const newToken = await result.user.getIdToken(true); // ← já usa o próprio user

                // Segunda tentativa de criar o cookie, agora com o token atualizado com a claim
                const res2 = await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: newToken }),
                });

                if (!res2.ok) {
                    toast.error("Erro ao criar sessão após atualização.");
                    return;
                }
            } else {
                // Se não precisar renovar o token (pois a alteracao da claim é apenas necessaria no primeiro login), mas a resposta original falhou
                if (!res1.ok) {
                    toast.error("Erro ao criar sessão de autenticação.");
                    return;
                }
            }
            console.log("Redirecionando para:", result.redirectTo);
            router.push(result.redirectTo);

        } catch (error: any) {
            console.error("Erro inesperado:", error.message, error.stack, error);
            toast.error("Erro inesperado: " + (error?.message || "Erro desconhecido"));
        }

    }
    // Renderiza o componente de recuperar senha
    if (recoverPassword) {
        return <RecoverPassword onBack={() => setRecoverPassword(false)}/>
    }
    
    return (
        <main className="flex flex-col justify-between items-center h-screen w-screen bg-pink-fcsn dark:bg-blue-fcsn overflow-auto">
            <Toaster richColors closeButton/> {/* Usado para mostrar mensagens ao usuario de uma forma pratica*/}
    
            <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-between w-full max-w-[1100px] h-auto min-h-[600px] my-4 md:my-8 py-6 bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md">
                {/*Quadrado branco*/}

                <div className="flex flex-col justify-center items-center h-[200px] md:h-[250px] gap-6">
                    <Image
                        src={ darkMode ? darkLogo : logo}
                        alt="csn-logo"
                        width={600}
                        className=""
                        priority
                    />
                    {/*logo Fundação CSN*/}

                    <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-4">
                        Fazer Login
                    </div>
                </div>
    
                {/*INPUTS*/}
                <div className="flex flex-col items-center w-full space-y-4 md:space-y-6 px-4 md:px-8">

                    {/* INPUT DE EMAIL */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-lg text-blue-fcsn dark:text-white-off font-bold mb-2">
                            Email
                        </label>
                        
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full h-12 md:h-14 bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn transition-all duration-300 focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-4"
                        />
                        {/* Se possuir erro exibiremos uma mensagem abaixo do input, div className="min-h-[24px] (define um espaço para a mensagem de erro e impede que o conteudo "pule" ao exibir a mensagem*/}
                    <div className="min-h-[24px] mt-1">
                        {errors.email && (
                            <p className="text-red-600 dark:text-red-500 text-base">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>
                    

                    {/* INPUT DE SENHA */}
                    <div className="w-full max-w-[600px]">
                        <label className="text-lg text-blue-fcsn dark:text-white-off font-bold mb-2">
                            Senha
                        </label>
                        
                        <div className="relative w-full">
                            <input
                                type={visible ? "text" : "password"}
                                {...register('password')}
                                className="w-full h-12 md:h-14 bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn transition-all duration-300 focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-4 pr-10"
                            />
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"

                                onClick={(event) => {
                                    event.preventDefault();
                                    setVisible(prev => !prev);
                                }}>
                                    {visible ? <Eye size={20}/> : <EyeOff size={20}/>}
                            </button>
                        </div>
                        {/* Se possuir erro exibiremos uma mensagem abaixo do input */}
                            <div className="h-6 mt-1 mb-2">
                                {errors.password && (
                                    <p className="text-red-600 dark:text-red-500 text-base mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                    </div>


                    <div className="flex flex-col sm:flex-row justify-between w-full max-w-[600px] gap-4">
                        <div className="flex items-center">
                            <h1>Ainda não tem uma conta?</h1>
                            
                            <button
                                onClick={(event) => {
                                    event.preventDefault();
                                    router.push("/signin");
                                }}
                                className="text-pink-fcsn dark:text-pink-light hover:text-[#A25D80] hover:dark:text-pink-light2 mx-1 underline cursor-pointer"
                                >Cadastre-se aqui.</button>
                        </div>

                        <button
                            onClick={() => setRecoverPassword(true)}
                            className="text-pink-fcsn dark:text-pink-light hover:text-[#A25D80] hover:dark:text-pink-light2 mx-1 underline cursor-pointer"
                            >Esqueceu a senha?</button>
                    </div>
                </div>

                <div className="flex justify-center items-center w-full py-8">
                    {/* botao de entrar */}
                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full max-w-[250px] h-12 md:h-14 bg-blue-fcsn rounded-xl text-white text-lg md:text-xl font-bold cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors">
                        {isSubmitting ? "Carregando..." : "Entrar"}
                    </button>
                </div>
            </form>

            <Footer/>
        </main>
    );
}