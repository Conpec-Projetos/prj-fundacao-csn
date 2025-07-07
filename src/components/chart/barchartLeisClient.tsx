'use client';

import { useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions
} from 'chart.js';
import { useTheme } from '@/context/themeContext';
import { usePDF } from '@/context/pdfContext';

// Gradiente com base na quantidade de projetos
export function generateGradientColors(data: number[], baseColor: string = '#b37b97'): string[] {
  const max = Math.max(...data);
  const min = Math.min(...data);

  return data.map(value => {
    const ratio = (value - min) / (max - min || 1);
    const lightness = 90 - ratio * 50;
    return hslFromHex(baseColor, lightness);
  });
}

export function hslFromHex(hex: string, lightness: number): string {
  hex = hex.replace('#', '');

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / delta) % 6; break;
      case gNorm: h = (bNorm - rNorm) / delta + 2; break;
      case bNorm: h = (rNorm - gNorm) / delta + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return `hsl(${h}, ${Math.round(s * 100)}%, ${lightness}%)`;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: number[];
  labels: string[];
  siglas: string[]
  colors?: string[];
  horizontal?: boolean;
  celular?: boolean;
}

export default function BarChart({
  data,
  labels,
  siglas,
  colors = ['pink-fcsn'],
  horizontal = false,
  celular = false,
}: BarChartProps) {
  const { darkMode } = useTheme(); 
  const { isPdfMode } = usePDF();

  const chartRef = useRef<ChartJS<'bar', number[], string> | null>(null);

  const options:ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    indexAxis: horizontal ? 'y' : 'x',
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 0,
        left: horizontal ? (celular ? 60 : 0) : 0,
        right: 25,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor:'#FFFFFF',
        bodyColor:'#FFFFFF',
        callbacks: {
            title: function(context: TooltipItem<'bar'>[]) {
                const dataIndex = context[0].dataIndex;
                return labels[dataIndex];
            },
            label: function(context: TooltipItem<'bar'>) {
                const dataIndex = context.dataIndex;
                return String(data[dataIndex]);
            },
}
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: true,
          color: darkMode ? '#FFFFFF' : '#292944',
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          display: true,
          color: darkMode ? '#FFFFFF' : '#292944',
        },
      },
    },
    animation: isPdfMode ? false : undefined,
  }), [darkMode, horizontal, celular, labels, data, isPdfMode]);

  const chartData = {
    labels: siglas,
    datasets: [
      {
        data,
        backgroundColor: generateGradientColors(data, colors[0]),
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className={`relative w-full ${celular ? 'h-[800px]' : 'h-[600px]'}`}>
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
}