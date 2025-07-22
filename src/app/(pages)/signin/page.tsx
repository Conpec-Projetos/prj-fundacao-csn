import SigninClient from "@/components/signin/SigninClient";

export default async function SigninPage() {
    // Se o usuário não está autenticado ou não confirmou o e-mail, renderiza o formulário
      return (
          <SigninClient />
      );
}