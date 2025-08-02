import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatHierarchyData } from '@/hooks/useHierarchyAnalysis';

interface RankChartProps {
  data: RatHierarchyData[];
  rats: any[];
}

const RankChart = ({ data, rats }: RankChartProps) => {
  const { t } = useTranslation();

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRatProfile = (ratId: string) => {
    return rats.find(rat => rat.id === ratId);
  };

  // Guard against empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        {t('No data available')}
      </div>
    );
  }

  const chartData = data.map(rat => {
    const profile = getRatProfile(rat.rat_id);
    return {
      ...rat,
      displayName: `${getRankEmoji(rat.rank)} ${rat.rat_name}${rat.nickname ? ` (${rat.nickname})` : ''}`,
      profilePicture: profile?.profile_picture
    };
  });

  const CustomLabel = (props: any) => {
    const { x, y, width, value, payload } = props;
    
    // Guard against undefined payload
    if (!payload || !payload.rat_id) {
      return null;
    }
    
    const profile = getRatProfile(payload.rat_id);
    
    return (
      <g>
        {/* Avatar */}
        <foreignObject x={x + width/2 - 15} y={y - 45} width={30} height={30}>
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.profile_picture} alt={payload.rat_name || ''} />
            <AvatarFallback className="text-xs">
              {payload.rat_name ? payload.rat_name.charAt(0) : '?'}
            </AvatarFallback>
          </Avatar>
        </foreignObject>
        
        {/* Rank */}
        <text 
          x={x + width/2 - 25} 
          y={y - 25} 
          textAnchor="middle" 
          className="fill-foreground text-sm font-bold"
        >
          {getRankEmoji(payload.rank || 0)}
        </text>
        
        {/* Name and nickname */}
        <text 
          x={x + width/2} 
          y={y - 8} 
          textAnchor="middle" 
          className="fill-foreground text-xs"
        >
          {payload.rat_name || 'Unknown'}
        </text>
        {payload.nickname && (
          <text 
            x={x + width/2} 
            y={y + 5} 
            textAnchor="middle" 
            className="fill-muted-foreground text-xs italic"
          >
            ({payload.nickname})
          </text>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 60, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="displayName" 
          tick={false}
          axisLine={false}
        />
        <YAxis 
          domain={[1, data.length]} 
          tickFormatter={(value) => `#${value}`}
          label={{ value: t('Rank'), angle: -90, position: 'insideLeft' }}
          reversed
        />
        <Tooltip 
          formatter={(value, name, props) => [
            `#${value}`,
            t('Rank')
          ]}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              const data = payload[0].payload;
              return `${data.rat_name}${data.nickname ? ` (${data.nickname})` : ''}`;
            }
            return label;
          }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="rank" 
          fill="hsl(var(--primary))"
          name={t('Rank')}
          label={<CustomLabel />}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                entry.rank === 1 ? '#FFD700' : // Gold
                entry.rank === 2 ? '#C0C0C0' : // Silver  
                entry.rank === 3 ? '#CD7F32' : // Bronze
                'hsl(var(--primary))'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RankChart;