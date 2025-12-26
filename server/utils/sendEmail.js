const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    // 1. SMTP Bilgileri varsa onları kullan
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        // 2. Yoksa Ethereal (Test) hesabı kullan
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        console.log('--- TEST ACCOUNT CREATED ---');
        console.log('User:', testAccount.user);
        console.log('Pass:', testAccount.pass);
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Gym App'} <${process.env.FROM_EMAIL || 'noreply@gymapp.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // HTML şablonu istenirse eklenebilir
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);

    // Ethereal kullanıldıysa Preview URL göster
    if (!process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
