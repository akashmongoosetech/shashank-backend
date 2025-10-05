# Bhargava Clinic Backend API

A Node.js backend API for the Bhargava Clinic Clinic website, handling contact forms and appointment bookings with email notifications.

## Features

- **Contact Form API**: Handles contact form submissions with email notifications
- **Appointment Booking API**: Manages appointment requests with email confirmations
- **Email Service**: Professional HTML email templates using Nodemailer
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against spam and abuse
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Robust error handling and logging
- **TypeScript**: Full TypeScript support for type safety

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Nodemailer** for email services
- **express-validator** for input validation
- **express-rate-limit** for rate limiting
- **CORS** for cross-origin requests
- **Helmet** for security headers

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Clinic Information
CLINIC_NAME=Bhargava Clinic Clinic
CLINIC_EMAIL=info@doctorderma.com
CLINIC_PHONE=+1 (555) 123-4567
CLINIC_ADDRESS=123 Medical Plaza, Health District, City 12345

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Email Configuration (Gmail)

To use Gmail SMTP, you'll need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

### 4. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Contact Form
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Health check

### Appointment Booking
- `POST /api/appointment` - Book an appointment
- `POST /api/appointment/confirm` - Confirm appointment (admin)
- `GET /api/appointment/treatments` - Get available treatments
- `GET /api/appointment` - Health check

## API Usage Examples

### Contact Form Submission

```javascript
const response = await fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Inquiry about treatments',
    message: 'I would like to know more about your acne treatment options.'
  }),
});

const result = await response.json();
```

### Appointment Booking

```javascript
const response = await fetch('http://localhost:5000/api/appointment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 123-4567',
    treatmentType: 'Acne Treatment',
    preferredDate: '2024-04-15',
    preferredTime: '10:00 AM',
    message: 'I have sensitive skin and would like to discuss options.'
  }),
});

const result = await response.json();
```

## Email Templates

The system sends professional HTML email templates for:

1. **Contact Form Notifications** - Sent to clinic staff
2. **Appointment Requests** - Sent to clinic staff
3. **Appointment Confirmations** - Sent to patients

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Protection**: Configured for specific frontend URL
- **Helmet Security**: Security headers for protection
- **Error Handling**: No sensitive information leaked in errors

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check without building

### Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server file
│   ├── routes/
│   │   ├── contact.ts        # Contact form routes
│   │   └── appointment.ts     # Appointment routes
│   ├── services/
│   │   └── emailService.ts   # Email service
│   └── middleware/
│       └── errorHandler.ts   # Error handling
├── package.json
├── tsconfig.json
└── env.example
```

## Troubleshooting

### Email Issues
- Verify Gmail app password is correct
- Check that 2FA is enabled on Gmail account
- Ensure EMAIL_USER matches the Gmail account

### CORS Issues
- Verify FRONTEND_URL matches your frontend development server
- Check that the frontend is running on the correct port

### Rate Limiting
- Adjust RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX_REQUESTS if needed
- Check logs for rate limit violations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production email service (SendGrid, Mailgun, etc.)
3. Configure proper CORS origins
4. Set up proper logging and monitoring
5. Use a process manager like PM2

## License

MIT License - See LICENSE file for details
