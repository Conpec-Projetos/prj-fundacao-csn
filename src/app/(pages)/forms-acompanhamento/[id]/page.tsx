import Footer from "@/components/footer/footer";
import { Toaster } from "sonner";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, formsCadastroDados, odsList, leiList, segmentoList, ambitoList } from "@/firebase/schema/entities";
import { FormsAcompanhamentoFormFields } from "@/lib/schemas";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AcompanhamentoForm from "@/components/forms/AcompanhamentoForm";


async function getInitialFormData(projetoID: string): Promise<Partial<FormsAcompanhamentoFormFields>> {
    
    // Tenta buscar o formulário de acompanhamento mais recente
    const acompanhamentoQuery = query(
        collection(db, "forms-acompanhamento"),
        where("projetoID", "==", projetoID),
        orderBy("dataResposta", "desc"),
        limit(1)
    );
    const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);

    if (!acompanhamentoSnapshot.empty) {
        console.log("Dados de acompanhamento encontrados. Pré-preenchendo...");
        const data = acompanhamentoSnapshot.docs[0].data() as formsAcompanhamentoDados;

        // Mapeia os dados do Firestore para o formato esperado pelo formulário
        const odsBooleans = new Array(odsList.length).fill(false);
        data.ods.forEach(id => {
            if (id >= 0 && id < odsList.length) {
                odsBooleans[id] = true;
            }
        });

        return {
            instituicao: data.instituicao,
            descricao: data.descricao,
            segmento: segmentoList.findIndex(s => s.nome === data.segmento),
            lei: leiList.findIndex(l => l.nome === data.lei),
            positivos: data.pontosPositivos,
            negativos: data.pontosNegativos,
            atencao: data.pontosAtencao,
            ambito: ambitoList.findIndex(a => a.nome === data.ambito),
            estados: data.estados,
            municipios: data.municipios,
            especificacoes: data.especificacoes,
            dataComeco: data.dataInicial,
            dataFim: data.dataFinal,
            contrapartidasProjeto: data.contrapartidasProjeto,
            beneficiariosDiretos: data.beneficiariosDiretos,
            beneficiariosIndiretos: data.beneficiariosIndiretos,
            diversidade: String(data.diversidade) as "true" | "false",
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
            ods: odsBooleans,
            relato: data.relato,
            website: data.website,
            links: data.links,
            contrapartidasExecutadas: data.contrapartidasExecutadas,
            fotos: [],
        };
    }

    // Se não houver acompanhamento, busca o formulário de cadastro original
    console.log("Nenhum acompanhamento encontrado. Usando dados do cadastro inicial.");
    const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", projetoID));
    const cadastroSnapshot = await getDocs(cadastroQuery);
    
    if (!cadastroSnapshot.empty) {
        const data = cadastroSnapshot.docs[0].data() as formsCadastroDados;

        const odsBooleans = new Array(odsList.length).fill(false);
        data.ods.forEach(id => {
             if (id >= 0 && id < odsList.length) {
                odsBooleans[id] = true;
            }
        });

        // Mapeia os dados do cadastro
        return {
            instituicao: data.instituicao,
            descricao: data.descricao,
            segmento: segmentoList.findIndex(s => s.nome === data.segmento),
            lei: leiList.findIndex(l => l.nome === data.lei),
            estados: data.estados,
            municipios: data.municipios,
            dataComeco: data.dataInicial,
            dataFim: data.dataFinal,
            contrapartidasProjeto: data.contrapartidasProjeto,
            beneficiariosDiretos: data.beneficiariosDiretos,
            ods: odsBooleans,
            website: data.website,
            diversidade: "",
            fotos: [],
        };
    }

    // Se nenhum dado for encontrado, retorna um objeto vazio
    console.warn(`Nenhum dado encontrado para o projeto com ID: ${projetoID}`);
    return {};
}

export default async function FormsAcompanhamento({ params }: { params: Promise<{ id: string }> }) {
    const { id: projetoID } = await params;

    // Autenticação no Servidor
    const user = await getCurrentUser();
    // Busca de dados no Servidor
    const initialData = await getInitialFormData(projetoID);

    return (
        <main className="flex flex-col justify-between items-center w-screen min-h-screen overflow-hidden no-scrollbar">
            <div className="flex flex-col items-center justify-center w-full py-12 text-blue-fcsn dark:text-white-off">
                <h1 className="text-center text-blue-fcsn dark:text-white-off w-[90vw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                    Acompanhamento de projeto
                </h1>
            </div>
            
            <AcompanhamentoForm 
                projetoID={projetoID}
                usuarioAtualID={user!.uid} // Sabemos com crtz que o user existe pois o middleware esta verificando isso, por isso coloquei "!" no user!
                initialData={initialData}
            />

            <Toaster richColors />
            <Footer />
        </main>
    );
}