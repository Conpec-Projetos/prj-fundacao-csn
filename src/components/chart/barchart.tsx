// components/barchart.tsx
import dynamic from 'next/dynamic';

const BarChartClient = dynamic(() => import('./barchartClient'), { ssr: false });

interface BarChartProps {
  title: string;
  data: number[];
  labels: string[];
  colors?: string[];
  useIcons?: boolean;
  horizontal?: boolean;
}

export default function BarChart(props: BarChartProps) {
  return <BarChartClient {...props} />;
}
