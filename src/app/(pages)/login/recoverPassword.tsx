import { useTheme } from "@/context/themeContext";
import { auth } from "@/firebase/firebase-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod"
import darkLogo from "@/assets/fcsn-logo-dark.svg"
import logo from "@/assets/fcsn-logo.svg"
import Image from "next/image";

const schema = z.object({
    email: z.string().email({message: "Email inválido!"}).min(1),
    // como uma classe. Primeiro o nome do atributo e depois seu tipo
    // coloque () depois do tipo e qualquer comando depois dele determina
    // as condições que ele deve ter para ser válido.
    });

type FormFields = z.infer<typeof schema>;

export default function RecoverPassword({ onBack }: { onBack: () => void }) {
    const { darkMode } = useTheme();

    const {
        register,
        handleSubmit,
        formState: {  isSubmitting, errors},
    } = useForm<FormFields>({ resolver: zodResolver(schema),
                defaultValues: {
                email: ""
            },
            mode: "onChange" // atualizara valores conforme cada caractere digitado, o que permite que mensagens de erro nao sejam exibidas só ao enviar o form
         });
    // declara o formulário

    const sendEmailRecover: SubmitHandler<FormFields> = async ({ email }) => {
        try {


            await sendPasswordResetEmail(auth, email);
                toast.success("Se este email estiver cadastrado, você receberá um link para redefinir sua senha ");
                // Nunca é apresentado erro, pois o firebase não revela se um email está cadastrado ou não por motivos de segurança 
            // Espera um pouco e volta para login
            setTimeout(() => {
              onBack(); // volta para tela de login
            }, 4000); // 2 segundos

            return "";
        } catch (erro: any) {
            toast.error('Email incorreto');
        }
    };


    return (
        <main className="flex flex-col justify-between items-center h-screen w-screen bg-pink-fcsn dark:bg-blue-fcsn overflow-auto">
            <Toaster richColors closeButton/>
            <form
            onSubmit={handleSubmit(sendEmailRecover)}
            className="flex flex-col gap-12 items-center w-full max-w-[1100px] h-auto min-h-[600px] my-18 py-8 bg-white-off dark:bg-blue-fcsn2 rounded-md shadow-blue-fcsn shadow-md">
                <div className="flex flex-col justify-center items-center h-[200px] md:h-[250px] gap-6">
                    <Image
                        src={ darkMode ? darkLogo : logo}
                        alt="csn-logo"
                        width={600}
                        className=""
                        priority
                    />
                    {/*logo Fundação CSN*/}
                    <div className="text-blue-fcsn dark:text-white-off font-bold text-2xl sm:text-3xl md:text-4xl mt-2">Vamos recuperar sua senha!</div>
                </div>
                    {/* INPUT DE EMAIL */}
                <div className="w-full max-w-[600px]">
                        <label className="text-lg text-blue-fcsn dark:text-white-off font-bold mb-2">
                            Digite o email cadastrado:
                        </label>
                        
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full h-12 md:h-14 bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn transition-all duration-300 focus:shadow-lg focus:outline-none focus:border-2 focus:border-blue-fcsn px-4"
                        />
                    <div className="min-h-[24px] mt-1">
                        {errors.email && (
                            <p className="text-red-600 dark:text-zinc-50 text-base  mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>

                    <div className="flex flex-row gap-16">
                        <button 
                            onClick={onBack}
                            className="w-56 max-w-[250px] h-12 md:h-14 bg-pink-fcsn rounded-xl text-white text-lg md:text-xl font-bold cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors">
                                Voltar para login
                        </button>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-56 max-w-[250px] h-12 md:h-14 bg-blue-fcsn rounded-xl text-white text-lg md:text-xl font-bold cursor-pointer hover:bg-blue-fcsn2 dark:hover:bg-[#202037] transition-colors">
                            {isSubmitting ? "Enviando..." : "Recuperar Senha"}
                        </button>
                    </div>


                </form>
        
        </main>
    );
}