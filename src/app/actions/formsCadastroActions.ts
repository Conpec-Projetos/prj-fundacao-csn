'use server'

import { db } from '@/firebase/firebase-config';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, arrayUnion } from "firebase/firestore";
import { getFileUrl, getItemNome, getOdsIds, getPublicoNomes } from '@/lib/utils';
import { Projetos, formsCadastroDados, segmentoList } from '@/firebase/schema/entities';
import { formsCadastroSchema } from '@/lib/schemas';
import { getLeisFromDB } from "@/lib/utils";

export async function submitCadastroForm(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());

    console.log('Server Action?')
    // Converte os campos que são objetos/arrays de volta
    try {
        if (typeof rawFormData.publico === 'string') {
            rawFormData.publico = JSON.parse(rawFormData.publico);
        }
        if (typeof rawFormData.ods === 'string') {
            rawFormData.ods = JSON.parse(rawFormData.ods);
        }
        if (typeof rawFormData.estados === 'string') {
            rawFormData.estados = JSON.parse(rawFormData.estados);
        }
        if (typeof rawFormData.municipios === 'string') {
            rawFormData.municipios = JSON.parse(rawFormData.municipios);
        }
    } catch (e) {
        return { success: false, error: `Dados do formulário inválidos. ${e}` };
    }
    
    const diarioFiles = formData.getAll('diario') as File[];
    const apresentacaoFiles = formData.getAll('apresentacao') as File[];
    const complianceFiles = formData.getAll('compliance') as File[];
    const documentosFiles = formData.getAll('documentos') as File[];
    const usuarioAtualID = formData.get('usuarioAtualID') as string | null;

    const dataToValidate = {
        ...rawFormData,
        diario: diarioFiles,
        apresentacao: apresentacaoFiles,
        compliance: complianceFiles,
        documentos: documentosFiles,
    };

    const validationResult = formsCadastroSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
        console.error("Erro de validação no servidor:", validationResult.error.flatten().fieldErrors);
        return { success: false, error: "Dados inválidos." };
    }

    const data = validationResult.data;

    try {
        const leiList = await getLeisFromDB();

        const projetoData: Projetos = {
            nome: data.nomeProjeto,
            instituicao: data.instituicao,
            estados: data.estados,
            municipios: data.municipios,
            lei: getItemNome(data.lei, leiList),
            status: "pendente",
            ativo: true,
            compliance: false,
            empresas: [],
            indicacao: "",
            ultimoFormulario: "",
            valorAprovado: 0
        };
        
        const docProjetoRef = await addDoc(collection(db, "projetos"), projetoData);
        const projetoID = docProjetoRef.id;

        const [diarioUrl, apresentacaoUrl, complianceUrl, documentosUrl] = await Promise.all([
            getFileUrl(data.diario, 'forms-cadastro', projetoID, "diario"),
            getFileUrl(data.apresentacao, 'forms-cadastro', projetoID, "apresentacao"),
            getFileUrl(data.compliance, 'forms-cadastro', projetoID, "compliance"),
            getFileUrl(data.documentos, 'forms-cadastro', projetoID)
        ]);

        const firestoreData: formsCadastroDados = {
            dataPreenchido: new Date().toISOString().split('T')[0],
            instituicao: data.instituicao,
            cnpj: data.cnpj,
            representante: data.representanteLegal,
            telefone: data.telefone,
            emailLegal: data.emailRepLegal,
            responsavel: data.responsavel,
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

        const docCadastroRef = await addDoc(collection(db, "forms-cadastro"), firestoreData);
        await updateDoc(doc(db, "projetos", projetoID), { ultimoFormulario: docCadastroRef.id });
        
        if (usuarioAtualID) {
            const q = query(collection(db, "associacao"), where("usuarioID", "==", usuarioAtualID));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await updateDoc(querySnapshot.docs[0].ref, { projetosIDs: arrayUnion(projetoID) });
            } else {
                await addDoc(collection(db, "associacao"), { usuarioID: usuarioAtualID, projetosIDs: [projetoID] });
            }
        }
        
        return { success: true };

    } catch (error) {
        console.error("Erro na Server Action:", error);
        return { success: false, error: "Falha ao registrar o projeto no banco de dados." };
    }
}