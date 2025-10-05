import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  name: string;
  email: string;
  phone: string;
  treatmentType: string;
  preferredDate: Date;
  preferredTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  priority: 'low' | 'medium' | 'high';
  confirmedDate?: Date;
  confirmedTime?: string;
  actualDate?: Date;
  actualTime?: string;
  duration: number; // in minutes
  notes?: string;
  assignedTo?: string;
  tags: string[];
  reminderSent: boolean;
  reminderSentAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  referenceId?: string;
}

const AppointmentSchema = new Schema<IAppointment>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  treatmentType: {
    type: String,
    required: [true, 'Treatment type is required'],
    enum: [
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
      'General Consultation'
    ]
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
    validate: {
      validator: function(value: Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: 'Preferred date cannot be in the past'
    }
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
    enum: [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM'
    ]
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  confirmedDate: {
    type: Date
  },
  confirmedTime: {
    type: String
  },
  actualDate: {
    type: Date
  },
  actualTime: {
    type: String
  },
  duration: {
    type: Number,
    default: 60, // Default 60 minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  assignedTo: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
AppointmentSchema.index({ email: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ preferredDate: 1 });
AppointmentSchema.index({ confirmedDate: 1 });
AppointmentSchema.index({ treatmentType: 1 });
AppointmentSchema.index({ createdAt: -1 });
AppointmentSchema.index({ name: 'text', email: 'text', treatmentType: 'text' });

// Virtual for formatted date
AppointmentSchema.virtual('formattedPreferredDate').get(function() {
  return this.preferredDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

AppointmentSchema.virtual('formattedConfirmedDate').get(function() {
  if (!this.confirmedDate) return null;
  return this.confirmedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for appointment reference
AppointmentSchema.virtual('referenceId').get(function(this: IAppointment) {
  return `APT-${(this._id as any).toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware
AppointmentSchema.pre('save', function(next) {
  // Auto-set confirmedDate when status changes to 'confirmed'
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedDate) {
    this.confirmedDate = this.preferredDate;
    this.confirmedTime = this.preferredTime;
  }
  
  // Auto-set cancelledAt when status changes to 'cancelled'
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  // Auto-set actualDate when status changes to 'completed'
  if (this.isModified('status') && this.status === 'completed' && !this.actualDate) {
    this.actualDate = this.confirmedDate || this.preferredDate;
    this.actualTime = this.confirmedTime || this.preferredTime;
  }
  
  next();
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
