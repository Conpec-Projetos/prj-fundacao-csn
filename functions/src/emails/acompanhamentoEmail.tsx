import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Button,
  Link,
  Text,
  Preview,
} from '@react-email/components';

interface AcompanhamentoEmailProps {
  destinatario: string;
  nomeProjeto: string;
  linkAcompanhamento: string;
}

export default function AcompanhamentoEmail(email: AcompanhamentoEmailProps) {
  return (
    <Html>
      <Head/>
      <Preview>Lembrete de Acompanhamento do Projeto: {email.nomeProjeto}</Preview>
      <Body
        style={{
          backgroundColor: '#f6f9fc',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
        }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            margin: '0 auto',
            padding: '20px 0 48px',
            marginBottom: '64px',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
          }}>
          <Heading
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginTop: '48px',
              textAlign: 'center',
              color: '#292944',
            }}>Lembrete de Acompanhamento</Heading>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}>Olá, {email.destinatario}!
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}>Lembramos que está na hora de preencher o formulário de
            acompanhamento para o seu projeto <strong>{email.nomeProjeto}</strong>.
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}>Por favor, acesse o link abaixo para nos atualizar sobre o progresso:
          </Text>
          <Button
            style={{
              backgroundColor: '#292944',
              borderRadius: '5px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
              width: '200px',
              padding: '12px 20px',
              margin: '20px auto',
            }}
            href={email.linkAcompanhamento}>
            Preencher Formulário
          </Button>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}>Se o botão não funcionar, você pode copiar e colar este link no seu navegador:
            <br />
            <Link
              href={email.linkAcompanhamento}
              style={{
                color: '#b15265',
                fontSize: '14px',
                textDecoration: 'underline',
                wordBreak: 'break-all',
              }}>{email.linkAcompanhamento}
            </Link>
          </Text>
          <Text
            style={{
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              padding: '0 40px',
              color: '#525f7f',
            }}>Atenciosamente,
            <br />
            Equipe da Fundação CSN
          </Text>
        </Container>
      </Body>
    </Html>
  );
}