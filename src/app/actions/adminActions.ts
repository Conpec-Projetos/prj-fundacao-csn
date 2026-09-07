'use server';

import { db } from '@/firebase/firebase-config';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, writeBatch, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { storageAdmin } from '@/firebase/firebase-admin-config';
import { v4 as uuidv4 } from 'uuid';

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

// Coleções que guardam o nome da lei (por valor, não por referência de ID).
const LEI_COLLECTIONS = ["projetos", "forms-cadastro", "forms-acompanhamento"];

function normalizeLawField(value: string): string {
  return (value || '').trim().toLowerCase();
}

// Retorna qual campo colide com uma lei já existente, ou null se não houver conflito.
async function findDuplicateLaw(nome: string, sigla: string, excludeId?: string): Promise<'duplicate_nome' | 'duplicate_sigla' | null> {
  const lawsSnapshot = await getDocs(collection(db, 'leis'));
  const normalizedNome = normalizeLawField(nome);
  const normalizedSigla = normalizeLawField(sigla);

  for (const lawDoc of lawsSnapshot.docs) {
    if (lawDoc.id === excludeId) continue;
    const data = lawDoc.data() as Law;
    if (normalizeLawField(data.nome) === normalizedNome) return 'duplicate_nome';
    if (normalizeLawField(data.sigla) === normalizedSigla) return 'duplicate_sigla';
  }

  return null;
}

// Atualiza o campo "lei" (armazenado por nome) em todas as coleções relacionadas.
async function propagateLeiChange(oldNome: string, newNome: string): Promise<void> {
  for (const col of LEI_COLLECTIONS) {
    const q = query(collection(db, col), where("lei", "==", oldNome));
    const snapshot = await getDocs(q);

    if (snapshot.empty) continue;

    const batch = writeBatch(db);
    snapshot.forEach((d) => batch.update(d.ref, { lei: newNome }));
    await batch.commit();
  }
}

async function isLawInUse(nome: string): Promise<boolean> {
  for (const col of LEI_COLLECTIONS) {
    const q = query(collection(db, col), where("lei", "==", nome));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return true;
  }
  return false;
}

export async function getLaws(): Promise<Law[]> {
  try {
    const lawsSnapshot = await getDocs(collection(db, 'leis'));
    return lawsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Law));
  } catch (error) {
    console.error("Erro ao buscar leis:", error);
    return [];
  }
}

export async function createLaw(nome: string, sigla: string): Promise<{ success: boolean; error?: string }> {
  try {
    const duplicate = await findDuplicateLaw(nome, sigla);
    if (duplicate) return { success: false, error: duplicate };

    await addDoc(collection(db, 'leis'), { nome, sigla });
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar lei:", error);
    return { success: false };
  }
}

export async function updateLaw(
  lawId: string,
  nome: string,
  sigla: string
): Promise<{ success: boolean; error?: string }> {
  try {

    const lawRef = doc(db, "leis", lawId);
    const lawSnap = await getDoc(lawRef);

    if (!lawSnap.exists()) {
      console.log("Lei não encontrada");
      return { success: false, error: 'not_found' };
    }

    const duplicate = await findDuplicateLaw(nome, sigla, lawId);
    if (duplicate) return { success: false, error: duplicate };

    const oldNome = lawSnap.data().nome;

    await updateDoc(lawRef, { nome, sigla });

    if (oldNome !== nome) {
      await propagateLeiChange(oldNome, nome);
    }

    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (e) {
    console.error("ERRO:", e);
    return { success: false };
  }
}

export async function deleteLaw(lawId: string, replacementLawId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const lawRef = doc(db, 'leis', lawId);
    const lawSnap = await getDoc(lawRef);

    if (!lawSnap.exists()) {
      return { success: false, error: 'not_found' };
    }

    const nome = lawSnap.data().nome;

    if (await isLawInUse(nome)) {
      if (!replacementLawId || replacementLawId === lawId) {
        return { success: false, error: 'in_use_needs_replacement' };
      }

      const replacementSnap = await getDoc(doc(db, 'leis', replacementLawId));
      if (!replacementSnap.exists()) {
        return { success: false, error: 'invalid_replacement' };
      }

      await propagateLeiChange(nome, replacementSnap.data().nome);
    }

    await deleteDoc(lawRef);
    revalidatePath('/admin/gerenciamento');
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar lei:", error);
    return { success: false };
  }
}

export async function uploadFileAndGetUrlAdmin(file: File, forms: string, projetoID: string, filename?: string): Promise<string> {
  const bucket = storageAdmin.bucket();
  const destination = `${forms}/${projetoID}/${filename ? `${file.name}-${filename}` : file.name}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUpload = bucket.file(destination);
  const downloadToken = uuidv4();

  await fileUpload.save(buffer, {
      metadata: {
          contentType: file.type,
          metadata: {
              firebaseStorageDownloadTokens: downloadToken
          }
      }
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
  return publicUrl;
}