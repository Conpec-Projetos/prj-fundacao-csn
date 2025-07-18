import { cookies } from 'next/headers';
import { authAdmin } from '@/firebase/firebase-admin-config';
import { DecodedIdToken } from 'firebase-admin/auth';

// Funca responsavel por retornar se o usuario esta logado ou nao
export async function getCurrentUser(): Promise<DecodedIdToken | null> {
  // Obtemos os cookies atuais
  const cookieStore = await cookies(); 
  
  // Pegamos o cookie session (se existir)
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    // Verifica o cookie da sessão com o Admin SDK
    // O segundo argumento 'true' verifica se o cookie foi revogado
    const decodedToken = await authAdmin.verifySessionCookie(session, true);
    return decodedToken; // Retornamos os dados do usuario autenticado
  } catch (error) {
    // O cookie é inválido ou expirou
    console.error('Error verifying session cookie:', error);
    return null;
  }
}