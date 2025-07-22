
import { NextResponse } from 'next/server'; //usado para retornar uma resposta HTTP na API do Next.js.
import { cookies } from 'next/headers';
import { authAdmin } from '@/firebase/firebase-admin-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

// Essa funcao sera chamada quando o frontend enviar uma requisicao para a rota (api/auth/session)
export async function POST(request: Request) {
  // Apos o signin o firebase gerará um idToken, ao fazer o login fazemos uma requisicao para essa api passando esse idToken que usaremos para criar o cookie

  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token not provided.' }, { status: 400 });
  }


  // Na rota da API
  console.log("Iniciando POST /api/auth/session");
  try {
    // Com o firebase-admin conseguimos decodificar o token e pegar informacoes como email e id
    const decoded = await authAdmin.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: "Email não disponível no token." }, { status: 400 });
    }

    // Aqui vamos fazer uma claim (“atributo” incluído dentro do token), precisamos usar isso para nao precisarmos no middleware fazer uma requisicao ao firestore
    // Verifica se o claim ja foi definido anteriormente (pois so alteramos no 1° login)
    const alreadyHasClaim = decoded.userIntAdmin !== undefined || decoded.userExt !== undefined;

    console.log(alreadyHasClaim);

    const dominiosInternos = ["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"];
    const domain = email.split("@")[1];
    const isInterno = dominiosInternos.includes(domain);
    let isAdmin = false;

    if(isInterno){
        const usuarioInt = collection(db, "usuarioInt");
        const qADM = query(usuarioInt, where("email", "==", email), where("administrador", "==", true));
        const snapshotADM = await getDocs(qADM);
        isAdmin = !snapshotADM.empty;
    }

    // Consulta Firestore apenas se ainda não tem o claim
    if (decoded.userIntAdmin !== isAdmin || !alreadyHasClaim) {
      if(isInterno){
        if (isAdmin) {
          await authAdmin.setCustomUserClaims(uid, { userIntAdmin: true, userExt: false }); // Propriedade que esta agora no token para sabermos se o userInt é adm

          // Retorna que o front precisa renovar o token antes de criar o cookie, pois atualizamos ele com a claim
          return NextResponse.json({ mustRefreshToken: true});
        }
        else {
          await authAdmin.setCustomUserClaims(uid, { userIntAdmin: false, userExt: false });
          // Retorna que o front precisa renovar o token antes de criar o cookie, pois atualizamos ele com a claim
          return NextResponse.json({ mustRefreshToken: true });
        }
      } else {
          await authAdmin.setCustomUserClaims(uid, { userIntAdmin: false, userExt: true }); // Propriedade que esta agora no token para sabermos que o userExt

          // Retorne que o front precisa renovar o token antes de criar o cookie, pois atualizamos ele com a claim
          return NextResponse.json({ mustRefreshToken: true});
      }
    }
    // Define o tempo de expiração da sessão em milissegundos, *tempo minimo 2 minutos, *tempo maximo 2 semanas (deixei 5 dias, apos dois dias o cookie sera deletado pelo navegador e ao carregar a pagina (se a pessoa estiver usando o sistema ela sera redirecionada para o login), se nao tiver acessado e expirar ao acessar ja ira para o login direto)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // O idToken (do Firebase Auth) é trocado por um session cookie, que pode ser verificado no servidor depois (authAdmin.createSessionCookie é uma função do Firebase Admin)
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    // Definindo o cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      httpOnly: true, // Nao acessivel via javascript
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/', // cookie disponivel em todo o site

      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}



export async function GET(req: Request) {
  const sessionCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("session="))?.split("=")[1];

  if (!sessionCookie) 
    return NextResponse.json({ user: null });

  try {
    const decoded = await authAdmin.verifySessionCookie(sessionCookie);
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// Rota para fazer logout (invalidar o cookie)
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({ status: 'success' });
}