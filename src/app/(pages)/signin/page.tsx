'use client'
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTheme } from "@/context/themeContext";
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { auth } from "@/firebase/firebase-config";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { Associacao, Projetos, usuarioInt, usuarioExt } from "@/firebase/schema/entities";
import { FirebaseError } from "firebase/app";

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
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.email && user.emailVerified) {
                const emailDomain = user.email.split('@')[1];

                if (emailDomain === "conpec.com.br") {
                    router.push("/")
                } else {
                    router.push("inicio-externo")
                }

            } else {
                console.log("E-mail não verificado, bloqueando acesso.");
            }
        } else {
            setIsCheckingUser(false);
        }});

      return () => unsubscribe();
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

    async function projetoValido(email: string): Promise<{ valido: boolean, projetosIDs: string[] }> {
        const emailDomain = email.split('@')[1];

        if (emailDomain === "conpec.com.br" || emailDomain === "csn.com.br" || emailDomain === "fundacaocsn.org.br") {
            return { valido: true, projetosIDs: [] };
        }

        const formsRef = collection(db, "forms-cadastro");
        const qForms = query(formsRef, where("emailResponsavel", "==", email));
        const formsSnapshot = await getDocs(qForms);

        if (formsSnapshot.empty) {
            toast.error("Não encontramos nenhum projeto cadastro no sistema associado a esse e-mail.");
            return { valido: false, projetosIDs: [] };
        }

        const ProjetosIDs: string[] = [];
        let hasProjetoAprovado = false;

        for (const docCadastro of formsSnapshot.docs) {
            const idCadastro = docCadastro.id;
            const projetoRef = collection(db, "projetos");
            const qProjeto = query(projetoRef, where("ultimoFormulario", "==", idCadastro));
            const snapshotProjeto = await getDocs(qProjeto);

            if (!snapshotProjeto.empty) {
                snapshotProjeto.forEach(projDoc => {
                    const projetoData = projDoc.data() as Projetos;
                    if (projetoData.status === "aprovado") { 
                        hasProjetoAprovado = true;
                    }
                    if (!ProjetosIDs.includes(projDoc.id)) {
                        ProjetosIDs.push(projDoc.id);
                    }
                });
            }
        }
        if (!hasProjetoAprovado) {
            toast.error("Não é possível cadastrar esse usuário pois não há nenhum projeto aprovado associado a este e-mail.");
            return { valido: false, projetosIDs: [] };
        }
        return { valido: true, projetosIDs: ProjetosIDs };
    }


    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setLoadingAuth(true);

        try {
            const { valido, projetosIDs } = await projetoValido(data.email);

            if (!valido) {
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // Manda o e-mail de verificação
            await sendEmailVerification(user);
            toast.success("E-mail de verificação enviado. Verifique sua caixa de entrada para terminar o cadastro!");

            // Lógica para criar o documento na coleção 'usuarioInt' ou 'usuarioExt'
            const emailDomain = data.email.split('@')[1];

            if (emailDomain === "conpec.com.br" || emailDomain === "csn.com.br" || emailDomain === "fundacaocsn.org.br") {
                const newUserInt: usuarioInt = {
                    nome: data.name,
                    email: data.email,
                    administrador: false,
                };
                await setDoc(doc(db, "usuarioInt", user.uid), newUserInt);
                // Se for uusuário interno ele não cria o documento em 'associacao'
            } else {
                const newUserExt: usuarioExt = {
                    nome: data.name,
                    email: data.email,
                };
                await setDoc(doc(db, "usuarioExt", user.uid), newUserExt);

                // Cria ou atualiza o documento da coleção 'associacao' para usuários externos
                const associacaoRef = collection(db, "associacao");
                const q = query(associacaoRef, where("usuarioID", "==", user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const existingDocRef = querySnapshot.docs[0].ref;
                    await updateDoc(existingDocRef, {
                        projetosIDs: arrayUnion(...projetosIDs)
                    });
                } else {
                    const newAssociacaoDoc: Associacao = {
                        usuarioID: user.uid,
                        projetosIDs: projetosIDs
                    };
                    await addDoc(collection(db, "associacao"), newAssociacaoDoc);
                }
            }

            // Desloga o usuário após o cadastro
            await signOut(auth); 

            setTimeout(() => {
                router.push("./login");
            }, 6000);

        } catch (error) {
            const firebaseError = error as FirebaseError;
            console.error("Erro no cadastro:", firebaseError);

            if (firebaseError.code === 'auth/email-already-in-use') {
                toast.error('Este e-mail já está em uso.');
            } else if (firebaseError.code === 'auth/invalid-email') {
                toast.error('Formato de e-mail inválido.');
            } else if (firebaseError.code === 'auth/weak-password') {
                toast.error('A senha é muito fraca. Por favor, insira uma senha mais forte.');
            } else {
                toast.error('Erro ao criar conta. Tente novamente. Se o problema persistir, entre em contato.');
            }
            
        } finally {
            setLoadingAuth(false);
        }
    };


    if (isCheckingUser){
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