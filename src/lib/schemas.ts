import { z } from "zod";
import { validaCNPJ } from "./utils";
import { publicoList } from "@/firebase/schema/entities";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%&*()_+-=]{8,}$/;
const passwordErrorMessage = "A senha precisa ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.";

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "A senha é obrigatória"), // Mantém uma verficação básica, a validação completa é feita no signin
});

export const signinSchema = z.object({
    name: z.string().min(3, {message: "O nome deve incluir no mínimo 3 caracteres."}).regex(/^[A-Za-z\s]+$/, {message: "O nome deve conter apenas letras."}), // Nome deve conter apenas letras e espaços, com no mínimo 3 caracteres
    email: z.string().email({message: "Email inválido!"}).min(1),
    password: z.string().regex(passwordRegex, {
        message: passwordErrorMessage
    }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

const fileArraySchema = (acceptedTypes: string[], typeName: string, maxFileSize: number) => z.array(z.instanceof(File), {
        required_error: "O envio de arquivos é obrigatório.",
    })
    .min(1, "É necessário enviar pelo menos um arquivo.")
    .refine(files => files.every(file => file.size <= maxFileSize * 1024 * 1024), 
        `Tamanho máximo por arquivo é de ${maxFileSize}MB.`)
    .refine(files => files.every(file => acceptedTypes.includes(file.type)),
        `Tipo de arquivo inválido. Apenas ${typeName} são aceitos.`
    );

export const formsAcompanhamentoSchema = z.object({
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
    relato: z.string().trim().max(500, "Máximo de 500 caracteres permitidos").optional(),
    fotos: fileArraySchema(['image/jpeg', 'image/png'], 'Imagens (JPG ou PNG)', 5),
    website: z.string().trim().optional(),
    links: z.string().trim().max(300, "Máximo de 300 caracteres permitidos").optional(),
    contrapartidasExecutadas: z.string().max(500, "Máximo de 500 caracteres permitidos").optional(),
    }).refine(data => new Date(data.dataFim) > new Date(data.dataComeco), {
        message: "A data final deve ser posterior à data inicial.",
        path: ["dataFim"],
    });

export type FormsAcompanhamentoFormFields = z.infer<typeof formsAcompanhamentoSchema>;

const outroPublicoIndex = publicoList.findIndex(p => p.nome.toLowerCase().startsWith('outro'));

export const formsCadastroSchema = z.object({
    instituicao: z.string().trim().min(1, "O nome da instituição é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    cnpj: z.string().trim()
    .min(1, "O CNPJ é obrigatório.")
    .refine((cnpj) => {
        const apenasDigitos = cnpj.replace(/\D/g, '');
        return apenasDigitos.length === 14;
    }, "O CNPJ deve conter 14 dígitos.")
    .refine(validaCNPJ, "O CNPJ informado não é válido."),
    representanteLegal: z.string().trim().min(1, "O nome do representante é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    telefone: z.string().trim().min(14, "Forneça um número de telefone válido.").max(15, "O telefone deve ter no máximo 11 dígitos."),
    emailRepLegal: z.string().trim().email("Formato de e-mail inválido.").min(1, "O e-mail do representante é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    responsavel: z.string().trim().min(1, "O nome do responsável do projeto é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    emailResponsavel: z.string().trim().email("Formato de e-mail inválido.").min(1, "O e-mail do responsável é obrigatório.").max(100, "Máximo de 100 caracteres permitidos"),
    cep: z.string().trim().regex(/^\d{5}-\d{3}$/, { message: "Formato de CEP inválido (ex: 12345-678)."}),
    endereco: z.string({ required_error: "" }).trim().min(1, "O endereço é obrigatório.").max(200, "Máximo de 200 caracteres permitidos"),
    numeroEndereco: z.coerce.number({ invalid_type_error: "Número inválido" }).optional(),
    complemento: z.string().max(150, "Máximo de 150 caracteres permitidos").trim().optional(),
    cidade: z.string({ required_error: "" }).trim().min(1, "A cidade é obrigatória."),
    estado: z.string({ required_error: "" }).trim().min(1, "O estado é obrigatório."),
    nomeProjeto: z.string().trim().min(1, "O nome do projeto é obrigatório.").max(150, "Máximo de 150 caracteres permitidos"),
    website: z.string().trim().max(500, "Máximo de 500 caracteres permitidos").optional(),
    valorAprovado: z.coerce.number({ invalid_type_error: "Valor inválido" }).positive("O valor aprovado deve ser maior que zero."),
    valorApto: z.coerce.number({ invalid_type_error: "Valor inválido" }).positive("O valor apto a captar deve ser maior que zero."),
    dataComeco: z.string().min(1, "A data de início é obrigatória."),
    dataFim: z.string().min(1, "A data de fim é obrigatória."),
    banco: z.string().trim().max(50, "Máximo de 50 caracteres permitidos").optional(),
    agencia: z.string().trim().max(10, "Máximo de 10 caracteres permitidos").optional(),
    numeroAgencia: z.string().trim().max(10, "Máximo de 10 caracteres permitidos").optional(),
    digitoAgencia: z.string().trim().optional(),
    conta: z.string().trim().max(15, "Máximo de 15 caracteres permitidos").optional(),
    segmento: z.coerce.number({ required_error: "A seleção do segmento é obrigatória.", invalid_type_error: "Selecione uma das opções" }).min(0, "A seleção do segmento é obrigatória."),
    descricao: z.string().trim().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(400, "Máximo de 400 caracteres permitidos"),
    publico: z.array(z.boolean()).refine(val => val.some(v => v), { message: "Selecione pelo menos um público." }),
    outroPublico: z.string().max(40, "Máximo de 40 caracteres permitidos").optional(),
    ods: z.array(z.boolean()).refine(val => val.filter(Boolean).length > 0, { message: "Selecione pelo menos uma ODS." }).refine(val => val.filter(Boolean).length <= 3, { message: "Selecione no máximo 3 ODSs." }),
    beneficiariosDiretos: z.coerce.number({ invalid_type_error: "Número inválido" }).min(1, "O número de beneficiários é obrigatório."),
    estados: z.array(z.string()).min(1, "Selecione pelo menos um estado."),
    municipios: z.array(z.string()).min(1, "Selecione pelo menos um município."),
    lei: z.coerce.number({ required_error: "A seleção da lei é obrigatória." }).min(0, "A seleção da lei é obrigatória."),
    numeroLei: z.string().trim().max(20, "Máximo de 20 caracteres permitidos"),
    contrapartidasProjeto: z.string().trim().min(10, "A descrição das contrapartidas é obrigatória.").max(400, "Máximo de 400 caracteres permitidos"),
    observacoes: z.string().trim().max(400, "Máximo de 400 caracteres permitidos").optional(),
    diario: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens', 10),
    apresentacao: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens', 10),
    compliance: fileArraySchema(['application/pdf'], 'PDF', 10),
    documentos: fileArraySchema(['application/pdf', 'image/jpeg', 'image/png'], 'PDF ou Imagens', 10),
    termosPrivacidade: z.coerce.boolean().refine(val => val === true, {
        message: "Você deve aceitar os termos de privacidade para continuar.",
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

export type FormsCadastroFormFields = z.infer<typeof formsCadastroSchema>;