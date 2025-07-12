import AdminHomeClient from "@/components/homeAdmin/homeClient";
import { getCurrentUser } from "@/lib/auth";
import { IsADM } from "@/lib/isAdm";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
    const user = await getCurrentUser();

    // Verificação se o usuario esta logado, se nao estiver redirecionamos para a pagina de login
    if (!user || !user.email_verified || !user.email) {
        return redirect('/login');
    }

    const email = user.email;
    const domain = email.split("@")[1];
    const adm = await IsADM(email);
    const internalDomains = ["conpec.com.br", "csn.com.br", "fundacaocsn.org.br"];
    const isInternalUser = internalDomains.includes(domain);

    // Fluxo de redirecionamento
    if (!isInternalUser) {
        return redirect('/inicio-externo'); // Usuários externos
    }
    if (!adm) {
        return redirect('/dashboard'); // Usuários internos não-admin
    }

    // Somente usuarios internos e admins  chegam aqui
    return <AdminHomeClient />;
}