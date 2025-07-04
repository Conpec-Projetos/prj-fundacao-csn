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
import { collection, addDoc, updateDoc, query, where, getDocs, runTransaction, doc, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, formsCadastroDados, dadosEstados, odsList, leiList, segmentoList, ambitoList } from "@/firebase/schema/entities";
import { getFileUrl, getOdsIds, getItemNome, slugifyEstado } from "@/lib/utils";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller, FieldError } from "react-hook-form";
import { State, City } from "country-state-city";

const MAX_FILE_SIZE_MB = 5;
const fileArraySchema = (acceptedTypes: string[], typeName: string) => z.array(z.instanceof(File), {
        required_error: "O envio de arquivos é obrigatório.",
    })
    .min(1, "É necessário enviar pelo menos um arquivo.")
    .refine(files => files.every(file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024), 
        `Tamanho máximo por arquivo é de ${MAX_FILE_SIZE_MB}MB.`)
    .refine(files => files.every(file => acceptedTypes.includes(file.type)),
        `Tipo de arquivo inválido. Apenas ${typeName} são aceitos.`
    );

const acompanhamentoSchema = z.object({
    instituicao: z.string().trim().min(1, "O nome da instituição é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    descricao: z.string().trim().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "Máximo de 500 caracteres permitidos"),
    segmento: z.coerce.number({ required_error: "A seleção do segmento é obrigatória." }).min(0, "A seleção do segmento é obrigatória."),
    lei: z.coerce.number({ required_error: "A seleção da lei é obrigatória." }).min(0, "A seleção da lei é obrigatória."),
    positivos: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    negativos: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    atencao: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    ambito: z.coerce.number({ required_error: "A seleção do âmbito é obrigatória." }).min(0, "A seleção do âmbito é obrigatória."),
    estados: z.array(z.string()).min(1, "Selecione pelo menos um estado."),
    municipios: z.array(z.string()).min(1, "Selecione pelo menos um município."),
    especificacoes: z.string().trim().min(20, "As especificações do território deve ter no mínimo 20 caracteres.").max(500, "Máximo de 500 caracteres permitidos"),
    dataComeco: z.string().min(1, "A data de início é obrigatória."),
    dataFim: z.string().min(1, "A data de fim é obrigatória."),
    contrapartidasProjeto: z.string().trim().min(20, "A descrição das contrapartidas deve ter no mínimo 20 caracteres.").max(500, "Máximo de 500 caracteres permitidos"),
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
    relato: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    fotos: fileArraySchema(['image/jpeg', 'image/png'], 'Imagens (JPG ou PNG)'),
    website: z.string().trim().url({ message: "URL inválida." }),
    links: z.string().trim().min(1, "Insira pelo menos um link.").max(300, "Máximo de 300 caracteres permitidos"),
    contrapartidasExecutadas: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    }).refine(data => new Date(data.dataFim) > new Date(data.dataComeco), {
        message: "A data final deve ser posterior à data inicial.",
        path: ["dataFim"],
    });

type FormFields = z.infer<typeof acompanhamentoSchema>;

type DadosComparaveisProjeto = {
    beneficiariosDiretos: number;
    beneficiariosIndiretos?: number;
    lei: string;
    segmento: string;
    municipios: string[];
    estados: string[];
    ods: number[];
};

async function handleInfoRemovida(ultimoForm: DadosComparaveisProjeto, nomeEstado: string) {
    const estadoDocID = slugifyEstado(nomeEstado);
    const docRef = doc(db, "dadosEstados", estadoDocID);

    try {
        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);
            if (!docSnapshot.exists()) return;
            
            const updates: Partial<dadosEstados> = {};
            const dadosAtuais = docSnapshot.data() as dadosEstados;

            // Reverte as contagens
            updates.beneficiariosDireto = (dadosAtuais.beneficiariosDireto || 0) - (ultimoForm.beneficiariosDiretos || 0);
            updates.beneficiariosIndireto = (dadosAtuais.beneficiariosIndireto || 0) - (ultimoForm.beneficiariosIndiretos || 0);
            updates.qtdProjetos = (dadosAtuais.qtdProjetos || 0) - 1;
            // Assumimos que a organização também sai junto com o único projeto dela naquele estado
            updates.qtdOrganizacoes = (dadosAtuais.qtdOrganizacoes || 0) - 1;
            
            // Reverte ODS
            const antigoOdsIds = ultimoForm.ods;
            const novosProjetosODS = [...(dadosAtuais.projetosODS || [])];
            antigoOdsIds.forEach(id => {
                 if (id >= 0 && id < novosProjetosODS.length) { 
                    novosProjetosODS[id] = Math.max(0, (novosProjetosODS[id] || 0) - 1);
                 }
            });
            updates.projetosODS = novosProjetosODS;

            // Reverte Lei e Segmento
            updates.lei = dadosAtuais.lei.map(item => item.nome === ultimoForm.lei ? { ...item, qtdProjetos: Math.max(0, (item.qtdProjetos || 0) - 1) } : item);
            updates.segmento = dadosAtuais.segmento.map(item => item.nome === ultimoForm.segmento ? { ...item, qtdProjetos: Math.max(0, (item.qtdProjetos || 0) - 1) } : item);

            // Reverte Municípios
            const antigoMunicipios = ultimoForm.municipios.filter(m => City.getAllCities().find(c => c.name === m)?.stateCode === State.getAllStates().find(s => s.name === nomeEstado)?.isoCode);
            updates.municipios = dadosAtuais.municipios.filter(m => !antigoMunicipios.includes(m));
            updates.qtdMunicipios = (dadosAtuais.qtdMunicipios || 0) - antigoMunicipios.length;

            transaction.update(docRef, updates);
        });
    } catch (e) {
        console.error("Erro ao reverter dados do estado removido:", e);
        throw e;
    }
}

