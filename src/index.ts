import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { contactRouter } from './routes/contact';
import { subscriberRouter } from './routes/subscriber';
import { appointmentRouter } from './routes/appointment';
import { blogRouter } from './routes/blog';
import { errorHandler } from './middleware/errorHandler';
import { databaseService } from './services/databaseService';
import { emailService } from './services/emailService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
databaseService.connect().catch((error) => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});

// Security middleware
app.use(helmet());

// CORS configuration — allow all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Ensure preflight requests are handled for all routes
app.options('*', cors());

// Rate limiting removed for development

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await databaseService.healthCheck();
  
  res.status(200).json({
    status: 'OK',
    message: 'Bhargava Clinic Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    email: {
      enabled: emailService ? emailService['isEnabled']?.() === true : false,
      user: process.env.EMAIL_USER || null
    }
  });
});

// API routes
app.use('/api/contact', contactRouter);
app.use('/api/appointment', appointmentRouter);
app.use('/api/blog', blogRouter);
app.use('/api/subscriber', subscriberRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bhargava Clinic Backend API running on port ${PORT}`);
  console.log(`📧 Email service configured for: ${process.env.EMAIL_USER}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-derma-clinic'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
