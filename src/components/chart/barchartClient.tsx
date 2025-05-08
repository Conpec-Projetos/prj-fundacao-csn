'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart,
  ChartOptions,
} from 'chart.js';


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
  title: string;
  data: number[];
  labels: string[];
  colors?: string[];
  useIcons?: boolean;
  horizontal?: boolean;
}

export default function BarChart({
  title,
  data,
  labels,
  colors = ['pink-fcsn'],
  useIcons = false,
  horizontal = false,
}: BarChartProps) {
  const chartRef = useRef<any>(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const iconsRef = useRef<HTMLImageElement[]>([]);

  // Load ODS icons
    useEffect(() => {
      const loadIcons = async () => {
        const icons: HTMLImageElement[] = [];
  
        for (let i = 1; i <= 17; i++) {
          const img = new Image();
          img.src = `/ods/ods${i}.png`;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          icons.push(img);
        }
  
        iconsRef.current = icons;
        setIconsLoaded(true);
      };
  
      loadIcons();
    }, []);

    const iconPlugin = {
      id: 'iconLabels',
      afterDatasetsDraw: (chart: any) => {
        const { ctx, scales } = chart;
        const xAxis = scales.x;
        const yAxis = scales.y;
  
        if (!xAxis || !yAxis || !iconsRef.current.length) return;
  
        chart.data.labels.forEach((_: any, index: number) => {
          const icon = iconsRef.current[index];
          if (!icon) return;
          //alinhar os ODS
          const x = xAxis.getPixelForValue(index);
          const y = yAxis.bottom + 10;
        
          // Draw the icon centered under the bar
          ctx.drawImage(icon, x - 30, y, 60, 60);
        });
      }
    };
  
  const chartData = {
    labels: useIcons ? labels.map(() => '') : labels,
    datasets: [
      {
        data,
        backgroundColor: useIcons
          ? [
            '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2', 
            '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
            '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
          ]
          : generateGradientColors(data, colors[0]),
        borderWidth: 1,
        borderRadius: 8,

      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: horizontal ? 'y' : 'x', // Define a direção do gráfico ( se ele for horizontal ou)
    maintainAspectRatio: false, // isso precisa para que ele se ajuste ao tamanho do contêiner 
    layout: {
      padding: {
        bottom: useIcons ? 80 : 0, // Add space for icons if enabled
      }
    },
    plugins: {
      legend: {
        display: false, //nunca mostra a legenda
      },
      title: {
        display: false,   //nunca mostra o título
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: !useIcons },
      },
      y: {
        grid: { display: false },
        ticks: { display: true },
      },
    },
    animation: {},
  };

  return (
    <div className="relative w-full h-full">
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={useIcons ? [iconPlugin] : []}
      />
    </div>
  );
}
