import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { CloudTasksClient } from "@google-cloud/tasks";
import { Resend } from "resend";
import AcompanhamentoEmail from "./emails/acompanhamentoEmail";

admin.initializeApp();
const db = admin.firestore();

const tasksClient = new CloudTasksClient();
const resend = new Resend(RESEND_KEY);

export const onProjectApproved = onDocumentUpdated("projetos/{projetoId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("Nenhum dado no evento.");
    return;
  }

  const dataAntes = snapshot.before.data();
  const dataDepois = snapshot.after.data();
  const { projetoId } = event.params;

  // Verifica se o status mudou para 'aprovado'
  if (dataAntes.status !== "aprovado" && dataDepois.status === "aprovado") {
    const { ultimoFormulario, nome: nomeProjeto, isTest } = dataDepois;

    if (!ultimoFormulario) {
      logger.error(`Projeto ${projetoId}: Aprovado sem 'ultimoFormulario'.`);
      return;
    }
    
    const formCadastroRef = db.collection("forms-cadastro").doc(ultimoFormulario);
    const formDoc = await formCadastroRef.get();

    if (!formDoc.exists) {
       logger.error(`Projeto ${projetoId}: Documento de formulário ${ultimoFormulario} não encontrado.`);
       return;
    }
    
    const destinatario = formDoc.data()?.responsavel;
    const emailDestinatario = formDoc.data()?.emailResponsavel;
    
    if (!emailDestinatario) {
        logger.error(`E-mail do destinatário não encontrado para o projeto ${projetoId}. Modo Teste: ${isTest}`);
        return;
    }

    //  Lógica de Agendamento
    const linkAcompanhamento = `${process.env.PROJECT_URL}/forms-acompanhamento/${projetoId}`;
    const taskPayload = { email: emailDestinatario, destinatario, nomeProjeto, linkAcompanhamento, isTest };
    
    const intervalos = isTest === true ? [30] : [3, 7, 10]; // Se for teste, envia o email depois de 30 segundos, se não for, envia depois de 3, 7, 10 meses
    const unidadeTempo = isTest === true ? 'seconds' : 'months';

    logger.log(`[${isTest ? 'TEST' : 'PROD'}] Projeto ${projetoId} aprovado. Agendando ${intervalos.length} e-mail(s).`);

    const serviceAccountEmail = `${process.env.PROJECT_ID}@appspot.gserviceaccount.com`;

    const schedulingPromises = intervalos.map(intervalo => {
        const scheduleDate = new Date();
        if (unidadeTempo === 'seconds') {
            scheduleDate.setSeconds(scheduleDate.getSeconds() + intervalo);
        } else {
            scheduleDate.setMonth(scheduleDate.getMonth() + intervalo);
        }

        const taskRequest = {
            parent: tasksClient.queuePath(process.env.PROJECT_ID!, process.env.LOCATION!, process.env.QUEUE_NAME!),
            task: {
                httpRequest: {
                    httpMethod: "POST" as const,
                    url: 'https://sendfollowupemail-fjxpmi546q-uc.a.run.app',
                    headers: { "Content-Type": "application/json" },
                    body: Buffer.from(JSON.stringify(taskPayload)).toString("base64"),
                    oidcToken: {
                    serviceAccountEmail: serviceAccountEmail,
                  },
                },
                scheduleTime: { seconds: Math.floor(scheduleDate.getTime() / 1000) },
            },
        };
        
        logger.log(`Agendando tarefa para ${intervalo} ${unidadeTempo} em ${scheduleDate.toISOString()}`);
        return tasksClient.createTask(taskRequest);
    });

    await Promise.all(schedulingPromises);
  }
});

export const sendFollowUpEmail = onRequest(
  {
    invoker: 'private', 
  }, 
  async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

  try {
      const { email, destinatario, nomeProjeto, linkAcompanhamento, isTest } = req.body;

    logger.info("Dados recebidos para envio de e-mail:", {
      emailDestinatario: email,
      destinatario,
      projeto: nomeProjeto,
      linkGerado: linkAcompanhamento,
    });
      
      const subject = isTest
          ? `[TESTE] Acompanhamento do Projeto: ${nomeProjeto}`
          : `Acompanhamento do Projeto: ${nomeProjeto}`;

      await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: subject,
          react: AcompanhamentoEmail({destinatario: destinatario, nomeProjeto: nomeProjeto, linkAcompanhamento: linkAcompanhamento})
      });

      logger.log(`E-mail de ${isTest ? 'TESTE' : 'PRODUÇÃO'} enviado para ${email}.`);
      res.status(200).send("E-mail enviado com sucesso.");
  } catch (error) {
      logger.error("Erro ao enviar e-mail:", error);
      res.status(500).send("Erro interno ao enviar e-mail.");
  }
});