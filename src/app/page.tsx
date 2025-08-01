import AdminHomeClient from "@/components/homeAdmin/homeClient";
import { db } from "@/firebase/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dadosEstados } from "@/firebase/schema/entities";

function somarDadosEstados(array: dadosEstados[]): dadosEstados {
  const maiorAporteGlobal = array
    .map((d) => d.maiorAporte)
    .reduce((max, curr) => {
      if (!max || (curr && curr.valorAportado > max.valorAportado)) {
        return curr;
      }
      return max;
    }, null as { nome: string; valorAportado: number } | null) ?? {
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
    projetosODS: [],
    lei: [],
    segmento: [],
    municipios: [],
  };

  return array.reduce((acc, curr) => {
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
        : curr.projetosODS ?? [],
      lei: [] as { nome: string; qtdProjetos: number }[],
      segmento: [] as { nome: string; qtdProjetos: number }[],
      municipios: [...(acc.municipios ?? []), ...(curr.municipios ?? [])],
    };

    // Agora agrupa e soma os segmentos

    const segmentosCombinados = [
      ...(acc.segmento || []),
      ...(curr.segmento || []),
    ];
    const leiCombinada = [...(acc.lei || []), ...(curr.lei || [])];

    const segmentoAgrupado = segmentosCombinados.reduce((segAcc, segCurr) => {
      const index = segAcc.findIndex((item) => item.nome === segCurr.nome);
      if (index >= 0) {
        segAcc[index].qtdProjetos += segCurr.qtdProjetos || 0;
      } else {
        segAcc.push({ ...segCurr });
      }
      return segAcc;
    }, [] as { nome: string; qtdProjetos: number }[]);

    novoAcc.segmento = segmentoAgrupado;

    const leiAgrupada = leiCombinada.reduce((leiAcc, leiCurr) => {
      const index = leiAcc.findIndex((item) => item.nome === leiCurr.nome);
      if (index >= 0) {
        leiAcc[index].qtdProjetos += leiCurr.qtdProjetos || 0;
      } else {
        leiAcc.push({ ...leiCurr });
      }
      return leiAcc;
    }, [] as { nome: string; qtdProjetos: number }[]);

    novoAcc.lei = leiAgrupada;

    return novoAcc;
  }, initialValue);
}

async function buscarDadosGerais(): Promise<{
  dados: dadosEstados;
  estadosAtendidos: number;
}> {
  const consulta = query(
    collection(db, "dadosEstados"),
    where("qtdProjetos", "!=", 0)
  );

  const consultaSnapshot = await getDocs(consulta);
  const todosDados: dadosEstados[] = [];

  consultaSnapshot.forEach((doc) => {
    const data = doc.data() as dadosEstados;
    todosDados.push(data);
  });

  const dadosSomados = somarDadosEstados(todosDados);
  const totalEstadosAtendidos = todosDados.length;

  return {
    dados: dadosSomados,
    estadosAtendidos: totalEstadosAtendidos,
  };
} 

export default async function AdminHomePage() {
  const dadosGerais = await buscarDadosGerais()

  return (
    <AdminHomeClient dados={dadosGerais.dados} estadosAtendidos={dadosGerais.estadosAtendidos}/>
  );
}
