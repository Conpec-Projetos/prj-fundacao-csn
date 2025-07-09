import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authAdmin } from '@/firebase/firebase-admin-config';

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token not provided.' }, { status: 400 });
  }

  // Define o tempo de expiração da sessão em milissegundos (5 dias)
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    (await cookies()).set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}

// Rota para fazer logout (invalidar o cookie)
export async function DELETE() {
    (await cookies()).delete('session');
    return NextResponse.json({ status: 'success' });
}