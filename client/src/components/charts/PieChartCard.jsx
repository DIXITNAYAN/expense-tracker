import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/format.js';

export default function PieChartCard({ data, currency }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No expense data for this period</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.name,
    value: d.total,
    color: d.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={{
            backgroundColor: 'rgb(15 23 42)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
