'use client';

import { useState, useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase-config";
import {
    NormalInput,
    LongInput,
    NumeroEndInput,
    NumberInput,
    HorizontalSelects,
    VerticalSelects,
    DateInputs,
    EstadoInput,
    LeiSelect,
    FileInput,
    CidadeInput,
    GrowInput,
    SingleEstadoInput,
    PublicoInput
} from "@/components/inputs/inputs";
import { State, City } from "country-state-city";
import { toast } from "sonner";
import { odsList, segmentoList, publicoList } from "@/firebase/schema/entities";
import { formatCNPJ, formatCEP, formatTelefone, formatMoeda, filtraDigitos } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, FieldError } from "react-hook-form";
import { submitCadastroForm } from '@/app/actions/formsCadastroActions';
import { formsCadastroSchema, FormsCadastroFormFields } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";



export default function CadastroForm({ usuarioAtualID }: { usuarioAtualID: string | null }) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [compliancePdfUrl, setCompliancePdfUrl] = useState<string | null>(null);
    const [leiList, setLeiList] = useState<string[]>([]);

    const router = useRouter()

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormsCadastroFormFields>({
        resolver: zodResolver(formsCadastroSchema),
        mode: "onBlur",
        defaultValues: {
            instituicao: "",
            cnpj: "",
            representanteLegal: "",
            telefone: "",
            emailRepLegal: "",
            responsavel: "",
            emailResponsavel: "",
            cep: "",
            endereco: "",
            numeroEndereco: undefined,
            complemento: "",
            cidade: "",
            estado: "",
            nomeProjeto: "",
            website: "",
            valorAprovado: undefined,
            valorApto: undefined,
            dataComeco: "",
            dataFim: "",
            banco: "",
            agencia: "",
            numeroAgencia: "",
            digitoAgencia: "",
            conta: "",
            segmento: undefined,
            descricao: "",
            publico: new Array(publicoList.length).fill(false),
            outroPublico: "",
            ods: new Array(odsList.length).fill(false),
            beneficiariosDiretos: undefined,
            estados: [],
            municipios: [],
            // @ts-expect-error O erro aqui é esperado porque o usuário vai precisar escolher uma opção
            lei: "",
            numeroLei: "",
            contrapartidasProjeto: "",
            observacoes: "",
            diario: [],
            apresentacao: [],
            compliance: [],
            documentos: [],
            termosPrivacidade: false,
        },
    });

    const watchedCep = watch('cep');
    const watchedEstados = watch('estados');
    const watchedPublico = watch('publico');
    const outroPublicoIndex = publicoList.findIndex(p => p.nome.toLowerCase().startsWith('outro'));
    const isOutroPublicoSelected = watchedPublico && watchedPublico[outroPublicoIndex];
    const watchedNumeroAgencia = watch('numeroAgencia');
    const watchedDigitoAgencia = watch('digitoAgencia');

    useEffect(() => {
        if (watchedNumeroAgencia || watchedDigitoAgencia) {
            const agenciaCompleta = watchedDigitoAgencia
                ? `${watchedNumeroAgencia}-${watchedDigitoAgencia}`
                : watchedNumeroAgencia;
            setValue('agencia', agenciaCompleta, { shouldValidate: true });
        } else {
            setValue('agencia', '', { shouldValidate: true });
        }
    }, [watchedNumeroAgencia, watchedDigitoAgencia, setValue]);

    useEffect(() => {
        const fetchPdfUrl = async () => {
            try {
                const storageRef = ref(storage, 'publico/Formulário de Doações e Patrocínios - 2025.pdf');
                const url = await getDownloadURL(storageRef);
                setCompliancePdfUrl(url);
            } catch (error) {
                console.error("Error fetching compliance PDF URL:", error);
                toast.error("Erro ao carregar o link do formulário de compliance.");
            }
        };

        fetchPdfUrl();
    }, []);

    useEffect(() => {
        const fetchAddress = async (cep: string) => {
            const cepFormatado = cep.replace(/\D/g, '');
            if (cepFormatado.length !== 8) return;
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepFormatado}`);
                if (!response.ok) throw new Error('CEP não encontrado');
                const data = await response.json();
                const fullAddress = data.neighborhood ? `${data.street} - ${data.neighborhood}` : data.street;
                setValue("endereco", fullAddress, { shouldValidate: true });
                setValue("cidade", data.city, { shouldValidate: true });
                setValue("estado", data.state, { shouldValidate: true });
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        };
        fetchAddress(watchedCep);
    }, [watchedCep, setValue]);


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
            leisFromDB.sort(); // Ordenando o array
            setLeiList(leisFromDB);
        }
        fetchLeis()
    }, []);

    return (
        <form
            className="flex flex-col justify-center items-center max-w-[1500px] w-[90vw] sm:w-[80vw] xl:w-[70vw] mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-lg"
            onSubmit={handleSubmit(async (data) => {

                const loadingToastId = toast.loading("Enviando formulário...");

                const formData = new FormData();

                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value) && value.every(item => item instanceof File)) {
                        // Tratado separadamente abaixo
                    } else if (typeof value === 'object' && value !== null) {
                        formData.append(key, JSON.stringify(value));
                    } else if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                });

                data.diario.forEach((file: File) => formData.append('diario', file));
                data.apresentacao.forEach((file: File) => formData.append('apresentacao', file));
                data.compliance.forEach((file: File) => formData.append('compliance', file));
                data.documentos.forEach((file: File) => formData.append('documentos', file));

                if (usuarioAtualID) {
                    formData.append('usuarioAtualID', usuarioAtualID);
                }

                try {
                    const result = await submitCadastroForm(formData);

                    toast.dismiss(loadingToastId);

                    if (result.success) {
                        toast.success("Formulário enviado com sucesso!");
                        if (usuarioAtualID) {
                            router.push('/inicio-externo');
                        } else {
                            reset()
                            setCurrentPage(1)
                            window.scrollTo(0, 0)
                        }
                    } else {
                        toast.error(`Erro: ${result.error}`);
                    }
                } catch (error) {
                    toast.dismiss(loadingToastId);
                    toast.error("Ocorreu um erro inesperado ao enviar o formulário.");
                    console.error(error);
                }
            })}
            noValidate
        >

            {currentPage === 1 && (
                <div className="w-full">
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col justify-around w-11/12 my-10 space-y-4">

                            <NormalInput
                                text="Nome da instituição:"
                                isNotMandatory={false}
                                registration={register("instituicao")}
                                error={errors.instituicao}
                            />

                            <Controller
                                name="cnpj"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="cnpj" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            CNPJ: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="cnpj"
                                                type="text"
                                                {...field}
                                                onChange={(e) => {
                                                    const valorFormatado = formatCNPJ(e.target.value);
                                                    field.onChange(valorFormatado);
                                                }}
                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                            />
                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />

                            <NormalInput
                                text="Representante legal:"
                                isNotMandatory={false}
                                registration={register("representanteLegal")}
                                error={errors.representanteLegal}
                            />

                            <Controller
                                name="telefone"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="telefone" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            Telefone do representante legal: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="telefone"
                                                type="tel"
                                                // Espalha as propriedades do field (name, onBlur, ref, value)
                                                {...field}
                                                // Sobrescreve o onChange para incluir a formatação
                                                onChange={(e) => {
                                                    const valorFormatado = formatTelefone(e.target.value);
                                                    // Chama o onChange do Controller com o valor já formatado
                                                    field.onChange(valorFormatado);
                                                }}
                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                            />
                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />

                            <NormalInput
                                text="E-mail do representante legal:"
                                isNotMandatory={false}
                                registration={register("emailRepLegal")}
                                error={errors.emailRepLegal}
                            />

                            <NormalInput
                                text="Responsável pelo projeto"
                                isNotMandatory={false}
                                registration={register("responsavel")}
                                error={errors.responsavel}
                            />
                            <NormalInput
                                text="E-mail do responsável:"
                                isNotMandatory={false}
                                registration={register("emailResponsavel")}
                                error={errors.emailResponsavel}
                            />

                            <Controller
                                name="cep"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="cep" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            CEP: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="cep"
                                                type="text"
                                                {...field}
                                                onChange={(e) => {
                                                    const valorFormatado = formatCEP(e.target.value);
                                                    field.onChange(valorFormatado);
                                                }}
                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                            />
                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />

                            <NormalInput
                                text="Endereço:"
                                isNotMandatory={false}
                                registration={register("endereco")}
                                error={errors.endereco}
                            />

                            <div className="flex flex-row min-h-[60px] h-fit w-full justify-center items-start gap-x-5">
                                <NumeroEndInput
                                    text="Número:"
                                    isNotMandatory={true}
                                    registration={register("numeroEndereco")}
                                    error={errors.numeroEndereco}
                                />

                                <GrowInput
                                    text="Complemento:"
                                    isNotMandatory={true}
                                    registration={register("complemento")}
                                    error={errors.complemento}
                                />
                            </div>

                            <div className="flex flex-row h-full w-full justify-between items-start gap-x-4">
                                <GrowInput
                                    text="Cidade:"
                                    isNotMandatory={false}
                                    registration={register("cidade")}
                                    error={errors.cidade}
                                />

                                <Controller
                                    name="estado"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <SingleEstadoInput
                                            text="Estado:"
                                            isNotMandatory={false}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={error}
                                        />
                                    )}
                                />
                            </div>

                            <NormalInput
                                text="Nome do Projeto:"
                                isNotMandatory={false}
                                registration={register("nomeProjeto")}
                                error={errors.nomeProjeto}
                            />

                            <NormalInput
                                text="Link para website:"
                                isNotMandatory={true}
                                registration={register("website")}
                                error={errors.website}
                            />

                            <Controller
                                name="valorAprovado"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="valorAprovado" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            Valor aprovado: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="valorAprovado"
                                                type="text"
                                                placeholder="R$"
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                                name={field.name}
                                                value={field.value ? formatMoeda(field.value) : ""}
                                                onChange={(e) => {
                                                    const digitsOnly = filtraDigitos(e.target.value);
                                                    const limitedDigits = digitsOnly.slice(0, 18);
                                                    const numericValue = limitedDigits ? parseInt(limitedDigits, 10) / 100 : undefined;
                                                    field.onChange(numericValue);
                                                }}
                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                            />
                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />

                            <Controller
                                name="valorApto"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <div className="flex flex-col lg:flex-row w-auto md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="valorApto" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            Valor apto a captar: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="valorApto"
                                                type="text"
                                                placeholder="R$"
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                                name={field.name}
                                                value={field.value ? formatMoeda(field.value) : ""}
                                                onChange={(e) => {
                                                    const digitsOnly = filtraDigitos(e.target.value);
                                                    const limitedDigits = digitsOnly.slice(0, 18);
                                                    const numericValue = limitedDigits ? parseInt(limitedDigits, 10) / 100 : undefined;
                                                    field.onChange(numericValue);
                                                }}
                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                            />
                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                        </div>
                                    </div>
                                )}
                            />

                            <DateInputs
                                text="Período de captação:"
                                isNotMandatory={false}
                                startRegistration={register("dataComeco")}
                                endRegistration={register("dataFim")}
                                error_start={errors.dataComeco}
                                error_end={errors.dataFim}
                            />

                            <Controller
                                name="diario"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <FileInput
                                        text={"Diário Oficial:"}
                                        isNotMandatory={false}
                                        value={value || []}
                                        onChange={onChange}
                                        error={error}
                                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                    />
                                )}
                            />

                            <h1 className="mt-5 text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold"
                            >Dados Bancários
                            </h1>

                            <div className="flex flex-col gap-y-4 mx-7">
                                <NormalInput
                                    text="Banco:"
                                    isNotMandatory={false}
                                    registration={register("banco")}
                                    error={errors.banco}
                                />

                                <div className="flex flex-col md:flex-row h-full w-full justify-between md:items-start gap-y-4 md:gap-x-4">
                                    <div className="flex flex-col lg:flex-row w-full md:gap-x-4 items-start sm:items-center grow">
                                        <label htmlFor="numeroAgencia" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                            Agência: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="flex items-start w-full gap-x-2">
                                            {/* Input para o Número da Agência */}
                                            <div className="flex-grow">
                                                <Controller
                                                    name="numeroAgencia"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <>
                                                            <input
                                                                id="numeroAgencia"
                                                                type="text"
                                                                placeholder="Número"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                                    field.onChange(valorFiltrado);
                                                                }}
                                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                            />
                                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                                        </>
                                                    )}
                                                />
                                            </div>

                                            {/* Input para o Dígito */}
                                            <div className="w-1/4 max-w-[80px]">
                                                <Controller
                                                    name="digitoAgencia"
                                                    control={control}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <>
                                                            <input
                                                                type="text"
                                                                placeholder="Dígito"
                                                                maxLength={1}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                                    field.onChange(valorFiltrado);
                                                                }}
                                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 text-center ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                            />
                                                            {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                                        </>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Controller
                                        name="conta"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <div className="flex flex-col lg:flex-row w-full md:gap-x-4 items-start sm:items-center grow">
                                                <label htmlFor="conta" className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold">
                                                    Conta Corrente: <span className="text-[#B15265]">*</span>
                                                </label>
                                                <div className="w-full">
                                                    <input
                                                        id="conta"
                                                        type="text"
                                                        {...field}
                                                        onChange={(e) => {
                                                            const valorFiltrado = filtraDigitos(e.target.value);
                                                            field.onChange(valorFiltrado);
                                                        }}
                                                        className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                    />
                                                    {error && <p className="text-red-500 mt-1 text-sm">{error.message}</p>}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

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

                            <LongInput text="Breve descrição do projeto:" isNotMandatory={false} registration={register("descricao")} error={errors.descricao} />

                            <Controller
                                name="apresentacao"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <FileInput
                                        text={"Apresentação do projeto:"}
                                        isNotMandatory={false}
                                        value={value || []}
                                        onChange={onChange}
                                        error={error}
                                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                    />
                                )}
                            />

                            <Controller
                                name="publico"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <PublicoInput
                                        text="Público beneficiado:"
                                        list={publicoList.map(p => p.nome)}
                                        isNotMandatory={false}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={error as FieldError}
                                    />
                                )}
                            />

                            <div className={`transition-all duration-300 ease-in-out w-full ${isOutroPublicoSelected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <NormalInput
                                    text="Especifique o público:"
                                    isNotMandatory={false}
                                    registration={register("outroPublico")}
                                    error={errors.outroPublico}
                                />
                            </div>

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

                            <NumberInput
                                text="Número de público direto que será beneficiado:"
                                isNotMandatory={false}
                                registration={register("beneficiariosDiretos")}
                                error={errors.beneficiariosDiretos}
                            />

                            <Controller
                                name="estados"
                                control={control}
                                render={({ field, fieldState: { error } }) => {
                                    const handleStateRemoval = (stateName: string) => {
                                        const allStates = State.getStatesOfCountry("BR");
                                        const estadoObject = allStates.find(s => s.name === stateName);
                                        if (estadoObject) {
                                            const estadoUF = estadoObject.isoCode;
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

                            <Controller
                                name="lei"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <LeiSelect
                                        text="Lei de incentivo do projeto:"
                                        list={leiList}
                                        value={field.value}
                                        isNotMandatory={false}
                                        onChange={field.onChange}
                                        error={error}
                                    />
                                )}
                            />
                            <NormalInput
                                text="Número de aprovação do projeto por lei:"
                                isNotMandatory={true}
                                registration={register("numeroLei")}
                                error={errors.numeroLei}
                            />

                            <LongInput
                                text="Contrapartidas:"
                                isNotMandatory={false}
                                registration={register("contrapartidasProjeto")}
                                error={errors.contrapartidasProjeto}
                            />

                            <LongInput
                                text="Observações:"
                                isNotMandatory={false}
                                registration={register("observacoes")}
                                error={errors.observacoes}
                            />

                        </div>
                        <div className="flex justify-end w-full px-[5%]">
                            <button type="button" className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10" onClick={() => setCurrentPage(2)}>Próxima página</button>
                        </div>
                    </div>
                </div>
            )}

            {currentPage === 2 && (
                <div className="w-full">
                    <div className="flex flex-col w-full items-center gap-8 mt-10">
                        <div className="w-11/12">
                            {/* Botão de download para o formulário de compliance */}
                            {compliancePdfUrl && (
                                <div className="flex flex-col items-start mb-4 gap-y-2">
                                    <p className="text-xl text-blue-fcsn dark:text-white-off font-bold">
                                        Faça o download do formulário de compliance, preencha-o e anexe no campo abaixo.
                                    </p>
                                    <a
                                        href={compliancePdfUrl}
                                        download="Formulario_Compliance.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-fit px-4 h-[50px] bg-blue-fcsn dark:bg-blue-fcsn3 dark:hover:bg-blue-fcsn hover:bg-blue-fcsn2 rounded-[7px] text-md font-bold text-white cursor-pointer shadow-md flex items-center justify-center"
                                    >
                                        Baixar Formulário de Compliance
                                    </a>
                                </div>
                            )}

                            <Controller
                                name="compliance"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <FileInput
                                        text={"Formulário de compliance:"}
                                        isNotMandatory={false}
                                        value={value || []}
                                        onChange={onChange}
                                        error={error as FieldError}
                                        acceptedFileTypes={['application/pdf']}
                                    />
                                )}
                            />

                            <Controller
                                name="documentos"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <FileInput
                                        text={"Documentos adicionais:"}
                                        isNotMandatory={false}
                                        value={value || []}
                                        onChange={onChange}
                                        error={error as FieldError}
                                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                    />
                                )}
                            />

                            <div className="flex flex-col pt-7">
                                <div className="flex flex-row gap-x-2 items-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-blue-fcsn cursor-pointer"
                                        {...register("termosPrivacidade")}
                                    />
                                    <p className="text-lg text-blue-fcsn dark:text-white">
                                        Eu declaro ter lido e concordado com os Termos de Uso e a Política de Privacidade
                                        <span className="text-[#B15265]">*</span>
                                    </p>
                                </div>
                                {errors.termosPrivacidade && <p className="text-red-500 text-sm mt-1 pl-7">{errors.termosPrivacidade.message}</p>}
                            </div>
                        </div>
                        <div className="flex flex-row w-11/12 justify-between gap-4 mt-8">
                            <button
                                type="button"
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-gray-100 hover:bg-white rounded-[7px] text-md md:text-lg font-bold text-blue-fcsn cursor-pointer shadow-md mb-10"
                                onClick={() => setCurrentPage(1)}
                            >Página anterior
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10"
                            >{isSubmitting ? "Enviando..." : "Enviar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}