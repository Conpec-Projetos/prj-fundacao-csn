'use server';

import { db } from "@/firebase/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Projetos } from "@/firebase/schema/entities";

interface ODS {
  numberODS: number;
  src: string;
}

export interface ProjectComponentProps {
  id: string;
  name: string;
  finalStatus: "aprovado" | "pendente" | "reprovado";
  projetosComplianceStatus: boolean;
  value: number;
  incentiveLaw: string;
  description: string;
  ODS: ODS[];
  complianceUrl: string | null;
  additionalDocsUrls: string[];
  isActive: boolean;
}

export async function getProjects(): Promise<ProjectComponentProps[]> {
    const projectsSnapshot = await getDocs(collection(db, "projetos"));
    const projectsPromises = projectsSnapshot.docs.map(async (projectDoc) => {
        const projectData = projectDoc.data() as Projetos;
        const projectId = projectDoc.id;

        let description = "Sem descrição.";
        let ods: number[] = [];
        let complianceUrl: string | null = null;
        let additionalDocsUrls: string[] = [];

        if (projectData.ultimoFormulario) {
            const formsSnapshot = await getDocs(query(collection(db, "forms-cadastro"), where("projetoID", "==", projectId)));
            if (!formsSnapshot.empty) {
                const formData = formsSnapshot.docs[0].data();
                description = formData.descricao || "Sem descrição.";
                ods = formData.ods || [];
                complianceUrl = formData.compliance?.[0] || null;
                additionalDocsUrls = formData.documentos || [];
            }
        }

        const processedODS: ODS[] = ods.map((odsItem: number) => ({
            numberODS: odsItem,
            src: `/ods/ods${odsItem + 1}.png`,
        }));

        return {
            id: projectId,
            name: projectData.nome || "Nome Indisponível",
            finalStatus: projectData.status,
            projetosComplianceStatus: projectData.compliance === true,
            value: projectData.valorAprovado || 0,
            incentiveLaw: projectData.lei ? projectData.lei.split('-')[0].trim() : "Não informada",
            description: description,
            ODS: processedODS,
            complianceUrl: complianceUrl,
            additionalDocsUrls: additionalDocsUrls,
            isActive: projectData.ativo,
        };
    });

    const resolvedProjects = await Promise.all(projectsPromises);
    return resolvedProjects.sort((a, b) => Number(b.isActive) - Number(a.isActive));
}