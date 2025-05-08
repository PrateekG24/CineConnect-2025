const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Email Service for handling all email operations
 * This service creates transporters based on environment and provides methods for different email types
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create the appropriate email transporter based on configuration
   */
  createTransporter() {
    // Production transporter
    try {
      return nodemailer.createTransport({
        service: config.EMAIL.SERVICE,
        auth: {
          user: config.EMAIL.USERNAME,
          pass: config.EMAIL.PASSWORD
        },
        // Improve reliability with connection pool
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        // Add some extra security for production environments
        secure: process.env.NODE_ENV === 'production'
      });
    } catch (error) {
      console.error('Failed to create email transporter:', error);
      throw new Error('Email service configuration error');
    }
  }

  /**
   * Send an email verification message
   * @param {Object} user - User object
   * @param {String} token - Verification token
   * @param {String} newEmail - Optional new email if email is being changed
   * @param {Boolean} isPasswordReset - Whether this is for password reset
   */
  async sendVerificationEmail(user, token, newEmail = null, isPasswordReset = false) {
    const targetEmail = newEmail || user.email;
    const verificationUrl = `${config.CLIENT_URL}/verify-email/${token}`;

    // Different subjects and content based on email purpose
    let subject, heading, mainText, buttonText;

    if (isPasswordReset) {
      subject = 'Reset Your CineConnect Password';
      heading = 'Password Reset Request';
      mainText = `We received a request to reset your password. Please click the button below to set a new password. If you didn't request this, you can safely ignore this email.`;
      buttonText = 'Reset Password';
    } else if (newEmail) {
      subject = 'Verify Your New CineConnect Email';
      heading = 'Email Change Verification';
      mainText = `You've requested to change your email address to ${newEmail}. Please verify this new email address by clicking the button below:`;
      buttonText = 'Verify New Email';
    } else {
      subject = 'Verify Your CineConnect Email';
      heading = 'Email Verification';
      mainText = `Thanks for creating an account with CineConnect. To complete your registration, please verify your email address by clicking the button below:`;
      buttonText = 'Verify Email Address';
    }

    // Email content with enhanced styling
    const mailOptions = {
      from: config.EMAIL.FROM,
      to: targetEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e50914;">CineConnect</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
            <h2 style="margin-top: 0;">${heading}</h2>
            <p>Hi ${user.username},</p>
            <p>${mainText}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #e50914; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${buttonText}</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9e9e9; text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} CineConnect. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      // Log email in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
          =============================================
          SENDING EMAIL (${isPasswordReset ? 'PASSWORD RESET' : newEmail ? 'EMAIL CHANGE' : 'VERIFICATION'})
          =============================================
          TO: ${targetEmail}
          SUBJECT: ${subject}
          URL: ${verificationUrl}
          =============================================
        `);
      }

      // Send email and return results
      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        message: `${isPasswordReset ? 'Password reset' : 'Verification'} email sent successfully`
      };
    } catch (error) {
      console.error(`Error sending ${isPasswordReset ? 'password reset' : 'verification'} email:`, error);

      // More detailed error information for debugging
      const errorDetails = {
        code: error.code || 'UNKNOWN',
        message: error.message,
        target: targetEmail,
        service: config.EMAIL.SERVICE,
        sender: config.EMAIL.USERNAME,
      };

      console.error('Email error details:', JSON.stringify(errorDetails, null, 2));

      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new EmailService(); 