'use server'

import { collection, addDoc, updateDoc, query, where, getDocs, runTransaction, doc, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, formsCadastroDados, dadosEstados, leiList, segmentoList, ambitoList } from "@/firebase/schema/entities";
import { getFileUrl, getOdsIds, getItemNome, slugifyEstado } from "@/lib/utils";
import { State, City } from "country-state-city";
import { formsAcompanhamentoSchema, FormsAcompanhamentoFormFields } from "@/lib/schemas";

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

async function handleInfoAdicionada(novoForm: FormsAcompanhamentoFormFields, nomeEstado: string) {
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

async function handleInfoPersistida(ultimoForm: DadosComparaveisProjeto, novoForm: FormsAcompanhamentoFormFields, nomeEstado: string) {
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

export async function submitAcompanhamentoForm(formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());
    const projetoID = formData.get('projetoID') as string;
    const usuarioAtualID = formData.get('usuarioAtualID') as string;
    const fotos = formData.getAll('fotos') as File[];

    const dataToValidate = {
        ...rawFormData,
        fotos, // Adiciona o array de arquivos
        
        // Converte os campos que foram stringificados de volta para arrays
        ods: typeof rawFormData.ods === 'string' ? JSON.parse(rawFormData.ods) : [],
        estados: typeof rawFormData.estados === 'string' ? JSON.parse(rawFormData.estados) : [],
        municipios: typeof rawFormData.municipios === 'string' ? JSON.parse(rawFormData.municipios) : [],
    };

    const validationResult = formsAcompanhamentoSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
        // Log detalhado do erro no servidor para ajudar na depuração
        console.error("Erro de validação no servidor:", validationResult.error.flatten().fieldErrors);
        
        // Retorna uma mensagem de erro genérica e clara para o cliente
        return { 
            success: false, 
            error: "Dados inválidos. Por favor, verifique os campos e tente novamente." 
        };
    }

    // 4. Se a validação passar, `data` conterá os dados limpos e tipados
    const data: FormsAcompanhamentoFormFields = validationResult.data;

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
            return { success: false, error: "Não foi possível encontrar uma referência a esse projeto." };
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
            estados: data.estados, // Se algum dia precisar de adicionar os estados na coleção de projetos é só descomentar.
            municipios: data.municipios,
            lei: getItemNome(data.lei, leiList),
            ultimoFormulario: formsAcompanhamentoRef.id
        });

        return { success: true };
    } catch (error) {
        console.error("Erro na Server Action de Acompanhamento:", error);
        return { success: false, error: "Falha ao registrar o formulário." };
    }
}