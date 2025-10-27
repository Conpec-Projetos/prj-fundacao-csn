import AdminHomeClient from "@/components/homeAdmin/homeClient";
import { db } from "@/firebase/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dadosEstados } from "@/firebase/schema/entities";

export const dynamic = "force-dynamic"

function somarDadosEstados(array: dadosEstados[]): dadosEstados {
    const projetosUnicos = new Set<string>(); // fazemos isso pois ao inserir no firebase ha duplicacoes (ex: se o mesmo projeto atua em dois estados entao no doc de cada estado estará a informacao desse projeto em cada um e isso da duplicacao na soma)
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
      qtdProjetos: 0,  // usaremos isso
      beneficiariosDireto: 0,
      beneficiariosIndireto: 0,
      qtdOrganizacoes: 0,
      qtdMunicipios: 0,
      lei: [],
      segmento: [],
      municipios: [],
      idProjects: [],
      projetosODS: Array(17).fill(0), // ✅ inicializa aqui
    };
  
    return array.reduce((acc, curr) => {
    // Soma somente projetos únicos
    if (curr.idProjects) {
      curr.idProjects.forEach((idProj) => {
        if (!projetosUnicos.has(idProj)) {
          projetosUnicos.add(idProj);

          acc.valorTotal += curr.valorTotal ?? 0;
          acc.beneficiariosDireto += curr.beneficiariosDireto ?? 0;
          acc.beneficiariosIndireto += curr.beneficiariosIndireto ?? 0;
          acc.qtdOrganizacoes += curr.qtdOrganizacoes ?? 0;
          acc.qtdMunicipios += curr.qtdMunicipios ?? 0;
          acc.qtdProjetos += curr.qtdProjetos ?? 0;

          // Soma ODS
          if (curr.projetosODS) {
            curr.projetosODS?.forEach((valor, i) => {
              acc.projetosODS = acc.projetosODS ?? Array(17).fill(0); // garante que existe
              acc.projetosODS[i] = (acc.projetosODS[i] ?? 0) + valor;
            });
          }

          // Acumula municípios
          acc.municipios.push(...(curr.municipios ?? []));

          // Acumula segmentos
          curr.segmento?.forEach((seg) => {
            const idx = acc.segmento.findIndex((s) => s.nome === seg.nome);
            if (idx >= 0) acc.segmento[idx].qtdProjetos += seg.qtdProjetos;
            else acc.segmento.push({ ...seg });
          });

          // Acumula leis
          curr.lei?.forEach((lei) => {
            const idx = acc.lei.findIndex((l) => l.nome === lei.nome);
            if (idx >= 0) acc.lei[idx].qtdProjetos += lei.qtdProjetos;
            else acc.lei.push({ ...lei });
          });
        }
      });
    }

    return acc;
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
