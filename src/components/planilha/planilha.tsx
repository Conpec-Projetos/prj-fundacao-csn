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
  where,
  query,
  Timestamp
} from "firebase/firestore";
import { Projetos } from "@/firebase/schema/entities";
import { Filter } from "./filter";
import {
  FaCaretDown,
  FaCaretUp,
  FaCheckCircle,
  FaEdit,
  FaList,
  FaLock,
  FaHourglassHalf,
  FaPencilAlt,
  FaTable,
  FaTimesCircle,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { EmpresasEditModal } from "./empresasEditModal";

interface Empresa {
  nome: string;
  valorAportado: number; // Armazenado em centavos para evitar problemas com ponto flutuante
}

interface PlanilhaProps {
  tipoPlanilha: "aprovacao" | "monitoramento" | "historico";
}

// Define a estrutura de um projeto com o ID do documento
interface ProjetoComId extends Omit<Projetos, 'empresas'> {
  id: string;
  empresas: Empresa[];
  dataAprovado?: Timestamp;
}

const formatCurrency = (value: number) => {
  if (value) return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return 'R$0,00'
};

const empresasFilterFn: FilterFn<ProjetoComId> = (row, columnId, filterValue) => {
  const empresas = row.getValue(columnId) as Empresa[];
  if (!Array.isArray(empresas)) return false;
  return empresas.some((empresa) =>
    empresa.nome.toLowerCase().includes(String(filterValue).toLowerCase())
  );
};

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
type ActiveFilter = 'all' | 'true' | 'false';
type StatusFilter = 'all' | 'aprovado' | 'reprovado' | 'pendente';

// Função de filtro personalizada para colunas de números

const numberFilterFn: FilterFn<ProjetoComId> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId) as number;
  return String(rowValue).includes(String(filterValue));
};


// Converte qualquer valor para uma string de exibição
const toDisplayValue = (value: unknown, columnId: string): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    // Lógica de exibição para "empresas"
    if (columnId === 'empresas') {
      return (value as Empresa[])
        .map(e => `${e.nome} (${formatCurrency(e.valorAportado)})`)
        .join("; ");
    }
    return value.join(", ");
  }

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString('pt-BR');
  }
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
  const [value, setValue] = useState(toDisplayValue(initialValue, column.id));

  const onBlur = () => updateData(row.original.id, column.id, value);

  useEffect(() => {
    setValue(toDisplayValue(initialValue, column.id));
  }, [initialValue, column.id]);

  return isEditable ? (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-fcsn rounded"
    />

  ) : (
    <div className="h-full p-2 break-words">
      {toDisplayValue(initialValue, column.id)}
    </div>
  );
};

// Componente principal da Planilha

