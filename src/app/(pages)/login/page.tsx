'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react"; // Adicionado useEffect
import { auth } from "@/firebase/firebase-config"
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import RecoverPassword from "./recoverPassword";
import { FirebaseError } from "firebase/app";

// zod é uma biblioteca para validar parâmetros, no caso o schema
const schema = z.object({
    email: z.string().email({message: "Email inválido!"}).min(1),
    // Verifica se possui estrutura de email
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas e minúsculas e números."}),
    // verifica se possui a estrutura de senha definida com regex
    });

type FormFields = z.infer<typeof schema>;
// define que o forms tem o tipo schema, declarado anteriormente

export default function Login() {
    const router = useRouter();
    const { darkMode } = useTheme();
    const [visible, setVisible] = useState<boolean>(false);
    const [recoverPassword, setRecoverPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.email && user.emailVerified) {
                const emailDomain = user.email.split('@')[1];

                // Se colocar o dominio da csn nao conseguirei testar, logo coloquei o da conpec
                if (emailDomain === "conpec.com.br") {
                    router.push("/")
                } else {
                    router.push("inicio-externo")
                }
                
            } else {
                console.log("E-mail não verificado, bloqueando acesso.");
                setIsLoading(false);
            }
        } else {
            // Se não está logado, permite que a página de login seja renderizada
            setIsLoading(false);
        }});

      return () => unsubscribe();
    }, [router]);

    const {
        register,
        handleSubmit,
        formState: {  isSubmitting, errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema),
            defaultValues: {
            email: "",
            password: ""
        },
        mode: "onChange" // atualizara valores conforme cada caractere digitado, o que permite que mensagens de erro nao sejam exibidas só ao enviar o form
     });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            const userVerification = userCredential.user;

                if (userVerification.email && userVerification.emailVerified) {
                    const idToken = await user.getIdToken();
                    const emailDomain = userVerification.email.split('@')[1];

                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                    // Se colocar o dominio da csn nao conseguirei testar, logo coloquei o da conpec
                    if (emailDomain === "conpec.com.br") {
                        router.push("/")
                    } else {
                        router.push("inicio-externo")
                    }
                    
                } else {
                    toast.error('Por favor, verifique seu e-mail antes de fazer login.');
                }
            }

        catch (error) {
            if (error instanceof FirebaseError) {
                console.error("Erro ao tentar fazer login:", error.code);

                switch (error.code) {
                    case 'auth/wrong-password':
                        toast.error('Email ou senha incorretos.');
                        break;
                    case 'auth/user-not-found':
                        toast.error('Usuário não encontrado.');
                        break;
                    case 'auth/too-many-requests':
                        toast.error('Muitas tentativas. Tente novamente mais tarde.');
                        break;
                    case 'auth/invalid-credential':
                        toast.error('Email ou senha incorretos.');
                        break;
                    default:
                        toast.error('Erro ao tentar fazer o login. Tente novamente.');
                        console.error(error);
                }
            } else {
            toast.error('Erro ao tentar fazer o login. Tente novamente.');
            console.error(error);
            }
        };
    }

    if (isLoading){
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center h-screen bg-white dark:bg-blue-fcsn2 dark:bg-opacity-80">
                <Image
                    src={darkMode ? darkLogo : logo}
                    alt="csn-logo"
                    width={600}
                    className=""
                    priority
                />
                <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-6 text-center">
                    Verificando sessão...
                </div>
            </div>
        );
    }

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
                                    router.push("./signin");
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