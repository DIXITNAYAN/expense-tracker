import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency } from '../utils/format.js';

export default function StatCard({ title, amount, icon: Icon, color, currency, trend, subtitle }) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend != null && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend >= 0
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}
          >
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold tracking-tight">
        {formatCurrency(amount, currency)}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
