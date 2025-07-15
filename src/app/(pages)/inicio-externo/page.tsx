
import { db } from '@/firebase/firebase-config';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { Projetos, formsAcompanhamentoDados, formsCadastroDados, Associacao, usuarioExt } from '@/firebase/schema/entities';
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
}


async function syncUserProjects(uid: string, email: string) {
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
        let instituicao = '', lei = '', formularioPendente = false, dataUltimoForm;

        if (projetoData.status === "aprovado") {
            formularioPendente = true;
            if (projetoData.ultimoFormulario) {
                const formAcompanhamentoSnap = await getDoc(doc(db, "forms-acompanhamento", projetoData.ultimoFormulario));
                if (formAcompanhamentoSnap.exists()) {
                    const data = formAcompanhamentoSnap.data() as formsAcompanhamentoDados;
                    dataUltimoForm = data.dataResposta;
                    instituicao = data.instituicao;
                    lei = data.lei;
                } else {
                    const formCadastroSnap = await getDoc(doc(db, "forms-cadastro", projetoData.ultimoFormulario));
                    if (formCadastroSnap.exists()) {
                        const data = formCadastroSnap.data() as formsCadastroDados;
                        dataUltimoForm = data.dataPreenchido;
                        instituicao = data.instituicao;
                        lei = data.lei;
                    }
                }
            }
            if (dataUltimoForm && new Date(dataUltimoForm) >= tresMesesAtras) {
                formularioPendente = false;
            }
        }
        
        const valorTotal = (projetoData.valorAportadoReal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        return {
            id: projetoId,
            nome: projetoData.nome,
            instituicao,
            status: projetoData.status,
            valorTotal,
            lei,
            formularioPendente,
        };
    });

    const resolvedProjects = (await Promise.all(projectsDataPromises)).filter((p): p is ProjetoExt => p !== null);
    return resolvedProjects.reverse();
}


export default async function ExternalUserHomePage() {
  const user = await getCurrentUser();
    // Assumimos que o usuário já passou pelo middleware e é válido e externo
    await syncUserProjects(user!.uid, user!.email!);

    const [userData, userProjects] = await Promise.all([
        getUserData(user!.uid),
        getUserProjects(user!.uid)
    ]);

    // Fallback: se algo deu errado na coleta de dados (muito raro)
    if (!userData) {
        return (
            <div className="flex items-center justify-center h-screen text-center text-xl">
                Erro ao carregar dados do usuário. Tente novamente mais tarde.
            </div>
        );
    }

    const userName = userData.nome.split(" ")[0];

    return (
        <div className="flex flex-col min-h-[90vh]">
            <ExternalUserDashboard userName={userName} userProjects={userProjects} />
            <Footer />
        </div>
    );
}