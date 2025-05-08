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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
}

export default function PieChart({data, labels, colors = [
  '#e74c3c','#8e44ad','#39c2e0','#2ecc40','#f1c40f',] }
  : PieChartProps) {
  const { darkMode } = useTheme();
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
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: darkMode ? '#FFFFFF' : '#292944'
        }
      },
      title: {
        display: true,
      },
    },
  }), [darkMode]);

  return <Pie data={chartData} options={options} />;
}
