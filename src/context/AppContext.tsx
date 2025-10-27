"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  paginaDesabilitada: boolean;
  setPaginaDesabilitada: (valor: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [paginaDesabilitada, setPaginaDesabilitadaState] = useState(false);

  // Lê o valor salvo no localStorage ao montar
  useEffect(() => {
    const salvo = localStorage.getItem("paginaDesabilitada");
    if (salvo === "true") setPaginaDesabilitadaState(true);
  }, []);

  // Atualiza o localStorage quando o valor mudar
  const setPaginaDesabilitada = (valor: boolean) => {
    setPaginaDesabilitadaState(valor);
    localStorage.setItem("paginaDesabilitada", valor.toString());
  };

  return (
    <AppContext.Provider value={{ paginaDesabilitada, setPaginaDesabilitada }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de AppProvider");
  return ctx;
}
