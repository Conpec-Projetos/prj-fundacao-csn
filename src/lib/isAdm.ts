import { dbAdmin } from "@/firebase/firebase-admin-config";

// Usei essa função muitas vezes para verificar se o usuario é um administrador
export async function IsADM(email: string): Promise<boolean> {
    try {
        const snapshot = await dbAdmin
            .collection("usuarioInt")
            .where("email", "==", email)
            .where("administrador", "==", true)
            .get();
        return !snapshot.empty;
    } catch (e) {
        console.error("Erro ao verificar se é ADM:", e);
        return false;
    }
}