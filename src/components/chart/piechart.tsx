// components/PieChart.tsx
import dynamic from 'next/dynamic';

const PieChartClient = dynamic(() => import('./piechartClient'), { ssr: false });

interface PieChartProps {
  title: string;
  data: number[];
  labels: string[];
  colors?: string[];
}

export default function PieChart(props: PieChartProps) {
  return (
    <div className="h-full w-full">
      <PieChartClient {...props} />
    </div>
  );
}
