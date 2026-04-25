import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/summary', async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month != null ? Number(req.query.month) : now.getMonth();
    const year = req.query.year != null ? Number(req.query.year) : now.getFullYear();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [allTime, monthly, recent, byCategory, byPayment] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.find({ user: userId })
        .populate('category', 'name color icon type')
        .sort({ date: -1 })
        .limit(5),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            _id: 1,
            total: 1,
            name: '$category.name',
            color: '$category.color',
            icon: '$category.icon',
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } },
      ]),
    ]);

    const sumByType = (arr) => {
      const r = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
      arr.forEach((a) => {
        if (a._id === 'income') {
          r.income = a.total;
          r.incomeCount = a.count;
        } else if (a._id === 'expense') {
          r.expense = a.total;
          r.expenseCount = a.count;
        }
      });
      return r;
    };

    const allTimeStats = sumByType(allTime);
    const monthStats = sumByType(monthly);

    res.json({
      allTime: {
        income: allTimeStats.income,
        expense: allTimeStats.expense,
        balance: allTimeStats.income - allTimeStats.expense,
        transactionCount: allTimeStats.incomeCount + allTimeStats.expenseCount,
      },
      currentMonth: {
        income: monthStats.income,
        expense: monthStats.expense,
        balance: monthStats.income - monthStats.expense,
        transactionCount: monthStats.incomeCount + monthStats.expenseCount,
        savingsRate:
          monthStats.income > 0
            ? Math.round(
                ((monthStats.income - monthStats.expense) / monthStats.income) * 100
              )
            : 0,
      },
      recent,
      byCategory,
      byPayment,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/monthly-trend', async (req, res, next) => {
  try {
    const months = Number(req.query.months || 6);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const byMonth = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = {
        month: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        income: 0,
        expense: 0,
        balance: 0,
      };
    }

    data.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, '0')}`;
      if (byMonth[key]) {
        byMonth[key][d._id.type] = d.total;
      }
    });

    Object.values(byMonth).forEach((m) => {
      m.balance = m.income - m.expense;
    });

    res.json(Object.values(byMonth));
  } catch (err) {
    next(err);
  }
});

router.get('/daily-trend', async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const data = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const byDay = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      byDay[key] = {
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: 0,
        expense: 0,
      };
    }

    data.forEach((d) => {
      const key = `${d._id.year}-${d._id.month}-${d._id.day}`;
      if (byDay[key]) byDay[key][d._id.type] = d.total;
    });

    res.json(Object.values(byDay));
  } catch (err) {
    next(err);
  }
});

export default router;
