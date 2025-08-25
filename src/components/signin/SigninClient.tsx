'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState} from "react";
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { registrarUsuario} from "@/app/actions/signin";
import { signinSchema } from "@/lib/schemas";

type FormFields = z.infer<typeof signinSchema>;

export default function SigninClient(){
    const router = useRouter();
    const [visibleFirst, setVisibleFirst] = useState(false);
    const [visibleSecond, setVisibleSecond] = useState(false);
    const { darkMode } = useTheme();
    const [loadingAuth, setLoadingAuth] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(signinSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
     });


    const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setLoadingAuth(true);
    try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result = await registrarUsuario(formData);

        if (!result.success) {
            toast.error(result.error || "Erro ao registrar.");
            console.error("Código do erro Firebase:", result.firebaseErrorCode);
            return
        }

        toast.success("Cadastro realizado com sucesso! Verifique seu e-mail.");
        setTimeout(() => {
        router.push("/login");
        }, 5000);
    } catch (err) {
        console.error("Erro inesperado:", err);
        toast.error("Erro inesperado. Tente novamente.");
    } finally {
        setLoadingAuth(false);
    }
    };

    return(
        <main className="flex flex-col justify-between items-center w-screen h-auto bg-pink-fcsn dark:bg-blue-fcsn overflow-auto">
            <Toaster richColors closeButton/>

            <form
                className="flex flex-col items-center justify-between w-full max-w-[1100px]
                        h-auto min-h-[600px] my-4 md:my-8 py-6
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
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn dark:focus:bg-blue-fcsn3"
                        />
                        <div className="min-h-[24px] mt-1">
                            {errors.name && (
                                <p className="text-red-600 dark:text-red-500 text-base">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
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
                                    focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn dark:focus:bg-blue-fcsn3"
                        />
                        <div className="min-h-[24px] mt-1">
                            {errors.email && (
                                <p className="text-red-600 dark:text-red-500 text-base">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
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
                                            focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn dark:focus:bg-blue-fcsn3"
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
                            <div className="h-6 mt-1">
                                {errors.password && (
                                    <p className="text-red-600 dark:text-red-500 text-base mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
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
                            <div className="h-6 mt-1">
                                {errors.confirmPassword && (
                                    <p className="text-red-600 dark:text-red-500 text-base mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex flex-row justify-center items-center text-sm md:text-base mt-12">
                    <span>Já tem uma conta?</span>
                    <button
                        onClick={(e) => {
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