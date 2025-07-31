'use client'
import Footer from "@/components/footer/footer";

export default function privacy_policy(){

    return(
        <div className="flex flex-col min-h-[90vh]">
            <div className="flex flex-1 flex-col justify-start items-center bg-white-off py-20 ">
                <h1 className="text-blue-fcsn text-4xl font-bold pb-8">POLÍTICA DE PRIVACIDADE DE DADOS EXTERNA</h1>
                <div className="flex flex-col w-3/4">
                    <h1 className="text-2xl font-bold">1. OBJETIVO</h1>
                    <h1 className="text-2xl font-bold">1.1. DIRETRIZES PARA O TRATAMENTO DE DADOS PESSOAIS</h1>
                    <div className="text-xl">
                        <h1>A CSN busca garantir que os seus dados sejam:</h1>
                        <h1>a) Tratados e processados legalmente, de forma justa e transparente;</h1>
                        <h1>b) Coletados para fins específicos, explícitos e legítimos e que não sejam processados
                        posteriormente de maneira incompatível com esses propósitos;</h1>
                        <h1>c) Adequados, relevantes e limitados ao necessário, de acordo com os objetivos para os quais
                        eles são tratados, dentro do conceito de minimização da coleta;</h1>
                        <h1>d) Precisos e, quando aplicável, atualizados;</h1>
                        <h1>e) Armazenados de forma a permitir a identificação dos titulares de dados por um período
                        definido para tratamento, sendo excluído ou tornado anônimo quando o período for
                        finalizado;</h1>
                        <h1>f) Mantidos em segurança e protegidos contra o acesso e/ou tratamento não autorizados ou
                        ilegais, e contra a perda, destruição ou danos acidentais, utilizando técnicas adequadas e
                        medidas para garantir a sua integridade e confidencialidade.</h1>                    
                    </div>
                
                    <h1 className="text-2xl font-bold">2. ABRANGÊNCIA</h1>
                    <h1 className="text-xl">Esta política (“Política de Privacidade”) aplica-se a todas as Unidades e Empresas do Grupo
                    CSN no território nacional (denominadas, em conjunto, como “CSN”), que estejam sob a
                    abrangência da Lei n° 13.079/18 (“Lei Geral de Proteção de Dados” ou “LGPD”).</h1>
                
                    <h1 className="text-2xl font-bold">3. DEFINIÇÕES</h1>
                    <h1 className="text-2xl font-bold">3.1. CONCEITOS BÁSICOS PARA A COMPREENSÃO DESTA POLÍTICA DE
                    PRIVACIDADE</h1>
                    


                </div>
            </div>
        <Footer />
    </div>
    );
}