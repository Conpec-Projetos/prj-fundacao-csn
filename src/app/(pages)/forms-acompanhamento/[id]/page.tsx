'use client';
import Image from "next/image";
import Footer from "@/components/footer/footer";
import logo from "@/assets/fcsn-logo.svg"
import darkLogo from "@/assets/fcsn-logo-dark.svg";
import { useTheme } from "@/context/themeContext";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import {
    NormalInput, 
    LongInput,
    NumberInput,
    HorizontalSelects,
    VerticalSelects,
    DateInputs,
    EstadoInput,
    LeiSelect,
    YesNoInput,
    FileInput,
    CidadeInput
    } from "@/components/inputs/inputs";
import { Toaster, toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, odsList, leiList, segmentoList, ambitoList } from "@/firebase/schema/entities";
import { getFileUrl, getOdsIds, getItemNome } from "@/lib/utils";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller, FieldError } from "react-hook-form";
import { State, City } from "country-state-city";

const MAX_FILE_SIZE_MB = 5;
const fileArraySchema = z.array(z.instanceof(File), {
        required_error: "O envio de fotos é obrigatório.",
    })
    .min(1, "É necessário enviar pelo menos uma foto.")
    .max(5, "Você pode enviar no máximo 5 fotos.")
    .refine(files => files.every(file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024), 
        `Tamanho máximo por arquivo é de ${MAX_FILE_SIZE_MB}MB.`);

const acompanhamentoSchema = z.object({
  instituicao: z.string().trim().min(1, "O nome da instituição é obrigatório."),
  descricao: z.string().trim().min(20, "A descrição deve ter no mínimo 20 caracteres."),
  segmento: z.coerce.number({ required_error: "A seleção do segmento é obrigatória." }).min(0, "A seleção do segmento é obrigatória."),
  lei: z.coerce.number({ required_error: "A seleção da lei é obrigatória." }).min(0, "A seleção da lei é obrigatória."),
  positivos: z.string().optional(),
  negativos: z.string().optional(),
  atencao: z.string().optional(),
  ambito: z.coerce.number({ required_error: "A seleção do âmbito é obrigatória." }).min(0, "A seleção do âmbito é obrigatória."),
  estados: z.array(z.string()).min(1, "Selecione pelo menos um estado."),
  municipios: z.array(z.string()).min(1, "Selecione pelo menos um município."),
  especificacoes: z.string().trim().min(1, "As especificações do território são obrigatórias."),
  dataComeco: z.string().min(1, "A data de início é obrigatória."),
  dataFim: z.string().min(1, "A data de fim é obrigatória."),
  contrapartidasProjeto: z.string().trim().min(10, "A descrição das contrapartidas é obrigatória."),
  beneficiariosDiretos: z.coerce.number({ invalid_type_error: "Número inválido" }).min(0, "O valor deve ser zero ou maior."),
  beneficiariosIndiretos: z.coerce.number({ invalid_type_error: "Número inválido" }).min(0, "O valor deve ser zero ou maior."),
  diversidade: z.string({ required_error: "A seleção é obrigatória." }),
  qtdAmarelas: z.coerce.number().min(0),
  qtdBrancas: z.coerce.number().min(0),
  qtdIndigenas: z.coerce.number().min(0),
  qtdPardas: z.coerce.number().min(0),
  qtdPretas: z.coerce.number().min(0),
  qtdMulherCis: z.coerce.number().min(0),
  qtdMulherTrans: z.coerce.number().min(0),
  qtdHomemCis: z.coerce.number().min(0),
  qtdHomemTrans: z.coerce.number().min(0),
  qtdNaoBinarios: z.coerce.number().min(0),
  qtdPCD: z.coerce.number().min(0),
  qtdLGBT: z.coerce.number().min(0),
  ods: z.array(z.boolean()).refine(val => val.filter(Boolean).length > 0, { message: "Selecione pelo menos uma ODS." }).refine(val => val.filter(Boolean).length <= 3, { message: "Selecione no máximo 3 ODSs." }),
  relato: z.string().optional(),
  fotos: fileArraySchema,
  website: z.string().trim().url({ message: "URL inválida." }),
  links: z.string().trim().min(1, "Insira pelo menos um link."),
  contrapartidasExecutadas: z.string().optional(),
}).refine(data => new Date(data.dataFim) > new Date(data.dataComeco), {
    message: "A data final deve ser posterior à data inicial.",
    path: ["dataFim"],
});

type FormFields = z.infer<typeof acompanhamentoSchema>;

