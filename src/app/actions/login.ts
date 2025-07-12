'use server';

import { auth, db } from "@/firebase/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

// Tipo de retorno
type LoginResult = 
  | { success: true; idToken: string, redirectTo: string }
  | { success: false; error: string; firebaseErrorCode?: string };

// Funcao usada para o redirecionamento correto
async function isADM(email: string): Promise<boolean> {
  const usuarioInt = collection(db, "usuarioInt");
  const qADM = query(usuarioInt, where("email", "==", email), where("administrador", "==", true));
  const snapshotADM = await getDocs(qADM);
  return !snapshotADM.empty;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    // Tentamos fazer o login do user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificamos se o user verificou o email enviado
    if (!user.emailVerified) {
      return {
        success: false,
        error: "Por favor, verifique seu e-mail antes de fazer login.",
        firebaseErrorCode: "email-nao-verificado"
      };
    }

    // Pedimos ao Firebase o token de autenticação JWT, que será usado pelo backend para criar uma sessão (via cookie no login)
    const idToken = await user.getIdToken();

    const emailDomain = user.email?.split("@")[1] || "";

    // Aqui ja fazemos o redirecionamento conforme o dominio do email
    let redirectTo = "/inicio-externo";
    if (["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"].includes(emailDomain)) {
      const adm = await isADM(user.email || "");
      redirectTo = adm ? "/" : "/dashboard";
    }

    // Retornamos para o componente LoginClient que o sucesso do login, o idToken (para enviar a requisicao posteriormente e criar o cookie) e redirecionamos
    return {
      success: true,
      idToken,
      redirectTo
    };

  } catch (error: any) {
    console.error("Erro no login:", error);
    let message = "Erro ao tentar fazer o login.";
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      message = "Email ou senha incorretos.";
    } else if (error.code === "auth/user-not-found") {
      message = "Usuário não encontrado.";
    } else if (error.code === "auth/too-many-requests") {
      message = "Muitas tentativas. Tente novamente mais tarde.";
    }

    return {
      success: false,
      error: message,
      firebaseErrorCode: error.code
    };
  }
}
