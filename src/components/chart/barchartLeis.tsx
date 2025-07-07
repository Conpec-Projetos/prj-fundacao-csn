// components/barchart.tsx
import dynamic from 'next/dynamic';

const BarChartLeisClient = dynamic(() => import('./barchartLeisClient'), { ssr: false });

interface BarChartProps {
  title: string;
  data: number[];
  labels: string[];
  siglas: string[];
  colors?: string[];
  useIcons?: boolean;
  horizontal?: boolean;
}

export default function BarChartLeis(props: BarChartProps) {
  return <BarChartLeisClient {...props} />;
}
