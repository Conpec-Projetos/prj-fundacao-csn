import SigninClient from "@/components/signin/SigninClient";
import { getCurrentUser } from "@/lib/auth";
import { IsADM } from "@/lib/isAdm";
import { redirect } from "next/navigation";


export default async function SigninPage() {
    const user = await getCurrentUser();

    if (user && user.email_verified && user.email) {
        const email = user.email;
        const domain = email.split("@")[1];
        const adm = await IsADM(email);
        const internalDomains = ["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"];
        const isInternalUser = internalDomains.includes(domain);

        if (isInternalUser && adm ) {
            redirect("/");
        } 
        else if(isInternalUser){
            redirect("/dashboard");
        } 
        else {
            redirect("/inicio-externo");
        }
    }

    // Se o usuário não está autenticado ou não confirmou o e-mail, renderiza o formulário
      return (
          <SigninClient />
      );
}