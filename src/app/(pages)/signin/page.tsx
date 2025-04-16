'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation"
import {toast, Toaster} from "sonner"


export default function Signin(){
    const router = useRouter();

    const [visibleFirst, setVisibleFirst] = useState<boolean>(false);
    const [visibleSecond, setVisibleSecond] = useState<boolean>(false);

    //  TODO:
    //      Implementar back-end do cadastro

    return(
        <main className="
            flex flex-col justify-between items-center
            w-screen
            h-screen
            bg-pink-fcsn">
            
            <Toaster richColors closeButton/>

            <form
                className="
                    flex flex-col justify-center
                    xl:w-[1100px] md:w-6/7 w-4/5
                    h-2/3
                    bg-white-off
                    rounded-md
                    shadow-blue-fcsn shadow-md"
                onSubmit={(event) => event.preventDefault()}>
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
                    >Fazer Cadastro</div>

                </div>

                {/*INPUTS*/}
                <div className="
                    flex flex-col items-center
                    h-full">
                    
                    {/* INPUT DE NOME */}
                    <div className="
                        flex flex-col justify-around
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6
                        h-1/3">
                        
                        <label className="
                            h-1/6
                            text-lg text-blue-fcsn font-bold"
                        >Nome</label>                        
                        
                        <input
                            type="text"
                            className="
                                w-full
                                h-4/7
                                bg-white
                                rounded-xl
                                border-1 border-blue-fcsn
                                transition-all duration-300
                                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                px-3"/>
                    </div>



                    {/* INPUT DE EMAIL */}
                    <div className="
                        flex flex-col justify-around
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6
                        h-1/3">
                        
                        <label className="
                            h-1/6
                            text-lg text-blue-fcsn font-bold"
                        >Email</label>                        
                        
                        <input
                            type="email"
                            className="
                                w-full
                                h-4/7
                                bg-white
                                rounded-xl
                                border-1 border-blue-fcsn
                                transition-all duration-300
                                focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                px-3"/>
                    </div>
                     
                    <div className="
                        flex flex-row justify-between
                        xl:w-2/3 lg:w-3/4 md:w-4/5 w-5/6
                        h-1/3">


                        {/* PRIMEIRA SENHA */}
                        <div className="
                            w-11/24
                            h-full">

                            <label className="
                                h-1/6
                                text-lg text-blue-fcsn font-bold"
                            >Senha</label>
                            
                            <div className="
                                w-full 
                                h-4/7 
                                relative">

                                <input 
                                    type={visibleFirst ? "text" : "password"}
                                    className="
                                    h-full
                                    w-full
                                    bg-white
                                    rounded-xl
                                    border-1 border-blue-fcsn
                                    transition-all duration-300
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                    px-3"/>
                                
                                <button
                                    className="
                                        absolute
                                        text-gray-400
                                        cursor-pointer
                                        right-1/24
                                        bottom-1/2
                                        translate-y-1/2"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        //impede que o botão submeta o forms
                                        setVisibleFirst(prev => !prev);
                                    }}>
                                        {visibleFirst ? <Eye/> : <EyeOff/>}
                                    </button>
                            </div>
                        </div>

                        {/* SEGUNDA SENHA */}
                        <div className="
                            w-11/24
                            h-full">

                            <label className="
                                h-1/6
                                text-lg text-blue-fcsn font-bold"
                            >Confirme a senha</label>
                            
                            <div className="
                                w-full 
                                h-4/7 
                                relative">

                                <input 
                                    type={visibleFirst ? "text" : "password"}
                                    className="
                                    h-full
                                    w-full
                                    bg-white
                                    rounded-xl
                                    border-1 border-blue-fcsn
                                    transition-all duration-300
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn
                                    px-3"/>
                                
                                <button
                                    className="
                                        absolute
                                        text-gray-400
                                        cursor-pointer
                                        right-1/24
                                        bottom-1/2
                                        translate-y-1/2"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        //impede que o botão submeta o forms
                                        setVisibleFirst(prev => !prev);
                                    }}>
                                        {visibleFirst ? <Eye/> : <EyeOff/>}
                                    </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="
                    flex flex-row justify-center
                    h-1/12">
                    <h1>Já tem uma conta?</h1>
                    <button
                        onClick={ () => router.push("./login")}
                        className="
                        text-pink-fcsn
                        mx-1
                        underline
                        cursor-pointer"
                    >Faça o seu login.</button>
                </div>

                {/* botao de entrar */}
                <div className="
                    flex flex-row justify-center items-center
                    h-1/3">
                    <button
                        type="submit"
                        className="
                            w-[250px]
                            h-[55px]
                            bg-blue-fcsn
                            rounded-xl
                            text-white text-2xl font-bold
                            cursor-pointer"
                        >Cadastrar</button>
                </div>
            </form>
            
            <Footer></Footer>
        </main>
    );
}