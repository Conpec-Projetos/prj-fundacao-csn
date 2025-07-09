import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth.';
import { db } from '@/firebase/firebase-config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Projetos, formsAcompanhamentoDados, formsCadastroDados, Associacao, usuarioExt } from '@/firebase/schema/entities';
import Footer from '@/components/footer/footer';
import ExternalUserDashboard from '@/components/inicio-ext/inicioExtContent';

interface ProjetoExt {
  id: string;
  nome: string;
  instituicao: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  valorTotal: string;
  lei: string;
  formularioPendente: boolean;
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

    if (!user) {
        redirect('/login');
    }

    const [userData, userProjects] = await Promise.all([
        getUserData(user.uid),
        getUserProjects(user.uid)
    ]);
    
    if (!userData) {
        // Se não encontrar na coleção externa, pode ser um usuário interno
        redirect('/');
    }

    const userName = userData.nome.split(" ")[0];

    return (
        <div className="flex flex-col min-h-[90vh]">
            <ExternalUserDashboard userName={userName} userProjects={userProjects} />
            <Footer />
        </div>
    );
}