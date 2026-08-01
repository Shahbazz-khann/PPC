const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send password reset email
 * @param {string} toEmail 
 * @param {string} resetUrl 
 */
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Pakistan Property Care" <noreply@ppc.com>',
            to: toEmail,
            subject: 'Password Reset Request - Pakistan Property Care',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #C59B27; margin: 0;">Pakistan Property Care</h2>
                </div>
                <h3 style="color: #333;">Password Reset Request</h3>
                <p style="color: #555; line-height: 1.5;">
                    You recently requested to reset your password for your Pakistan Property Care account.
                    Click the button below to reset it.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #C59B27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Reset Your Password
                    </a>
                </div>
                <p style="color: #555; line-height: 1.5;">
                    If the button doesn't work, you can also copy and paste the following link into your browser:<br>
                    <a href="${resetUrl}" style="color: #C59B27; word-break: break-all;">${resetUrl}</a>
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
                    This password reset link will expire in 15 minutes.
                    <br><br>
                    If you did not request a password reset, please ignore this email or contact support if you have concerns.
                </p>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error(`Error sending password reset email to ${toEmail}:`, error);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail
};
