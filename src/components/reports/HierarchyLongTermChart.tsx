import React, { useMemo } from 'react';
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

interface HistoryRecord {
  analysis_time: string;
  rat_id: string;
  rat_name: string;
  rank: number;
  dominance_score: number;
}

interface Props {
  rats: any[];
  history: HistoryRecord[];
}

const HierarchyLongTermChart: React.FC<Props> = ({ rats, history }) => {
  const idToName: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    rats?.forEach((r: any) => {
      if (r?.id) map[r.id] = r.name || r.id;
    });
    // ensure names from history even if rat was deleted
    history?.forEach((h) => {
      if (!map[h.rat_id]) map[h.rat_id] = h.rat_name || h.rat_id;
    });
    return map;
  }, [rats, history]);

  const ratIds = useMemo(() => Array.from(new Set(history?.map(h => h.rat_id) || [])), [history]);

  const chartData = useMemo(() => {
    // group by timestamp and build a record per time
    const byTime = new Map<string, any>();
    history?.forEach((h) => {
      const ts = new Date(h.analysis_time).toLocaleString();
      if (!byTime.has(ts)) byTime.set(ts, { time: ts });
      byTime.get(ts)[h.rat_id] = h.rank;
    });
    return Array.from(byTime.entries()).map(([, v]) => v);
  }, [history]);

  const dashPatterns = ['', '6 4', '3 3', '8 4', '2 6', '10 4'];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
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

export default HierarchyLongTermChart;
