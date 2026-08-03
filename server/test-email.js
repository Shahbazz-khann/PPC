require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function testEmail() {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Pakistan Property Care" <noreply@ppc.com>',
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email - PPC',
            text: 'This is a test email.',
        });
        console.log('Email sent successfully. Message ID:', info.messageId);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

testEmail();
