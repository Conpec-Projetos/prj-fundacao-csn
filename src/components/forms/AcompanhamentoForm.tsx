'use client';

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
import { toast } from "sonner";
import { odsList, segmentoList, ambitoList } from "@/firebase/schema/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller, FieldError } from "react-hook-form";
import { State, City } from "country-state-city";
import { formsAcompanhamentoSchema, FormsAcompanhamentoFormFields } from "@/lib/schemas";
import { submitAcompanhamentoForm } from "@/app/actions/formsAcompanhamentoActions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";


interface AcompanhamentoFormProps {
  projetoID: string;
  usuarioAtualID: string;
  initialData: Partial<FormsAcompanhamentoFormFields>;
}

export default function AcompanhamentoForm({ projetoID, usuarioAtualID, initialData }: AcompanhamentoFormProps) {
    const router = useRouter();
    const [leiList, setLeiList] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormsAcompanhamentoFormFields>({
        resolver: zodResolver(formsAcompanhamentoSchema),
        defaultValues: initialData,
        mode: "onBlur",
    });

    const watchedEstados = watch('estados');

    // fetch leis from firebase
    useEffect(() => {
        const fetchLeis = async () => {
            const snapshot = await getDocs(collection(db, "leis"));
            const leisFromDB: string[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as { nome: string; sigla: string };
                if (data.nome) {
                 leisFromDB.push(data.nome);
                }
            });
            setLeiList(leisFromDB);
        }
        fetchLeis()
    }, []);


    const onSubmit: SubmitHandler<FormsAcompanhamentoFormFields> = async (data) => {
        if (!usuarioAtualID) {
            toast.error("Usuário não autenticado. Por favor, faça login.");
            return;
        }

        const loadingToastId = toast.loading("Enviando formulário...");

        const formData = new FormData();
        // Preenche o FormData
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'fotos' && Array.isArray(value)) {
                // Arquivos serão adicionados depois
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        // Adiciona os arquivos
        data.fotos.forEach(file => formData.append('fotos', file));
        
        // Adiciona IDs necessários para a action
        formData.append('projetoID', projetoID);
        formData.append('usuarioAtualID', usuarioAtualID);
        
        try {
            const result = await submitAcompanhamentoForm(formData);
            toast.dismiss(loadingToastId);
            if (result.success) {
                toast.success("Formulário de acompanhamento enviado com sucesso!");

                setTimeout(() => {
                    router.push('/inicio-externo');
                }, 3000);

            } else {
                toast.error(`Erro: ${result.error}`);
            }
        } catch (error) {
             toast.dismiss(loadingToastId);
             toast.error(`Ocorreu um erro inesperado: ${error}`);
        }
    };

    return(
        <form 
            className="flex flex-col justify-center items-center max-w-[1500px] w-[90vw] sm:w-[80vw] xl:w-[70vw] mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-lg overflow-hidden no-scrollbar"
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
                    list={leiList}
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
                        const handleStateRemoval = (nomeEstado: string) => {
                            const allStates = State.getStatesOfCountry("BR");
                            const stateObject = allStates.find(s => s.name === nomeEstado);
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
                            acceptedFileTypes={['image/jpeg', 'image/png']}
                        />
                    )}
                />

            {/* Links para as website: */}
                <NormalInput
                    text="Link para website:"
                    isNotMandatory={true}
                    registration={register("website")}
                    error={errors.website}
                />

            {/* Links para as redes sociais */}
                <LongInput 
                    text="Links para as redes sociais:" 
                    isNotMandatory={true}
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
    );
}