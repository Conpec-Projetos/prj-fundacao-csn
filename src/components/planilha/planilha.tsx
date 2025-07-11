import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { db } from "@/firebase/firebase-config";
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

/**
 * Documentação do Componente Célula Editável (EditableCell)
 * Este componente é renderizado dentro de cada célula (<td>) da tabela.
 * Ele gere o seu próprio estado para permitir a edição do valor.
 * Quando o utilizador clica fora do campo de input (onBlur), ele chama a função
 * para atualizar os dados diretamente no Firestore.
 *
 * @param {object} props - Propriedades passadas pelo TanStack Table.
 * @param {any} props.getValue - Função para obter o valor inicial da célula.
 * @param {object} props.row - Objeto com informações da linha atual.
 * @param {object} props.column - Objeto com informações da coluna atual.
 * @param {object} props.table - A instância da tabela, que contém a nossa função de atualização.
 * @returns {JSX.Element} Um elemento <input> para edição.
 */
const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  // Função chamada quando o campo de input perde o foco.
  const onBlur = () => {
    // A função updateData está definida no meta da nossa tabela.
    table.options.meta?.updateData(row.original.id, column.id, value);
  };

  // Atualiza o estado local se o valor inicial (do Firebase) mudar.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-blue-100 rounded"
    />
  );
};

/**
 * Documentação do Componente Planilha
 * Este é o componente principal que busca os dados do Firestore em tempo real,
 * configura e renderiza a tabela usando TanStack Table e Tailwind CSS.
 */
const Planilha = () => {
  const [data, setData] = useState([]);

  // Etapa de Leitura de Dados (Real-time)
  // O useEffect com onSnapshot ouve as alterações na coleção 'planilha_dados'
  // e atualiza o nosso estado 'data' sempre que algo muda no Firestore.
  useEffect(() => {
    const colecaoRef = collection(db, 'projetos');
    const unsubscribe = onSnapshot(colecaoRef, (snapshot) => {
      const dadosDoFirebase = snapshot.docs.map((doc) => ({
        id: doc.id, // Guardamos o ID do documento para saber qual atualizar
        ...doc.data(),
      }));
      setData(dadosDoFirebase);
      console.log('Dados recebidos:', dadosDoFirebase);
    });

    // Função de limpeza: para de ouvir quando o componente é desmontado.
    return () => unsubscribe();
  }, []);

  /**
   * Definição das colunas para o TanStack Table.
   * - accessorKey: Corresponde ao nome do campo no seu documento do Firestore.
   * - header: O texto que aparecerá no cabeçalho da coluna.
   * - cell: Define como cada célula da coluna será renderizada. Usamos o nosso EditableCell.
   */
  const columns = useMemo(
    () => [
        {
        accessorKey: 'lei',
        header: 'Lei',
        cell: EditableCell,
      },
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: EditableCell,
      },
      {
        accessorKey: 'valorAportadoReal',
        header: 'Aportado',
        cell: EditableCell,
      },
      {
        accessorKey: 'empresaVinculada',
        header: 'Proponente',
        cell: EditableCell,
      },
      {
        accessorKey: 'indicacao',
        header: 'Indicação',
        cell: EditableCell,
      },
      {
        accessorKey: 'municipios',
        header: 'Municípios',
        cell: EditableCell,
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: EditableCell,
      },
    ],
    []
  );

  // Hook principal do TanStack Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // 'meta' é um objeto onde podemos passar funções e dados personalizados
    // para qualquer parte da tabela, como o nosso EditableCell.
    meta: {
      updateData: (docId, columnId, value) => {
        // Função para Escrever/Atualizar Dados
        const docRef = doc(db, 'projetos', docId);
        updateDoc(docRef, { [columnId]: value })
          .then(() => console.log('Documento atualizado com sucesso!'))
          .catch((error) => console.error('Erro ao atualizar documento:', error));
      },
    },
  });

  return (
    <div className="p-4">
      <div className="overflow-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b border-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
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
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-0"> {/* Padding zero para o input preencher */}
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