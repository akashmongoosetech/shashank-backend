import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { Subscriber } from '../models/Subscriber.js';

const router = Router();

const subscribeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source cannot exceed 50 characters')
];

const getSubscribersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
];

// GET /api/subscriber - Get all subscribers with pagination
router.get('/', getSubscribersValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  let query: any = {};
  if (search) {
    query.email = { $regex: search, $options: 'i' };
  }

  const totalItems = await Subscriber.countDocuments(query);
  const subscribers = await Subscriber.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json({
    success: true,
    message: 'Subscribers retrieved successfully',
    data: {
      subscribers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// POST /api/subscriber - Create a new subscriber
router.post('/', subscribeValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { email, source } = req.body as { email: string; source?: string };

  // Upsert: avoid duplicate errors, return existing
  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return res.status(200).json({ success: true, message: 'You are already subscribed.' });
  }

  const subscriber = new Subscriber({ email, source });
  await subscriber.save();

  // Fire-and-forget confirmation email; do not fail subscription on email error
  emailService
    .sendSubscriptionConfirmation(email)
    .catch((err) => console.warn('⚠️ Failed to send subscription confirmation:', err));

  return res.status(201).json({ success: true, message: 'Subscribed successfully.' });
}));

export { router as subscriberRouter };


