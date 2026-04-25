import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month != null ? Number(req.query.month) : now.getMonth();
    const year = req.query.year != null ? Number(req.query.year) : now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year }).populate(
      'category',
      'name color icon type'
    );

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const spent = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const spentMap = Object.fromEntries(spent.map((s) => [String(s._id), s.total]));

    const enriched = budgets.map((b) => ({
      ...b.toObject(),
      spent: spentMap[String(b.category._id)] || 0,
      remaining: Math.max(0, b.amount - (spentMap[String(b.category._id)] || 0)),
      percentage: Math.min(
        100,
        Math.round(((spentMap[String(b.category._id)] || 0) / b.amount) * 100)
      ),
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('category').isMongoId(),
    body('amount').isFloat({ gt: 0 }),
    body('month').isInt({ min: 0, max: 11 }),
    body('year').isInt({ min: 2000 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      const existing = await Budget.findOne({
        user: req.user._id,
        category: req.body.category,
        month: req.body.month,
        year: req.body.year,
      });
      if (existing) {
        existing.amount = req.body.amount;
        await existing.save();
        const populated = await Budget.findById(existing._id).populate(
          'category',
          'name color icon type'
        );
        return res.json(populated);
      }
      const b = await Budget.create({ ...req.body, user: req.user._id });
      const populated = await Budget.findById(b._id).populate(
        'category',
        'name color icon type'
      );
      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid budget id' });
    }
    const b = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!b) return res.status(404).json({ message: 'Budget not found' });
    if (req.body.amount) b.amount = req.body.amount;
    await b.save();
    const populated = await Budget.findById(b._id).populate(
      'category',
      'name color icon type'
    );
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid budget id' });
    }
    const b = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!b) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
