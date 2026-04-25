import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/format.js';

export default function BarChartCard({ data, currency }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'rgb(100 116 139)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'rgb(100 116 139)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => formatCurrency(v, currency)}
          contentStyle={{
            backgroundColor: 'rgb(15 23 42)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
          }}
          cursor={{ fill: 'rgba(148,163,184,0.1)' }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
        />
        <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}
