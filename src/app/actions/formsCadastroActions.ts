"use server";

import { db } from "@/firebase/firebase-config";
import { Projetos, formsCadastroDados, segmentoList } from "@/firebase/schema/entities";
import { formsCadastroSchema } from "@/lib/schemas";
import { getItemNome, getLeisFromDB, getOdsIds, getPublicoNomes } from "@/lib/utils";
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { uploadFileAndGetUrlAdmin } from "./adminActions";

export async function submitCadastroForm(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());

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

    // Files may come as URLs (uploaded to Vercel Blob) or as File objects (fallback).
    const diarioFiles = formData.getAll("diario") as (File | string)[];
    const apresentacaoFiles = formData.getAll("apresentacao") as (File | string)[];
    const complianceFiles = formData.getAll("compliance") as (File | string)[];
    const documentosFiles = formData.getAll("documentos") as (File | string)[];
    const usuarioAtualID = formData.get("usuarioAtualID") as string | null;

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
            valorAprovado: 0,
        };

        const docProjetoRef = await addDoc(collection(db, "projetos"), projetoData);
        const projetoID = docProjetoRef.id;

        // data.* may contain either File objects or already-uploaded blob URLs.
        const diarioUrl = await Promise.all(
            data.diario.map(f =>
                typeof f === "string"
                    ? Promise.resolve(f)
                    : uploadFileAndGetUrlAdmin(f, "forms-cadastro", projetoID, "diario")
            )
        );
        const apresentacaoUrl = await Promise.all(
            data.apresentacao.map(f =>
                typeof f === "string"
                    ? Promise.resolve(f)
                    : uploadFileAndGetUrlAdmin(f, "forms-cadastro", projetoID, "apresentacao")
            )
        );
        // Normalize apresentacao entries into absolute URLs when possible.
        // Also unwrap JSON-stringified arrays like '["https://..."]' which can be produced
        // by legacy clients so they don't become stored as invalid path-like values.
        const normalizeUrl = (u: string | null | undefined): string | null | undefined => {
            if (!u) return u;
            // Defensive: if the stored value is a JSON-stringified array, parse and use first item.
            try {
                const trimmed = u.trim();
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
                        u = parsed[0];
                    }
                }
            } catch {
                // ignore parse errors and fall back to treating u as raw string
            }

            if (u.startsWith("http://") || u.startsWith("https://")) return u;
            const base =
                process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL ??
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
            if (base) return `${base.replace(/\/$/, "")}/${u.replace(/^\//, "")}`;
            return u;
        };
        const apresentacaoUrlNormalized = apresentacaoUrl
            .flat()
            .map(u => normalizeUrl(u) as string)
            .filter(Boolean);
        const complianceUrl = await Promise.all(
            data.compliance.map(f =>
                typeof f === "string"
                    ? Promise.resolve(f)
                    : uploadFileAndGetUrlAdmin(f, "forms-cadastro", projetoID, "compliance")
            )
        );
        const documentosUrl = await Promise.all(
            data.documentos.map(f =>
                typeof f === "string" ? Promise.resolve(f) : uploadFileAndGetUrlAdmin(f, "forms-cadastro", projetoID)
            )
        );

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
            lei: getItemNome(data.lei, leiList),
            numeroLei: data.numeroLei,
            contrapartidasProjeto: data.contrapartidasProjeto,
            observacoes: data.observacoes || "",
            termosPrivacidade: data.termosPrivacidade,
            projetoID: projetoID,
            diario: diarioUrl.flat(),
            apresentacao: apresentacaoUrlNormalized,
            compliance: complianceUrl.flat(),
            documentos: documentosUrl.flat(),
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