async function handleInfoAdicionada(novoForm: FormFields, nomeEstado: string) {
    const estadoDocID = slugifyEstado(nomeEstado);
    const docRef = doc(db, "dadosEstados", estadoDocID);
    
    try {
        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);
            if (!docSnapshot.exists()) return;

            const dadosAtuais = docSnapshot.data() as dadosEstados;
            const updates: Partial<dadosEstados> = {};

            // Adiciona novas contagens
            updates.beneficiariosDireto = (dadosAtuais.beneficiariosDireto || 0) + novoForm.beneficiariosDiretos;
            updates.beneficiariosIndireto = (dadosAtuais.beneficiariosIndireto || 0) + novoForm.beneficiariosIndiretos;
            updates.qtdProjetos = (dadosAtuais.qtdProjetos || 0) + 1;
            updates.qtdOrganizacoes = (dadosAtuais.qtdOrganizacoes || 0) + 1;

             // Adiciona ODS
            const novoOdsIds = getOdsIds(novoForm.ods);
            const novosProjetosODS = [...(dadosAtuais.projetosODS || Array(17).fill(0))];
            novoOdsIds.forEach(id => {
                if (id >= 0 && id < novosProjetosODS.length) {
                    novosProjetosODS[id] = (novosProjetosODS[id] || 0) + 1;
                }
            });
            updates.projetosODS = novosProjetosODS;

            // Adiciona Lei e Segmento
            const leiSelecionadaNome = getItemNome(novoForm.lei, leiList);
            updates.lei = dadosAtuais.lei.map(item => item.nome === leiSelecionadaNome ? { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 } : item);
            
            const segmentoSelecionadoNome = getItemNome(novoForm.segmento, segmentoList);
            updates.segmento = dadosAtuais.segmento.map(item => item.nome === segmentoSelecionadoNome ? { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 } : item);

            // Adiciona Municípios
            const novoMunicipios = novoForm.municipios.filter(m => City.getAllCities().find(c => c.name === m)?.stateCode === State.getAllStates().find(s => s.name === nomeEstado)?.isoCode);
            const novoMunicipiosSet = new Set([...dadosAtuais.municipios, ...novoMunicipios]);
            updates.municipios = Array.from(novoMunicipiosSet);
            updates.qtdMunicipios = (dadosAtuais.qtdMunicipios || 0) + novoMunicipios.length;

            transaction.update(docRef, updates);
        });
    } catch (e) {
        console.error("Erro ao adicionar dados ao novo estado:", e);
        throw e;
    }
}

async function handleInfoPersistida(ultimoForm: DadosComparaveisProjeto, novoForm: FormFields, nomeEstado: string) {
    const estadoDocID = slugifyEstado(nomeEstado);
    const docRef = doc(db, "dadosEstados", estadoDocID);
    
    try {
        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);
            if (!docSnapshot.exists()) return;

            const dadosAtuais = docSnapshot.data() as dadosEstados;
            const updates: Partial<dadosEstados> = {};

            // Beneficiários
            const diffBeneficiarios = novoForm.beneficiariosDiretos - (ultimoForm.beneficiariosDiretos || 0);
            updates.beneficiariosDireto = (dadosAtuais.beneficiariosDireto || 0) + diffBeneficiarios;
            const diffBeneficiariosIndiretos = novoForm.beneficiariosIndiretos - (ultimoForm.beneficiariosIndiretos || 0);
            updates.beneficiariosIndireto = (dadosAtuais.beneficiariosIndireto || 0) + diffBeneficiariosIndiretos;

            // Lei
            const antigoLei = ultimoForm.lei;
            const novaLei = getItemNome(novoForm.lei, leiList);
            if (antigoLei !== novaLei) {
                updates.lei = dadosAtuais.lei.map(item => {
                    if (item.nome === antigoLei) return { ...item, qtdProjetos: Math.max(0, (item.qtdProjetos || 0) - 1) };
                    if (item.nome === novaLei) return { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 };
                    return item;
                });
            }

            // Segmento
            const antigoSegmento = ultimoForm.segmento;
            const novoSegmento = getItemNome(novoForm.segmento, segmentoList);
             if (antigoSegmento !== novoSegmento) {
                updates.segmento = dadosAtuais.segmento.map(item => {
                    if (item.nome === antigoSegmento) return { ...item, qtdProjetos: Math.max(0, (item.qtdProjetos || 0) - 1) };
                    if (item.nome === novoSegmento) return { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 };
                    return item;
                });
            }

            // ODS
            const antigoOdsIds = new Set(ultimoForm.ods);
            const novoOdsIds = new Set(getOdsIds(novoForm.ods));
            const novosProjetosODS = [...(dadosAtuais.projetosODS || Array(17).fill(0))];
            
            antigoOdsIds.forEach(id => { if (!novoOdsIds.has(id)) novosProjetosODS[id] = Math.max(0, (novosProjetosODS[id] || 0) - 1) });
            novoOdsIds.forEach(id => { if (!antigoOdsIds.has(id)) novosProjetosODS[id] = (novosProjetosODS[id] || 0) + 1 });
            updates.projetosODS = novosProjetosODS;

            // Municípios
            const oldMunicipios = new Set(ultimoForm.municipios);
            const newMunicipios = new Set(novoForm.municipios);
            const atualTotalMunicipios = new Set(dadosAtuais.municipios);

            oldMunicipios.forEach(m => { if (!newMunicipios.has(m)) atualTotalMunicipios.delete(m) });
            newMunicipios.forEach(m => atualTotalMunicipios.add(m));

            updates.municipios = Array.from(atualTotalMunicipios);
            updates.qtdMunicipios = atualTotalMunicipios.size;


            transaction.update(docRef, updates);
        });
    } catch (e) {
        console.error("Erro ao atualizar dados do estado persistente:", e);
        throw e;
    }
}

