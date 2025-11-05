"use client";

import { submitCadastroForm } from "@/app/actions/formsCadastroActions";
import {
    CidadeInput,
    DateInputs,
    EstadoInput,
    FileInput,
    GrowInput,
    HorizontalSelects,
    LeiSelect,
    LongInput,
    NormalInput,
    NumberInput,
    NumeroEndInput,
    PublicoInput,
    SingleEstadoInput,
    VerticalSelects,
} from "@/components/inputs/inputs";
import { db, storage } from "@/firebase/firebase-config";
import { odsList, publicoList, segmentoList } from "@/firebase/schema/entities";
import { FormsCadastroFormFields, formsCadastroSchema } from "@/lib/schemas";
import { filtraDigitos, formatCEP, formatCNPJ, formatMoeda, formatTelefone, normalizeStoredUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload as vercelUpload } from "@vercel/blob/client";
import { City, State } from "country-state-city";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FieldError, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CadastroForm({ usuarioAtualID }: { usuarioAtualID: string | null }) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [compliancePdfUrl, setCompliancePdfUrl] = useState<string | null>(null);
    const [leiList, setLeiList] = useState<string[]>([]);

    const router = useRouter();

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
            documentos: { // mudanca pq agora é um objeto de arrays
                estatuto: [],
                ata: [],
                contrato: [],
            },
            termosPrivacidade: false,
        },
    });

    // upload progress state keyed by field name
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    // helper: upload a single file via Vercel Blob client upload
    const uploadFileToVercel = async (file: File, fieldName: string) => {
        try {
            setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

            const clientPayload = JSON.stringify({ size: file.size, type: file.type });

            // Build a pathname including a folder and original filename
            const pathname = `${fieldName}/${Date.now()}-${file.name}`;

            const result = await vercelUpload(pathname, file, {
                access: "public",
                handleUploadUrl: "/api/upload",
                clientPayload,
                onUploadProgress: ({ percentage }) => {
                    setUploadProgress(prev => ({ ...prev, [fieldName]: Math.round(percentage) }));
                },
                multipart: true, // allow multipart for larger files
            });

            // Normalize to a canonical public URL string.
            type VercelResult = { url?: string; downloadUrl?: string; pathname?: string; key?: string };
            const vr = result as VercelResult;
            const publicUrl: string | null =
                vr.url ??
                vr.downloadUrl ??
                (() => {
                    const pathnameFromResult = vr.pathname ?? vr.key ?? null;
                    if (!pathnameFromResult) return null;
                    const base = process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL || window.location.origin;
                    return `${base.replace(/\/$/, "")}/${String(pathnameFromResult).replace(/^\//, "")}`;
                })();

            setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
            if (!publicUrl) throw new Error("Upload succeeded but no public URL was returned by Vercel Blob");
            return publicUrl;
        } catch (err) {
            console.error("Upload failed", err);
            setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
            throw err;
        }
    };

    const watchedCep = watch("cep");
    const watchedEstados = watch("estados");
    const watchedPublico = watch("publico");
    const outroPublicoIndex = publicoList.findIndex(p => p.nome.toLowerCase().startsWith("outro"));
    const isOutroPublicoSelected = watchedPublico && watchedPublico[outroPublicoIndex];
    const watchedNumeroAgencia = watch("numeroAgencia");
    const watchedDigitoAgencia = watch("digitoAgencia");

    useEffect(() => {
        if (watchedNumeroAgencia || watchedDigitoAgencia) {
            const agenciaCompleta = watchedDigitoAgencia
                ? `${watchedNumeroAgencia}-${watchedDigitoAgencia}`
                : watchedNumeroAgencia;
            setValue("agencia", agenciaCompleta, { shouldValidate: true });
        } else {
            setValue("agencia", "", { shouldValidate: true });
        }
    }, [watchedNumeroAgencia, watchedDigitoAgencia, setValue]);

    useEffect(() => {
        const fetchPdfUrl = async () => {
            try {
                const storageRef = ref(storage, "publico/Formulário de Doações e Patrocínios - 2025.pdf");
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
            const cepFormatado = cep.replace(/\D/g, "");
            if (cepFormatado.length !== 8) return;
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepFormatado}`);
                if (!response.ok) throw new Error("CEP não encontrado");
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
            snapshot.forEach(doc => {
                const data = doc.data() as { nome: string; sigla: string };
                if (data.nome) {
                    leisFromDB.push(data.nome);
                }
            });
            leisFromDB.sort(); // Ordenando o array
            setLeiList(leisFromDB);
        };
        fetchLeis();
    }, []);

    return (
        <form
            className="flex flex-col justify-center items-center max-w-[1500px] w-[90vw] sm:w-[80vw] xl:w-[70vw] mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-lg"
            onSubmit={handleSubmit(async data => {
                console.log("Formulário submetido", data); // Adicione este log
                // Verificação do tam
                const allFiles = [...data.diario, ...data.apresentacao, ...data.compliance,  ...Object.values(data.documentos).flat(),];

                // 2. Soma o tamanho de todos os arquivos (em bytes)
                const totalSizeInBytes = allFiles.reduce((acc, file) => {
                    return acc + (file instanceof File ? file.size : 0);
                }, 0);
                // 3. Define o limite. O do Firebase é 100MB.
                const limitInBytes = 100 * 1024 * 1024; // 100 MB

                // 4. Compara o tamanho total com o limite
                if (totalSizeInBytes > limitInBytes) {
                    toast.error("Envio cancelado: Arquivos muito grandes.", {
                        description: `O tamanho total dos seus anexos (${(totalSizeInBytes / 1024 / 1024).toFixed(2)} MB) excede o nosso limite de 100 MB. Por favor, reduza o tamanho dos arquivos.`,
                        duration: 10000,
                    });
                    return;
                }

                const loadingToastId = toast.loading("Enviando formulário...");

                const formData = new FormData();

                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value) && value.every(item => item instanceof File)) {
                        // Tratado separadamente abaixo
                    } else if (typeof value === "object" && value !== null) {
                        formData.append(key, JSON.stringify(value));
                    } else if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                });

                console.log("Documentos sendo enviados:");

                if (usuarioAtualID) {
                    formData.append("usuarioAtualID", usuarioAtualID);
                }

                try {
                    const result = await submitCadastroForm(formData);

                    toast.dismiss(loadingToastId);

                    if (result.success) {
                        toast.success("Formulário enviado com sucesso!");
                        if (usuarioAtualID) {
                            router.push("/inicio-externo");
                        } else {
                            reset();
                            setCurrentPage(1);
                            window.scrollTo(0, 0);
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
                                        <label
                                            htmlFor="cnpj"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
                                            CNPJ: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="cnpj"
                                                type="text"
                                                {...field}
                                                onChange={e => {
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
                                        <label
                                            htmlFor="telefone"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
                                            Telefone do representante legal: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="telefone"
                                                type="tel"
                                                // Espalha as propriedades do field (name, onBlur, ref, value)
                                                {...field}
                                                // Sobrescreve o onChange para incluir a formatação
                                                onChange={e => {
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
                                        <label
                                            htmlFor="cep"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
                                            CEP: <span className="text-[#B15265]">*</span>
                                        </label>
                                        <div className="w-full">
                                            <input
                                                id="cep"
                                                type="text"
                                                {...field}
                                                onChange={e => {
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
                                        <label
                                            htmlFor="valorAprovado"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
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
                                                onChange={e => {
                                                    const digitsOnly = filtraDigitos(e.target.value);
                                                    const limitedDigits = digitsOnly.slice(0, 18);
                                                    const numericValue = limitedDigits
                                                        ? parseInt(limitedDigits, 10) / 100
                                                        : undefined;
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
                                        <label
                                            htmlFor="valorApto"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
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
                                                onChange={e => {
                                                    const digitsOnly = filtraDigitos(e.target.value);
                                                    const limitedDigits = digitsOnly.slice(0, 18);
                                                    const numericValue = limitedDigits
                                                        ? parseInt(limitedDigits, 10) / 100
                                                        : undefined;
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
                                    <div>
                                        <FileInput
                                            text={"Diário Oficial:"}
                                            isNotMandatory={false}
                                            value={value || []}
                                            onChange={async files => {
                                                // Upload any File objects and replace them with URLs
                                                const processed: (File | string)[] = [];
                                                for (const f of files) {
                                                    if (typeof f === "string") {
                                                        processed.push(f);
                                                    } else {
                                                        try {
                                                            const url = await uploadFileToVercel(f, "diario");
                                                            processed.push(url);
                                                        } catch {
                                                            toast.error("Falha ao enviar arquivo.", { description: "Assegure que o arquivo tem menos de 10MB e verifique sua conexão." });
                                                        }
                                                    }
                                                }
                                                onChange(processed);
                                            }}
                                            error={error}
                                            acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
                                            progress={uploadProgress["diario"] ?? null}
                                        />
                                        
                                    </div>
                                )}
                            />

                            <h1 className="mt-5 text-xl md:text-xl lg:lg text-blue-fcsn dark:text-white-off font-bold">
                                Dados Bancários
                            </h1>

                            <div className="flex flex-col gap-y-4 mx-7">
                                <NormalInput
                                    text="Banco:"
                                    isNotMandatory={true} // mudei para nao ser mais obrigatorio
                                    registration={register("banco")}
                                    error={errors.banco}
                                />

                                <div className="flex flex-col md:flex-row h-full w-full justify-between md:items-start gap-y-4 md:gap-x-4">
                                    <div className="flex flex-col lg:flex-row w-full md:gap-x-4 items-start sm:items-center grow">
                                        <label
                                            htmlFor="numeroAgencia"
                                            className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                        >
                                            Agência:
                                        </label>
                                        <div className="flex items-start w-full gap-x-2">
                                            {/* Input para o Número da Agência */}
                                            <div className="flex-grow">
                                                <Controller
                                                    name="numeroAgencia"
                                                    control={control}
                                                    rules={{ required: false }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <>
                                                            <input
                                                                id="numeroAgencia"
                                                                type="text"
                                                                placeholder="Número"
                                                                {...field}
                                                                onChange={e => {
                                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                                    field.onChange(valorFiltrado);
                                                                }}
                                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                            />
                                                            {error && (
                                                                <p className="text-red-500 mt-1 text-sm">
                                                                    {error.message}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </div>

                                            {/* Input para o Dígito */}
                                            <div className="w-1/4 max-w-[80px]">
                                                <Controller
                                                    name="digitoAgencia"
                                                    control={control}
                                                    rules={{ required: false }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <>
                                                            <input
                                                                type="text"
                                                                placeholder="Dígito"
                                                                maxLength={1}
                                                                {...field}
                                                                onChange={e => {
                                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                                    field.onChange(valorFiltrado);
                                                                }}
                                                                className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 text-center ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                            />
                                                            {error && (
                                                                <p className="text-red-500 mt-1 text-sm">
                                                                    {error.message}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Controller
                                        name="conta"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div className="flex flex-col lg:flex-row w-full md:gap-x-4 items-start sm:items-center grow">
                                                <label
                                                    htmlFor="conta"
                                                    className="min-w-fit text-xl text-blue-fcsn dark:text-white-off self-start lg:self-center mb-1 font-bold"
                                                >
                                                    Conta Corrente:
                                                </label>
                                                <div className="w-full">
                                                    <input
                                                        id="conta"
                                                        type="text"
                                                        {...field}
                                                        onChange={e => {
                                                            const valorFiltrado = filtraDigitos(e.target.value);
                                                            field.onChange(valorFiltrado);
                                                        }}
                                                        className={`w-full h-[50px] bg-white dark:bg-blue-fcsn3 rounded-[7px] border-1 focus:shadow-lg focus:outline-none focus:border-2 px-3 ${error ? "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500" : "border-blue-fcsn dark:border-blue-fcsn focus:border-blue-fcsn dark:focus:border-blue-fcsn"}`}
                                                    />
                                                    {error && (
                                                        <p className="text-red-500 mt-1 text-sm">{error.message}</p>
                                                    )}
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

                            <LongInput
                                text="Breve descrição do projeto:"
                                isNotMandatory={false}
                                registration={register("descricao")}
                                error={errors.descricao}
                            />

                            <Controller
                                name="apresentacao"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <div>
                                        <FileInput
                                            text={"Apresentação do projeto:"}
                                            isNotMandatory={false}
                                            value={value || []}
                                            onChange={async files => {
                                                const processed: (File | string)[] = [];
                                                for (const f of files) {
                                                    if (typeof f === "string") processed.push(f);
                                                    else {
                                                        try {
                                                            processed.push(await uploadFileToVercel(f, "apresentacao"));
                                                        } catch {
                                                            toast.error("Falha ao enviar arquivo.", {description: "Assegure que o arquivo tem menos de 10MB e verifique sua conexão."});
                                                        }
                                                    }
                                                }
                                                onChange(processed);
                                            }}
                                            error={error}
                                            acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
                                            progress={uploadProgress["apresentacao"] ?? null}
                                        />
                                    </div>
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

                            <div
                                className={`transition-all duration-300 ease-in-out w-full ${isOutroPublicoSelected ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                            >
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
                                            const cidadesDoEstado = new Set(
                                                City.getCitiesOfState("BR", estadoUF).map(c => c.name)
                                            );
                                            const cidadesAtuais = watch("municipios");
                                            const novasCidades = cidadesAtuais.filter(
                                                cidade => !cidadesDoEstado.has(cidade)
                                            );
                                            setValue("municipios", novasCidades, { shouldValidate: true });
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
                                isNotMandatory={true}
                                registration={register("observacoes")}
                                error={errors.observacoes}
                            />
                        </div>
                        <div className="flex justify-end w-full px-[5%]">
                            <button
                                type="button"
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10"
                                onClick={() => setCurrentPage(2)}
                            >
                                Próxima página
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentPage === 2 && (
                <div className="w-full">
                    <div className="flex flex-col w-full items-center gap-8 mt-10">
                        <div className="w-11/12">
                            {/* Botão de download para o formulário de compliance */}
                            {(() => {
                                const normalizedCompliancePdfUrl = normalizeStoredUrl(compliancePdfUrl) || null;
                                if (!normalizedCompliancePdfUrl) return null;
                                return (
                                    <div className="flex flex-col items-start mb-4 gap-y-2">
                                        <p className="text-xl text-blue-fcsn dark:text-white-off font-bold">
                                            Faça o download do formulário de compliance, preencha-o e anexe no campo
                                            abaixo.
                                        </p>
                                        <a
                                            href={normalizedCompliancePdfUrl}
                                            download="Formulario_Compliance.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-fit px-4 h-[50px] bg-blue-fcsn dark:bg-blue-fcsn3 dark:hover:bg-blue-fcsn hover:bg-blue-fcsn2 rounded-[7px] text-md font-bold text-white cursor-pointer shadow-md flex items-center justify-center"
                                        >
                                            Baixar Formulário de Compliance
                                        </a>
                                    </div>
                                );
                            })()}

                            <Controller
                                name="compliance"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <div>
                                        <FileInput
                                            text={"Formulário de compliance:"}
                                            isNotMandatory={false}
                                            value={value || []}
                                            onChange={async files => {
                                                const processed: (File | string)[] = [];
                                                for (const f of files) {
                                                    if (typeof f === "string") processed.push(f);
                                                    else {
                                                        try {
                                                            processed.push(await uploadFileToVercel(f, "compliance"));
                                                        } catch {
                                                            toast.error("Falha ao enviar arquivo.", {description: "Assegure que o arquivo tem menos de 10MB e verifique sua conexão."});
                                                        }
                                                    }
                                                }
                                                onChange(processed);
                                            }}
                                            error={error as FieldError}
                                            acceptedFileTypes={["application/pdf"]}
                                            progress={uploadProgress["compliance"] ?? null}
                                        />
                                    </div>
                                )}
                            />
                            {/* Estatuto */}
                            <Controller
                            name="documentos.estatuto"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <div>
                                <FileInput
                                    text={"Estatuto:"}
                                    isNotMandatory={false}
                                    value={value || []}
                                    onChange={async files => {
                                    const processed: (File | string)[] = [];
                                    for (const f of files) {
                                        if (typeof f === "string") processed.push(f);
                                        else {
                                        try {
                                            processed.push(await uploadFileToVercel(f, "documentos/estatuto"));
                                        } catch {
                                            toast.error("Falha ao enviar arquivo.", {
                                            description:
                                                "Assegure que o arquivo tem menos de 10MB e verifique sua conexão.",
                                            });
                                        }
                                        }
                                    }
                                    onChange(processed);
                                    }}
                                    error={error as FieldError}
                                    acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
                                    progress={uploadProgress["documentos.estatuto"] ?? null}
                                />
                                </div>
                            )}
                            />

                            {/* Ata */}
                            <Controller
                            name="documentos.ata"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <div>
                                <FileInput
                                    text={"Ata:"}
                                    isNotMandatory={false}
                                    value={value || []}
                                    onChange={async files => {
                                    const processed: (File | string)[] = [];
                                    for (const f of files) {
                                        if (typeof f === "string") processed.push(f);
                                        else {
                                        try {
                                            processed.push(await uploadFileToVercel(f, "documentos/ata"));
                                        } catch {
                                            toast.error("Falha ao enviar arquivo.", {
                                            description:
                                                "Assegure que o arquivo tem menos de 10MB e verifique sua conexão.",
                                            });
                                        }
                                        }
                                    }
                                    onChange(processed);
                                    }}
                                    error={error as FieldError}
                                    acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
                                    progress={uploadProgress["documentos.ata"] ?? null}
                                />
                                </div>
                            )}
                            />

                            {/* Contrato */}
                            <Controller
                            name="documentos.contrato"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <div>
                                <FileInput
                                    text={"Contrato:"}
                                    isNotMandatory={false}
                                    value={value || []}
                                    onChange={async files => {
                                    const processed: (File | string)[] = [];
                                    for (const f of files) {
                                        if (typeof f === "string") processed.push(f);
                                        else {
                                        try {
                                            processed.push(await uploadFileToVercel(f, "documentos/contrato"));
                                        } catch {
                                            toast.error("Falha ao enviar arquivo.", {
                                            description:
                                                "Assegure que o arquivo tem menos de 10MB e verifique sua conexão.",
                                            });
                                        }
                                        }
                                    }
                                    onChange(processed);
                                    }}
                                    error={error as FieldError}
                                    acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
                                    progress={uploadProgress["documentos.contrato"] ?? null}
                                />
                                </div>
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
                                        Eu declaro ter lido e concordado com os Termos de Uso e a Política de
                                        Privacidade
                                        <span className="text-[#B15265]">*</span>
                                    </p>
                                </div>
                                {errors.termosPrivacidade && (
                                    <p className="text-red-500 text-sm mt-1 pl-7">{errors.termosPrivacidade.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row w-11/12 justify-between gap-4 mt-8">
                            <button
                                type="button"
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-gray-100 hover:bg-white rounded-[7px] text-md md:text-lg font-bold text-blue-fcsn cursor-pointer shadow-md mb-10"
                                onClick={() => setCurrentPage(1)}
                            >
                                Página anterior
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-[110px] md:w-[150px] h-[50px] md:h-[60px] bg-blue-fcsn hover:bg-blue-fcsn3 rounded-[7px] text-md md:text-lg font-bold text-white cursor-pointer shadow-md mb-10"
                            >
                                {isSubmitting ? "Enviando..." : "Enviar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
