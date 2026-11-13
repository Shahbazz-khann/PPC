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
            from: process.env.EMAIL_FROM || '"Pakistan Property Care" <pakistanpropertycare@gmail.com>',
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

/**
 * Send email verification OTP
 * @param {string} toEmail 
 * @param {string} otp 
 */
const sendVerificationEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Pakistan Property Care" <pakistanpropertycare@gmail.com>',
            to: toEmail,
            subject: 'Verify your Email - Pakistan Property Care',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #C59B27; margin: 0;">Pakistan Property Care</h2>
                </div>
                <h3 style="color: #333;">Verify Your Email Address</h3>
                <p style="color: #555; line-height: 1.5;">
                    Thank you for signing up! Please use the verification code below to complete your registration.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f4f4f4; border: 1px dashed #ccc; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; display: inline-block;">
                        ${otp}
                    </div>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
                    This verification code will expire in 15 minutes.
                    <br><br>
                    If you did not create an account, please ignore this email.
                </p>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error(`Error sending verification email to ${toEmail}:`, error);
        return false;
    }
};

/**
 * Send contact enquiry email to PPC admin
 * @param {Object} enquiry
 * @param {string} enquiry.name
 * @param {string} enquiry.email
 * @param {string} enquiry.phone
 * @param {string} enquiry.message
 */
const sendContactEnquiryEmail = async ({ name, email, phone, message }) => {
    try {
        const toAdminEmail = process.env.EMAIL_USER || 'pakistanpropertycare@gmail.com';
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Pakistan Property Care" <pakistanpropertycare@gmail.com>',
            to: toAdminEmail,
            replyTo: email,
            subject: `[Website Contact Enquiry] from ${name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #063B29; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #063B29; margin: 0; font-size: 22px;">Pakistan Property Care</h2>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">New Website Contact Form Enquiry</p>
                </div>

                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px;">Visitor Information:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: bold; width: 120px; color: #4b5563; font-size: 14px; border: 1px solid #e5e7eb;">Name:</td>
                        <td style="padding: 10px 12px; color: #111827; font-size: 14px; border: 1px solid #e5e7eb; font-weight: 500;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: bold; color: #4b5563; font-size: 14px; border: 1px solid #e5e7eb;">Email:</td>
                        <td style="padding: 10px 12px; color: #111827; font-size: 14px; border: 1px solid #e5e7eb;">
                            <a href="mailto:${email}" style="color: #063B29; text-decoration: none; font-weight: bold;">${email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 12px; background-color: #f9fafb; font-weight: bold; color: #4b5563; font-size: 14px; border: 1px solid #e5e7eb;">Phone:</td>
                        <td style="padding: 10px 12px; color: #111827; font-size: 14px; border: 1px solid #e5e7eb;">
                            <a href="tel:${phone}" style="color: #063B29; text-decoration: none; font-weight: bold;">${phone || 'Not provided'}</a>
                        </td>
                    </tr>
                </table>

                <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px;">Message:</h3>
                <div style="background-color: #f9fafb; border-left: 4px solid #063B29; padding: 15px; border-radius: 4px; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${message}
                </div>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 25px; border-top: 1px solid #f3f4f6; padding-top: 15px; text-align: center;">
                    💡 You can click <strong>Reply</strong> to directly respond to ${name} (${email}).
                </p>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Contact enquiry email sent to admin. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Error sending contact enquiry email:', error);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendContactEnquiryEmail
};
