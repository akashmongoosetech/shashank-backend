import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

class EmailService {
  private transporter: Transporter | null = null;
  private enabled: boolean = false;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('⚠️ Email service disabled: EMAIL_USER or EMAIL_PASS not set in environment');
      this.enabled = false;
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user,
        pass,
      },
    });

    this.enabled = true;

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      if (!this.enabled || !this.transporter) return;
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.CLINIC_EMAIL,
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Doctor Derma Clinic</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-top: 0;">Message</h3>
              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; line-height: 1.6; color: #374151;">${data.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>This email was sent from the Doctor Derma Clinic contact form.</p>
            <p>Reply directly to this email to respond to ${data.name}.</p>
          </div>
        </div>
      `,
    };

      if (!this.enabled || !this.transporter) {
        console.warn('⚠️ Email service is disabled. Skipping sendContactEmail.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentEmail(data: {
    name: string;
    email: string;
    phone: string;
    treatmentType: string;
    preferredDate: string;
    preferredTime: string;
    message?: string;
  }): Promise<void> {
    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.CLINIC_EMAIL,
      replyTo: data.email,
      subject: `New Appointment Request - ${data.treatmentType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">New Appointment Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Doctor Derma Clinic</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #059669; margin-top: 0;">Patient Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Name:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Treatment:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.treatmentType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Preferred Date:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${new Date(data.preferredDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Preferred Time:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.preferredTime}</td>
                </tr>
              </table>
            </div>
            
            ${data.message ? `
            <div style="background: white; padding: 25px; border-radius: 8px;">
              <h3 style="color: #059669; margin-top: 0;">Additional Message</h3>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; line-height: 1.6; color: #374151;">${data.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            ` : ''}
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0;">Next Steps</h4>
              <p style="margin: 0; color: #92400e;">
                Please contact the patient within 24 hours to confirm the appointment availability and schedule.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>This appointment request was submitted through the Doctor Derma Clinic booking system.</p>
            <p>Reply directly to this email to respond to ${data.name}.</p>
          </div>
        </div>
      `,
    };

      if (!this.enabled || !this.transporter) {
        console.warn('⚠️ Email service is disabled. Skipping sendAppointmentEmail.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
  }

  async sendContactConfirmation(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Thank you for contacting us - ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Thank You for Contacting Us</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Doctor Derma Clinic</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">Hello ${data.name}!</h2>
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.
              </p>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin-top: 0;">Your Message Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Subject:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.message.replace(/\n/g, '<br>')}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h4 style="color: #059669; margin-top: 0;">What happens next?</h4>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Our team will review your message within 24 hours</li>
                <li>We'll respond to your inquiry via email or phone</li>
                <li>If urgent, please call us directly at ${process.env.CLINIC_PHONE}</li>
              </ul>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin-top: 0;">Contact Information</h4>
              <p style="margin: 0; color: #374151;">
                <strong>Phone:</strong> ${process.env.CLINIC_PHONE}<br>
                <strong>Email:</strong> ${process.env.CLINIC_EMAIL}<br>
                <strong>Address:</strong> ${process.env.CLINIC_ADDRESS}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Thank you for choosing Doctor Derma Clinic. We look forward to helping you!</p>
          </div>
        </div>
      `,
    };

    if (!this.enabled || !this.transporter) {
      console.warn('⚠️ Email service is disabled. Skipping sendContactConfirmation.');
      return;
    }

    await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentConfirmation(data: {
    name: string;
    email: string;
    treatmentType: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<void> {
    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Appointment Confirmed - ${data.treatmentType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Doctor Derma Clinic</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #059669; margin-top: 0;">Appointment Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Patient:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Treatment:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.treatmentType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${new Date(data.appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.appointmentTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Location:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${process.env.CLINIC_ADDRESS}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h4 style="color: #059669; margin-top: 0;">Important Reminders</h4>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before your scheduled appointment</li>
                <li>Bring a valid ID and insurance card (if applicable)</li>
                <li>If you need to reschedule, please call us at least 24 hours in advance</li>
                <li>Contact us at ${process.env.CLINIC_PHONE} if you have any questions</li>
              </ul>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin-top: 0;">Contact Information</h4>
              <p style="margin: 0; color: #374151;">
                <strong>Phone:</strong> ${process.env.CLINIC_PHONE}<br>
                <strong>Email:</strong> ${process.env.CLINIC_EMAIL}<br>
                <strong>Address:</strong> ${process.env.CLINIC_ADDRESS}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Thank you for choosing Doctor Derma Clinic. We look forward to seeing you!</p>
          </div>
        </div>
      `,
    };

      if (!this.enabled || !this.transporter) {
        console.warn('⚠️ Email service is disabled. Skipping sendAppointmentConfirmation.');
        return;
      }

      await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentRequestConfirmation(data: {
    name: string;
    email: string;
    phone: string;
    treatmentType: string;
    preferredDate: string;
    preferredTime: string;
    message?: string;
  }): Promise<void> {
    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Appointment Request Received - ${data.treatmentType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Appointment Request Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Doctor Derma Clinic</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #059669; margin-top: 0;">Hello ${data.name}!</h2>
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Thank you for booking an appointment with us. We have received your request and will contact you within 24 hours to confirm your appointment.
              </p>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                <h3 style="color: #059669; margin-top: 0;">Your Appointment Request</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Treatment:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.treatmentType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Preferred Date:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${new Date(data.preferredDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Preferred Time:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.preferredTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.phone}</td>
                  </tr>
                  ${data.message ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; color: #6b7280;">${data.message.replace(/\n/g, '<br>')}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0;">What happens next?</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Our team will review your appointment request within 24 hours</li>
                <li>We'll call you to confirm availability and finalize your appointment</li>
                <li>You'll receive a confirmation email with all the details</li>
                <li>If urgent, please call us directly at ${process.env.CLINIC_PHONE}</li>
              </ul>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin-top: 0;">Contact Information</h4>
              <p style="margin: 0; color: #374151;">
                <strong>Phone:</strong> ${process.env.CLINIC_PHONE}<br>
                <strong>Email:</strong> ${process.env.CLINIC_EMAIL}<br>
                <strong>Address:</strong> ${process.env.CLINIC_ADDRESS}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Thank you for choosing Doctor Derma Clinic. We look forward to seeing you!</p>
          </div>
        </div>
      `,
    };

    if (!this.enabled || !this.transporter) {
      console.warn('⚠️ Email service is disabled. Skipping sendAppointmentRequestConfirmation.');
      return;
    }

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
