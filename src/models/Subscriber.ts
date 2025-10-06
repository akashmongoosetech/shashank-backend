import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  source?: string; // e.g., 'footer', 'landing', 'contact'
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email']
  },
  source: {
    type: String,
    trim: true,
    maxlength: [50, 'Source cannot exceed 50 characters']
  }
}, {
  timestamps: true,
});

SubscriberSchema.index({ email: 1 }, { unique: true });

export const Subscriber = mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);


