'use client'
import Footer from "@/components/footer/footer";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col justify-start items-center bg-white-off py-16 px-6">
        <article className="prose prose-blue max-w-4xl text-lg">
          {/* Título Principal */}
          <h1 className="text-blue-fcsn text-4xl font-bold text-center mb-10">
            POLÍTICA DE PRIVACIDADE DE DADOS EXTERNA
          </h1>

          {/* Seção 1 */}
          <section>
            <h4 className="text-2xl font-bold my-4">1. OBJETIVO</h4>
            <h5 className="text-lg font-semibold my-4">
              1.1. DIRETRIZES PARA O TRATAMENTO DE DADOS PESSOAIS
            </h5>
            <p>
              A CSN busca garantir que os seus dados sejam:
            </p>
            <ol className="list-alpha space-y-2 pl-4">
            <li>Tratados e processados legalmente, de forma justa e transparente;</li>
            <li>Coletados para fins específicos, explícitos e legítimos e que não sejam processados posteriormente de maneira incompatível com esses propósitos;</li>
            <li>Adequados, relevantes e limitados ao necessário, de acordo com os objetivos para os quais eles são tratados, dentro do conceito de minimização da coleta;</li>
            <li>Precisos e, quando aplicável, atualizados;</li>
            <li>Armazenados de forma a permitir a identificação dos titulares de dados por um período definido para tratamento, sendo excluído ou tornado anônimo quando o período for finalizado;</li>
            <li>Mantidos em segurança e protegidos contra o acesso e/ou tratamento não autorizados ou ilegais, e contra a perda, destruição ou danos acidentais, utilizando técnicas adequadas e medidas para garantir a sua integridade e confidencialidade.</li>
            </ol>

          </section>

          {/* Seção 2 */}
          <section>
            <h4 className="text-2xl font-bold my-4">2. ABRANGÊNCIA</h4>
            <p>
              Esta política (“Política de Privacidade”) aplica-se a todas as Unidades e Empresas
              do Grupo CSN no território nacional (denominadas, em conjunto, como “CSN”), que
              estejam sob a abrangência da Lei n° 13.079/18 (“Lei Geral de Proteção de Dados”
              ou “LGPD”).
            </p>
          </section>

          {/* Seção 3 */}
          <section>
            <h4 className="text-2xl font-bold my-4">3. DEFINIÇÕES</h4>
            <h5 className="text-base font-semibold my-4">
              3.1. CONCEITOS BÁSICOS PARA A COMPREENSÃO DESTA POLÍTICA DE PRIVACIDADE
            </h5>
            <p>
              Os termos abaixo, usados no singular ou no plural, no masculino ou no feminino, terão os
              significados a eles atribuídos quando iniciados com letra maiúscula nesta Política de
              Privacidade:
            </p>
            <div className="pl-8 space-y-4">
              <div>
                <span className="font-semibold">Autoridade Nacional de Proteção de Dados: </span>
                <span>
                  Órgão da Administração Pública responsável por zelar, implementar e fiscalizar o
                  cumprimento da Lei Geral de Proteção de Dados (“LGPD”) em todo o território nacional;
                </span>
              </div>

              <div>
                <span className="font-semibold">Base Legal: </span>
                <span>
                  São as hipóteses legais que autorizam a CSN a tratar Dados Pessoais, quais sejam:
                  a) consentimento do titular do Dado Pessoal;
                  b) cumprimento de obrigação legal ou regulatória;
                  c) para a execução de contratos ou de procedimentos preliminares;
                  d) para o exercício regular de direitos;
                  e) para a proteção da vida ou incolumidade física;
                  f) para a tutela da saúde;
                  g) para proteção ao crédito; e
                  h) quando necessário para atender aos legítimos interesses do Controlador.
                  Todo e qualquer Tratamento de Dados Pessoais realizado pela CSN só pode ser considerado válido
                  se tiver fundamento em uma dessas Bases Legais.
                </span>
              </div>

              <div>
                <span className="font-semibold">Consentimento: </span>
                <span>
                  Manifestação livre fornecida pelo Titular de Dados, para autorizar o Tratamento dos Dados
                  Pessoais para uma finalidade específica definida;
                </span>
              </div>

              <div>
                <span className="font-semibold">Controlador: </span>
                <span>
                  Pessoa natural ou jurídica, de direito público ou privado, a quem competem as decisões
                  referentes ao tratamento de Dados Pessoais;
                </span>
              </div>

              <div>
                <span className="font-semibold">Criptografia: </span>
                <span>
                  É um processo que busca eliminar as chances de terceiros obterem acesso a Dados Pessoais não
                  autorizados. Quando os Dados Pessoais são criptografados, é aplicado um algoritmo para
                  codificá-los de modo que eles não tenham mais o formato original e, portanto, não possam ser
                  lidos. Os Dados Pessoais só podem ser decodificados ao formato original com o uso de uma
                  chave de decriptografia específica;
                </span>
              </div>

              <div>
                <span className="font-semibold">Dado Pessoal: </span>
                <span>
                  Qualquer informação que identifique ou possa identificar uma pessoa, tais como nomes, números
                  de telefone, códigos de identificação, números de documento, endereços, e-mail etc.;
                </span>
              </div>

              <div>
                <span className="font-semibold">Dado Pessoal Sensível: </span>
                <span>
                  Dado Pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a
                  sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde
                  ou à vida sexual, dado genético ou biométrico quando vinculado a uma pessoa natural;
                </span>
              </div>

              <div>
                <span className="font-semibold">Encarregado de Dados: </span>
                <span>
                  Pessoa natural ou jurídica indicada pelo Controlador para monitorar a conformidade da proteção
                  de Dados Pessoais e atuar como canal de comunicação entre o controlador, os titulares dos Dados
                  Pessoais e a Autoridade Nacional de Proteção de Dados;
                </span>
              </div>

              <div>
                <span className="font-semibold">Operador: </span>
                <span>
                  Pessoa natural ou jurídica, de direito público ou privado, que realiza o Tratamento de Dados
                  Pessoais em nome do Controlador;
                </span>
              </div>

              <div>
                <span className="font-semibold">Titular de Dados: </span>
                <span>
                  Pessoa natural a quem se referem os Dados Pessoais que são objeto do Tratamento;
                </span>
              </div>

              <div>
                <span className="font-semibold">Tratamento: </span>
                <span>
                  Toda a operação realizada em relação ao Dado Pessoal. Por exemplo: coleta, produção, recepção,
                  classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento de
                  informação, modificação, comunicação, transferência, difusão ou extração;
                </span>
              </div>

              <div>
                <span className="font-semibold">Violação de Dados: </span>
                <span>
                  Incidente de segurança envolvendo a integridade de Dados Pessoais, em ambiente interno ou
                  externo, independentemente da natureza ou causa, que de alguma forma possa ocasionar a
                  destruição acidental ou ilegal, perda, roubo, dano e/ou processamento ilegal de informações
                  pessoais, alteração, divulgação não autorizada ou acesso a Dados Pessoais transmitidos,
                  armazenados ou Tratados de outro modo por sociedade que mantenha relações jurídicas com a CSN
                  ou por qualquer terceiro contratado em nome dela, seja em formato eletrônico, impresso ou
                  outra forma, interferência em sistema de informação que comprometa a privacidade, segurança,
                  confidencialidade, disponibilidade ou integridade dos Dados Pessoais;
                </span>
              </div>
            </div>
          </section>

          {/* Seção 4 */}
          <section>
            <h4 className="text-2xl font-bold my-4">4. RESPONSABILIDADES</h4>
            <h5 className="text-lg font-semibold my-4">
              4.1. ENCARREGADO DE DADOS
            </h5>
            <p>
              Se tiver alguma dúvida sobre a Política de Privacidade, entre em contato com o nosso Encarregado pela Proteção de Dados Pessoais através do e-mail indicado abaixo.
            </p>
            <div className="border flex flex-wrap gap-2 justify-center p-3 my-4">
                <p className="font-semibold">E-MAIL:</p>
                <p>protecaodedados_encarregado@csn.com.br</p>
            </div>
          </section>

          {/* Seção 5 */}
          <section>
            <h4 className="text-2xl font-bold my-4">5. DIRETRIZES GERAIS</h4>
            <h5 className="text-lg font-semibold my-4">
              5.1.
            </h5>
            <p>
              A CSN, para os fins da Lei Geral de Proteção de Dados Pessoais e normas aplicáveis, reconhece a importância da privacidade e da segurança dos Dados Pessoais dos empregados, clientes, fornecedores, prestadores de serviços e demais parceiros, obtidos em decorrência do relacionamento empresarial e socioeconômico, e por meio da presente Política de Privacidade, define as diretrizes para o Tratamento dos seus Dados Pessoais, no que tange aos tipos de dados coletados, utilização,
              compartilhamento
              e
              armazenamento,
              além
              de
              garantir
              transparência quanto às operações de Tratamento às quais seus Dados Pessoais são
              submetidos.
              A CSN entende como um dos seus valores fundamentais o compromisso de respeitar e garantir
              a privacidade dos seus Dados Pessoais.
              Caso você esteja com dúvidas ou precise de informações adicionais, poderá contatar o nosso
              Encarregado pelo Tratamento dos Dados Pessoais, conforme orientações disponibilizadas ao
              final dessa Política de Privacidade.           
            </p>
            <h5 className="text-lg font-semibold my-4">
              5.2. QUAIS DADOS PESSOAIS A CSN COLETA?
            </h5>
            <p>
              Os tipos de Dados Pessoais e a forma como a CSN os coleta dependem de como você se
              relaciona conosco. Assim, exemplificamos abaixo quais Dados Pessoais coletamos e por quê o
              fazemos:
            </p>
            <h5 className="text-lg font-semibold my-4">
              5.2.1. Dados de cadastro e contrato
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais, como Nome, CPF, endereço (fisico e/ou eletrônico), número de telefone
            e data de nascimento etc., para identificação dos representantes legais de clientes,
            fornecedores, prestadores de serviços e demais parceiros.
            </li>
            <li>Dados Pessoais e Dados Pessoais Sensíveis, tais como Dados da relação de trabalho
            (Contrato de Trabalho; Rescisão contratual; SEFIP/GRF (FGTS); GPS (INSS); PIS,
            NIS/CAGED etc.), Cidade, CPF, Data de Nascimento, E-mail, Endereço, Estado Civil,
            Gênero, Grau de escolaridade, Histórico escolar, Idade, Informações Bancárias,
            Nacionalidade, Naturalidade, Números de telefone, RG/Passaporte/Carteira Nacional de
            Habilitação, Telefone, empresa/organização, foto, função ou cargo, raça, cor, laudo
            médico para a identificação da pessoa com deficiência etc., para o processamento das
            rotinas trabalhistas, previdenciárias e fiscais de seus empregados e colaboradores.
            </li>
            <li>Dados Pessoais como Nome, CPF, Dados Bancários etc., para fins de processamento de
            gamentos e prevenção à fraude.
            </li>
            <li>
            Dados Pessoais como Formas de Pagamento, CEP, CPF, Data de Nascimento, E-mail,
            Endereço, Nacionalidade, Nome, Profissão, RG, Telefone Celular, Telefone Comercial,
            Telefone Residencial etc., para fins de cadastro, análise de crédito e elaboração de
            contratos para contratação de serviços e venda de produtos.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.2. Informações financeiras
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]"> 
              <li>Dados Pessoais como as informações de fatura, como histórico, datas de pagamento,
              valores em aberto e/ou pagamentos recebidos etc., para controles, relatórios
              financeiros, auditoria e impostos.
              </li>
              <li>
              Dados Pessoais como Informações de nota fiscal, informações sobre sua conta bancária
              tc., para processar pagamentos.
              </li>
              <li>
              Dados Pessoais e Dados Pessoais Sensíveis relativas a Informação dos colaboradores
              de serviços terceirizados, como, sem se limitar:
              </li>
            </ol>
            <ol className="list-alpha  space-y-2 pl-4">
            <li>Folha de Pagamento</li>
            <li>Recibo de Pagamento (Contracheque)</li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.3. Dados biométricos e circuito fechado de televisão (“CFTV”)
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais e Dados Pessoais Sensíveis de identificação do titular, biometria, foto
            etc., para fornecimento de crachá de identificação e liberação de acesso às nossas
            instalações.
            </li>
            <li>Nossas instalações podem coletar Dados Pessoais como imagens e gravações dos
            titulares (os dados obtidos via CFTV são sobrescritos automaticamente após até 6
            (seis) meses) para atender às legislações específicas do nosso segmento de atuação,
            monitorar ato suspeito ou registro de ocorrência de furto e garantir a segurança de
            nossos colaboradores e prestadores de serviço.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.4. Dados de atendimento
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais e/ou Dados Pessoais Sensíveis relativas às informações prestadas nos serviços de atendimento ao cliente, através de qualquer meio disponibilizado pela CSN, para
            processar e responder às suas solicitações.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.5. Dados sobre como você usa o site da CSN
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais relativos ao levantamento de informações de logs de uso, endereço IP,
            dispositivos de acesso e demais informações relacionadas à interação do usuário com
            nossas plataformas, tais como áreas visitadas, recursos e funcionalidades utilizadas,
            registros de cliques e histórico de navegação etc., com objetivo de analisar
            performance, tendências e identificação de mal uso dos sites da CSN.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.6. Dados de currículos
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais e/ou Dados Pessoais Sensíveis relativos às informações que são
            fornecidas voluntariamente pelos titulares, tais como dados da relação de trabalho
            (PIS, NIS/CAGED etc.), Cidade, CPF, Data de Nascimento, E-mail, Endereço, Estado
            Civil, Gênero, Grau de escolaridade, Histórico escolar, Histórico profissional, Nome,
            telefone e empresa de terceiros na recomendação profissional, Pretensão salarial,
            Idade, Informações Bancárias, Nacionalidade, Naturalidade, Números de telefone,
            RG/Passaporte/Carteira Nacional de Habilitação, Telefone, empresa/organização, foto,
            função ou cargo, raça, cor, laudo médico para a identificação da pessoa com
            deficiência etc., para o envio de perfil para candidatura a uma de nossas vagas e
            análise de conflito de interesses.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.2.7. Cumprimento de normativas internas:
            </h5>
            <ol className=" space-y-2 pl-4 list-[upper-roman]">
            <li>Dados Pessoais e/ou Dados Pessoais Sensíveis para fins de cumprimento de obrigações
            legais e normas da CSN, tais como dados cadastrais de ex-colaboradores, pensionistas
            de colaboradores ou de ex-colaboradores e dependentes de colaboradores ou de ex-
            colaboradores, informações advindas de processos judiciais etc.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.3. QUAIS SÃO AS BASES LEGAIS UTILIZADAS PARA O TRATAMENTO DOS SEUS DADOS PESSOAIS?
            </h5>
            <p>A CSN somente realiza o Tratamento de Dados Pessoais e Dados Pessoais Sensíveis de acordo
            com as hipóteses previstas na legislação brasileira e, quando exigido por lei, utilizamos seus
            Dados Pessoais mediante obtenção prévia de consentimento.
            A depender da atividade realizada, realizamos o Tratamento de Dados Pessoais e/ou de Dados
            Pessoais Sensíveis de acordo com as seguintes hipóteses:
            </p>
            <ol className="list-alpha  space-y-2 pl-4">
            <li>mediante o fornecimento prévio de consentimento pelo Titular dos Dados Pessoais, nos casos aplicáveis;</li>
            <li>para o cumprimento de obrigação legal ou regulatória que determine o Tratamento dos Dados Pessoais;</li>
            <li>quando necessário para negociação ou execução de um contrato estabelecido entre os Titulares dos Dados Pessoais e a CSN, para cumprir com as obrigações contratuais assumidas, garantindo operabilidade, visibilidade e continuidade dos serviços;</li>
            <li>para o exercício regular de direitos, inclusive em processo judicial, administrativo ou arbitral;</li>
            <li>para proteção do crédito, prevenção a fraudes e garantia da segurança dos Titulares dos Dados Pessoais;</li>
            <li>para atender um interesse legítimo, desde que o Tratamento seja previamente
            avaliado para realização de Tratamento justo, razoável e equilibrado. Dentre as
            hipóteses de Tratamento de Dados Pessoais fundamentado em interesses legítimos,
            temos as seguintes situações: i) prospectar clientes e parceiros de negócios; ii) para
            comunicações transacionais, que contemplam informações de pedidos, compras e
            rastreio; iii) para apurar denúncias e realizar auditorias; iv) conduzir o planejamento
            de negócios; v) geração e análise de indicadores, relatórios e previsões; vi)
            acompanhamento e análises de desempenhos; vii) estratégia de comunicação; viii)
            gestão de controles; ix) análise de conflito de interesses.
            </li>
            </ol>
            <h5 className="text-lg font-semibold my-4">
              5.4. QUANDO PODEMOS COMPARTILHAR OS SEUS DADOS PESSOAIS OU DADOS PESSOAIS SENSÍVEIS?
            </h5>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.4.1.
            </h5>
            <p>Em alguns casos podemos compartilhar Dados Pessoais com parceiros comerciais que
            nos prestam serviços de modo a ajudar-nos a realizar o nosso negócio, mas sempre
            faremos isso com a devida transparência e de forma alinhada com as expectativas
            dos Titulares dos Dados Pessoais que se relacionam conosco.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.4.2.
            </h5>
            <p>Os seus Dados Pessoais são compartilhados apenas quando estritamente necessário e
            de acordo com as salvaguardas e boas práticas detalhadas nesta Política de
            Privacidade.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.4.3.
            </h5>
            <p>A CSN como responsável pelo Tratamento
            dos
            Dados
            Pessoais,
            exige,
            contratualmente, que nossos fornecedores e parceiros, criteriosamente escolhidos,
            atuem de forma segura e adotem todas as medidas de segurança técnicas para o
            cumprimento da legislação aplicável quanto à proteção e privacidade de Dados
            Pessoais e, adicionalmente, desta Política de Privacidade.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.4.4.
            </h5>
            <p>Em algumas situações, podemos também ser obrigados a compartilhar os seus dados
            à Autoridade Nacional de Proteção de Dados e outras entidades para fins
            regulamentares ou quando exigido pela legislação vigente.
            </p>
            </div>
            <h5 className="text-lg font-semibold my-4">
              5.5. POR QUANTO TEMPO ARMAZENAMOS OS SEUS DADOS PESSOAIS E DADOS PESSOAIS SENSÍVEIS?
            </h5>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.5.1.
            </h5>
            <p>Os Dados Pessoais são armazenados pelo tempo que for necessário para cumprir com
            as finalidades para as quais foram coletados, conforme estabelecido no item 5.2
            (QUAIS DADOS PESSOAIS A CSN COLETA?), salvo se houver qualquer outra razão
            para sua manutenção como, por exemplo, cumprimento de obrigações legais, regulatórias, contratuais, entre outras, desde que fundamentadas com uma Base Legal.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.5.2.
            </h5>
            <p>Sempre fazemos uma análise técnica para determinar o período de retenção
            adequado para cada tipo de Dado Pessoal coletado, considerando a sua natureza,
            necessidade de coleta e finalidade para a qual ele será tratado.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.5.3.
            </h5>
            <p>O término do Tratamento dos Dados Pessoais do Titular e sua consequente eliminação
