import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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