import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  CellContext,
  ColumnFiltersState,
  SortingState,
  FilterFn,
} from "@tanstack/react-table";
import { db } from "@/firebase/firebase-config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Projetos } from "@/firebase/schema/entities";
import { Filter } from "./filter";
import {
  FaCaretDown,
  FaCaretUp,
  FaCheckCircle,
  FaList,
  FaLock,
  FaPencilAlt,
  FaTable,
  FaTimesCircle,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Define a estrutura de um projeto com o ID do documento
interface ProjetoComId extends Projetos {
  id: string;
}

// Função de filtro personalizada para colunas que contêm arrays de strings
const arrayIncludesFilterFn: FilterFn<ProjetoComId> = (
  row,
  columnId,
  filterValue
) => {
  const array = row.getValue(columnId) as string[];
  if (!Array.isArray(array)) return false;
  return array.some((item) =>
    item.toLowerCase().includes(String(filterValue).toLowerCase())
  );
};

type ComplianceFilter = 'all' | 'true' | 'false';

// Função de filtro personalizada para colunas de números
const numberFilterFn: FilterFn<ProjetoComId> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId) as number;
  return String(rowValue).includes(String(filterValue));
};

// Converte qualquer valor para uma string segura para ser exibida em um input
const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return "";
  return String(value);
};

interface EditableCellProps extends CellContext<ProjetoComId, unknown> {
  updateData: (docId: string, columnId: string, value: string) => void;
  isEditable: boolean;
}

const EditableCell = ({
  getValue,
  row,
  column,
  updateData,
  isEditable,
}: EditableCellProps) => {
  const initialValue = getValue();
  const [value, setValue] = useState(toDisplayValue(initialValue));

  const onBlur = () => updateData(row.original.id, column.id, value);

  useEffect(() => {
    setValue(toDisplayValue(initialValue));
  }, [initialValue]);

  return isEditable ? (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-fcsn rounded"
    />
  ) : (
    <div className="w-full h-full p-2 truncate">
      {toDisplayValue(initialValue)}
    </div>
  );
};

