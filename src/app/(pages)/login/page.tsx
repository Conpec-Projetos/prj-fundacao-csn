'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { auth } from "@/firebase/firebase-config"
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg"

// zod é uma biblioteca para validar parâmetros, no caso o schema
const schema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
    // como uma classe. Primeiro o nome do atributo e depois seu tipo
    // coloque () depois do tipo e qualquer comando depois dele determina
    // as condições que ele deve ter para ser válido.
    });

type FormFields = z.infer<typeof schema>;
// define que o forms tem o tipo schema, declarado anteriormente

export default function Login() {
    const router = useRouter();

    const { darkMode } = useTheme()

    const [visible, setVisible] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: {  isSubmitting },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });
    // declara o formulário

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = {...userCredential.user, timeout: Date.now() + (1000 * 60 * 60)};
            
            if(user){
                localStorage.setItem('user', JSON.stringify(user));
                // Guarda o id do usuário no cache para facilitar o acesso na hora de enviar formulários
                router.push("/");
            }
            // auth está em firebase-config.ts
        } 
        catch (error) {
            toast.error('Senha ou e-mail incorreto.');
        }
    };
    
    return (
        //classname="flex justify item h w color"
        <main className="flex flex-col justify-between items-center h-screen w-screen bg-pink-fcsn dark:bg-blue-fcsn overflow-auto">
            <Toaster richColors closeButton/>
    
            <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-between w-full max-w-[1100px] h-auto min-h-[600px] my-4 md:my-8 bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md">
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
                            className="text-pink-fcsn dark:text-pink-light hover:text-[#A25D80] hover:dark:text-pink-light2 mx-1 underline cursor-pointer"
                            >Esqueceu a senha?</button>
                        {/* TODO: IMPLEMENTAR ESQUECEU A SENHA */}
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