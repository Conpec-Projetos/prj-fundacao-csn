'use client';

import Planilha from "../planilha/planilha";

export default function PlanilhaAprovacaoClient() {
  return (
    <div className="flex flex-col grow min-h-[90vh]">
        <main className="flex flex-col gap-8 px-8 pb-8 flex-1 sm:mx-8 pt-12">          
            <Planilha tipoPlanilha="aprovacao" />
        </main>
    </div>
  );
}