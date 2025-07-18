
import { db } from '@/firebase/firebase-config';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { Projetos, Associacao, usuarioExt } from '@/firebase/schema/entities';
import Footer from '@/components/footer/footer';
import ExternalUserDashboard from '@/components/inicio-ext/inicioExtContent';
import { getCurrentUser } from '@/lib/auth';

interface ProjetoExt {
  id: string;
  nome: string;
  instituicao: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  valorTotal: string;
  lei: string;
  formularioPendente: boolean;
  ativo: boolean;
}


async function syncProjetosUsuario(uid: string, email: string) {
    try {
        // Busca todos os formulários de cadastro associados ao email do usuário
        const formsRef = collection(db, "forms-cadastro");
        const qForms = query(formsRef, where("emailResponsavel", "==", email));
        const formsSnapshot = await getDocs(qForms);

        if (formsSnapshot.empty) {
            // Se não houver projetos com este e-mail, não há nada a fazer.
            return;
        }

        // Coleta todos os IDs de projeto encontrados
        const allProjectIdsFromForms = formsSnapshot.docs.map(doc => doc.data().projetoID).filter(id => id);

        if (allProjectIdsFromForms.length === 0) {
            return;
        }

        // Encontra o documento de associação do usuário
        const associacaoRef = collection(db, 'associacao');
        const qAssociacao = query(associacaoRef, where('usuarioID', '==', uid));
        const associacaoSnapshot = await getDocs(qAssociacao);

        if (!associacaoSnapshot.empty) {
            // Atualiza o documento de associação se ele já existe
            const assocDoc = associacaoSnapshot.docs[0];
            const existingProjectIds = assocDoc.data().projetosIDs || [];
            
            // Filtra para encontrar apenas os projetos que ainda não estão associados
            const newProjectIds = allProjectIdsFromForms.filter(id => !existingProjectIds.includes(id));

            if (newProjectIds.length > 0) {
                // Adiciona apenas os novos IDs ao array existente
                await updateDoc(assocDoc.ref, {
                    projetosIDs: arrayUnion(...newProjectIds)
                });
                console.log(`Projetos sincronizados para o usuário ${uid}. Adicionados: ${newProjectIds.length}`);
            }
        } else {
            // Se o documento de associação não existe, cria um novo
            const newAssociacaoDoc: Associacao = {
                usuarioID: uid,
                projetosIDs: allProjectIdsFromForms
            };
            await addDoc(collection(db, "associacao"), newAssociacaoDoc);
            console.log(`Novo documento de associação criado para o usuário ${uid} com ${allProjectIdsFromForms.length} projetos.`);
        }

    } catch (error) {
        console.error("Erro ao sincronizar projetos do usuário:", error);
    }
}

async function getUserData(uid: string) {
    const userExtRef = doc(db, 'usuarioExt', uid);
    const userExtSnap = await getDoc(userExtRef);
    if (userExtSnap.exists()) {
        return userExtSnap.data() as usuarioExt;
    }
    return null;
}

async function getUserProjects(uid: string): Promise<ProjetoExt[]> {
    const associacaoRef = collection(db, 'associacao');
    const qAssociacao = query(associacaoRef, where('usuarioID', '==', uid));
    const associacaoSnapshot = await getDocs(qAssociacao);

    if (associacaoSnapshot.empty) return [];

    const associacaoDoc = associacaoSnapshot.docs[0].data() as Associacao;
    const projetosIDs = associacaoDoc.projetosIDs || [];
    if (projetosIDs.length === 0) return [];

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const projectsDataPromises = projetosIDs.map(async (projetoId): Promise<ProjetoExt | null> => {
        const projetoDocRef = doc(db, 'projetos', projetoId);
        const projetoDocSnap = await getDoc(projetoDocRef);

        if (!projetoDocSnap.exists()) return null;

        const projetoData = projetoDocSnap.data() as Projetos;

        // Como os campos "instituição" e "lei" agora existem dentro dos documentos de projetos, não precisamos da lógica de busca dos formulários.
        const instituicao = projetoData.instituicao || "Instituição não especificada";
        const lei = projetoData.lei || "Lei não especificada";

        let formularioPendente = false

        if (projetoData.status === "aprovado" && projetoData.dataAprovado) {
            // Obter a contagem de formulários de acompanhamento existentes para o projeto
            const acompanhamentoQuery = query(
                collection(db, "forms-acompanhamento"),
                where("projetoID", "==", projetoId)
            );
            const acompanhamentoSnapshot = await getDocs(acompanhamentoQuery);
            const numAcompanhamentos = acompanhamentoSnapshot.size;

            // Definir a lógica com base na contagem de formulários
            const dataAprovado = projetoData.dataAprovado.toDate();
            const hoje = new Date();
            let mesesAtras = -1; // Valor padrão que não acionará o formulário pendente

            switch (numAcompanhamentos) {
                case 0:
                    mesesAtras = 3; // 3 meses para o primeiro formulário
                    break;
                case 1:
                    mesesAtras = 7; // 7 meses para o segundo
                    break;
                case 2:
                    mesesAtras = 10; // 10 meses para o terceiro
                    break;
                default: // 3 ou mais formulários
                    formularioPendente = false;
                    break;
            }

            if (mesesAtras > 0) {
                const dataLimite = new Date(hoje);
                dataLimite.setMonth(hoje.getMonth() - mesesAtras);
                if (dataAprovado <= dataLimite) {
                    formularioPendente = true;
                }
            }
        }

        const valorTotal = (projetoData.valorAprovado || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        return {
            id: projetoId,
            nome: projetoData.nome,
            instituicao,
            status: projetoData.status,
            valorTotal,
            lei,
            formularioPendente,
            ativo: projetoData.ativo
        };
    });

    const resolvedProjects = (await Promise.all(projectsDataPromises)).filter((p): p is ProjetoExt => p !== null);
    return resolvedProjects.reverse();
}


export default async function ExternalUserHomePage() {
  const user = await getCurrentUser();
    // Assumimos que o usuário já passou pelo middleware e é válido e externo
    await syncProjetosUsuario(user!.uid, user!.email!);

    const [userData, userProjects] = await Promise.all([
        getUserData(user!.uid),
        getUserProjects(user!.uid)
    ]);

    // Fallback: se algo deu errado na coleta de dados (muito raro)
    if (!userData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
                <h1 className="text-2xl font-bold text-blue-fcsn dark:text-white-off">
                    Quase lá!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Estamos preparando sua área. Por favor, recarregue a página em alguns instantes.
                </p>
                <Footer />
            </div>
        )
    }

    const userName = userData.nome.split(" ")[0];

    return (
        <div className="flex flex-col min-h-[90vh]">
            <ExternalUserDashboard userName={userName} userProjects={userProjects} />
            <Footer />
        </div>
    );
}