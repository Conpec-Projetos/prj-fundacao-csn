'use server';

import { auth, db } from "@/firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  arrayUnion
} from "firebase/firestore";
import {
  Associacao,
  usuarioInt,
  usuarioExt,
  Projetos
} from "@/firebase/schema/entities";

type SignUpResult = {
  success: boolean;
  error?: string;
  firebaseErrorCode?: string;
  user?: {
    uid: string;
    email: string;
    name: string;
  };
};

// 🧠 Mensagens de erro Firebase
function getErrorMessage(error: any): string {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso.";
    case "auth/invalid-email":
      return "Formato de e-mail inválido.";
    case "auth/weak-password":
      return "A senha é muito fraca. Use uma senha mais forte.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    default:
      return error.message || "Erro desconhecido.";
  }
}

// 🔐 Cria usuário no Firebase Auth
async function signinUser(name: string, email: string, password: string): Promise<SignUpResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email || email,
        name
      }
    };
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return {
      success: false,
      error: getErrorMessage(error),
      firebaseErrorCode: error.code
    };
  }
}

// 🧱 Cria documento para usuário interno
async function createUserInt(userId: string, name: string, email: string) {
  const newUserInt: usuarioInt = {
    nome: name,
    email,
    administrador: false
  };
  await setDoc(doc(db, "usuarioInt", userId), newUserInt);
}

// 🧱 Cria documento para usuário externo + associação
async function createUserExt(userId: string, name: string, email: string, projetosIDs: string[]) {
  const newUserExt: usuarioExt = {
    nome: name,
    email
  };
  await setDoc(doc(db, "usuarioExt", userId), newUserExt);

  const associacaoRef = collection(db, "associacao");
  const q = query(associacaoRef, where("usuarioID", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingDocRef = querySnapshot.docs[0].ref;
    await updateDoc(existingDocRef, {
      projetosIDs: arrayUnion(...projetosIDs)
    });
  } else {
    const newAssociacaoDoc: Associacao = {
      usuarioID: userId,
      projetosIDs
    };
    await addDoc(associacaoRef, newAssociacaoDoc);
  }
}

// Verifica projetos aprovados
async function verificarProjetosAprovados(email: string): Promise<string[]> {
  const formsRef = collection(db, "forms-cadastro");
  const qForms = query(formsRef, where("emailResponsavel", "==", email));
  const formsSnapshot = await getDocs(qForms);

  const projetosIDs: string[] = [];

  for (const docCadastro of formsSnapshot.docs) {
    const idCadastro = docCadastro.id;
    const projetoRef = collection(db, "projetos");
    const qProjeto = query(projetoRef, where("ultimoFormulario", "==", idCadastro));
    const snapshotProjeto = await getDocs(qProjeto);

    snapshotProjeto.forEach((projDoc) => {
      const projetoData = projDoc.data() as Projetos;
      if (projetoData.status === "aprovado") {
        if (!projetosIDs.includes(projDoc.id)) {
          projetosIDs.push(projDoc.id);
        }
      }
    });
  }

  return projetosIDs;
}

// 🚀 Ação principal: criar usuário
export async function registrarUsuario(formData: FormData): Promise<SignUpResult> {
  const raw = Object.fromEntries(formData.entries());

  const name = raw.name as string;
  const email = raw.email as string;
  const password = raw.password as string;

  const emailDomain = email.split("@")[1];

  try {
    // 👉 Se não for domínio institucional, verifique projetos aprovados ANTES
    if (!["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"].includes(emailDomain)) {
      const projetosIDs = await verificarProjetosAprovados(email);

      if (projetosIDs.length === 0) {
        return {
          success: false,
          error: "Você não possui projetos aprovados."
        };
      }
    }

    // ✅ Só agora cria o usuário no Auth
    const resSigninUser = await signinUser(name, email, password);

    if (!resSigninUser.success || !resSigninUser.user) {
      return {
        success: false,
        error: resSigninUser.error || "Erro desconhecido.",
        firebaseErrorCode: resSigninUser.firebaseErrorCode
      };
    }

    const { uid, email: emailUser, name: nomeUser } = resSigninUser.user;

    // 🔐 Criar documentos no Firestore
    if (["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"].includes(emailDomain)) {
      await createUserInt(uid, nomeUser, emailUser);
    } else {
      const projetosIDs = await verificarProjetosAprovados(emailUser); // reusado
      await createUserExt(uid, nomeUser, emailUser, projetosIDs);
    }

    return {
      success: true,
      user: resSigninUser.user
    };

  } catch (error: any) {
    console.error("Erro no registro:", error);
    return {
      success: false,
      error: "Erro inesperado ao registrar o usuário.",
      firebaseErrorCode: error.code || "unknown"
    };
  }
}




