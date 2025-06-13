import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase-config";
import { odsList, publicoList } from "@/firebase/schema/entities";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserIdFromLocalStorage(): string | null {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userObject = JSON.parse(storedUser);
      // Verifica se a sessão expirou
      if (userObject.timeout && Date.now() > userObject.timeout) {
        localStorage.removeItem("user");
        console.log("Sessão expirada. Redirecionando para login...");
        // Certifique-se de que este código está rodando no client-side
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      }
      return userObject.uid; // Acessa o ID do usuário
    } catch (error) {
      console.error("Erro ao parsear usuário do localStorage:", error);
      localStorage.removeItem("user"); // Limpa em caso de erro de parse
        if (typeof window !== "undefined") {
          window.location.href = '/login';
        }
      return null;
    }
  }
  // Se não há usuário armazenado, pode ser uma boa ideia redirecionar também,
   if (typeof window !== "undefined") {
     // Verifique se a página atual já não é a de login para evitar loop
       if (window.location.pathname !== '/login' && window.location.pathname !== '/signin') {
           window.location.href = '/login';
        }
    }
  return null;
}

export async function getFileUrl(files: File[], forms: string, projetoID: string, filename?: string): Promise<string[]> {
  const fileUrl: string[] = [];
  for (const file of files) {
      const storageRef = ref(storage, `${forms}/${projetoID}/${Date.now()}-${filename || file.name}`);
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