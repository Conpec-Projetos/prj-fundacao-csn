import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db} from "@/firebase/firebase-config";
import { odsList, publicoList } from "@/firebase/schema/entities";
import { collection, getDocs } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function formatCNPJ(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 14);

  if (!digitsOnly) return "";

  return digitsOnly
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatCEP(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  if (!digitsOnly) return "";

  return digitsOnly.replace(/(\d{5})(\d)/, '$1-$2');
}

export function validaCNPJ(cnpj: string): boolean {
  // Remove caracteres de formatação
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');

  // Verifica o tamanho e se todos os dígitos são iguais
  if (cleanCnpj.length !== 14 || /^(\d)\1+$/.test(cleanCnpj)) {
    return false;
  }

  let size = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, size);
  const digits = cleanCnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  if (result !== parseInt(digits.charAt(0), 10)) {
    return false;
  }

  size = size + 1;
  numbers = cleanCnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  return result === parseInt(digits.charAt(1), 10);
}


export function formatTelefone(value: string): string {
  if (!value) return "";
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

  if (digitsOnly.length <= 2) {
    return `(${digitsOnly}`;
  }
  if (digitsOnly.length <= 6) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
  }
  if (digitsOnly.length <= 10) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
  }
  return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
}

export function formatMoeda(value: number): string {
  if (isNaN(value)) return "";

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function filtraDigitos(value: string): string {
  if (!value) return "";
  return value.replace(/\D/g, ''); // Remove tudo que não for dígito
}

export async function getLeisFromDB() {
  const leisCollection = collection(db, 'leis');
  const leisSnapshot = await getDocs(leisCollection);
  const leisList = leisSnapshot.docs.map((doc, index) => ({
      id: index,
      nome: doc.data().nome,
      sigla: doc.data().sigla,
  }));
  return leisList;
}