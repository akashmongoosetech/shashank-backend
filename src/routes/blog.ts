import { Router, Request, Response } from 'express';
import { body, validationResult, query, param } from 'express-validator';
import { Blog } from '../models/Blog.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = Router();

const createValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('slug').trim().isLength({ min: 3, max: 200 }).matches(/^[a-z0-9-]+$/),
  body('excerpt').trim().isLength({ min: 10, max: 400 }),
  body('content').isString().isLength({ min: 10 }),
  body('image').optional().isURL(),
  body('author').optional().trim().isLength({ max: 100 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('readTime').optional().trim().isLength({ max: 50 }),
  body('tags').optional().isArray(),
  body('sections').optional().isArray(),
  body('sections.*.title').optional().trim().isLength({ max: 200 }),
  body('sections.*.content').optional().isString().isLength({ min: 3 }),
  body('sections.*.image').optional().isURL(),
  body('status').optional().isIn(['draft', 'published']),
  body('metaDescription').optional().trim().isLength({ max: 160 }),
  body('seoKeywords').optional().isArray(),
  body('metaTags').optional().isArray(),
];

// POST /api/blog - create
router.post('/', createValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const exists = await Blog.findOne({ slug: req.body.slug });
  if (exists) throw createError('Slug already exists', 400);

  const blog = await Blog.create(req.body);
  return res.status(201).json({ success: true, message: 'Blog created', data: blog });
}));

// GET /api/blog - list with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'published']),
  query('search').optional().trim().isLength({ max: 100 }),
  query('category').optional().trim().isLength({ max: 100 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '10');
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search as string };

  const blogs = await Blog.find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    }
  });
}));

// GET /api/blog/:slug - get by slug
router.get('/:slug', [ param('slug').trim().isLength({ min: 3 }) ], asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
  return res.status(200).json({ success: true, data: blog });
}));

// PUT /api/blog/:id - update
router.put('/:id', createValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
  return res.status(200).json({ success: true, message: 'Blog updated', data: blog });
}));

// DELETE /api/blog/:id - delete
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
  return res.status(200).json({ success: true, message: 'Blog deleted' });
}));

export { router as blogRouter };


