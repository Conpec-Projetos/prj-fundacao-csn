import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Link,
  Text,
  Preview,
} from '@react-email/components';

interface ProjetoAprovadoProps {
  nomeDestinatario: string;
  emailDestinatario: string;
  nomeProjeto: string;
  valorAprovado: string;
  linkSite: string;
}

export default function ProjetoAprovadoEmail(info: ProjetoAprovadoProps) {
  return (
    <Html>
      <Head />
      <Preview>Projeto Aprovado: {info.nomeProjeto}</Preview>
      <Body
        style={{
          backgroundColor: '#f6f9fc',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            margin: '0 auto',
            padding: '20px 0 48px',
            marginBottom: '64px',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
          }}
        >
          <Heading
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginTop: '48px',
              textAlign: 'center',
              color: '#292944',
            }}
          >
            Projeto Aprovado
          </Heading>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            Olá {info.nomeDestinatario},
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            É com grande satisfação que informamos que o seu projeto{' '}
            <strong>{info.nomeProjeto}</strong> foi aprovado. O valor aprovado
            é de <strong>R$ {info.valorAprovado}</strong>, e será transferido
            para a conta bancária informada no formulário de cadastro.
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            A partir de agora, você já pode se cadastrar em nosso sistema. Para
            isso, acesse o site através do link abaixo:
            <br />
            <Link
              href={info.linkSite}
              style={{
                color: '#b15265',
                fontSize: '14px',
                textDecoration: 'underline',
              }}
            >
              {info.linkSite}
            </Link>
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            Informamos ainda que, nos prazos de 3, 7 e 10 meses a partir da
            aprovação, será necessário preencher um formulário de
            acompanhamento sobre o andamento do projeto. Fique tranquilo(a), nós
            enviaremos lembretes por e-mail nas datas correspondentes.
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            Caso tenha dúvidas ou precise de apoio, nossa equipe está à
            disposição.
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}
          >
            Atenciosamente,
            <br />
            Equipe da Fundação CSN
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
