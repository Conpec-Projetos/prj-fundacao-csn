"use server";

import { db } from "@/firebase/firebase-config";
import { ambitoList, formsAcompanhamentoDados, segmentoList } from "@/firebase/schema/entities";
import { FormsAcompanhamentoFormFields, formsAcompanhamentoSchema } from "@/lib/schemas";
import { getItemNome, getLeisFromDB, getOdsIds } from "@/lib/utils";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { uploadFileAndGetUrlAdmin } from "./adminActions";

export async function submitAcompanhamentoForm(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());
    const projetoID = formData.get("projetoID") as string;
    const usuarioAtualID = formData.get("usuarioAtualID") as string;
    const fotos = formData.getAll("fotos") as (File | string)[];

    const dataToValidate = {
        ...rawFormData,
        fotos, // Adiciona o array de arquivos

        // Converte os campos que foram stringificados de volta para arrays
        ods: typeof rawFormData.ods === "string" ? JSON.parse(rawFormData.ods) : [],
        estados: typeof rawFormData.estados === "string" ? JSON.parse(rawFormData.estados) : [],
        municipios: typeof rawFormData.municipios === "string" ? JSON.parse(rawFormData.municipios) : [],
    };

    const validationResult = formsAcompanhamentoSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
        // Log detalhado do erro no servidor para ajudar na depuração
        console.error("Erro de validação no servidor:", validationResult.error.flatten().fieldErrors);

        // Retorna uma mensagem de erro genérica e clara para o cliente
        return {
            success: false,
            error: "Dados inválidos. Por favor, verifique os campos e tente novamente.",
        };
    }

    // Se a validação passar, 'data' conterá os dados limpos e tipados
    const data: FormsAcompanhamentoFormFields = validationResult.data;

    try {
        const fotoURLs = await Promise.all(
            data.fotos.map(file =>
                typeof file === "string"
                    ? Promise.resolve(file)
                    : uploadFileAndGetUrlAdmin(file, "forms-acompanhamento", projetoID)
            )
        );
        const leiList = await getLeisFromDB();

        const uploadFirestore: formsAcompanhamentoDados = {
            projetoID: projetoID,
            dataResposta: new Date().toISOString().split("T")[0],
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
            diversidade: data.diversidade === "true",
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
            fotos: fotoURLs.flat(),
            website: data.website,
            links: data.links,
            contrapartidasExecutadas: data.contrapartidasExecutadas,
        };

        const formsAcompanhamentoRef = await addDoc(collection(db, "forms-acompanhamento"), uploadFirestore);

        const projetoDocRef = doc(db, "projetos", projetoID);
        await updateDoc(projetoDocRef, {
            instituicao: data.instituicao,
            estados: data.estados, // Se algum dia precisar de adicionar os estados na coleção de projetos é só descomentar.
            municipios: data.municipios,
            lei: getItemNome(data.lei, leiList),
            ultimoFormulario: formsAcompanhamentoRef.id,
        });

        return { success: true };
    } catch (error) {
        console.error("Erro na Server Action de Acompanhamento:", error);
        return { success: false, error: "Falha ao registrar o formulário." };
    }
}
