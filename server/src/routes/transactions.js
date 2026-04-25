import express from 'express';
import { body, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get(
  '/',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['income', 'expense']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
  ],
  async (req, res, next) => {
    try {
      const {
        startDate,
        endDate,
        type,
        category,
        search,
        page = 1,
        limit = 50,
        sortBy = 'date',
        sortOrder = 'desc',
      } = req.query;

      const filter = { user: req.user._id };
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [items, total] = await Promise.all([
        Transaction.find(filter)
          .populate('category', 'name color icon type')
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Transaction.countDocuments(filter),
      ]);

      res.json({
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('category').isMongoId().withMessage('Valid category is required'),
    body('date').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      const tx = await Transaction.create({ ...req.body, user: req.user._id });
      const populated = await Transaction.findById(tx._id).populate(
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
      return res.status(400).json({ message: 'Invalid transaction id' });
    }
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    Object.assign(tx, req.body);
    await tx.save();
    const populated = await Transaction.findById(tx._id).populate(
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
      return res.status(400).json({ message: 'Invalid transaction id' });
    }
    const tx = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.get('/export/csv', async (req, res, next) => {
  try {
    const items = await Transaction.find({ user: req.user._id })
      .populate('category', 'name type')
      .sort({ date: -1 });

    const header = 'Date,Type,Category,Description,Amount,Payment Method,Notes\n';
    const rows = items
      .map((t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        const cat = t.category?.name || '';
        const desc = (t.description || '').replace(/"/g, '""');
        const notes = (t.notes || '').replace(/"/g, '""');
        return `${date},${t.type},"${cat}","${desc}",${t.amount},${t.paymentMethod},"${notes}"`;
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${Date.now()}.csv"`
    );
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
});

export default router;
