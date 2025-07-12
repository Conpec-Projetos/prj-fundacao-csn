import { NextResponse } from 'next/server'; //usado para retornar uma resposta HTTP na API do Next.js.
import { cookies } from 'next/headers';
import { authAdmin } from '@/firebase/firebase-admin-config';

// Essa funcao sera chamada quando o frontend enviar uma requisicao para a rota (api/auth/session)
export async function POST(request: Request) {
  // Apos o signin o firebase gerará um idToken
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token not provided.' }, { status: 400 });
  }

  // Define o tempo de expiração da sessão em milissegundos (5 dias)
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // O idToken (do Firebase Auth) é trocado por um session cookie, que pode ser verificado no servidor depois (authAdmin.createSessionCookie é uma função do Firebase Admin)
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    // Definindo o cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      httpOnly: true, // Nao acessivel via javascript
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
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

  if (!sessionCookie) return NextResponse.json({ user: null });

  try {
    const decoded = await authAdmin.verifySessionCookie(sessionCookie);
    return NextResponse.json({ user: decoded });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

// Rota para fazer logout (invalidar o cookie)
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return NextResponse.json({ status: 'success' });
}