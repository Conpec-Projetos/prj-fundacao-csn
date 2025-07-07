'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PDFContextType {
  isPdfMode: boolean;
  setIsPdfMode: (isPdfMode: boolean) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider = ({ children }: { children: ReactNode }) => {
  const [isPdfMode, setIsPdfMode] = useState(false);

  return (
    <PDFContext.Provider value={{ isPdfMode, setIsPdfMode }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
};