import { auth, db } from "@/firebase/firebase-config";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

// Tipo de retorno
type LoginResult = 
  | { success: true; idToken: string, user: User; redirectTo: string }
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
      user,
      redirectTo
    };

  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error("Erro no login:", error);
      let message = "Erro ao tentar fazer o login.";
      switch (error.code) {
        case "auth/wrong-password":
          message = "Email ou senha incorretos.";
          break;
        case "auth/invalid-credential":
          message = "Email ou senha incorretos.";
          break;
        case "auth/user-not-found":
          message = "Usuário não encontrado.";
          break;
        case "auth/too-many-requests":
          message = "Muitas tentativas. Tente novamente mais tarde.";
          break;
        default:
          message = "Erro ao tentar fazer o login. Tente novamente.";
          break;
      } return {
        success: false,
        error: message,
        firebaseErrorCode: error.code
      };
    }
  } return {
    success: false,
    error: "Erro desconhecido ao tentar fazer o login."
  };
}