// Componente principal da Planilha
const Planilha = () => {
  const [data, setData] = useState<ProjetoComId[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('all');

  const filteredData = useMemo(() => {
    if (complianceFilter == 'all') {
      return data
    }
    const filterValue = complianceFilter === 'true'
    return data.filter(projeto => projeto.compliance === filterValue)
  }, [data, complianceFilter])

  // Efeito para buscar e ouvir as atualizações dos dados do Firestore
  useEffect(() => {
    const colecaoRef = collection(db, "projetos");
    const unsubscribe = onSnapshot(colecaoRef, (snapshot) => {
      setData(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Projetos),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Função para atualizar um campo no Firestore quando uma célula é editada
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
      } catch (error) {
        console.error("Erro ao atualizar documento:", error);
      }
    },
    []
  );

  // Definição das colunas da tabela
  const columns = useMemo(
    () => [
      {
        accessorKey: "lei",
        header: "Lei",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
      },
      {
        accessorKey: "nome",
        header: "Nome",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
      },
      {
        accessorKey: "valorAportadoReal",
        header: "Aportado",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
        filterFn: numberFilterFn,
      },
      {
        accessorKey: "instituicao",
        header: "Proponente",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
      },
      {
        accessorKey: "empresas",
        header: "Empresas Grupo CSN",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
        filterFn: arrayIncludesFilterFn,
      },
      {
        accessorKey: "indicacao",
        header: "Indicação",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
      },
      {
        accessorKey: "municipios",
        header: "Municípios",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
        filterFn: arrayIncludesFilterFn,
      },
      {
        accessorKey: "estados",
        header: "Estados",
        cell: (props: CellContext<ProjetoComId, unknown>) => (
          <EditableCell
            {...props}
            updateData={handleUpdateData}
            isEditable={isEditable}
          />
        ),
        filterFn: arrayIncludesFilterFn,
      },
    ],
    [handleUpdateData, isEditable]
  );

  // Instância da tabela com todas as configurações
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
  });

  const handleComplianceFilterChange = () => {
    setComplianceFilter(current => {
      if (current === 'all') return 'false'
      if (current === 'false') return 'true'
      return 'all'
    })
  }

  const complianceButtonConfig = {
    all: { text: 'Todos', icon: <FaList />, className: 'bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    true: { text: 'Aprovados', icon: <FaCheckCircle />, className: 'bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    false: { text: 'Pendentes', icon: <FaTimesCircle />, className: 'bg-blue-fcsn2 hover:bg-blue-fcsn3' }
  };

  // Função para exportar os dados visíveis para um ficheiro Excel (.xlsx)
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Projetos");

    // Define as colunas (cabeçalhos, chaves de dados e larguras)
    worksheet.columns = [
      { header: "Nome do Projeto", key: "nome", width: 40 },
      { header: "Lei de Incentivo", key: "lei", width: 30 },
      {
        header: "Valor Aportado",
        key: "valorAportadoReal",
        width: 20,
        style: { numFmt: '"R$"#,##0.00' },
      },
      { header: "Proponente", key: "instituicao", width: 30 },
      { header: "Empresas Grupo CSN", key: "empresas", width: 35 },
      { header: "Indicação", key: "indicacao", width: 25 },
      { header: "Municípios", key: "municipios", width: 40 },
      { header: "Estados", key: "estados", width: 30 },
    ];

    const rows = table.getFilteredRowModel().rows;
    const dataToExport = rows.map((row) => {
      const data = row.original;
      return {
        ...data,
        empresas: Array.isArray(data.empresas) ? data.empresas.join(", ") : "",
        municipios: Array.isArray(data.municipios)
          ? data.municipios.join(", ")
          : "",
        estados: Array.isArray(data.estados) ? data.estados.join(", ") : "",
      };
    });

    worksheet.addRows(dataToExport);

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "ff292944" } },
      left: { style: "thin", color: { argb: "ff292944" } },
      bottom: { style: "thin", color: { argb: "ff292944" } },
      right: { style: "thin", color: { argb: "ff292944" } },
    };

    // Estilização do Cabeçalho
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" }, // Cor do texto: Branco
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffb37b97" }, // Cor de fundo: Rosa curadoria
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = borderStyle;
    });

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyle;
        });
      }
    });

    // Gera o ficheiro e aciona o download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Projetos_FCSN.xlsx");
  };

  return (
    <div>
      <div className="mb-4 flex justify-end items-center gap-4">
        {/* Botão de alterar o filtro de compliance */}
        <button
          onClick={handleComplianceFilterChange}
          className={`font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-white ${complianceButtonConfig[complianceFilter].className}`}
        >
          {complianceButtonConfig[complianceFilter].icon}
          <span>Compliance: <strong>{complianceButtonConfig[complianceFilter].text}</strong></span>
        </button>

        {/* Botão de Edição */}
        <button
          onClick={() => setIsEditable((prev) => !prev)}
          className="font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 bg-blue-fcsn dark:bg-blue-fcsn2 text-white-off hover:bg-blue-fcsn2 dark:hover:bg-blue-fcsn3 cursor-pointer"
        >
          {isEditable ? <FaLock /> : <FaPencilAlt />}
          {isEditable ? "Bloquear" : "Editar"}
        </button>

        <button
          onClick={handleExport}
          className="flex flex-row items-center justify-center gap-2 bg-blue-fcsn dark:bg-blue-fcsn2 text-white-off font-bold py-2 px-4 rounded-lg hover:bg-blue-fcsn2 dark:hover:bg-blue-fcsn3 transition-colors cursor-pointer"
        >
          <FaTable /> Exportar para Excel
        </button>
      </div>

      <div className="overflow-auto rounded-lg shadow-md border border-gray-200 dark:border-blue-fcsn2">
        <table className="min-w-full bg-white dark:bg-blue-fcsn3">
          <thead className="bg-white-off dark:bg-blue-fcsn2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left text-sm font-bold text-blue-fcsn dark:text-white-off uppercase tracking-wider align-top"
                  >
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "flex items-center gap-1 cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="text-gray-400">
                        {{ asc: <FaCaretUp />, desc: <FaCaretDown /> }[
                          header.column.getIsSorted() as string
                        ] ?? null}
                      </span>
                    </div>
                    {header.column.getCanFilter() ? (
                      <Filter column={header.column} />
                    ) : null}
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
    </div>
  );
};

export default Planilha;
