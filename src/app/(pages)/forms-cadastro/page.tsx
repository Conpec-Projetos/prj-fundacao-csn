'use client';
import Footer from "@/components/footer/footer";
import { useState, useEffect } from "react";
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
    PublicoBeneficiadoInput,
    SingleEstadoInput
} from "@/components/inputs/inputs";
import { State, City } from "country-state-city";
import { Toaster, toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, arrayUnion, runTransaction } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase-config";

import { formsCadastroDados, odsList, leiList, segmentoList, Projetos, publicoList, dadosEstados } from "@/firebase/schema/entities";
import { getFileUrl, getOdsIds, getPublicoNomes, getItemNome, slugifyEstado, validaCNPJ, formatCNPJ, formatCEP, formatTelefone, formatMoeda, filtraDigitos } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller, FieldError } from "react-hook-form";

const MAX_FILE_SIZE_MB = 10;
const fileArraySchema = (acceptedTypes: string[], typeName: string) => z.array(z.instanceof(File), {
        required_error: "O envio de arquivos é obrigatório.",
    })
    .min(1, "É necessário enviar pelo menos um arquivo.")
    .refine(files => files.every(file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024), 
        `Tamanho máximo por arquivo é de ${MAX_FILE_SIZE_MB}MB.`)
    .refine(files => files.every(file => acceptedTypes.includes(file.type)),
        `Tipo de arquivo inválido. Apenas ${typeName} são aceitos.`
    );

const outroPublicoIndex = publicoList.findIndex(p => p.nome.toLowerCase().startsWith('outro'));

const formsCadastroSchema = z.object({
    instituicao: z.string().trim().min(1, "O nome da instituição é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    cnpj: z.string().trim()
    .min(1, "O CNPJ é obrigatório.") // Garante que o campo não seja enviado vazio
    .refine((cnpj) => {
        const apenasDigitos = cnpj.replace(/\D/g, '');
        return apenasDigitos.length === 14;
    }, "O CNPJ deve conter 14 dígitos.")
    .refine(validaCNPJ, "O CNPJ informado não é válido."),
    representanteLegal: z.string().trim().min(1, "O nome do representante é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    telefone: z.string().trim().min(14, "Forneça um número de telefone válido.").max(15, "O telefone deve ter no máximo 11 dígitos."),
    emailRepLegal: z.string().trim().email("Formato de e-mail inválido.").min(1, "O e-mail do representante é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    emailResponsavel: z.string().trim().email("Formato de e-mail inválido.").min(1, "O e-mail do responsável é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    cep: z.string().trim().regex(/^\d{5}-\d{3}$/, { message: "Formato de CEP inválido (ex: 12345-678)."}),
    endereco: z.string({ required_error: "" }).trim().min(1, "O endereço é obrigatório.").max(200, "Máximo de 200 caracteres permitidos"),
    numeroEndereco: z.coerce.number({ invalid_type_error: "Número inválido" }).min(1, "O número é obrigatório."),
    complemento: z.string().max(150, "Máximo de 150 caracteres permitidos").optional(),
    cidade: z.string({ required_error: "" }).trim().min(1, "A cidade é obrigatória.").max(30, "Máximo de 30 caracteres permitidos"),
    estado: z.string({ required_error: "" }).trim().min(1, "O estado é obrigatório."),
    nomeProjeto: z.string().trim().min(1, "O nome do projeto é obrigatório.").max(150, "Máximo de 150 caracteres permitidos"),
    website: z.string().trim().url({ message: "URL inválida." }),
    valorAprovado: z.coerce.number({ invalid_type_error: "Valor inválido" }).positive("O valor aprovado deve ser maior que zero."),
    valorApto: z.coerce.number({ invalid_type_error: "Valor inválido" }).positive("O valor apto a captar deve ser maior que zero."),
    dataComeco: z.string().min(1, "A data de início é obrigatória."),
    dataFim: z.string().min(1, "A data de fim é obrigatória."),
    banco: z.string().trim().min(1, "O nome do banco é obrigatório.").max(50, "Máximo de 50 caracteres permitidos"),
    agencia: z.string().trim().min(1, "A agência é obrigatória.").max(10, "Máximo de 10 caracteres permitidos"),
    conta: z.string().trim().min(1, "A conta corrente é obrigatória.").max(15, "Máximo de 15 caracteres permitidos"),
    segmento: z.coerce.number({ required_error: "A seleção do segmento é obrigatória.", invalid_type_error: "Selecione uma das opções" }).min(0, "A seleção do segmento é obrigatória."),
    descricao: z.string().trim().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "Máximo de 500 caracteres permitidos"),
    publico: z.array(z.boolean()).refine(val => val.some(v => v), { message: "Selecione pelo menos um público." }),
    outroPublico: z.string().max(40, "Máximo de 40 caracteres permitidos").optional(),
    ods: z.array(z.boolean()).refine(val => val.filter(Boolean).length > 0, { message: "Selecione pelo menos uma ODS." }).refine(val => val.filter(Boolean).length <= 3, { message: "Selecione no máximo 3 ODSs." }),
    beneficiariosDiretos: z.coerce.number({ invalid_type_error: "Número inválido" }).min(1, "O número de beneficiários é obrigatório."),
    estados: z.array(z.string()).min(1, "Selecione pelo menos um estado."),
    municipios: z.array(z.string()).min(1, "Selecione pelo menos um município."),
    lei: z.coerce.number({ required_error: "A seleção da lei é obrigatória." }).min(0, "A seleção da lei é obrigatória."),
    numeroLei: z.string().trim().min(1, "O número de aprovação da lei é obrigatório.").max(20, "Máximo de 20 caracteres permitidos"),
    contrapartidasProjeto: z.string().trim().min(10, "A descrição das contrapartidas é obrigatória.").max(500, "Máximo de 500 caracteres permitidos"),
    observacoes: z.string().trim().min(10, "As observações devem ter no mínimo 10 caracteres.").max(500, "Máximo de 500 caracteres permitidos"),
    diario: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens'),
    apresentacao: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens'),
    compliance: fileArraySchema(['application/pdf'], 'PDF'),
    documentos: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens'),
    termosPrivacidade: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos de privacidade para continuar." }),
        }),
    }).refine(data => {
        if (data.publico[outroPublicoIndex] && !data.outroPublico?.trim()) {
            return false;
        }
        return true;
    }, {
    message: "Por favor, especifique o público.",
    path: ["outroPublico"], 
});

