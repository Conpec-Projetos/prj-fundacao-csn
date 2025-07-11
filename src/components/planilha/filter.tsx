"use client";

import React, { useState, useEffect } from 'react';
import { Column, RowData } from '@tanstack/react-table';


export function Filter<TData extends RowData>({
  column,
}: {
  column: Column<TData, unknown>;
}) {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      column.setFilterValue(value);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, column]);

  return (
    <div className="mt-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Filtrar..."
        className="w-full text-sm border-gray-300 dark:border-blue-fcsn2 rounded-md shadow-sm p-1 bg-white dark:bg-blue-fcsn3 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}