const Planilha = (props: PlanilhaProps) => {
  const [data, setData] = useState<ProjetoComId[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjetoComId | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredData = useMemo(() => {
    let filtered = data;

    if (complianceFilter !== 'all') {
      const complianceValue = complianceFilter === 'true';
      filtered = filtered.filter(p => p.compliance === complianceValue);
    }
    if (activeFilter !== 'all') {
      const activeValue = activeFilter === 'true';
      filtered = filtered.filter(p => p.ativo === activeValue);
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter(p => {
            if (!p.dataAprovado) return false;
            return p.dataAprovado.toDate() >= start;
        });
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(p => {
            if (!p.dataAprovado) return false;
            return p.dataAprovado.toDate() <= end;
        });
    }
    
    return filtered;

  }, [data, complianceFilter, activeFilter, startDate, endDate, statusFilter]);

  // Efeito para buscar e ouvir as atualizações dos dados do Firestore
  useEffect(() => {
    const colecaoRef = collection(db, "projetos");
    let consulta;

    if (props.tipoPlanilha === "aprovacao") {
      consulta = query(colecaoRef, where("status", "==", "pendente"), where("ativo", '==', true));
    } else if (props.tipoPlanilha === "monitoramento") {
      consulta = query(colecaoRef, where("status", "==", "aprovado"), where("ativo", '==', true));
    } else {
      consulta = colecaoRef;
    }

    const unsubscribe = onSnapshot(consulta, (snapshot) => {
      setData(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Projetos),
        }))
      );
    });
    return () => unsubscribe();
  }, [props.tipoPlanilha]);

  // Função para atualizar um campo no Firestore quando uma célula é editada
  const handleUpdateData = useCallback(
    async (docId: string, columnId: string, value: string) => {
      let processedValue: string | number | string[] = value;
      switch (columnId) {
        case "municipios":
        case "estados":
          processedValue = value.split(",").map((item) => item.trim());
          break;
        case "valorAprovado":
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

  const handleSaveEmpresas = async (updatedEmpresas: Empresa[]) => {
    if (editingProject) {
      const novoValorAprovado = updatedEmpresas.reduce((total, empresa) => total + empresa.valorAportado, 0);
      const dataToUpdate = {
        empresas: updatedEmpresas,
        valorAprovado: novoValorAprovado,
      };
      const docRef = doc(db, "projetos", editingProject.id);
      try {
        await updateDoc(docRef, dataToUpdate);
        console.log("Projeto atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar o projeto:", error);
      }
    }
  };

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
        accessorKey: "valorAprovado",
        header: "Aprovado",
        cell: (props: CellContext<ProjetoComId, unknown>) => {
          const valor = props.getValue() as number;
          return (
            <div className="p-2 break-words text-right">
              {formatCurrency(valor)}
            </div>
          );
        },
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
        cell: (props: CellContext<ProjetoComId, unknown>) => {
          const empresas = props.getValue() as Empresa[];
          const displayValue = Array.isArray(empresas)
            ? empresas.map(e => `${e.nome} (${formatCurrency(e.valorAportado)})`).join("; ")
            : "";

          return (
            <div className="p-2 flex items-center justify-between group">
              <span className="break-words">{displayValue}</span>
              {isEditable && (
                <button
                  onClick={() => {
                    setEditingProject(props.row.original);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded-full text-blue-fcsn dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaEdit />
                </button>
              )}
            </div>
          )
        },
        filterFn: empresasFilterFn,
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

  const handleActiveFilterChange = () => {
    setActiveFilter(current => {
      if (current === 'all') return 'false'
      if (current === 'false') return 'true'
      return 'all'
    })
  }

  const handleStatusFilterChange = () => {
    setStatusFilter(current => {
        if (current === 'all') return 'aprovado';
        if (current === 'aprovado') return 'reprovado';
        if (current === 'reprovado') return 'pendente';
        return 'all';
    });
  };

  const complianceButtonConfig = {
    all: { text: 'Todos', icon: <FaList />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    true: { text: 'Aprovados', icon: <FaCheckCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    false: { text: 'Pendentes', icon: <FaTimesCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' }
  };

  const activeButtonConfig = {
    all: { text: 'Todos', icon: <FaList />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    true: { text: 'Sim', icon: <FaCheckCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    false: { text: 'Não', icon: <FaTimesCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' }
  };

   const statusButtonConfig = {
    all: { text: 'Todos', icon: <FaList />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    aprovado: { text: 'Aprovados', icon: <FaCheckCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    reprovado: { text: 'Reprovados', icon: <FaTimesCircle />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' },
    pendente: { text: 'Pendentes', icon: <FaHourglassHalf />, className: 'bg-blue-fcsn dark:bg-blue-fcsn2 hover:bg-blue-fcsn3' }
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
        key: "valorAprovado",
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
        empresas: Array.isArray(data.empresas) ? data.empresas.map(e => `${e.nome} (${formatCurrency(e.valorAportado)})`).join("; ") : "",
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
      {editingProject && (
        <EmpresasEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEmpresas}
          initialData={editingProject.empresas || []}
          projectName={editingProject.nome}
        />
      )}
      <div className="mb-4 flex flex-wrap justify-end items-center gap-4">
        {props.tipoPlanilha === "aprovacao" && (
          <h1 className="text-3xl font-bold mr-auto">Projetos para aprovação</h1>
        )}
        {props.tipoPlanilha === "monitoramento" && (
          <h1 className="text-3xl font-bold mr-auto">Projetos em monitoramento</h1>
        )}
        {props.tipoPlanilha === "historico" && (
          <>
            <h1 className="text-3xl font-bold mr-auto">Histórico dos projetos</h1>
            <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="font-bold text-blue-fcsn dark:text-white-off">De:</label>
                <input 
                    type="date" 
                    id="start-date"
                    onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                    className="[color-scheme:dark] p-2 border rounded-lg bg-blue-fcsn dark:bg-blue-fcsn2 border-blue-fcsn2 dark:border-blue-fcsn text-white-off font-bold"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="end-date" className="font-bold text-blue-fcsn dark:text-white-off">Até:</label>
                <input 
                    type="date" 
                    id="end-date"
                    onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                    className="[color-scheme:dark] p-2 border rounded-lg bg-blue-fcsn dark:bg-blue-fcsn2 border-blue-fcsn2 dark:border-blue-fcsn text-white-off font-bold"
                />
            </div>
            <button
              onClick={handleStatusFilterChange}
              className={`font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-white cursor-pointer ${statusButtonConfig[statusFilter].className}`}
            >
                {statusButtonConfig[statusFilter].icon}
                <span>Status: <strong>{statusButtonConfig[statusFilter].text}</strong></span>
            </button>
            <button
              onClick={handleActiveFilterChange}
              className={`font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-white cursor-pointer ${activeButtonConfig[activeFilter].className}`}
            >{activeButtonConfig[activeFilter].icon} Ativo: <strong>{activeButtonConfig[activeFilter].text}</strong> </button>
          </>
        )}
        {/* Botão de alterar o filtro de compliance */}
        <button
          onClick={handleComplianceFilterChange}
          className={`font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-white cursor-pointer ${complianceButtonConfig[complianceFilter].className}`}
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
        <table className="min-w-full bg-white dark:bg-blue-fcsn3 table-fixed">
          <thead className="bg-white-off dark:bg-blue-fcsn2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="w-full p-3 text-left text-sm font-bold text-blue-fcsn dark:text-white-off uppercase tracking-wider align-top"
                    style={{ width: header.getSize() }}
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