type FormFields = z.infer<typeof formsCadastroSchema>;

async function updateDadosEstado(formData: FormFields, stateName: string) {
    // Converte o nome do estado (ex: "São Paulo") para o ID do documento (ex: "sao_paulo")
    const estadoDocID = slugifyEstado(stateName);
    const docRef = doc(db, "dadosEstados", estadoDocID);

    try {
        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);

            if (!docSnapshot.exists()) {
                console.error(`Documento para o estado ${stateName} (${estadoDocID}) não encontrado!`);
                return;
            }


            const dadosAtuais = docSnapshot.data() as dadosEstados;
            type UpdatesType = Partial<{
                beneficiariosDireto: number;
                lei: typeof dadosAtuais.lei;
                municipios: string[];
                qtdMunicipios: number;
                projetosODS: number[];
                qtdOrganizacoes: number;
                qtdProjetos: number;
                segmento: typeof dadosAtuais.segmento;
            }>;
            const updates: UpdatesType = {};

            // beneficiariosDireto
            updates.beneficiariosDireto = (dadosAtuais.beneficiariosDireto || 0) + formData.beneficiariosDiretos;

            // lei
            const leiSelecionadaNome = getItemNome(formData.lei, leiList);
            updates.lei = dadosAtuais.lei.map(item =>
                item.nome === leiSelecionadaNome
                    ? { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 }
                    : item
            );

            // municipios
            const municipiosAtuais = new Set(dadosAtuais.municipios || []); 

            const estadoObject = State.getAllStates().find(s => s.name === stateName && s.countryCode === 'BR');

            if (estadoObject) {
                // Pega a lista de cidades APENAS desse estado
                const municipiosDoEstado = City.getCitiesOfState('BR', estadoObject.isoCode);
                const nomeMunicipios = new Set(municipiosDoEstado.map(c => c.name));

                // Filtra os municípios do formulário para garantir que eles pertencem a este estado
                const formMunicipios = formData.municipios.filter(m => nomeMunicipios.has(m));

                const novoMunicipiosSet = new Set([...municipiosAtuais, ...formMunicipios]);
                const municipiosAdicionados = novoMunicipiosSet.size - municipiosAtuais.size;
                
                updates.municipios = Array.from(novoMunicipiosSet);
                updates.qtdMunicipios = (dadosAtuais.qtdMunicipios || 0) + municipiosAdicionados;
            } else {
                console.warn(`Não foi possível encontrar o objeto do estado para: ${stateName}`);
            }

            // projetosODS
            const odsIds = getOdsIds(formData.ods);
            const novosProjetosODS = [...(dadosAtuais.projetosODS || Array(17).fill(0))];
            odsIds.forEach(id => {
                // ODSs são base 1, array é base 0.
                if (id >= 0 && id < novosProjetosODS.length) {
                    novosProjetosODS[id] = (novosProjetosODS[id] || 0) + 1;
                }
            });
            updates.projetosODS = novosProjetosODS;

            // qtdOrganizacoes & qtdProjetos
            updates.qtdOrganizacoes = (dadosAtuais.qtdOrganizacoes || 0) + 1;
            updates.qtdProjetos = (dadosAtuais.qtdProjetos || 0) + 1;

            // segmento
            const segmentoSelecionadoNome = getItemNome(formData.segmento, segmentoList);
            updates.segmento = dadosAtuais.segmento.map(item =>
                item.nome === segmentoSelecionadoNome
                    ? { ...item, qtdProjetos: (item.qtdProjetos || 0) + 1 }
                    : item
            );

            // Aplica todas as atualizações na transação
            transaction.update(docRef, updates);
        });
        console.log(`Documento do estado ${stateName} atualizado com sucesso.`);
    } catch (error) {
        console.error(`Erro ao atualizar dados para o estado ${stateName}:`, error);
        // Lançar o erro novamente para que o `onSubmit` principal possa capturá-lo
        throw error;
    }
}

