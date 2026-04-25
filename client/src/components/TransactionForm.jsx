import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { formatDateInput } from '../utils/format.js';

export default function TransactionForm({ open, onClose, onSaved, editing }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: formatDateInput(new Date()),
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      api.get('/categories').then(({ data }) => setCategories(data));
      if (editing) {
        setForm({
          type: editing.type,
          amount: editing.amount,
          category: editing.category?._id || editing.category,
          description: editing.description || '',
          date: formatDateInput(editing.date),
          paymentMethod: editing.paymentMethod || 'cash',
          notes: editing.notes || '',
        });
      } else {
        setForm({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: formatDateInput(new Date()),
          paymentMethod: 'cash',
          notes: '',
        });
      }
    }
  }, [open, editing]);

  const filteredCats = categories.filter((c) => c.type === form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error('Please select a category');
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/transactions/${editing._id}`, form);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction added');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
      <div className="card w-full sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-b-none sm:rounded-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold">
            {editing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="btn-ghost !p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
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

          <div>
            <label className="label">Amount</label>
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

          <div>
            <label className="label">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              <option value="">Select category</option>
              {filteredCats.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Payment</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="input"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="e.g. Lunch with friends"
            />
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input"
              placeholder="Additional details"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
