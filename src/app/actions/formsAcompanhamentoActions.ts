"use server";

import { dbAdmin } from "@/firebase/firebase-admin-config";
import { ambitoList, formsAcompanhamentoDados, segmentoList } from "@/firebase/schema/entities";
import { FormsAcompanhamentoFormFields, formsAcompanhamentoSchema } from "@/lib/schemas";
import { getItemNome, getOdsIds } from "@/lib/utils";
import { uploadFileAndGetUrlAdmin } from "./adminActions";

export async function submitAcompanhamentoForm(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());
    const projetoID = formData.get("projetoID") as string;
    const usuarioAtualID = formData.get("usuarioAtualID") as string;
    const fotos = formData.getAll("fotos") as (File | string)[];

    const dataToValidate = {
        ...rawFormData,
        fotos,

        ods: typeof rawFormData.ods === "string" ? JSON.parse(rawFormData.ods) : [],
        estados: typeof rawFormData.estados === "string" ? JSON.parse(rawFormData.estados) : [],
        municipios: typeof rawFormData.municipios === "string" ? JSON.parse(rawFormData.municipios) : [],
    };

    const validationResult = formsAcompanhamentoSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
        console.error("Erro de validação no servidor:", validationResult.error.flatten().fieldErrors);

        return {
            success: false,
            error: "Dados inválidos. Por favor, verifique os campos e tente novamente.",
        };
    }

    const data: FormsAcompanhamentoFormFields = validationResult.data;

    try {
        const fotoURLs = await Promise.all(
            data.fotos.map((file: File | string) =>
                typeof file === "string"
                    ? Promise.resolve(file)
                    : uploadFileAndGetUrlAdmin(file, "forms-acompanhamento", projetoID)
            )
        );

        const uploadFirestore: formsAcompanhamentoDados = {
            projetoID: projetoID,
            dataResposta: new Date().toISOString().split("T")[0],
            usuarioID: usuarioAtualID,
            instituicao: data.instituicao,
            descricao: data.descricao,
            segmento: getItemNome(data.segmento, segmentoList),
            lei: data.lei,
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

        const formsAcompanhamentoRef = await dbAdmin.collection("forms-acompanhamento").add(uploadFirestore);

        await dbAdmin.collection("projetos").doc(projetoID).update({
            instituicao: data.instituicao,
            estados: data.estados,
            municipios: data.municipios,
            lei: data.lei,
            ultimoFormulario: formsAcompanhamentoRef.id,
        });

        return { success: true };
    } catch (error) {
        console.error("Erro na Server Action de Acompanhamento:", error);
        return { success: false, error: "Falha ao registrar o formulário." };
    }
}
