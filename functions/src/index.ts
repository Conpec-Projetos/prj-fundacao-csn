import { onDocumentUpdated, onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import AcompanhamentoEmail from "./emails/acompanhamentoEmail";
import { onSchedule } from "firebase-functions/v2/scheduler"
import {
  Projetos,
  dadosEstados,
  formsAcompanhamentoDados,
  formsCadastroDados,
} from "./tipos/entities";

admin.initializeApp();
const db = admin.firestore();

// process.env.RESEND_KEY (colocar quando for dar commit)
const resend = new Resend(process.env.RESEND_KEY); // Ele não funciona se deixar a api key como variável de ambiente, então é necessário passar ela hardcoded aqui
// Eu sinceramente não sei o porque ele não consegue ler a variável de ambiente aqui mas em outros momentos consegue
// Só coloco assim para enviar pro github sem expor a chave, mas se for fazer deploy, lembra de mudar.

export const verificarProjetoAprovado = onDocumentUpdated("projetos/{projetoId}", async (event) => {
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

async function enviaEmailAcompanhamento(payload: { email: string; destinatario: string; nomeProjeto: string; linkAcompanhamento: string; }) {
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
    react: AcompanhamentoEmail({ destinatario: destinatario, nomeProjeto: nomeProjeto, linkAcompanhamento: linkAcompanhamento })
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
          await enviaEmailAcompanhamento({
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

export const desativarProjetosExpirados = onSchedule("every day 06:00", async () => {
  logger.log("Iniciando verificação de projetos com data final expirada");

  try {
    // O locale 'en-CA' convenientemente formata a data como YYYY-MM-DD.
    const hojeString = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo'
    }).format(new Date());

    logger.info(`Data de hoje para comparação: ${hojeString}`);

    // Consulta a coleção 'forms-cadastro' por documentos com dataFinal <= hoje.
    const formsQuery = db
      .collection("forms-cadastro")
      .where("dataFinal", "<=", hojeString);

    const querySnapshot = await formsQuery.get();

    if (querySnapshot.empty) {
      logger.info("Nenhum formulário de cadastro com data final expirada foi encontrado.");
      return; // Finaliza a execução se não houver nada a fazer.
    }

    logger.info(`Encontrados ${querySnapshot.size} formulários com data expirada.`);

    // Usa um WriteBatch para atualizar todos os documentos de uma vez.
    const batch = db.batch();
    let projetosParaDesativar = 0;

    querySnapshot.forEach((doc) => {
      const formData = doc.data();
      const projetoId = formData.projetoID;

      // Verifica se o campo projetoID existe no documento.
      if (projetoId && typeof projetoId === 'string') {
        // Cria uma referência para o documento correspondente na coleção 'projetos'.
        const projetoRef = db.collection("projetos").doc(projetoId);

        // Adiciona a operação de atualização ao lote.
        batch.update(projetoRef, { ativo: false });

        projetosParaDesativar++;
        logger.log(`Agendando desativação para o projeto ID: ${projetoId}`);
      } else {
        logger.warn(`Documento ${doc.id} em 'forms-cadastro' não possui um projetoID válido.`);
      }
    });

    // Executa todas as operações de atualização no lote.
    if (projetosParaDesativar > 0) {
      await batch.commit();
      logger.info(`${projetosParaDesativar} projetos foram desativados com sucesso.`);
    } else {
      logger.info("Nenhum projeto precisou ser desativado.");
    }

  } catch (error) {
    logger.error("Erro ao tentar desativar projetos expirados:", error);
  }
}
);


const estadosFirebase: { [key: string]: string } = {
  'Acre': 'acre',
  'Alagoas': 'alagoas',
  'Amapá': 'amapa',
  'Amazonas': 'amazonas',
  'Bahia': 'bahia',
  'Ceará': 'ceara',
  'Distrito Federal': 'distrito_federal',
  'Espírito Santo': 'espirito_santo',
  'Goiás': 'goias',
  'Maranhão': 'maranhao',
  'MatoGrosso': 'mato_grosso',
  'Mato Grosso do Sul': 'mato_grosso_do_sul',
  'Minas Gerais': 'minas_gerais',
  'Pará': 'para',
  'Paraíba': 'paraiba',
  'Paraná': 'parana',
  'Pernambuco': 'pernambuco',
  'Piauí': 'piaui',
  'Rio de Janeiro': 'rio_de_janeiro',
  'Rio Grande do Norte': 'rio_grande_do_norte',
  'Rio Grande do Sul': 'rio_grande_do_sul',
  'Rondônia': 'rondonia',
  'Roraima': 'roraima',
  'Santa Catarina': 'santa_catarina',
  'São Paulo': 'sao_paulo',
  'Sergipe': 'sergipe',
  'Tocantins': 'tocantins'
}
/**
 * Função auxiliar para buscar os dados de um formulário.
 * Procura primeiro na coleção 'formsAcompanhamento' e depois em 'formsCadastro'.
 * @param {string} formId O ID do documento do formulário.
 * @returns {Promise<formsAcompanhamentoDados | formsCadastroDados | null>} Os dados do formulário ou nulo se não encontrado.
 */
const getFormData = async (
  formId: string
): Promise<formsAcompanhamentoDados | formsCadastroDados | null> => {
  if (!formId) {
    console.log("ID do formulário não fornecido.");
    return null;
  }

  // 1. Tenta buscar na coleção 'formsAcompanhamento'
  const acompanhamentoRef = db.collection("forms-acompanhamento").doc(formId);
  const acompanhamentoDoc = await acompanhamentoRef.get();
  if (acompanhamentoDoc.exists) {
    console.log(`Formulário ${formId} encontrado em 'forms-acompanhamento'.`);
    return acompanhamentoDoc.data() as formsAcompanhamentoDados;
  }

  // 2. Se não encontrou, tenta buscar na coleção 'formsCadastro'
  const cadastroRef = db.collection("forms-cadastro").doc(formId);
  const cadastroDoc = await cadastroRef.get();
  if (cadastroDoc.exists) {
    console.log(`Formulário ${formId} encontrado em 'forms-cadastro'.`);
    return cadastroDoc.data() as formsCadastroDados;
  }

  // 3. Se não encontrou em nenhuma, retorna nulo e avisa no log
  console.warn(
    `Alerta: Documento do formulário com ID ${formId} não foi encontrado em nenhuma das coleções.`
  );
  return null;
};

/**
 * Recalcula todos os indicadores para um determinado estado e atualiza a coleção 'dadosEstados'.
 * @param {string} stateName O nome do estado a ser recalculado.
 */
const recalculateStateIndicators = async (stateName: string) => {
  console.log(`Iniciando recálculo para o estado: ${stateName}`);

  // 1. Busca todos os projetos que são 'ativos', 'aprovados' e pertencem ao estado especificado.
  const projectsSnapshot = await db
    .collection("projetos")
    .where("ativo", "==", true)
    .where("status", "==", "aprovado")
    .where("estados", "array-contains", stateName)
    .get();

  // 2. Se não houver projetos para este estado, zera os dados dele em 'dadosEstados'
  if (projectsSnapshot.empty) {
    console.log(`Nenhum projeto ativo/aprovado encontrado para ${stateName}. Limpando indicadores.`);
    await db.collection("dadosEstados").doc(stateName).set({
      nomeEstado: stateName,
      qtdProjetos: 0,
      qtdMunicipios: 0,
      municipios: [],
      valorTotal: 0,
      maiorAporte: { nome: '', valorAportado: 0 },
      beneficiariosDireto: 0,
      beneficiariosIndireto: 0,
      qtdOrganizacoes: 0,
      projetosODS: Array(17).fill(0),
      segmento: [],
      lei: {}
    });
    return;
  }

  // 3. Inicializa os agregadores de dados
  let totalValorAportado = 0;
  let totalBeneficiariosDiretos = 0;
  let totalBeneficiariosIndiretos = 0;
  const uniqueInstituicoes = new Set<string>();
  const allMunicipios = new Set<string>();
  const allODS = new Array(17).fill(0);
  const segmentCounts: { [key: string]: number } = {};
  const leiCounts: { [key: string]: number } = {};
  let maiorAporte = { nome: "", valorAportado: 0 };

  // 4. Itera sobre cada projeto encontrado para somar os dados
  for (const projectDoc of projectsSnapshot.docs) {
    const projeto = projectDoc.data() as Projetos;
    const formData = await getFormData(projeto.ultimoFormulario || "");

    // Agregação principal
    totalValorAportado += Number(projeto.valorAprovado) || 0;
    uniqueInstituicoes.add(projeto.instituicao);
    projeto.municipios.forEach((mun) => allMunicipios.add(mun));

    // Atualiza o maior aporte
    if (projeto.valorAprovado > maiorAporte.valorAportado) {
      maiorAporte = {
        nome: projeto.nome,
        valorAportado: projeto.valorAprovado,
      };
    }

    // Contagem por lei
    leiCounts[projeto.lei] = (leiCounts[projeto.lei] || 0) + 1;

    // Agregação baseada nos dados do formulário
    if (formData) {
      totalBeneficiariosDiretos += formData.beneficiariosDiretos || 0;
      // O campo 'beneficiariosIndiretos' só existe em 'formsAcompanhamentoDados'
      if ("beneficiariosIndiretos" in formData) {
        totalBeneficiariosIndiretos += formData.beneficiariosIndiretos || 0;
      }
      formData.ods?.forEach((ods) => allODS[ods] += 1);
      segmentCounts[formData.segmento] = (segmentCounts[formData.segmento] || 0) + 1;
    }
  }

  // 5. Formata os dados para o formato final de 'dadosEstados'
  const finalStateData: dadosEstados = {
    nomeEstado: stateName,
    qtdProjetos: projectsSnapshot.size,
    qtdMunicipios: allMunicipios.size,
    municipios: Array.from(allMunicipios).sort(),
    valorTotal: totalValorAportado,
    maiorAporte: maiorAporte,
    beneficiariosDireto: totalBeneficiariosDiretos,
    beneficiariosIndireto: totalBeneficiariosIndiretos,
    qtdOrganizacoes: uniqueInstituicoes.size,
    projetosODS: Array.from(allODS).sort((a, b) => a - b),
    segmento: Object.entries(segmentCounts).map(([nome, qtd]) => ({ nome: nome, qtdProjetos: qtd })),
    lei: Object.entries(leiCounts).map(([nome, qtd]) => ({ nome: nome, qtdProjetos: qtd })),
  };

  // 6. Salva os dados calculados no Firestore
  await db.collection("dadosEstados").doc(estadosFirebase[stateName]).set(finalStateData);
  console.log(`Indicadores para ${stateName} atualizados com sucesso.`);
};


/**
 * Função principal (Trigger) que observa a coleção 'projetos'.
 * É acionada na criação, atualização ou exclusão de um projeto.
 */
export const onProjetoWrite = onDocumentWritten("projetos/{projetoId}", async (event) => {
  // Na v2, o objeto de evento contém os dados. O 'change' está dentro de 'event.data'.
  const change = event.data;
  if (!change) {
    console.log("Nenhum dado de alteração associado ao evento.");
    return;
  }

  // O resto da lógica é idêntico, pois já opera sobre 'before' e 'after'.
  const beforeData = change.before.exists ? (change.before.data() as Projetos) : null;
  const afterData = change.after.exists ? (change.after.data() as Projetos) : null;

  const affectedStates = new Set<string>();

  if (beforeData?.estados) {
    beforeData.estados.forEach((state) => affectedStates.add(state));
  }
  if (afterData?.estados) {
    afterData.estados.forEach((state) => affectedStates.add(state));
  }

  if (affectedStates.size === 0) {
    console.log("Nenhum estado afetado pela alteração. Encerrando.");
    return;
  }

  const recalculationPromises = Array.from(affectedStates).map((stateName) =>
    recalculateStateIndicators(stateName)
  );

  await Promise.all(recalculationPromises);

  console.log("Todos os estados afetados foram recalculados.");
}
);