import { cookies } from 'next/headers';
import { authAdmin } from '@/firebase/firebase-admin-config';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function getCurrentUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies(); 
  
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    // Verifica o cookie da sessão com o Admin SDK
    // O segundo argumento 'true' verifica se o cookie foi revogado
    const decodedToken = await authAdmin.verifySessionCookie(session, true);
    return decodedToken;
  } catch (error) {
    // O cookie é inválido ou expirou
    console.error('Error verifying session cookie:', error);
    return null;
  }
}