export default function FormsAcompanhamento() {

    const router = useRouter();
    const routeParams = useParams<{ id: string }>();
    const { darkMode } = useTheme();
    const [isCheckingUser, setIsCheckingUser] = useState(true); // Estado para verificar o login

    const projetoID = routeParams.id;
    const [usuarioAtualID, setUsuarioAtualID] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(acompanhamentoSchema),
        mode: "onBlur", // Valida quando o campo perde o foco
        defaultValues: {
            instituicao: "",
            descricao: "",
            // @ts-expect-error O erro aqui é esperado porque o usuário vai precisar escolher uma opção
            lei: "", 
            positivos: "",
            negativos: "",
            atencao: "",
            estados: [],
            municipios: [],
            especificacoes: "",
            dataComeco: "",
            dataFim: "",
            contrapartidasProjeto: "",
            diversidade: "",
            ods: new Array(odsList.length).fill(false),
            relato: "",
            fotos: [],
            website: "",
            links: "",
            contrapartidasExecutadas: "",
        }
    });

    const watchedEstados = watch('estados');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUsuarioAtualID(user.uid);
            } else {
                router.push("/login"); 
            }
            setIsCheckingUser(false);
        });

        return () => unsubscribe();
    }, [router]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {

        if (!usuarioAtualID) {
            toast.error("Usuário não autenticado. Por favor, faça login.");
            return;
        }

        const loadingToastId = toast.loading("Enviando formulário...");

        try {
            // Acessa os dados validados do objeto 'data'
            const fotoURLs = await getFileUrl(data.fotos, 'forms-acompanhamento', projetoID);

            const uploadFirestore: formsAcompanhamentoDados = {
                projetoID: projetoID,
                dataResposta: new Date().toISOString().split('T')[0],
                usuarioID: usuarioAtualID,
                instituicao: data.instituicao,
                descricao: data.descricao,
                segmento: getItemNome(data.segmento, segmentoList),
                lei: getItemNome(data.lei, leiList),
                pontosPositivos: data.positivos,
                pontosNegativos: data.negativos,
                pontosAtencao: data.atencao,
                ambito: getItemNome(data.ambito, ambitoList),
                qtdEstados: data.estados.length,
                estados: data.estados,
                qtdMunicipios: data.municipios.length,
                municipios: data.municipios,
                especificacoes: data.especificacoes,
                dataInicial: data.dataComeco,
                dataFinal: data.dataFim,
                contrapartidasProjeto: data.contrapartidasProjeto,
                beneficiariosDiretos: data.beneficiariosDiretos,
                beneficiariosIndiretos: data.beneficiariosIndiretos,
                diversidade: data.diversidade === 'true',
                qtdAmarelas: data.qtdAmarelas,
                qtdBrancas: data.qtdBrancas,
                qtdIndigenas: data.qtdIndigenas,
                qtdPardas: data.qtdPardas,
                qtdPretas: data.qtdPretas,
                qtdMulherCis: data.qtdMulherCis,
                qtdMulherTrans: data.qtdMulherTrans,
                qtdHomemCis: data.qtdHomemCis,
                qtdHomemTrans: data.qtdHomemTrans,
                qtdNaoBinarios: data.qtdNaoBinarios,
                qtdPCD: data.qtdPCD,
                qtdLGBT: data.qtdLGBT,
                ods: getOdsIds(data.ods),
                relato: data.relato,
                fotos: fotoURLs,
                website: data.website,
                links: data.links,
                contrapartidasExecutadas: data.contrapartidasExecutadas,
            };

            await addDoc(collection(db, "forms-acompanhamento"), uploadFirestore);
            toast.dismiss(loadingToastId);
            toast.success(`Formulário enviado com sucesso!`);
            
        } catch (error) {
            console.error("Erro ao enviar formulário: ", error);
            toast.dismiss(loadingToastId);
            toast.error("Erro ao enviar formulário. Tente novamente.");
        }
    };

    if (isCheckingUser){
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center h-screen bg-white dark:bg-blue-fcsn2">
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
        <main
            className="flex flex-col justify-between items-center w-[screen] h-[dvh] overflow-hidden no-scrollbar">
            
            
            <div className="flex flex-col items-center justify-center w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh] text-blue-fcsn dark:text-white-off text-7xl font-bold"
            >
                <h1 className="text-center w-[90dvw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
                ">Acompanhamento de projeto</h1>
            </div>
            
            <form 
                className="flex flex-col justify-center items-center w-[90svw] sm:w-[80dvw] md:w-[80dvw] xl:w-[70dvw] h-90/100 mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-sm shadow-md shadow-gray-400 dark:shadow-gray-900 overflow-hidden no-scrollbar"
                onSubmit={handleSubmit(onSubmit)}
                noValidate>
                

                <div className="flex flex-col justify-around w-11/12 h-23/24 py-10">
                {/* Nome da instituição */}
                    <NormalInput
                        text="Nome da instituição:"
                        isNotMandatory={false}
                        registration={register("instituicao")}
                        error={errors.instituicao}
                    />

                {/* Breve descrição do prj */}
                    <LongInput
                        text="Breve descrição do projeto:"
                        registration={register("descricao")}
                        error={errors.descricao}
                        isNotMandatory={false}
                    />
                {/* Seg do Projeto */}
                    <Controller
                        name="segmento"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <HorizontalSelects
                                text="Segmento do projeto:"
                                isNotMandatory={false}
                                list={segmentoList.map(s => s.nome)}
                                value={field.value}
                                onChange={field.onChange}
                                error={error}
                            />
                        )}
                    />

                {/* Lei de incentivo do prj*/}
                    <LeiSelect
                        text="Lei de incentivo do projeto:"
                        list={leiList.map(l => l.nome)}
                        isNotMandatory={false}
                        registration={register("lei")}
                        error={errors.lei}
                    />
                        
                {/* Pontos positivos do prj */}
                    <LongInput
                        text="Pontos positivos do projeto:"
                        isNotMandatory={true}
                        registration={register("positivos")}
                        error={errors.positivos}
                    />

                {/* Pontos negtivos do prj */}
                    <LongInput
                        text="Pontos negativos do projeto:" 
                        isNotMandatory={true}
                        registration={register("negativos")}
                        error={errors.negativos}
                    />

                {/* Pontos de atenção do prj */}
                    <LongInput
                        text="Pontos de atenção do projeto:"
                        isNotMandatory={true}
                        registration={register("atencao")}
                        error={errors.atencao}
                    />
                
                {/* Ambito de desenvolvimento do prj */}
                    <Controller
                        name="ambito"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <HorizontalSelects
                                text="Âmbito de desenvolvimento do projeto:"
                                isNotMandatory={false}
                                list={ambitoList.map(s => s.nome)}
                                value={field.value}
                                onChange={field.onChange}
                                error={error}
                            />
                        )}
                    />

                {/* Estados onde ele atua: */}
                    <Controller
                        name="estados"
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                            const handleStateRemoval = (stateName: string) => {
                                const allStates = State.getStatesOfCountry("BR");
                                const stateObject = allStates.find(s => s.name === stateName);
                                if (stateObject) {
                                    const estadoUF = stateObject.isoCode;
                                    const cidadesDoEstado = new Set(City.getCitiesOfState("BR", estadoUF).map(c => c.name));
                                    const cidadesAtuais = watch('municipios');
                                    const novasCidades = cidadesAtuais.filter(cidade => !cidadesDoEstado.has(cidade));
                                    setValue('municipios', novasCidades, { shouldValidate: true });
                                }
                            };
                            return (
                                <EstadoInput
                                    text="Estados onde o projeto atua:"
                                    isNotMandatory={false}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onStateRemove={handleStateRemoval}
                                    error={error as FieldError}
                                />
                            );
                        }}
                    />

                {/* Municipios onde ele atua: */}
                    <Controller
                        name="municipios"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <CidadeInput
                                text="Municípios onde o projeto atua:"
                                isNotMandatory={false}
                                value={field.value}
                                onChange={field.onChange}
                                selectedStates={watchedEstados}
                                error={error as FieldError}
                            />
                        )}
                    />

                {/* Especificações do territorio de atuação do prj: */}
                    <LongInput
                        text="Especificações do territorio de atuação do projeto:"
                        isNotMandatory={false}
                        registration={register("especificacoes")}
                        error={errors.especificacoes}
                    />

                {/* Periodo de execução do prj: */}
                    <DateInputs
                        text="Período de execução do projeto:" 
                        isNotMandatory={false}
                        startRegistration={register("dataComeco")}
                        endRegistration={register("dataFim")}
                        error_start={errors.dataComeco}
                        error_end={errors.dataFim}
                    />

                {/* Contrapartidas do projeto: */}
                    <LongInput 
                        text="Contrapartidas do projeto:" 
                        isNotMandatory={false}
                        registration={register("contrapartidasProjeto")}
                        error={errors.contrapartidasProjeto}
                    />
                    <div className="flex flex-col gap-3 py-4">
                    {/* Numero total de beneficiários diretos: */}
                        <NumberInput 
                            text="Número total de beneficiários diretos no projeto:" 
                            isNotMandatory={false}
                            registration={register("beneficiariosDiretos")}
                            error={errors.beneficiariosDiretos}
                        />
                    
                    {/* Numero total de beneficiários indiretos: */}
                        <NumberInput 
                            text="Número total de beneficiários indiretos no projeto:" 
                            isNotMandatory={false}
                            registration={register("beneficiariosIndiretos")}
                            error={errors.beneficiariosIndiretos}
                        />

                    {/* Adota politicas de diversidade?: */}
                        <YesNoInput 
                            text="Sua instituição adota políticas de diversidade?" 
                            list={["Sim", "Não"]}
                            isNotMandatory={false}
                            registration={register("diversidade")}
                            error={errors.diversidade}
                        />

                    {/* Amarelas: */}
                        <NumberInput 
                            text="Quantidade de pessoas Amarelas na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdAmarelas")}
                            error={errors.qtdAmarelas}
                        />

                    {/* Brancas: */}
                        <NumberInput 
                            text="Quantidade de pessoas Brancas na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdBrancas")}
                            error={errors.qtdBrancas}
                            />

                    {/* Indígenas: */}
                        <NumberInput 
                            text="Quantidade de pessoas Indígenas na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdIndigenas")}
                            error={errors.qtdIndigenas}
                        />

                    {/* Pardas: */}
                        <NumberInput 
                            text="Quantidade de pessoas Pardas na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdPardas")}
                            error={errors.qtdPardas}
                            />

                    {/* Pretas: */}
                        <NumberInput 
                            text="Quantidade de pessoas Pretas na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdPretas")}
                            error={errors.qtdPretas}
                        />

                    {/* Mulher cis: */}
                        <NumberInput 
                            text="Quantidade de Mulheres Cisgênero na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdMulherCis")}
                            error={errors.qtdMulherCis}
                            />

                    {/* Mulher trans: */}
                        <NumberInput 
                            text="Quantidade de Mulheres Transgênero na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdMulherTrans")}
                            error={errors.qtdMulherTrans}
                        />

                    {/* Homem cis: */}
                        <NumberInput 
                            text="Quantidade de Homens Cisgênero na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdHomemCis")}
                            error={errors.qtdHomemCis}
                        />

                    {/* Homem trans: */}
                        <NumberInput 
                            text="Quantidade de Homens Transgênero na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdHomemTrans")}
                            error={errors.qtdHomemTrans}
                        />

                    {/* NBs: */}
                        <NumberInput 
                            text="Quantidade de pessoas Não-Binárias na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdNaoBinarios")}
                            error={errors.qtdNaoBinarios}
                        />

                    {/* PCDs: */}
                        <NumberInput 
                            text="Quantidade de Pessoas Com Deficiência (PCD) na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdPCD")}
                            error={errors.qtdPCD}
                        />

                    {/* LGBTs: */}
                        <NumberInput 
                            text="Quantidade de pessoas da comunidade LGBTQIA+ na sua instituição:" 
                            isNotMandatory={false}
                            registration={register("qtdLGBT")}
                            error={errors.qtdLGBT}
                            />

                    </div>
                {/* ODSs: */}
                    <Controller
                        name="ods"
                        control={control}
                        render={({ field, fieldState: { error } }) => (

                            <VerticalSelects
                                text="Objetivos de Desenvolvimento Sustentável (ODS) contemplados pelo projeto:"
                                subtext="Selecione até 3 opções."
                                list={odsList.map(o => o.nome)}
                                isNotMandatory={false}
                                value={field.value}
                                onChange={field.onChange}
                                error={error as FieldError}
                            />
                        )}
                    />

                {/* Relato de um beneficiário: */}
                    <LongInput 
                        text="Breve relato de um beneficiário do projeto:" 
                        isNotMandatory={true}
                        registration={register("relato")}
                        error={errors.relato}
                    />
                {/* Cinco fotos: */}
                    <Controller
                        name="fotos"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FileInput 
                                text={"Cinco fotos das atividades do projeto:"}
                                isNotMandatory={false}
                                value={value || []}
                                onChange={onChange}
                                error={error}
                            />
                        )}
                    />

                {/* Links para as website: */}
                    <NormalInput
                        text="Link para website:"
                        isNotMandatory={false}
                        registration={register("website")}
                        error={errors.website}
                    />

                {/* Links para as redes sociais */}
                    <LongInput 
                        text="Links para as redes sociais:" 
                        isNotMandatory={false}
                        registration={register("links")}
                        error={errors.links}
                    />

                {/* Contrapartidas apresentadas e executadas: */}
                    <LongInput 
                        text="Contrapartidas apresentadas e contrapartidas executadas:" 
                        isNotMandatory={true}
                        registration={register("contrapartidasExecutadas")}
                        error={errors.contrapartidasExecutadas}
                    />

                </div>
                    
                <div className="flex w-11/12 items-start">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10"
                    >{isSubmitting ? "Enviando..." : "Enviar"}</button>
                </div>
            </form>
            <Toaster richColors />
            <Footer></Footer>
        </main>
    );
}