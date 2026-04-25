import { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatRelative } from '../utils/format.js';
import StatCard from '../components/StatCard.jsx';
import PieChartCard from '../components/charts/PieChartCard.jsx';
import BarChartCard from '../components/charts/BarChartCard.jsx';
import LineChartCard from '../components/charts/LineChartCard.jsx';
import TransactionForm from '../components/TransactionForm.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, m, d] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/monthly-trend?months=6'),
        api.get('/dashboard/daily-trend?days=30'),
      ]);
      setSummary(s.data);
      setMonthly(m.data);
      setDaily(d.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currency = user?.currency || 'USD';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={summary.allTime.balance}
          icon={Wallet}
          color="bg-gradient-to-br from-primary-500 to-primary-700"
          currency={currency}
          subtitle={`${summary.allTime.transactionCount} total transactions`}
        />
        <StatCard
          title="This Month Income"
          amount={summary.currentMonth.income}
          icon={TrendingUp}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
          currency={currency}
        />
        <StatCard
          title="This Month Expense"
          amount={summary.currentMonth.expense}
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-red-700"
          currency={currency}
        />
        <StatCard
          title="Savings Rate"
          amount={summary.currentMonth.balance}
          icon={PiggyBank}
          color="bg-gradient-to-br from-amber-500 to-amber-700"
          currency={currency}
          subtitle={`${summary.currentMonth.savingsRate}% saved this month`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Income vs Expense</h3>
              <p className="text-sm text-slate-500">Last 6 months</p>
            </div>
          </div>
          <BarChartCard data={monthly} currency={currency} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Spending by Category</h3>
              <p className="text-sm text-slate-500">This month</p>
            </div>
          </div>
          <PieChartCard data={summary.byCategory} currency={currency} />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Daily Activity</h3>
            <p className="text-sm text-slate-500">Last 30 days</p>
          </div>
        </div>
        <LineChartCard data={daily} currency={currency} />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Recent Transactions</h3>
            <p className="text-sm text-slate-500">Your last 5 entries</p>
          </div>
          <Link
            to="/transactions"
            className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {summary.recent.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="mb-4">No transactions yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add your first transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {summary.recent.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: t.category?.color || '#6366f1' }}
                >
                  {t.category?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {t.description || t.category?.name || 'Transaction'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.category?.name} • {formatRelative(t.date)}
                  </p>
                </div>
                <div
                  className={`font-bold tabular-nums ${
                    t.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatCurrency(t.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={load}
      />
    </div>
  );
}
