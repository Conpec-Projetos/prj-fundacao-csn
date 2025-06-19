import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase-config";
import { odsList, publicoList } from "@/firebase/schema/entities";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getFileUrl(files: File[], forms: string, projetoID: string, filename?: string): Promise<string[]> {
  const fileUrl: string[] = [];
  for (const file of files) {
      const storageRef = ref(storage, `${forms}/${projetoID}/${filename || file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      fileUrl.push(downloadURL);
  }
  return fileUrl;
}

export function getOdsIds(selectedOds: boolean[]): number[] {
    const ids: number[] = [];
    selectedOds.forEach((isSelected, index) => {
        if (isSelected) {
            ids.push(odsList[index].id);
        }
    });
    return ids;
};

export function getPublicoNomes(selectedPublico: boolean[], outroValue: string): string[] {
    const nomes: string[] = [];
    selectedPublico.forEach((isSelected, index) => {
        if (!isSelected) {
            return; // Pula o item se a checkbox não estiver marcada
        }

        const publicoItem = publicoList[index];

        // Verifica se é a última opção da lista (que corresponde a "Outro")
        if (index === publicoList.length - 1) {
            // Se o usuário digitou algo, usa o texto dele. Senão, usa "Outro".
            nomes.push(outroValue.trim() || publicoItem.nome);
        } else {
            nomes.push(publicoItem.nome);
        }
    });
    return nomes;
}

export function getItemNome(selectedItem: number, ItemList: { id: number; nome: string }[]): string {
    const itemObj = ItemList.find((item) => item.id === selectedItem);
    return itemObj ? itemObj.nome : "";
}

export function slugifyEstado(stateName: string): string {
    return stateName
        .toLowerCase()
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_'); // Substitui espaços por underscores
}