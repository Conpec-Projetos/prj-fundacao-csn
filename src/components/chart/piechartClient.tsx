// components/piechartClient.tsx
'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useTheme } from '@/context/themeContext';
import { useMemo } from 'react';
import { usePDF } from '@/context/pdfContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  ehCelular?: boolean;
}

export default function PieChart({data, labels, ehCelular, colors = [
  '#e74c3c','#8e44ad','#39c2e0','#2ecc40','#f1c40f',] }
  : PieChartProps) {
  const { darkMode } = useTheme();
  const { isPdfMode } = usePDF();

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };


  const options = useMemo(() => ({
    responsive: true,
    animation: !isPdfMode,
    plugins: {
      legend: {
        position: ehCelular ? 'bottom' as const : 'right' as const,
        labels: {
          color: darkMode ? '#FFFFFF' : '#292944'
        }
      },
      title: {
        display: false,
      },
    },
  }), [darkMode, ehCelular, isPdfMode]);

  return <Pie data={chartData} options={options} />;
}
