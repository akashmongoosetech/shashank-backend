import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { emailService } from '../services/emailService';
import { Contact, IContact } from '../models/Contact';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Validation rules for contact form
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
];

// Validation rules for contact update
const contactUpdateValidation = [
  body('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'archived'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('assignedTo')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assigned to cannot exceed 100 characters'),
];

// POST /api/contact - Create new contact (public form submission)
router.post('/', contactValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { name, email, subject, message } = req.body;

  // Create contact record
  const contact = new Contact({
    name,
    email,
    subject,
    message,
    status: 'new',
    priority: 'medium'
  });

  await contact.save();

  // Send confirmation email to user
  await emailService.sendContactConfirmation({
    name,
    email,
    subject,
    message,
  });

  // Send admin alert email
  await emailService.sendContactEmail({
    name,
    email,
    subject,
    message,
  });

  console.log(`📧 Contact form submitted by ${name} (${email}) - Subject: ${subject}`);

  return res.status(201).json({
    success: true,
    message: 'Thank you for your message! We will get back to you soon.',
    data: {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      status: contact.status,
      createdAt: contact.createdAt,
    },
  });
}));

// GET /api/contact - Get all contacts with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { subject: { $regex: req.query.search, $options: 'i' } },
      { message: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

// GET /api/contact/:id - Get single contact
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: contact
  });
}));

// PUT /api/contact/:id - Update contact
router.put('/:id', contactUpdateValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }

  // Update fields
  const allowedUpdates = ['status', 'priority', 'tags', 'assignedTo', 'notes'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      (contact as any)[field] = req.body[field];
    }
  });

  await contact.save();

  return res.status(200).json({
    success: true,
    message: 'Contact updated successfully',
    data: contact
  });
}));

// DELETE /api/contact/:id - Delete contact
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Contact deleted successfully'
  });
}));

// GET /api/contact/stats/summary - Get contact statistics
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
        replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
        archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  };

  return res.status(200).json({
    success: true,
    data: result
  });
}));

export { router as contactRouter };
