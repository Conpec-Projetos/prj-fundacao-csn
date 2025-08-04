"use client";

import { useRef, ReactNode } from "react";
import GeradorPDF from "@/components/pdf/geradorPDF";
import Filtros from "@/components/dashboard/filtros";

interface DashboardClientAreaProps {
  children: ReactNode;
  estadoInicial?: string;
  cidadesIniciais?: string[];
}

export default function DashboardClientArea({
  children,
  estadoInicial,
  cidadesIniciais,
}: DashboardClientAreaProps) {
  const conteudoRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={conteudoRef}
      className="flex flex-col space-y-5 p-4 sm:p-6 md:p-10"
    >
      <div className="flex flex-row md:items-center w-full justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
          <GeradorPDF
            refConteudo={conteudoRef}
            nomeArquivo="dashboard-relatorio"
          />
          <Filtros
            estadoInicial={estadoInicial}
            cidadesIniciais={cidadesIniciais}
          />
        </div>
      </div>
      {children}
    </main>
  );
}
