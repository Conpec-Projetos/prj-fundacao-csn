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

export async function updateLaw(
  lawId: string,
  nome: string,
  sigla: string
) {
  try {
    console.log("▶ updateLaw chamada");

    const lawRef = doc(db, "leis", lawId);
    const lawSnap = await getDoc(lawRef);

    if (!lawSnap.exists()) {
      console.log("❌ Lei não encontrada");
      return { success: false };
    }

    const oldNome = lawSnap.data().nome;
    console.log("OLD:", `"${oldNome}"`);
    console.log("NEW:", `"${nome}"`);

    await updateDoc(lawRef, { nome, sigla });
    console.log("✔ Lei atualizada");

    const collections = [
      "projetos",
      "forms-cadastro",
      "forms-acompanhamento",
    ];

    for (const col of collections) {
      console.log(`🔍 Buscando em ${col}`);

      const q = query(
        collection(db, col),
        where("lei", "==", oldNome)
      );

      const snapshot = await getDocs(q);
      console.log(`📦 ${col}:`, snapshot.size);

      if (snapshot.empty) continue;

      const batch = writeBatch(db);

      snapshot.forEach((d) => {
        console.log("↻ atualizando", d.id);
        batch.update(d.ref, { lei: nome });
      });

      await batch.commit();
      console.log(`✅ ${col} atualizado`);
    }

    return { success: true };
  } catch (e) {
    console.error("🔥 ERRO:", e);
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