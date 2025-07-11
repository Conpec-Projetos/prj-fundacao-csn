import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  CellContext,
} from "@tanstack/react-table";
import { db } from "@/firebase/firebase-config";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Projetos } from "@/firebase/schema/entities";

interface ProjetoComId extends Projetos {
  id: string;
}

const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return "";
  }
  return String(value);
};

interface EditableCellProps extends CellContext<ProjetoComId, unknown> {
  updateData: (docId: string, columnId: string, value: string) => void;
}

const EditableCell = ({
  getValue,
  row,
  column,
  updateData,
}: EditableCellProps) => {
  const initialValue = getValue();
  const [value, setValue] = useState(toDisplayValue(initialValue));

  const onBlur = () => {
    updateData(row.original.id, column.id, value);
  };

  useEffect(() => {
    setValue(toDisplayValue(initialValue));
  }, [initialValue]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-fcsn rounded"
    />
  );
};

const Planilha = () => {
  const [data, setData] = useState<ProjetoComId[]>([]);

  useEffect(() => {
    const colecaoRef = collection(db, "projetos");
    const unsubscribe = onSnapshot(colecaoRef, (snapshot) => {
      const dadosDoFirebase: ProjetoComId[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Projetos),
      }));
      setData(dadosDoFirebase);
    });
    return () => unsubscribe();
  }, []);


  const handleUpdateData = useCallback(
    async (docId: string, columnId: string, value: string) => {
      let processedValue: string | number | string[] = value;

      switch (columnId) {
        case "municipios":
        case "estados":
        case "empresas":
          processedValue = value.split(",").map((item) => item.trim());
          break;
        case "valorAportadoReal":
          processedValue = parseFloat(value) || 0;
          break;
        default:
          processedValue = value;
          break;
      }

      const docRef = doc(db, "projetos", docId);
      const dataToUpdate = { [columnId]: processedValue };

      try {
        await updateDoc(docRef, dataToUpdate);
        console.log(`Campo ${columnId} atualizado com sucesso!`);
      } catch (error) {
        console.error("Erro ao atualizar documento:", error);
      }
    },
    []
  );

  const columns = useMemo(
    () => [
      // PASSO 2: Modificar a definição das colunas para passar a função via props
      {
        accessorKey: "lei",
        header: "Lei",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "nome",
        header: "Nome",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "valorAportadoReal",
        header: "Aportado",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "empresaVinculada",
        header: "Proponente",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "empresas",
        header: "Empresas Grupo CSN",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "indicacao",
        header: "Indicação",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "municipios",
        header: "Municípios",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
      {
        accessorKey: "estados",
        header: "Estados",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell {...props} updateData={handleUpdateData} />
        ),
      },
    ],
    [handleUpdateData] // Adicionamos a função como dependência do useMemo
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // PASSO 4: A propriedade 'meta' foi completamente removida!
  });

  return (
    // ... O resto do seu JSX permanece o mesmo
    <div className="overflow-auto rounded-lg shadow-md border border-gray-200 dark:border-blue-fcsn2">
      <table className="min-w-full bg-white dark:bg-blue-fcsn3">
        <thead className="bg-white-off dark:bg-blue-fcsn2">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-3 text-left text-sm font-bold text-blue-fcsn dark:text-white-off uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-blue-fcsn2 bg-white dark:bg-blue-fcsn3 text-blue-fcsn dark:text-white-off hover:bg-gray-50 dark:hover:bg-blue-fcsn2"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Planilha;