"use server";

import { db } from "@/firebase/firebase-config";
import { Projetos, formsCadastroDados, segmentoList } from "@/firebase/schema/entities";
import { formsCadastroSchema } from "@/lib/schemas";
import { getItemNome, getOdsIds, getPublicoNomes} from "@/lib/utils";
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

export async function submitCadastroForm(formData: FormData) {
    //
    // 1. Converter FormData em objeto normal
    //
    const rawFormData = Object.fromEntries(formData.entries());
    //
    // 2. Parse dos campos JSON
    //
    try {
        if (typeof rawFormData.publico === "string") {
            rawFormData.publico = JSON.parse(rawFormData.publico);
        }
        if (typeof rawFormData.ods === "string") {
            rawFormData.ods = JSON.parse(rawFormData.ods);
        }
        if (typeof rawFormData.estados === "string") {
            rawFormData.estados = JSON.parse(rawFormData.estados);
        }
        if (typeof rawFormData.municipios === "string") {
            rawFormData.municipios = JSON.parse(rawFormData.municipios);
        }
    } catch (e) {
        return { success: false, error: `Dados do formulário inválidos. ${e}` };
    }

    //
    // 3. Recuperar listas de URLs vindas do cliente
    //
    const diarioFiles = formData.getAll("diario") as string[];
    const apresentacaoFiles = formData.getAll("apresentacao") as string[];
    const complianceFiles = formData.getAll("compliance") as string[];
    const documentosFiles = formData.getAll("documentos") as string[];
    const usuarioAtualID = formData.get("usuarioAtualID") as string | null;

    //
    // 4. Preparar objeto para validação Zod
    //
    const dataToValidate = {
        ...rawFormData,
        diario: diarioFiles,
        apresentacao: apresentacaoFiles,
        compliance: complianceFiles,
        documentos: documentosFiles,
    };

    const validationResult = formsCadastroSchema.safeParse(dataToValidate);
    console.log("validationResult: ", validationResult)
    if (!validationResult.success) {
        console.error(
            "Erro de validação no servidor:",
            validationResult.error.flatten().fieldErrors
        );
        return { success: false, error: "Dados inválidos." };
    }

    const data = validationResult.data;

    //
    // 5. Criar projeto no Firestore
    //
    try {

        const projetoData: Projetos = {
            nome: data.nomeProjeto,
            instituicao: data.instituicao,
            estados: data.estados,
            municipios: data.municipios,
            lei: data.lei, // verificar aqui a lei pq sempre exibira so o nome será que nao era melhor passar o id?
            status: "pendente",
            ativo: true,
            compliance: false,
            empresas: [],
            indicacao: "",
            ultimoFormulario: "",
            valorAprovado: 0,
        };

        const docProjetoRef = await addDoc(collection(db, "projetos"), projetoData);
        const projetoID = docProjetoRef.id;

        //
        // 6. Como agora os arquivos vêm como URLs absolutas do Vercel,
        //    basta usar diretamente
        //
        const diarioUrl = diarioFiles;
        const apresentacaoUrl = apresentacaoFiles;
        const complianceUrl = complianceFiles;
        const documentosUrl = documentosFiles;

        //
        // 7. Montar dados do forms-cadastro
        //
        const firestoreData: formsCadastroDados = {
            dataPreenchido: new Date().toISOString().split("T")[0],
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
            banco: data.banco || "",
            agencia: data.agencia || "",
            conta: data.conta || "",
            segmento: getItemNome(data.segmento, segmentoList),
            descricao: data.descricao,
            publico: getPublicoNomes(data.publico, data.outroPublico || ""),
            ods: getOdsIds(data.ods),
            beneficiariosDiretos: data.beneficiariosDiretos,
            qtdEstados: data.estados.length,
            estados: data.estados,
            qtdMunicipios: data.municipios.length,
            municipios: data.municipios,
            lei: data.lei,
            numeroLei: data.numeroLei,
            contrapartidasProjeto: data.contrapartidasProjeto,
            observacoes: data.observacoes || "",
            termosPrivacidade: data.termosPrivacidade,
            projetoID: projetoID,

            // URLs já vindas do client
            diario: diarioUrl,
            apresentacao: apresentacaoUrl,
            compliance: complianceUrl,
            documentos: documentosUrl,
        };

        //
        // 8. Salvar documento do formulário
        //
        const docCadastroRef = await addDoc(
            collection(db, "forms-cadastro"),
            firestoreData
        );

        await updateDoc(doc(db, "projetos", projetoID), {
            ultimoFormulario: docCadastroRef.id,
        });

        //
        // 9. Vincular ao usuário autenticado (se existir)
        //
        if (usuarioAtualID) {
            const q = query(
                collection(db, "associacao"),
                where("usuarioID", "==", usuarioAtualID)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                await updateDoc(querySnapshot.docs[0].ref, {
                    projetosIDs: arrayUnion(projetoID),
                });
            } else {
                await addDoc(collection(db, "associacao"), {
                    usuarioID: usuarioAtualID,
                    projetosIDs: [projetoID],
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Erro na Server Action:", error);
        return {
            success: false,
            error: "Falha ao registrar o projeto no banco de dados.",
        };
    }
}
