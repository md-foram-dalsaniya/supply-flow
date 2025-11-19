const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"InstaSupply" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for InstaSupply Supplier Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Welcome to InstaSupply</h2>
          <p style="color: #333; font-size: 16px;">Your OTP for login verification is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 1 minute.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`   📧 OTP email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('   ❌ Error sending email:', error.message);
    return false;
  }
};

module.exports = sendOTPEmail;
