'use server'

import { z } from 'zod';
import { db } from '@/firebase/firebase-config';
import { State, City } from "country-state-city";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, arrayUnion, runTransaction } from "firebase/firestore";
import { getFileUrl, getItemNome, getOdsIds, getPublicoNomes, slugifyEstado } from '@/lib/utils';
import { Projetos, formsCadastroDados, leiList, segmentoList, dadosEstados } from '@/firebase/schema/entities';
import { formsCadastroSchema } from '@/lib/schemas';

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
        // Lançar o erro novamente para que o 'onSubmit' principal possa capturá-lo
        throw error;
    }
}

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
        const projetoData: Projetos = {
            nome: data.nomeProjeto,
            municipios: data.municipios,
            status: "pendente",
            ativo: false,
            compliance: false,
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

        const firestoreData: formsCadastroDados = {
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

        const docCadastroRef = await addDoc(collection(db, "forms-cadastro"), firestoreData);
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
        
        return { success: true };

    } catch (error) {
        console.error("Erro na Server Action:", error);
        return { success: false, error: "Falha ao registrar o projeto no banco de dados." };
    }
}