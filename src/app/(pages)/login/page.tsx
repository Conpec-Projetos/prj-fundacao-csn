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
        <main className="
            flex flex-col justify-between items-center
            w-screen
            h-screen
            bg-pink-fcsn">

            <Toaster richColors closeButton/>
    
            <form
            onSubmit={handleSubmit(onSubmit)}
            className="
                flex flex-col justify-start items-center
                xl:w-[1100px] md:w-6/7 w-4/5
                h-2/3
                bg-white-off
                rounded-md 
                shadow-blue-fcsn shadow-md">
                {/*Quadrado branco*/}

                <div className="
                    flex flex-col justify-center items-center
                    h-1/3">
    
                    <Image
                        src={ logo }
                        alt="csn-logo"
                        className="
                            h-[300px]"></Image>
                    {/*logo Fundação CSN*/}

                    <div className="
                        flex flex-row justify-center items-center
                        h-1/4
                        text-blue-fcsn font-bold text-4xl"
                    >Fazer Login</div>

                </div>

                {/*INPUTS*/}
                <div className="
                    flex flex-col items-center
                    w-full
                    h-1/3">

                    {/* INPUT DE EMAIL */}
                    <div className="
                        flex flex-col justify-around
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6
                        h-1/2">

                        <label className="
                            h-1/6
                            text-lg text-blue-fcsn font-bold"
                        >Email</label>
                        
                        <input
                            type="email"
                            {...register('email')}
                            className="
                                w-full
                                h-4/7
                                bg-white
                                rounded-xl border-1 border-blue-fcsn
                                transition-all duration-300
                                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                px-3"/>
                    </div>
                    

                    {/* INPUT DE SENHA */}
                    <div className="
                        flex flex-col justify-around
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6
                        h-1/2">

                        <label className="
                            h-1/6
                            text-lg text-blue-fcsn font-bold"
                        >Senha</label>
                        
                        <div className="
                            h-4/7
                            w-full
                            relative">
                            <input
                                type={visible ? "text" : "password"}
                                {...register('password')}
                                className="
                                    w-full
                                    h-full
                                    bg-white
                                    rounded-xl border-1 border-blue-fcsn
                                    transition-all duration-300
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                    px-3"/>
                            <button
                                className="
                                    zabsolute
                                    cursor-pointer
                                    text-gray-400
                                    right-1/24
                                    bottom-1/2
                                    translate-y-1/2" 
                                
                                onClick={(event) => {
                                    event.preventDefault();
                                    setVisible(prev => !prev);
                                }}>
                                    {visible ? <Eye/> : <EyeOff/>}
                            </button>
                        </div>
                    </div>


                    <div className="
                        flex flex-row justify-between
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6">

                        <div className="
                            flex flex-row justify-start
                            w-2/3">

                            <h1 className="
                                text-blue-fcsn"
                            >Ainda não tem uma conta?</h1>
                            
                            <button
                                onClick={(event) => {
                                    event.preventDefault();
                                    router.push("./signin");
                                }}
                                className="
                                    mx-1
                                    underline
                                    cursor-pointer
                                    text-pink-fcsn"
                                >Cadastre-se aqui.</button>
                        </div>

                        <button
                            className="
                                underline
                                cursor-pointer
                                text-pink-fcsn"
                            >Esqueceu a senha?</button>
                        {/* TODO: IMPLEMENTAR ESQUECEU A SENHA */}
                    </div>
                </div>

                <div className="
                    flex justify-center items-center
                    w-full
                    h-1/3">
                    {/* botao de entrar */}
                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="
                            w-[250px]
                            h-[55px]
                            bg-blue-fcsn
                            rounded-xl
                            text-white text-2xl font-bold
                            cursor-pointer">
                        {isSubmitting ? "Carregando..." : "Entrar"}
                    </button>
                </div>
                
            </form>

            <Footer></Footer>
        </main>
    );
}