o           correrá quando:
            </p>
            <ol className="list-alpha  space-y-2 pl-4">
              <li>For verificado que a finalidade para a qual o consentimento foi obtido foi alcançada
              ou que os Dados Pessoais coletados deixaram de ser necessários ou pertinentes ao
              alcance da finalidade específica almejada;
              </li>
              <li>
                Decorrer o fim do período de Tratamento legal;
              </li>
              <li>
              Houver manifestação do Titular de Dados, quando aplicável, que poderá realizar a
              solicitação
              por
              meio
              do
              endereço
              eletrônico:
              protecaodedados_encarregado@csn.com.br;
              </li>
              <li>
                Houver determinação legal.
              </li>
            </ol>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.5.4.
            </h5>
            <p> 
            No entanto, por motivo de lei, regulamentação ou determinação judicial, os Dados
            Pessoais do Titular de Dados poderão ser mantidos por período superior, findo o qual,
            serão excluídos com uso de métodos de descarte seguro, sendo eles:
            </p>
            <ol className="list-alpha  space-y-2 pl-4">
              <li>Deleção direta da base de dados;</li>
              <li>Anonimização da informação;</li>
              <li>Mascaramento dos Dados Pessoais; e</li>
              <li>Destruição em caso de informações físicas.</li>
            </ol>
            </div>
            <h5 className="text-lg font-semibold my-4">
              5.6. COMO GARANTIMOS A SEGURANÇA DOS SEUS DADOS?
            </h5>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.6.1.
            </h5>
            <p>A CSN adota medidas técnicas e organizacionais de segurança de informação
            compatíveis com o nível de risco avaliado e com o estado da técnica para garantir a
            confidencialidade, a integridade, a disponibilidade e a resiliência de seus sistemas
            informáticos, bancos de dados, arquivos físicos e outros repositórios de informações,
            de modo a evitar acessos não autorizados e situações acidentais ou ilícitas de
            destruição, perda, alteração, comunicação ou difusão de Dados Pessoais e Dados
            Pessoais Sensíveis.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.6.2.
            </h5>
            <p>A CSN possui processos, políticas e controles de Segurança da Informação
            desenhados e implementados para garantir a confidencialidade, a integridade e a
            disponibilidade de Dados Pessoais e Dados Pessoais Sensíveis.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.6.3.
            </h5>
            <p>Os Dados Pessoais e os Dados Pessoais Sensíveis serão acessados somente por
            profissionais
            devidamente
            autorizados,
            respeitando
            os
            princípios
            de
            proporcionalidade, necessidade, finalidade, segurança e adequação para os
            objetivos, além do compromisso de confidencialidade e preservação da privacidade nos termos desta Política de Privacidade.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.6.4.
            </h5>
            <p>A CSN se compromete a divulgar aos Titulares de Dados qualquer incidente de
            Violação de Dados relacionados aos seus Dados Pessoais e/ou e Dados Pessoais
            Sensíveis e quais as medidas que serão aplicadas no caso concreto.
            </p>
            </div>
            <h5 className="text-lg font-semibold my-4">
              5.7. TRANSFERÊNCIA INTERNACIONAL DE DADOS
            </h5>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.7.1.
            </h5>
            <p>Embora as empresas às quais essa Política de Privacidade se aplica possuam suas
            sedes no Brasil e os produtos e serviços sejam destinados a empresas no Brasil,
            aplicando-se, portanto, as leis brasileiras relacionadas à privacidade e proteção de
            Dados Pessoais, os Dados Pessoais e os Dados Pessoais Sensíveis que coletamos
            podem ser transferidos para as nossas filiais, controladas e coligadas localizadas no
            exterior.
            </p>
            </div>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.7.2.
            </h5>
            <p>De acordo com o previsto na legislação nacional, a transferência internacional de
            Dados Pessoais poderá ocorrer em países que proporcionem grau de proteção de
            Dados Pessoais adequado ao previsto na lei, ou assegurem o mesmo grau de
            proteção contratualmente, e, ainda, quando necessária para atender às hipóteses de
            i) execução de contrato e procedimentos preliminares relacionados a contrato; ii)
            cumprimento de obrigação legal ou regulatória e iii) para o exercício regular de
            direitos em processo judicial, administrativo ou arbitral.
            </p>
            </div>
            <h5 className="text-lg font-semibold my-4">
              5.8. OS DIREITOS SOBRE OS SEUS DADOS PESSOAIS E DADOS PESSOAIS SENSÍVEIS
            </h5>
            <div className="flex gap-2">
            <h5 className="text-lg font-semibold my-4">
              5.8.1.
            </h5>
            <p>A CSN possui os meios necessários para que o Titular dos Dados Pessoais, possa
            exercer seus direitos mencionados a seguir, de maneira gratuita, clara e de fácil
            acesso, considerando a legislação e os regulamentos aplicáveis e vigentes.
            </p>
            </div>
          <ol className="list-alpha space-y-2 pl-4">
            <li>
              <span className="font-semibold">Direito de acesso:</span> 
              <span>
                o Titular de Dados poderá ter acesso aos seus Dados Pessoais e Dados Pessoais Sensíveis
                tratados de forma simples e gratuita, por meio de formato físico ou digital, bem como
                informações sobre a forma, duração do Tratamento e integralidade dos seus Dados Pessoais
                tratados;
              </span>
            </li>
            <li>
              <span className="font-semibold">Direito de correção:</span> 
              <span>
              o Titular de Dados poderá solicitar a retificação, atualização
              e/ou complementação dos seus Dados Pessoais e Dados Pessoais Sensíveis
              armazenados pela CSN;
              </span>
            </li>
            <li>
              <span className="font-semibold">Direito de eliminação:</span> 
              <span>
              o Titular de Dados poderá solicitar a exclusão dos seus
              Dados Pessoais e Dados Pessoais Sensíveis, salvo se aplicável outra hipótese legal
              para a continuidade do Tratamento, ou leis que suportem o Tratamento;
              </span>
            </li>
            <li>
              <span className="font-semibold">Direito de portabilidade:</span> 
              <span>
              O titular de Dados Pessoais poderá exercer seus direitos acima citados por meio do e-
              mail protecaodedados_encarregado@csn.com.br;
              </span>
            </li>
          </ol>
          </section>


        </article>
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
