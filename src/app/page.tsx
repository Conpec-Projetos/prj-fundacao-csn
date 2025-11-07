import AdminHomeClient from "@/components/homeAdmin/homeClient";
import { db } from "@/firebase/firebase-config";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { dadosEstados } from "@/firebase/schema/entities";

export const dynamic = "force-dynamic"

type ProjetoInfo = { id: string; repetiu: boolean; vezes: number };

type CorrecaoDadosGerais = {
  beneficiariosDiretos: number;
  beneficiariosIndiretos: number;
  ods: number[];
};

type IdEscolhido = {
  id: string;
  idEscolhido: string; // se for do ultimoforms = ultimoForms se for do de projetos = projetos
};

  function somarDadosEstados(
    array: dadosEstados[],
    projRepetidos: Map<string, ProjetoInfo>
  ): dadosEstados {
    const maiorAporteGlobal = array
      .map((d) => d.maiorAporte)
      .reduce(
        (max, curr) => {
          if (!max || (curr && curr.valorAportado > max.valorAportado)) {
            return curr;
          }
          return max;
        },
        null as { nome: string; valorAportado: number } | null
      ) ?? {
      nome: "",
      valorAportado: 0,
    };

    const initialValue: dadosEstados = {
      nomeEstado: "Todos",
      valorTotal: 0,
      maiorAporte: maiorAporteGlobal,
      qtdProjetos: 0,
      beneficiariosDireto: 0,
      beneficiariosIndireto: 0,
      qtdOrganizacoes: 0,
      qtdMunicipios: 0,
      lei: [],
      segmento: [],
      municipios: [],
      idProjects: [],
    };

    return array.reduce((acc, curr) => {
      for (const id of curr.idProjects ?? []) {
        if (projRepetidos.has(id)) {
          const info = projRepetidos.get(id)!;
          info.vezes += 1;
          info.repetiu = true;
        } else {
          projRepetidos.set(id, { id, repetiu: false, vezes: 1 });
        }
      }
      // Soma dos valores escalares

      const novoAcc = {
        nomeEstado: "Todos",
        valorTotal: (acc.valorTotal ?? 0) + (curr.valorTotal ?? 0),
        maiorAporte: maiorAporteGlobal,
        qtdProjetos: (acc.qtdProjetos ?? 0) + (curr.qtdProjetos ?? 0),
        beneficiariosDireto:
          (acc.beneficiariosDireto ?? 0) + (curr.beneficiariosDireto ?? 0),
        beneficiariosIndireto:
          (acc.beneficiariosIndireto ?? 0) + (curr.beneficiariosIndireto ?? 0),
        qtdOrganizacoes:
          (acc.qtdOrganizacoes ?? 0) + (curr.qtdOrganizacoes ?? 0),
        qtdMunicipios: (acc.qtdMunicipios ?? 0) + (curr.qtdMunicipios ?? 0),
        projetosODS: acc.projetosODS
          ? acc.projetosODS.map((v, i) => v + (curr.projetosODS?.[i] ?? 0))
          : (curr.projetosODS ?? []),
        lei: [] as { nome: string; qtdProjetos: number }[],
        segmento: [] as { nome: string; qtdProjetos: number }[],
        municipios: [...(acc.municipios ?? []), ...(curr.municipios ?? [])],
        idProjects: [],
      };

      // Agora agrupa e soma os segmentos

      const segmentosCombinados = [
        ...(acc.segmento || []),
        ...(curr.segmento || []),
      ];
      const leiCombinada = [...(acc.lei || []), ...(curr.lei || [])];

      const segmentoAgrupado = segmentosCombinados.reduce(
        (segAcc, segCurr) => {
          const index = segAcc.findIndex((item) => item.nome === segCurr.nome);
          if (index >= 0) {
            segAcc[index].qtdProjetos += segCurr.qtdProjetos || 0;
          } else {
            segAcc.push({ ...segCurr });
          }
          return segAcc;
        },
        [] as { nome: string; qtdProjetos: number }[]
      );

      novoAcc.segmento = segmentoAgrupado;

      const leiAgrupada = leiCombinada.reduce(
        (leiAcc, leiCurr) => {
          const index = leiAcc.findIndex((item) => item.nome === leiCurr.nome);
          if (index >= 0) {
            leiAcc[index].qtdProjetos += leiCurr.qtdProjetos || 0;
          } else {
            leiAcc.push({ ...leiCurr });
          }
          return leiAcc;
        },
        [] as { nome: string; qtdProjetos: number }[]
      );

      novoAcc.lei = leiAgrupada;

      return novoAcc;
    }, initialValue);
  }

  async function buscarProjetosEmLote(
    projetoIds: string[]
  ): Promise<Record<string, any>> {
    const resultado: Record<string, any> = {};

    // Se não há IDs, retorna objeto vazio
    if (projetoIds.length === 0) {
      return resultado;
    }

    // Firestore limita a 10 documentos por consulta com "in"
    const batchSize = 10;

    for (let i = 0; i < projetoIds.length; i += batchSize) {
      const batchIds = projetoIds.slice(i, i + batchSize);

      // ✅ CORREÇÃO: batchIds é um array de strings
      const projetosQuery = query(
        collection(db, "projetos"),
        where("__name__", "in", batchIds)
      );

      const snapshot = await getDocs(projetosQuery);
      snapshot.forEach((doc) => {
        resultado[doc.id] = doc.data();
      });

      // Pequena pausa para evitar limites do Firestore
      if (i + batchSize < projetoIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return resultado;
  }

  async function correcaoSoma(id: IdEscolhido): Promise<CorrecaoDadosGerais> {
    const correcao: CorrecaoDadosGerais = {
      beneficiariosDiretos: 0,
      beneficiariosIndiretos: 0,
      ods: [],
    };

    try {
      // como esse id é do ultimo formulario ele pode nao existir, pois so é criado se ja preenchemos o forms de acompanhamento
      if (id.idEscolhido == "projetos") {
        // ou seja so tem forms de cadastro obrigatoriamente
        const formCadastro = query(
          collection(db, "forms-cadastro"),
          where("projetoID", "==", id.id)
        );
        const cadastroSnapshot = await getDocs(formCadastro);

        if (!cadastroSnapshot.empty) {
          // ✅ CORREÇÃO: Acessar o primeiro documento corretamente
          const doc = cadastroSnapshot.docs[0];
          const data = doc.data();

          correcao.beneficiariosDiretos = data?.beneficiariosDiretos ?? 0;
          correcao.ods = data?.ods ?? [];
          return correcao;
        }
      }
      // ✅ CORREÇÃO: Tratar campos inconsistentes entre formulários
      const refAcompanhamento = doc(db, "forms-acompanhamento", id.id);
      const acompanhamentoSnapshot = await getDoc(refAcompanhamento);

      if (acompanhamentoSnapshot.exists()) {
        const data = acompanhamentoSnapshot.data();
        correcao.beneficiariosDiretos =
          data?.beneficiariosDireto ?? data?.beneficiariosDiretos ?? 0;
        correcao.beneficiariosIndiretos =
          data?.beneficiariosIndireto ?? data?.beneficiariosIndiretos ?? 0;
        correcao.ods = data?.ods ?? [];
        return correcao;
      }

      const refCadastro = doc(db, "forms-cadastro", id.id);
      const cadastroSnapshot = await getDoc(refCadastro);

      if (cadastroSnapshot.exists()) {
        const data = cadastroSnapshot.data();
        correcao.beneficiariosDiretos =
          data?.beneficiariosDireto ?? data?.beneficiariosDiretos ?? 0;
        correcao.ods = data?.ods ?? [];
        return correcao;
      }

      return correcao;
    } catch (error) {
      console.error(`Erro ao buscar beneficiários para form ${id.id}:`, error);
      return correcao;
    }
  }

  async function buscarDadosGerais(): Promise<{
    dados: dadosEstados;
    dadosMapa: Record<string, number>;
    estadosAtendidos: number;
  }> {
    const consulta = query(
      collection(db, "dadosEstados"),
      where("qtdProjetos", "!=", 0)
    );

    const consultaSnapshot = await getDocs(consulta);
    const todosDados: dadosEstados[] = [];
    const dadosMapaTemp: Record<string, number> = {};

    consultaSnapshot.forEach((doc) => {
      const data = doc.data() as dadosEstados;
      todosDados.push(data);
      if (data.nomeEstado) {
        dadosMapaTemp[data.nomeEstado] = data.qtdProjetos;
      }
    });

    // inicialização
    const projRepetidos = new Map<string, ProjetoInfo>();

    // passando o projRepetidos por parametro para a soma
    let dadosSomados = somarDadosEstados(todosDados, projRepetidos);

    const projetosRepetidosIds = Array.from(projRepetidos.entries())
      .filter(([, info]) => info.repetiu)
      .map(([id]) => id);

    if (projetosRepetidosIds.length > 0) {
      const projetosRepetidosData =
        await buscarProjetosEmLote(projetosRepetidosIds);

      for (const [id, info] of projRepetidos) {
        if (info.repetiu && projetosRepetidosData[id]) {
          const projetoData = projetosRepetidosData[id];

          // ✅ CORREÇÃO: Aplicar todas as correções
          dadosSomados.qtdProjetos -= info.vezes - 1;

          // ✅ CORREÇÃO: Subtrair valor total (assumindo que está em projetoData.valorAprovado)
          const valorProjeto = projetoData.valorAprovado ?? 0;
          console.log(valorProjeto);
          dadosSomados.valorTotal -= valorProjeto * (info.vezes - 1);

          // ✅ CORREÇÃO: Buscar e subtrair beneficiários
          const escolhaDoId: IdEscolhido = {
            id: projetoData.ultimoFormulario,
            idEscolhido: "ultimoForms",
          };
          if (escolhaDoId.id == undefined || 0 || null) {
            escolhaDoId.id = id; // esse id é que esta na colecao dadosEstados para cada estado dentro do array idProjects que estamos percorrendo, e ele é id do projeto na colecao projetos
            escolhaDoId.idEscolhido = "projetos";
          }
          const correcao = await correcaoSoma(escolhaDoId);
          dadosSomados.beneficiariosDireto -=
            correcao.beneficiariosDiretos * (info.vezes - 1);
          dadosSomados.beneficiariosIndireto -=
            correcao.beneficiariosIndiretos * (info.vezes - 1);

          // ✅ CORREÇÃO: Subtrair ODS
          if (dadosSomados.projetosODS && correcao.ods.length > 0) {
            dadosSomados.projetosODS = dadosSomados.projetosODS.map(
              (valor, index) => {
                // Se este ODS está no projeto, subtrai 1 para cada repetição
                const shouldSubtract =
                  correcao.ods.includes(index + 1) ||
                  correcao.ods.includes(index);
                return shouldSubtract
                  ? Math.max(0, valor - (info.vezes - 1))
                  : valor;
              }
            );
          }
        }
      }
    }

    const totalEstadosAtendidos = todosDados.length;

    return {
      dados: dadosSomados,
      dadosMapa: dadosMapaTemp,
      estadosAtendidos: totalEstadosAtendidos,
    };
  }

export default async function AdminHomePage() {
  const dadosGerais = await buscarDadosGerais()

  return (
    <AdminHomeClient dados={dadosGerais.dados} estadosAtendidos={dadosGerais.estadosAtendidos}/>
  );
}
