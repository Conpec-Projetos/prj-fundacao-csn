"use client";

import { useState, useEffect } from 'react';

export function useEhCelular(): boolean {
  const [ehCelular, setEhCelular] = useState<boolean>(false);

  useEffect(() => {
    // Função que verifica a largura da tela e atualiza o estado
    const lidarRedimensionamento = () => {
      setEhCelular(window.innerWidth < 768); // Usando 768px como um breakpoint comum
    };

    lidarRedimensionamento();

    window.addEventListener("resize", lidarRedimensionamento);

    return () => {
      window.removeEventListener("resize", lidarRedimensionamento);
    };
  }, []);

  return ehCelular;
}