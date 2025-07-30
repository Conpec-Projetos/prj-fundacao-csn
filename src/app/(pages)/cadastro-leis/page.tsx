"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { toast, Toaster } from "sonner";

const leiSchema = z.object({
  nome: z
    .string()
    .min(1, { message: "O nome é obrigatório." }),
  sigla: z
    .string()
    .min(1, { message: "A sigla é obrigatória." }),
});

type LeiForm = z.infer<typeof leiSchema>;

export default function CadastroLeis() {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeiForm>({
    resolver: zodResolver(leiSchema),
  });

  const onSubmit = async (data: LeiForm) => {
    setIsSaving(true);

    try {
      await addDoc(collection(db, "leis"), data);
      toast.success("Lei cadastrada com sucesso!");
      reset();
    } catch (err) {
      console.error("Erro ao cadastrar lei: ", err);
      toast.error("Erro ao cadastrar lei. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 bg-gray-50 dark:bg-gray-800 px-4 transition">
      <Toaster richColors closeButton />

      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Cadastrar Lei
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white dark:bg-blue-fcsn3 rounded-lg shadow p-6 space-y-6 transition"
      >
        {/* Nome da Lei */}
        <div>
          <label className="block mb-1 text-lg font-bold text-gray-700 dark:text-white-off">
            Nome
          </label>
          <input
            type="text"
            {...register("nome")}
            placeholder="Nome da Lei"
            className="w-full py-3 bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn transition-all focus:shadow-lg focus:outline-none focus:border-blue-fcsn px-4"
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
          )}
        </div>

        {/* Sigla da Lei */}
        <div>
          <label className="block mb-1 text-lg font-bold text-gray-700 dark:text-white-off">
            Sigla
          </label>
          <input
            type="text"
            {...register("sigla")}
            placeholder="Sigla da Lei"
            className="w-full py-3 bg-white dark:bg-blue-fcsn3 rounded-xl border border-blue-fcsn transition-all focus:shadow-lg focus:outline-none focus:border-blue-fcsn px-4"
          />
          {errors.sigla && (
            <p className="text-red-500 text-sm mt-1">{errors.sigla.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-4 py-3 text-blue-fcsn dark:text-white-off bg-white-off dark:bg-blue-fcsn2 hover:bg-stone-300 dark:hover:bg-blue-fcsn rounded-xl text-lg font-bold px-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-fcsn transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : "Cadastrar Lei"}
        </button>
      </form>
    </div>
  );
}
