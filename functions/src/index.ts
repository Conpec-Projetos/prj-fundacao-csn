import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import AcompanhamentoEmail from "./emails/acompanhamentoEmail";
import { onSchedule } from "firebase-functions/v2/scheduler"

admin.initializeApp();
const db = admin.firestore();

const resend = new Resend(process.env.RESEND_KEY); // Ele não funciona se deixar a api key como variável de ambiente, então é necessário passar ela hardcoded aqui
// Eu sinceramente não sei o porque ele não consegue ler a variável de ambiente aqui mas em outros momentos consegue
// Só coloco assim para enviar pro github sem expor a chave, mas se for fazer deploy, lembra de mudar.

export const onProjectApproved = onDocumentUpdated("projetos/{projetoId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("Nenhum dado no evento.");
    return;
  }

  const dataAntes = snapshot.before.data();
  const dataDepois = snapshot.after.data();

  // Verifica se o status mudou para 'aprovado'
  if (dataAntes.status !== "aprovado" && dataDepois.status === "aprovado") {
    logger.log(`Projeto ${event.params.projetoId} aprovado. Salvando datas de notificação.`);

    const dataAprovacao = new Date(); // Usa a data atual como referência

    // Calcula os timestamps para 3, 7 e 10 meses no futuro
    const dataNotificacao3Meses = new Date(new Date().setMonth(dataAprovacao.getMonth() + 3));
    const dataNotificacao7Meses = new Date(new Date().setMonth(dataAprovacao.getMonth() + 7));
    const dataNotificacao10Meses = new Date(new Date().setMonth(dataAprovacao.getMonth() + 10));

    // Prepara a atualização para o documento do projeto
    const updatePayload = {
      dataAprovado: admin.firestore.Timestamp.fromDate(dataAprovacao),
      notificacoes: {
        p3: {
          dataAgendada: admin.firestore.Timestamp.fromDate(dataNotificacao3Meses),
          enviado: false,
        },
        p7: {
          dataAgendada: admin.firestore.Timestamp.fromDate(dataNotificacao7Meses),
          enviado: false,
        },
        p10: {
          dataAgendada: admin.firestore.Timestamp.fromDate(dataNotificacao10Meses),
          enviado: false,
        },
      },
    };

    // Atualiza o documento no Firestore
    return snapshot.after.ref.update(updatePayload);
  }

  return null;
});

async function sendFollowUpEmail(payload: { email: string; destinatario: string; nomeProjeto: string; linkAcompanhamento: string; }) {
  const { email, destinatario, nomeProjeto, linkAcompanhamento } = payload;
  const subject = `Acompanhamento do Projeto: ${nomeProjeto}`;

  logger.info("Dados recebidos para envio de e-mail:", {
    emailDestinatario: email,
    destinatario,
    projeto: nomeProjeto,
    linkGerado: linkAcompanhamento,
  });
    

  return resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: subject,
      react: AcompanhamentoEmail({destinatario: destinatario, nomeProjeto: nomeProjeto, linkAcompanhamento: linkAcompanhamento})
  });
}

export const verificarEmailsPendentes = onSchedule("every day 08:00", async () => {
  logger.log("Iniciando verificação de e-mails de acompanhamento pendentes.");

  const agora = admin.firestore.Timestamp.now();
  const projetosRef = db.collection("projetos");
  const linkBase = `${process.env.PROJECT_URL}/forms-acompanhamento/`;

  // Define os períodos e os campos de flag correspondentes
  const periodos = [
    { meses: 3, campoTimestamp: 'notificacoes.p3.dataAgendada', campoFlag: 'notificacoes.p3.enviado' },
    { meses: 7, campoTimestamp: 'notificacoes.p7.dataAgendada', campoFlag: 'notificacoes.p7.enviado' },
    { meses: 10, campoTimestamp: 'notificacoes.p10.dataAgendada', campoFlag: 'notificacoes.p10.enviado' },
  ];

  for (const periodo of periodos) {
    // Busca projetos cuja data de notificação já passou e cujo e-mail ainda não foi enviado
    const query = projetosRef
      .where(periodo.campoTimestamp, "<=", agora)
      .where(periodo.campoFlag, "==", false);
      
    const snapshot = await query.get();

    if (snapshot.empty) {
      logger.log(`Nenhum projeto encontrado para notificação de ${periodo.meses} meses.`);
      continue;
    }

    // Processa cada projeto encontrado
    for (const doc of snapshot.docs) {
      const projeto = doc.data();
      const projetoId = doc.id;

      // Busca o e-mail do responsável no formulário de cadastro
      const formsCadastroRef = db.collection("forms-cadastro");
      const qForms = formsCadastroRef.where("projetoID", "==", projetoId).limit(1);
      const formSnapshot = await qForms.get();
      
      if (!formSnapshot.empty) {
        const formDoc = formSnapshot.docs[0];
        const emailResponsavel = formDoc.data()?.emailResponsavel;
        const responsavel = formDoc.data()?.responsavel.split(" ")[0];
        
        logger.log(`Enviando e-mail de ${periodo.meses} meses para ${emailResponsavel} do projeto ${projeto.nome}`);

        try {
          await sendFollowUpEmail({
            email: emailResponsavel,
            destinatario: responsavel,
            nomeProjeto: projeto.nome,
            linkAcompanhamento: `${linkBase}${projetoId}`,
          });

          // Se o e-mail foi enviado com sucesso, atualiza a flag no Firestore
          await doc.ref.update({ [periodo.campoFlag]: true });

        } catch (error) {
          logger.error(`Falha ao enviar e-mail para ${emailResponsavel} do projeto ${projetoId}`, error);
        }
      } else {
        logger.warn(`Não foi possível encontrar o e-mail do responsável para o projeto ${projetoId}`);
      }
    }
  }
});