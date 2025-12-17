import { db } from "@/firebase/firebase-config";
import { odsList, publicoList } from "@/firebase/schema/entities";
import { clsx, type ClassValue } from "clsx";
import { collection, getDocs } from "firebase/firestore";
import { FieldError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

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
}

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

export function getItemNome(selectedItem: number | undefined, ItemList: { id: number; nome: string }[]): string {
    if(!selectedItem){
        return ""
    }
    const itemObj = ItemList.find(item => item.id === selectedItem);
    return itemObj ? itemObj.nome : "";
}

export function slugifyEstado(stateName: string): string {
    return stateName
        .toLowerCase()
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_"); // Substitui espaços por underscores
}

export function formatCNPJ(value: string): string {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 14);

    if (!digitsOnly) return "";

    return digitsOnly
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatCEP(value: string): string {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

    if (!digitsOnly) return "";

    return digitsOnly.replace(/(\d{5})(\d)/, "$1-$2");
}

export function validaCNPJ(cnpj: string): boolean {
    // Remove caracteres de formatação
    const cleanCnpj = cnpj.replace(/[^\d]/g, "");

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
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11);

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

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function filtraDigitos(value: string): string {
    if (!value) return "";
    return value.replace(/\D/g, ""); // Remove tudo que não for dígito
}

export type Leis = {
    id: string,
    nome: string,
    sigla:string
}


export type LeiSelectProps = {
  text: string;
  list: Leis[];
  value: string | null; // id (que é string) da lei selecionada
  onChange: (id: string) => void;
  error?: FieldError | undefined;
  isNotMandatory?: boolean;
};


export async function getLeisFromDB(): Promise<Leis[]> {
    const leisCollection = collection(db, "leis");
    const leisSnapshot = await getDocs(leisCollection);

    const leisList: Leis[] = leisSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        sigla: doc.data().sigla,
    }));

    return leisList;
}


/**
 * Normalize a stored URL-like value into an absolute URL when possible.
 * Handles legacy shapes like JSON-stringified arrays (e.g. '["https://..."]')
 * and path-like values by prefixing with NEXT_PUBLIC_VERCEL_BLOB_BASE_URL or VERCEL_URL or window.origin.
 * Returns null when input is empty/invalid.
 */export function normalizeStoredUrl(u?: string | string[] | null): string | null {
    if (!u) return null;
    
    // 1) Se já é array real → pegue o primeiro item
    if (Array.isArray(u)) {
        if (u.length > 0 && typeof u[0] === "string") {
            return u[0];
            
        }
        return null;
    }

    // A partir daqui u é string
    let s = String(u).trim();
    if (!s) return null;

    // 2) Remove aspas externas
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim();
    }

    // 3) Remove uma barra inicial antes de um JSON array
    if (s.startsWith("/") && s[1] === "[") {
        s = s.slice(1);
    }

    // 4) Se for JSON → parse
    if (s.startsWith("[") && s.endsWith("]")) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed) && parsed[0]) {
                return parsed[0];
            }
        } catch {
            /* Se der erro, continua como string normal */
        }
    }

    // 5) Já é URL normal
    if (s.startsWith("http://") || s.startsWith("https://")) {
        return s;
    }

    // 6) Prefixo para paths relativos
    const base =
        typeof window !== "undefined" && process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL == null
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL ??
              (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined));
    if (!base) return s;

    return `${base.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
}
