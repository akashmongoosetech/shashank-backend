import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML content
  image?: string;
  author?: string;
  category?: string;
  readTime?: string;
  tags: string[];
  sections?: Array<{ title?: string; content: string; image?: string }>;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaDescription?: string;
  seoKeywords?: string[];
  metaTags?: string[];
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 400 },
  content: { type: String, required: true },
  image: { type: String, trim: true },
  author: { type: String, trim: true, default: 'Clinic Team' },
  category: { type: String, trim: true },
  readTime: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  sections: [{
    title: { type: String, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    image: { type: String, trim: true },
  }],
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  publishedAt: { type: Date },
  metaDescription: { type: String, trim: true, maxlength: 160 },
  seoKeywords: [{ type: String, trim: true }],
  metaTags: [{ type: String, trim: true }],
}, {
  timestamps: true,
});

BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

BlogSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.get('status') === 'published' && !this.get('publishedAt')) {
      this.set('publishedAt', new Date());
    }
    if (this.get('status') === 'draft') {
      this.set('publishedAt', undefined);
    }
  }
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);


