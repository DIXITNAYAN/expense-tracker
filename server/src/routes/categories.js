import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type) filter.type = req.query.type;
    const cats = await Category.find(filter).sort({ type: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['income', 'expense']),
    body('color').optional().matches(/^#([0-9A-Fa-f]{6})$/),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      const cat = await Category.create({ ...req.body, user: req.user._id });
      res.status(201).json(cat);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const cat = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const { name, color, icon } = req.body;
    if (name) cat.name = name;
    if (color) cat.color = color;
    if (icon) cat.icon = icon;
    await cat.save();
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const used = await Transaction.exists({ category: req.params.id, user: req.user._id });
    if (used) {
      return res
        .status(400)
        .json({ message: 'Cannot delete category that has transactions' });
    }
    const cat = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
