
import LoginClient from "@/components/login/LoginClient";
import { getCurrentUser } from "@/lib/auth";
import { IsADM } from "@/lib/isAdm";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user && user.email_verified && user.email) {
    const email = user.email;
    const domain = email.split("@")[1];
    const adm = await IsADM(email);
    const internalDomains = ["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"];
    const isInternalUser = internalDomains.includes(domain);
    
    // Fluxo de redirecionamento
    if (isInternalUser && adm) {
      return redirect("/");
    } 
    else if(isInternalUser){
      return redirect("/dashboard");
    } 
    else {
      return redirect("/inicio-externo");
    }
  }
  // Se usuário não autenticado ou email não verificado, renderiza o formulário de login
  // Não autenticado → mostra tela de login
  return (
      <LoginClient />
  );
}