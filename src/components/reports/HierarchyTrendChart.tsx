import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RatHierarchyData } from '@/hooks/useHierarchyAnalysis';

interface Props {
  rats: any[];
  data7: RatHierarchyData[];
  data30: RatHierarchyData[];
  data90: RatHierarchyData[];
}

const HierarchyTrendChart: React.FC<Props> = ({ rats, data7, data30, data90 }) => {
  const idToName: Record<string, string> = {};
  rats?.forEach((r: any) => {
    if (r?.id) idToName[r.id] = r.nickname || r.name || r.id;
  });

  const allSets = [data7 || [], data30 || [], data90 || []];
  const ratIds = Array.from(
    new Set(
      allSets.flatMap((arr) => arr.map((d) => {
        if (d.rat_id && !idToName[d.rat_id]) idToName[d.rat_id] = d.nickname || d.rat_name || d.rat_id;
        return d.rat_id;
      }))
    )
  );

  const findRank = (arr: RatHierarchyData[], id: string) => arr?.find((d) => d.rat_id === id)?.rank ?? null;

  const chartData = [
    { window: '7天', ...Object.fromEntries(ratIds.map((id) => [id, findRank(data7 || [], id)])) },
    { window: '30天', ...Object.fromEntries(ratIds.map((id) => [id, findRank(data30 || [], id)])) },
    { window: '90天', ...Object.fromEntries(ratIds.map((id) => [id, findRank(data90 || [], id)])) },
  ];

  const dashPatterns = ['', '6 4', '3 3', '8 4', '2 6', '10 4'];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="window" />
          <YAxis allowDecimals={false} reversed minTickGap={1} />
          <Tooltip />
          <Legend />
          {ratIds.map((id, idx) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={idToName[id] || id}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              strokeDasharray={dashPatterns[idx % dashPatterns.length]}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HierarchyTrendChart;
