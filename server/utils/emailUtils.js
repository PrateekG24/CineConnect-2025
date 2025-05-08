const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Generate a random token for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create a transporter using the configured email provider
const createTransporter = () => {
  // Create SMTP transporter
  const transporter = nodemailer.createTransport({
    service: config.EMAIL.SERVICE,
    auth: {
      user: config.EMAIL.USERNAME,
      pass: config.EMAIL.PASSWORD
    }
  });

  return transporter;
};

// Send verification email using nodemailer
const sendVerificationEmail = async (user, token, newEmail) => {
  const targetEmail = newEmail || user.email;
  const verificationUrl = `${config.CLIENT_URL}/verify-email/${token}`;

  // Email content
  const mailOptions = {
    from: config.EMAIL.FROM,
    to: targetEmail,
    subject: 'Verify Your CineConnect Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e50914;">CineConnect</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
          <h2 style="margin-top: 0;">Email Verification</h2>
          <p>Hi ${user.username},</p>
          <p>Thanks for creating an account with CineConnect. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #e50914; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account with us, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9e9e9; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CineConnect. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    // Log the email sending attempt in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
        =============================================
        SENDING VERIFICATION EMAIL (REAL)
        =============================================
        TO: ${targetEmail}
        SUBJECT: Verify Your CineConnect Email
        URL: ${verificationUrl}
        =============================================
      `);
    }

    // Create transporter and send email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Verification email sent'
    };
  } catch (error) {
    console.error('Error sending verification email:', error);

    // For a production environment, you might want to connect to a fallback service
    // or notify admins about email sending failures
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail
}; 