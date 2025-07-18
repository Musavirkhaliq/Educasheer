import nodemailer from 'nodemailer';

// Create a transporter with the provided SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || '8b7bc7001@smtp-brevo.com',
    pass: process.env.EMAIL_PASS || '7ZYwMhrzsjybBWgK'
  },
  secure: false, // true for 465, false for other ports
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content (fallback)
 * @returns {Promise} - Nodemailer send result
 */
export const sendEmail = async (options) => {
  const { to, subject, html, text } = options;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'sukoonsphere@gmail.com',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a verification email to a user
 * @param {Object} user - User object
 * @param {string} user.email - User's email
 * @param {string} user.fullName - User's full name
 * @param {string} verificationToken - Email verification token
 * @returns {Promise} - Email send result
 */
/**
 * Get the client URL based on environment
 * @returns {string} - Client URL
 */
const getClientUrl = () => {
  let clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    // Default URLs based on NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      // clientUrl = 'https://learn.sukoonsphere.org';
      clientUrl = 'https://www.educasheer.in';
    } else {
      clientUrl = 'http://localhost:5173';
    }
  }

  return clientUrl;
};

export const sendVerificationEmail = async (user, verificationToken) => {
  const clientUrl = getClientUrl();
  const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #00bcd4; padding: 20px; text-align: center; color: white;">
        <h1>Educasheer</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${user.fullName},</p>
        <p>Thank you for registering with Educasheer. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #00bcd4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Educasheer Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Educasheer. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address - Educasheer',
    html
  });
};

/**
 * Send a password reset email to a user
 * @param {Object} user - User object
 * @param {string} user.email - User's email
 * @param {string} user.fullName - User's full name
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - Email send result
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const clientUrl = getClientUrl();
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #00bcd4; padding: 20px; text-align: center; color: white;">
        <h1>Educasheer</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
        <h2>Reset Your Password</h2>
        <p>Hello ${user.fullName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #00bcd4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The Educasheer Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Educasheer. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password - Educasheer',
    html
  });
};
