import Footer from "@/components/footer/footer";
import { Toaster } from "sonner";
import { collection, query, where, getDocs, orderBy, limit} from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formsAcompanhamentoDados, formsCadastroDados, odsList, segmentoList, ambitoList, Associacao} from "@/firebase/schema/entities";
import { FormsAcompanhamentoFormFields } from "@/lib/schemas";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AcompanhamentoForm from "@/components/forms/AcompanhamentoForm";
import ProjetoInfoBloco from "@/components/forms/projetoInfoBloco";


interface ProjetoInfo {
    nomeProjeto?: string;
    responsavel?: string;
    emailResponsavel?: string;
    representante?: string;
    emailLegal?: string;
}

async function getProjetoData(projetoID: string): Promise<{ initialData: Partial<FormsAcompanhamentoFormFields>; projetoInfo: ProjetoInfo }> {
    let initialData: Partial<FormsAcompanhamentoFormFields> = {};
    let projetoInfo: ProjetoInfo = {};

    // 1. Busca sempre o formulário de cadastro original para as informações estáticas
    const cadastroQuery = query(collection(db, "forms-cadastro"), where("projetoID", "==", projetoID), limit(1));
    const cadastroSnapshot = await getDocs(cadastroQuery);

    if (cadastroSnapshot.empty) {
        console.warn(`Nenhum dado de cadastro encontrado para o projeto com ID: ${projetoID}`);
        return { initialData, projetoInfo };
    }
    
    const cadastroData = cadastroSnapshot.docs[0].data() as formsCadastroDados;
    projetoInfo = {
        nomeProjeto: cadastroData.nomeProjeto,
        responsavel: cadastroData.responsavel,
        emailResponsavel: cadastroData.emailResponsavel,
        representante: cadastroData.representante,
        emailLegal: cadastroData.emailLegal,
    };

    // 2. Busca o último formulário de acompanhamento para pré-preenchimento
    const acompanhamentoQuery = query(
        collection(db, "forms-acompanhamento"),
        where("projetoID", "==", projetoID),
        orderBy("dataResposta", "asc"), // ordenando pela data da resposta e nao pelo ultimo forms, acredito que funciona
        limit(1)
    );
    const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);

    if (!acompanhamentoSnapshot.empty) {
        // const leiList: Leis[] = await getLeisFromDB();
        // Se já existe um acompanhamento, usa seus dados
        const data = acompanhamentoSnapshot.docs[0].data() as formsAcompanhamentoDados;
        const odsBooleans = new Array(odsList.length).fill(false);
        data.ods.forEach(id => {
            if (id >= 0 && id < odsList.length) odsBooleans[id] = true;
        });

        initialData = {
            instituicao: data.instituicao,
            descricao: data.descricao,
            segmento: segmentoList.findIndex(s => s.nome === data.segmento),
            lei: data.lei,
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
    } else {
        // Se não, usa os dados do cadastro original para pré-preenchimento
        const odsBooleans = new Array(odsList.length).fill(false);
        cadastroData.ods.forEach(id => {
            if (id >= 0 && id < odsList.length) odsBooleans[id] = true;
        });
        
        initialData = {
            instituicao: cadastroData.instituicao,
            descricao: cadastroData.descricao,
            segmento: segmentoList.findIndex(s => s.nome === cadastroData.segmento),
            lei: cadastroData.lei,
            estados: cadastroData.estados,
            municipios: cadastroData.municipios,
            dataComeco: cadastroData.dataInicial,
            dataFim: cadastroData.dataFinal,
            contrapartidasProjeto: cadastroData.contrapartidasProjeto,
            beneficiariosDiretos: cadastroData.beneficiariosDiretos,
            ods: odsBooleans,
            website: cadastroData.website,
            diversidade: "",
            fotos: [],
        };
    }

    return { initialData, projetoInfo };
}
// Nao precisaremos mais pois agora a qualquer momento o proponente pode preencher o forms de acompanhamento
// async function verificarFormularioPendente(projetoId: string): Promise<boolean> {
//     const projetoDocRef = doc(db, 'projetos', projetoId);
//     const projetoDocSnap = await getDoc(projetoDocRef);

//     if (!projetoDocSnap.exists()) {
//         return false; 
//     }

//     const projetoData = projetoDocSnap.data() as Projetos;

//     if (projetoData.status !== "aprovado" || !projetoData.dataAprovado) {
//         return false;
//     }

//     const acompanhamentoQuery = query(
//         collection(db, "forms-acompanhamento"),
//         where("projetoID", "==", projetoId)
//     );
//     const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
//     const numAcompanhamentos = acompanhamentoSnapshot.size;

//     const dataAprovado = projetoData.dataAprovado.toDate();
//     const hoje = new Date();
    
//     let mesesNecessarios = -1;

//     switch (numAcompanhamentos) {
//         case 0:
//             mesesNecessarios = 3;
//             break;
//         case 1:
//             mesesNecessarios = 7;
//             break;
//         case 2:
//             mesesNecessarios = 10;
//             break;
//         default:
//             return false; // Bloqueia se já tiver 3 ou mais
//     }

//     if (mesesNecessarios > 0) {
//         const dataLimite = new Date(dataAprovado);
//         dataLimite.setMonth(dataAprovado.getMonth() + mesesNecessarios);
        
//         return hoje >= dataLimite;
//     }

//     return false;
// }

export default async function FormsAcompanhamento({ params }: { params: Promise<{ id: string }> }) {
    const { id: projetoID } = await params;

    // Autenticação no Servidor
    const user = await getCurrentUser();

    // Essa pagina ainda nao esta sendo protegida com o middleware por isso deixei essa verificacao
    if (!user || !user.email_verified) {
        redirect('/login');
    }
    
    if(!user.userExt){
        redirect('/');
    }

    // Busca o documento de associação do usuário
    const associacaoRef = collection(db, 'associacao');
    const qAssociacao = query(associacaoRef, where('usuarioID', '==', user.uid));
    const associacaoSnapshot = await getDocs(qAssociacao);

    // Se o usuário não tem um documento de associação, ele não possui projetos
    if (associacaoSnapshot.empty) {
        redirect('/inicio-externo');
    }

    const associacaoDoc = associacaoSnapshot.docs[0].data() as Associacao;
    const projetosDoUsuario = associacaoDoc.projetosIDs || [];

    // Se o ID do projeto na URL não está na lista de projetos do usuário, redireciona
    if (!projetosDoUsuario.includes(projetoID)) {
        redirect('/inicio-externo');
    }

    // const isPendente = await verificarFormularioPendente(projetoID);
    // console.log(isPendente);
    // if (!isPendente) {
    //     redirect('/inicio-externo');
    // }

    // Busca de dados no Servidor
    const { initialData, projetoInfo } = await getProjetoData(projetoID);

    return (
        <main className="flex flex-col justify-between items-center w-screen min-h-screen overflow-hidden no-scrollbar">
            <div className="flex flex-col items-center justify-center w-full py-12 text-blue-fcsn dark:text-white-off">
                <h1 className="text-center text-blue-fcsn dark:text-white-off w-[90vw] text-wrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                    Acompanhamento de projeto
                </h1>
            </div>

            <ProjetoInfoBloco
                projectName={projetoInfo.nomeProjeto}
                responsibleName={projetoInfo.responsavel}
                responsibleEmail={projetoInfo.emailResponsavel}
                legalRepresentativeName={projetoInfo.representante}
                legalRepresentativeEmail={projetoInfo.emailLegal}
            />
            
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