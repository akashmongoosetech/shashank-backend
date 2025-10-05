# Email Setup Guide

This guide explains how to set up and configure the email functionality for the Bhargava Clinic Clinic application.

## Overview

The application now sends emails in the following scenarios:

### Contact Form
- **User Confirmation Email**: Sent to the user confirming their message was received
- **Admin Alert Email**: Sent to the clinic admin notifying them of a new contact form submission

### Appointment Booking
- **User Confirmation Email**: Sent to the user confirming their appointment request was received
- **Admin Alert Email**: Sent to the clinic admin notifying them of a new appointment request
- **Appointment Confirmation Email**: Sent to the user when an appointment is confirmed by admin

## Environment Variables Setup

### 1. Create/Update .env file

Copy the `env.example` file to `.env` and configure the following variables:

```env
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
```

### 2. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character password
5. Use this password as `EMAIL_PASS` in your .env file

#### Step 3: Configure Environment Variables
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 3. Alternative Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## Testing Email Functionality

### 1. Build the Backend
```bash
cd backend
npm run build
```

### 2. Run Email Tests
```bash
node test-email.js
```

This will send test emails to verify all functionality is working correctly.

### 3. Manual Testing

#### Test Contact Form
1. Start the backend server: `npm run dev`
2. Submit a contact form through the frontend
3. Check both user and admin email inboxes

#### Test Appointment Booking
1. Submit an appointment request through the frontend
2. Check both user and admin email inboxes
3. Confirm the appointment through the admin dashboard
4. Check for the final confirmation email

## Email Templates

The application includes professionally designed HTML email templates with:

- **Responsive Design**: Works on desktop and mobile devices
- **Brand Colors**: Consistent with clinic branding
- **Clear Information**: Well-organized appointment and contact details
- **Call-to-Actions**: Contact information and next steps
- **Professional Styling**: Clean, medical-themed design

## Troubleshooting

### Common Issues

#### 1. "Email service is disabled" Warning
- **Cause**: Missing or incorrect EMAIL_USER/EMAIL_PASS
- **Solution**: Verify environment variables are set correctly

#### 2. "Authentication failed" Error
- **Cause**: Wrong password or 2FA not enabled
- **Solution**: Use App Password for Gmail, enable 2FA

#### 3. "Connection timeout" Error
- **Cause**: Wrong SMTP settings or firewall blocking
- **Solution**: Check EMAIL_HOST and EMAIL_PORT settings

#### 4. Emails not received
- **Cause**: Emails might be in spam folder
- **Solution**: Check spam folder, whitelist clinic email address

### Debug Mode

To enable detailed email logging, add to your .env:
```env
NODE_ENV=development
```

This will show detailed email service logs in the console.

## Security Considerations

1. **Never commit .env files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate credentials** regularly
4. **Monitor email logs** for suspicious activity
5. **Use HTTPS** in production for secure email transmission

## Production Deployment

### 1. Environment Variables
Set all email-related environment variables in your production environment:
- Heroku: `heroku config:set EMAIL_USER=...`
- Vercel: Add to Environment Variables in dashboard
- AWS: Use AWS Secrets Manager or Parameter Store

### 2. Email Limits
- Gmail: 500 emails/day (free), 2000/day (paid)
- Consider using dedicated email services for high volume:
  - SendGrid
  - Mailgun
  - Amazon SES

### 3. Monitoring
- Set up email delivery monitoring
- Track bounce rates and delivery failures
- Monitor spam complaints

## Support

If you encounter issues with email setup:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the provided test script
4. Check your email provider's documentation for SMTP settings

For additional help, refer to the main project documentation or contact the development team.
