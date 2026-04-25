import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/format.js';
import toast from 'react-hot-toast';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Budgets() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets?month=${month}&year=${year}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get('/categories?type=expense')
      .then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    load();
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        category: form.category,
        amount: Number(form.amount),
        month,
        year,
      });
      toast.success('Budget saved');
      setShowForm(false);
      setEditing(null);
      setForm({ category: '', amount: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const handleEdit = (b) => {
    setEditing(b);
    setForm({ category: b.category._id, amount: b.amount });
    setShowForm(true);
  };

  const totalBudget = items.reduce((s, b) => s + b.amount, 0);
  const totalSpent = items.reduce((s, b) => s + b.spent, 0);
  const overall = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-slate-500 mt-1">
            Set spending limits and track them in real-time
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ category: '', amount: '' });
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Set Budget
        </button>
      </div>

      <div className="card p-5 flex flex-wrap items-center gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="input max-w-[180px]"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input max-w-[120px]"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {items.length > 0 && (
          <div className="flex-1 min-w-[260px] sm:ml-auto">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500">Overall</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(totalSpent, currency)} /{' '}
                {formatCurrency(totalBudget, currency)}
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  overall >= 100
                    ? 'bg-red-500'
                    : overall >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overall)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-slate-500 mb-4">No budgets set for this period</p>
          <button
            onClick={() => {
              setEditing(null);
              setForm({ category: '', amount: '' });
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => {
            const pct = b.percentage;
            const overspent = pct >= 100;
            const warning = pct >= 80 && !overspent;
            return (
              <div key={b._id} className="card p-5 group hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: b.category.color }}
                    >
                      {b.category.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{b.category.name}</p>
                      <p className="text-xs text-slate-500">{pct}% used</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Spent</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(b.spent, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Budget</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(b.amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        overspent
                          ? 'bg-red-500'
                          : warning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${
                      overspent
                        ? 'text-red-600'
                        : warning
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {overspent ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Over by {formatCurrency(b.spent - b.amount, currency)}
                      </>
                    ) : warning ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formatCurrency(b.remaining, currency)} left
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {formatCurrency(b.remaining, currency)} remaining
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
          <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Budget' : 'Set Budget'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="btn-ghost !p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                  disabled={!!editing}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Monthly Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input text-2xl font-bold"
                  placeholder="0.00"
                />
              </div>
              <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                Setting budget for{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {MONTHS[month]} {year}
                </strong>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
