'use server';

import { db } from '@/firebase/firebase-config';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Tipos
interface InternalUser {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
}

interface Law {
  id: string;
  nome: string;
  sigla: string;
}

// Funções para Colaboradores
export async function getInternalUsers(): Promise<InternalUser[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'usuarioInt'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternalUser));
  } catch (error) {
    console.error("Erro ao buscar usuários internos:", error);
    return [];
  }
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<{ success: boolean }> {
  try {
    const userDocRef = doc(db, 'usuarioInt', userId);
    await updateDoc(userDocRef, { administrador: isAdmin });
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do admin:", error);
    return { success: false };
  }
}


// Funções para Leis
export async function getLaws(): Promise<Law[]> {
  try {
    const lawsSnapshot = await getDocs(collection(db, 'leis'));
    return lawsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Law));
  } catch (error) {
    console.error("Erro ao buscar leis:", error);
    return [];
  }
}

export async function createLaw(nome: string, sigla: string): Promise<{ success: boolean }> {
  try {
    await addDoc(collection(db, 'leis'), { nome, sigla });
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar lei:", error);
    return { success: false };
  }
}

export async function updateLaw(lawId: string, nome: string, sigla: string): Promise<{ success: boolean }> {
  try {
    const lawDocRef = doc(db, 'leis', lawId);
    await updateDoc(lawDocRef, { nome, sigla });
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar lei:", error);
    return { success: false };
  }
}

export async function deleteLaw(lawId: string): Promise<{ success: boolean }> {
  try {
    const lawDocRef = doc(db, 'leis', lawId);
    await deleteDoc(lawDocRef);
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar lei:", error);
    return { success: false };
  }
}
