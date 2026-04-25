import Category from '../models/Category.js';

const defaultCategories = [
  { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'laptop' },
  { name: 'Investments', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
  { name: 'Gift', type: 'income', color: '#f59e0b', icon: 'gift' },
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { name: 'Transportation', type: 'expense', color: '#f97316', icon: 'car' },
  { name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Entertainment', type: 'expense', color: '#a855f7', icon: 'film' },
  { name: 'Bills & Utilities', type: 'expense', color: '#3b82f6', icon: 'receipt' },
  { name: 'Healthcare', type: 'expense', color: '#14b8a6', icon: 'heart' },
  { name: 'Education', type: 'expense', color: '#6366f1', icon: 'book' },
  { name: 'Other', type: 'expense', color: '#64748b', icon: 'tag' },
];

export const seedDefaultCategories = async (userId) => {
  const docs = defaultCategories.map((c) => ({ ...c, user: userId }));
  await Category.insertMany(docs, { ordered: false }).catch(() => {});
};