export default function FormsCadastro() {
    const [usuarioAtualID, setUsuarioAtualID] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(formsCadastroSchema),
        mode: "onBlur",
        defaultValues: {
            instituicao: "",
            cnpj: "",
            representanteLegal: "",
            telefone: "",
            emailRepLegal: "",
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
            // @ts-expect-error O erro de tipagem aqui é esperado e pode ser ignorado
            termosPrivacidade: false,
        },
    });
    
    const watchedCep = watch('cep'); // Observa alterações no campo CEP
    const watchedEstados = watch('estados');

    useEffect(() => {
        const fetchAddress = async (cep: string) => {
            // Remove caracteres não numéricos do CEP
            const cepFormatado = cep.replace(/\D/g, '');

            if (cepFormatado.length !== 8) {
                return; // Sai se o CEP não estiver completo
            }

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);

                if (!response.ok) {
                    throw new Error('CEP não encontrado');
                }

                const data = await response.json();

                // Adiciona o bairro junto ao nome da rua, se o bairro existir
                const fullAddress = data.bairro ? `${data.logradouro} - ${data.bairro}` : data.logradouro;

                // Preenche os campos do formulário com os dados do endereço
                setValue("endereco", fullAddress, { shouldValidate: true });
                setValue("cidade", data.localidade, { shouldValidate: true });
                setValue("estado", data.uf, { shouldValidate: true });
            
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        };

        fetchAddress(watchedCep);
    }, [watchedCep, setValue]); // O useEffect será executado quando watchedCep ou setValue mudarem
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUsuarioAtualID(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const loadingToastId = toast.loading("Enviando formulário...");

        try {
            const projetoData: Projetos = {
                nome: data.nomeProjeto,
                // estados: data.estados, // Se algum dia precisar de adicionar os estados na coleção de projetos é só descomentar.
                municipios: data.municipios,
                status: "pendente",
                ativo: false,
                compliance: "pendente",
                empresas: [],
                indicacao: "",
                ultimoFormulario: "",
                valorAportadoReal: 0
            };

            const docProjetoRef = await addDoc(collection(db, "projetos"), projetoData);
            const projetoID = docProjetoRef.id;

            const [diarioUrl, apresentacaoUrl, complianceUrl, documentosUrl] = await Promise.all([
                getFileUrl(data.diario, 'forms-cadastro', projetoID, "diario"),
                getFileUrl(data.apresentacao, 'forms-cadastro', projetoID, "apresentacao"),
                getFileUrl(data.compliance, 'forms-cadastro', projetoID, "compliance"),
                getFileUrl(data.documentos, 'forms-cadastro', projetoID)
            ]);
            
            const formData: formsCadastroDados = {
                dataPreenchido: new Date().toISOString().split('T')[0],
                instituicao: data.instituicao,
                cnpj: data.cnpj,
                representante: data.representanteLegal,
                telefone: data.telefone,
                emailLegal: data.emailRepLegal,
                emailResponsavel: data.emailResponsavel,
                cep: data.cep,
                endereco: data.endereco,
                numeroEndereco: data.numeroEndereco,
                complemento: data.complemento || "",
                cidade: data.cidade,
                estado: data.estado,
                nomeProjeto: data.nomeProjeto,
                website: data.website,
                valorAprovado: data.valorAprovado,
                valorApto: data.valorApto,
                dataInicial: data.dataComeco,
                dataFinal: data.dataFim,
                banco: data.banco,
                agencia: data.agencia,
                conta: data.conta,
                segmento: getItemNome(data.segmento, segmentoList),
                descricao: data.descricao,
                publico: getPublicoNomes(data.publico, data.outroPublico || ""),
                ods: getOdsIds(data.ods),
                beneficiariosDiretos: data.beneficiariosDiretos,
                qtdEstados: data.estados.length,
                estados: data.estados,
                qtdMunicipios: data.municipios.length,
                municipios: data.municipios,
                lei: getItemNome(data.lei, leiList),
                numeroLei: data.numeroLei,
                contrapartidasProjeto: data.contrapartidasProjeto,
                observacoes: data.observacoes,
                termosPrivacidade: data.termosPrivacidade,
                projetoID: projetoID,
                diario: diarioUrl,
                apresentacao: apresentacaoUrl,
                compliance: complianceUrl,
                documentos: documentosUrl,
            };

            const docCadastroRef = await addDoc(collection(db, "forms-cadastro"), formData);
            await updateDoc(doc(db, "projetos", projetoID), { ultimoFormulario: docCadastroRef.id });

            const updatePromises = data.estados.map(estado => updateDadosEstado(data, estado));
            await Promise.all(updatePromises);

            if (usuarioAtualID) {
                const q = query(collection(db, "associacao"), where("usuarioID", "==", usuarioAtualID));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    await updateDoc(querySnapshot.docs[0].ref, { projetosIDs: arrayUnion(projetoID) });
                } else {
                    await addDoc(collection(db, "associacao"), { usuarioID: usuarioAtualID, projetosIDs: [projetoID] });
                }
            }

            toast.dismiss(loadingToastId);
            console.log("Formulário enviado com sucesso:", docCadastroRef.id);
            toast.success(`Formulário enviado com sucesso!`);
        } catch (error) {
            console.error("Erro ao enviar formulário: ", error);
            toast.dismiss(loadingToastId);
            toast.error("Erro ao enviar formulário. Tente novamente.");
        }
    };


    return(
        <main className="flex flex-col justify-between items-center w-[screen] h-[dvh] overflow-hidden no-scrollbar">
            <HeaderSecundario />
            <div className="flex flex-col items-center justify-center w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh] text-blue-fcsn dark:text-white-off text-7xl font-bold"
            >
                <h1 className="text-center w-[90dvw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
                 >Inscrição de Projeto</h1>

            </div>
            
            <form 
                className="flex flex-col justify-center items-center max-w-[1500px] w-[90vw] sm:w-[80vw] xl:w-[70vw] mb-20 bg-white-off dark:bg-blue-fcsn2 rounded-lg shadow-lg"
                onSubmit={handleSubmit(onSubmit)}
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
                                    render={({ field, fieldState: { error } }) => {
                                        const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const valorFormatado = formatCNPJ(e.target.value);
                                            field.onChange(valorFormatado);
                                        };

                                        return (
                                            <NormalInput
                                                text="CNPJ:"
                                                isNotMandatory={false}
                                                registration={{ ...field, onChange: handleCnpjChange }}
                                                error={error}
                                            />
                                        );
                                    }}
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
                                    render={({ field, fieldState: { error } }) => {
                                        const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const valorFormatado = formatTelefone(e.target.value);
                                            field.onChange(valorFormatado);
                                        };

                                        return (
                                            <NormalInput
                                                text="Telefone do representante legal:"
                                                isNotMandatory={false}
                                                registration={{ ...field, onChange: handleTelefoneChange }}
                                                error={error}
                                            />
                                        );
                                    }}
                                />

                                <NormalInput
                                    text="E-mail do representante legal:"
                                    isNotMandatory={false}
                                    registration={register("emailRepLegal")}
                                    error={errors.emailRepLegal}
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
                                    render={({ field, fieldState: { error } }) => {
                                        const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const valorFormatado = formatCEP(e.target.value);
                                            field.onChange(valorFormatado);
                                        };

                                        return (
                                            <NormalInput
                                                text="CEP:"
                                                isNotMandatory={false}
                                                registration={{ ...field, onChange: handleCepChange }}
                                                error={error}
                                            />
                                        );
                                    }}
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
                                        isNotMandatory={false}
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
                                    isNotMandatory={false}
                                    registration={register("website")}
                                    error={errors.website}
                                />

                                <Controller
                                    name="valorAprovado"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => {
                                        const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            // Remove tudo que não é dígito
                                            const digitsOnly = filtraDigitos(e.target.value);
                                            // Converte para número (em Reais, não centavos)
                                            const numericValue = digitsOnly ? parseInt(digitsOnly, 10) / 100 : undefined;
                                            // Atualiza o estado do formulário com o número puro
                                            field.onChange(numericValue);
                                        };

                                        return (
                                            <NormalInput
                                                text="Valor aprovado:"
                                                isNotMandatory={false}
                                                // O valor exibido é formatado, mas o valor do campo (field.value) é um número
                                                registration={{ ...field, value: field.value ? formatMoeda(field.value) : "", onChange: handleValueChange }}
                                                error={error}
                                                placeholder="R$ "
                                                type="text"
                                            />
                                        );
                                    }}
                                />

                                <Controller
                                    name="valorApto"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => {
                                        const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const digitsOnly = filtraDigitos(e.target.value);
                                            const numericValue = digitsOnly ? parseInt(digitsOnly, 10) / 100 : undefined;
                                            field.onChange(numericValue);
                                        };

                                        return (
                                            <NormalInput
                                                text="Valor apto a captar:"
                                                isNotMandatory={false}
                                                registration={{ ...field, value: field.value ? formatMoeda(field.value) : "", onChange: handleValueChange }}
                                                error={error}
                                                placeholder="R$ "
                                                type="text"
                                            />
                                        );
                                    }}
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
                                        <Controller
                                            name="agencia"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => {
                                                const handleAgenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                    field.onChange(valorFiltrado);
                                                };

                                                return (
                                                    <NormalInput
                                                        text="Agência:"
                                                        isNotMandatory={false}
                                                        registration={{ ...field, onChange: handleAgenciaChange }}
                                                        error={error}
                                                    />
                                                );
                                            }}
                                        />

                                        <Controller
                                            name="conta"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => {
                                                const handleContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const valorFiltrado = filtraDigitos(e.target.value);
                                                    field.onChange(valorFiltrado);
                                                };

                                                return (
                                                    <NormalInput
                                                        text="Conta Corrente:"
                                                        isNotMandatory={false}
                                                        registration={{ ...field, onChange: handleContaChange }}
                                                        error={error}
                                                    />
                                                );
                                            }}
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

                                <LongInput text="Breve descrição do projeto:" isNotMandatory={false} registration={register("descricao")} error={errors.descricao}/>
                                
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

                                <PublicoBeneficiadoInput
                                    text="Público beneficiado:"
                                    isNotMandatory={false}
                                    list={publicoList.map(p => p.nome)}
                                    control={control}
                                    checkboxesName="publico"
                                    outroFieldName="outroPublico"
                                    errors={errors}
                                />
                                
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

                                <LeiSelect
                                    text="Lei de incentivo do projeto:"
                                    list={leiList.map(l => l.nome)}
                                    isNotMandatory={false}
                                    registration={register("lei")}
                                    error={errors.lei}
                                />

                                <NormalInput
                                    text="Número de aprovação do projeto por lei:"
                                    isNotMandatory={false}
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
            <Toaster richColors closeButton />
            <Footer/>
        </main>
    );
}