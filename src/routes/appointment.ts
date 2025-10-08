import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { emailService } from '../services/emailService.js';
import { Appointment, IAppointment } from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Treatment types for validation
const validTreatmentTypes = [
  'Acne Treatment',
  'Anti-Aging Treatment',
  'Chemical Peels',
  'Pigmentation Treatment',
  'Hair Transplant',
  'PRP Hair Therapy',
  'Hair Loss Treatment',
  'Scalp Treatment',
  'Laser Hair Removal',
  'Laser Skin Resurfacing',
  'Laser Tattoo Removal',
  'Laser Pigmentation Removal',
  'General Consultation',
];

// Time slots for validation
const validTimeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
];

// Validation rules for appointment booking
const appointmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Please provide a valid phone number'),
  body('treatmentType')
    .isIn(validTreatmentTypes)
    .withMessage('Please select a valid treatment type'),
  body('preferredDate')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  body('preferredTime')
    .isIn(validTimeSlots)
    .withMessage('Please select a valid time slot'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
];

// Validation rules for appointment update
const appointmentUpdateValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('confirmedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid confirmed date'),
  body('confirmedTime')
    .optional()
    .isIn(validTimeSlots)
    .withMessage('Invalid confirmed time'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('assignedTo')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assigned to cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('cancelledReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters'),
];

// POST /api/appointment - Create new appointment (public booking)
router.post('/', appointmentValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { name, email, phone, treatmentType, preferredDate, preferredTime, message } = req.body;

  // Create appointment record
  const appointment = new Appointment({
    name,
    email,
    phone,
    treatmentType,
    preferredDate: new Date(preferredDate),
    preferredTime,
    message,
    status: 'pending',
    priority: 'medium'
  });

  await appointment.save();

  // Send confirmation email to user (non-blocking)
  try {
    await emailService.sendAppointmentRequestConfirmation({
      name,
      email,
      phone,
      treatmentType,
      preferredDate,
      preferredTime,
      message,
    });
  } catch (emailError) {
    console.warn('⚠️ Failed to send appointment confirmation email:', emailError);
  }

  // Send admin alert email (non-blocking)
  try {
    await emailService.sendAppointmentEmail({
      name,
      email,
      phone,
      treatmentType,
      preferredDate,
      preferredTime,
      message,
    });
  } catch (emailError) {
    console.warn('⚠️ Failed to send appointment admin alert email:', emailError);
  }

  console.log(`📅 Appointment booked by ${name} (${email}) - ${treatmentType} on ${preferredDate} at ${preferredTime}`);

  return res.status(201).json({
    success: true,
    message: 'Appointment request submitted successfully! We will contact you within 24 hours to confirm.',
    data: {
      id: appointment._id,
      referenceId: appointment.referenceId,
      name: appointment.name,
      email: appointment.email,
      treatmentType: appointment.treatmentType,
      preferredDate: appointment.preferredDate,
      preferredTime: appointment.preferredTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
    },
  });
}));

// GET /api/appointment - Get all appointments with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('treatmentType').optional().isIn(validTreatmentTypes).withMessage('Invalid treatment type'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
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
  if (req.query.treatmentType) filter.treatmentType = req.query.treatmentType;
  
  // Date range filter
  if (req.query.dateFrom || req.query.dateTo) {
    filter.preferredDate = {};
    if (req.query.dateFrom) filter.preferredDate.$gte = new Date(req.query.dateFrom as string);
    if (req.query.dateTo) filter.preferredDate.$lte = new Date(req.query.dateTo as string);
  }
  
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
      { treatmentType: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const appointments = await Appointment.find(filter)
    .sort({ preferredDate: 1, preferredTime: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Appointment.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      appointments,
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

// GET /api/appointment/treatments - Get available treatment types
router.get('/treatments', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      treatments: validTreatmentTypes,
      timeSlots: validTimeSlots,
    },
  });
});

// GET /api/appointment/stats/summary - Get appointment statistics
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const stats = await Appointment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        noShow: { $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    noShow: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  };

  return res.status(200).json({
    success: true,
    data: result
  });
}));

// GET /api/appointment/:id - Get single appointment
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: appointment
  });
}));

// PUT /api/appointment/:id - Update appointment
router.put('/:id', appointmentUpdateValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Update fields
  const allowedUpdates = [
    'status', 'priority', 'confirmedDate', 'confirmedTime', 'duration',
    'notes', 'assignedTo', 'tags', 'cancelledReason'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      (appointment as any)[field] = req.body[field];
    }
  });

  await appointment.save();

  return res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: appointment
  });
}));

// DELETE /api/appointment/:id - Delete appointment
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully'
  });
}));

// POST /api/appointment/:id/confirm - Confirm an appointment
router.post('/:id/confirm', [
  body('confirmedDate').optional().isISO8601().withMessage('Invalid confirmed date'),
  body('confirmedTime').optional().isIn(validTimeSlots).withMessage('Invalid confirmed time'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Update appointment status and confirmation details
  appointment.status = 'confirmed';
  if (req.body.confirmedDate) appointment.confirmedDate = new Date(req.body.confirmedDate);
  if (req.body.confirmedTime) appointment.confirmedTime = req.body.confirmedTime;
  if (req.body.notes) appointment.notes = req.body.notes;

  await appointment.save();

  // Send confirmation email to patient
  await emailService.sendAppointmentConfirmation({
    name: appointment.name,
    email: appointment.email,
    treatmentType: appointment.treatmentType,
    appointmentDate: appointment.confirmedDate?.toISOString() || appointment.preferredDate.toISOString(),
    appointmentTime: appointment.confirmedTime || appointment.preferredTime,
  });

  console.log(`✅ Appointment confirmed for ${appointment.name} (${appointment.email}) - ${appointment.treatmentType}`);

  return res.status(200).json({
    success: true,
    message: 'Appointment confirmed and confirmation email sent to patient.',
    data: appointment
  });
}));

export { router as appointmentRouter };