export default function FormsAcompanhamento() {

    const router = useRouter();
    const routeParams = useParams<{ id: string }>();
    const { darkMode } = useTheme();
    const [isCheckingUser, setIsCheckingUser] = useState(true); // useState para verificar o login

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
            let ultimoForm: DadosComparaveisProjeto | null = null;

            // Tenta buscar o forms-acompanhamento mais recente
            const acompanhamentoQuery = query(
                collection(db, "forms-acompanhamento"),
                where("projetoID", "==", projetoID),
                orderBy("dataResposta", "desc"),
                limit(1)
            );
            const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);

            if (!acompanhamentoSnapshot.empty) {
                // Se encontrou, usa este como 'ultimoForm'
                console.log("Usando o último formulário de acompanhamento como base.");
                const ultimoFormAcompanhamento = acompanhamentoSnapshot.docs[0].data() as formsAcompanhamentoDados;
                ultimoForm = {
                    beneficiariosDiretos: ultimoFormAcompanhamento.beneficiariosDiretos,
                    beneficiariosIndiretos: ultimoFormAcompanhamento.beneficiariosIndiretos,
                    lei: ultimoFormAcompanhamento.lei,
                    segmento: ultimoFormAcompanhamento.segmento,
                    municipios: ultimoFormAcompanhamento.municipios,
                    estados: ultimoFormAcompanhamento.estados,
                    ods: ultimoFormAcompanhamento.ods,
                };
            } else {
                // Se não encontrou, faz o fallback para o forms-cadastro
                console.log("Nenhum acompanhamento anterior encontrado. Usando o formulário de cadastro como base.");
                const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", projetoID));
                const cadastroSnapshot = await getDocs(cadastroQuery);

                if (!cadastroSnapshot.empty) {
                    const originalCadastro = cadastroSnapshot.docs[0].data() as formsCadastroDados;
                    ultimoForm = {
                        beneficiariosDiretos: originalCadastro.beneficiariosDiretos,
                        // forms-cadastro não tem o campo de beneficiariosIndireto
                        lei: originalCadastro.lei,
                        segmento: originalCadastro.segmento,
                        municipios: originalCadastro.municipios,
                        estados: originalCadastro.estados,
                        ods: originalCadastro.ods,
                    };
                }
            }

            if (!ultimoForm) {
                toast.error("Não foi possível encontrar uma referência a esse projeto.");
                toast.dismiss(loadingToastId);
                return;
            }

            // Determinar quais estados foram adicionados, removidos ou mantidos
            const antigoEstados = new Set(ultimoForm.estados);
            const novoEstados = new Set(data.estados);

            const estadosRemovidos = [...antigoEstados].filter(s => !novoEstados.has(s));
            const estadosAdicionados = [...novoEstados].filter(s => !antigoEstados.has(s));
            const estadosPersistidos = [...antigoEstados].filter(s => novoEstados.has(s));

            // Executar as atualizações em paralelo
            const updatePromises = [
                ...estadosRemovidos.map(state => handleInfoRemovida(ultimoForm, state)),
                ...estadosAdicionados.map(state => handleInfoAdicionada(data, state)),
                ...estadosPersistidos.map(state => handleInfoPersistida(ultimoForm, data, state))
            ];
            
            await Promise.all(updatePromises);

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

            const formsAcompanhamentoRef = await addDoc(collection(db, "forms-acompanhamento"), uploadFirestore);

            const projetoDocRef = doc(db, "projetos", projetoID);
            await updateDoc(projetoDocRef, {
                // estados: data.estados, // Se algum dia precisar de adicionar os estados na coleção de projetos é só descomentar.
                municipios: data.municipios,
                ultimoFormulario: formsAcompanhamentoRef.id
            });

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