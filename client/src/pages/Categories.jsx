import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#6366f1' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category added');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', type: 'expense', color: '#6366f1' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, color: c.color });
    setShowForm(true);
  };

  const income = items.filter((c) => c.type === 'income');
  const expense = items.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: '', type: 'expense', color: '#6366f1' });
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Income Categories', list: income, color: 'text-emerald-600' },
            { title: 'Expense Categories', list: expense, color: 'text-red-600' },
          ].map((section) => (
            <div key={section.title} className="card p-6">
              <h3 className={`font-bold text-lg mb-4 ${section.color}`}>
                {section.title}{' '}
                <span className="text-slate-400 font-normal text-sm">
                  ({section.list.length})
                </span>
              </h3>
              {section.list.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">
                  No categories yet
                </p>
              ) : (
                <div className="space-y-2">
                  {section.list.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="flex-1 font-medium">{c.name}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
          <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Category' : 'New Category'}
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
              {!editing && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`py-2.5 rounded-lg font-semibold text-sm transition capitalize ${
                        form.type === t
                          ? t === 'expense'
                            ? 'bg-red-500 text-white shadow'
                            : 'bg-emerald-500 text-white shadow'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="label">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Groceries"
                />
              </div>

              <div>
                <label className="label">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`aspect-square rounded-lg transition ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${
                        form.color === c ? 'ring-slate-900 dark:ring-white' : 'ring-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
