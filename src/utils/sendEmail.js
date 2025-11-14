/**
 * SEND_EMAIL.JS - Email Sender
 * 
 * This file sends emails to users.
 * It's used to send OTP codes when users register or login.
 * Uses nodemailer library to connect to email service (like Gmail).
 */

const nodemailer = require('nodemailer');

// Send OTP code to user's email
const sendOTPEmail = async (email, otp) => {
  try {
    // Step 1: Set up email service connection
    // This connects to your email provider (Gmail, Outlook, etc.)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Email server address (e.g., smtp.gmail.com)
      port: process.env.EMAIL_PORT, // Port number (usually 587)
      secure: false, // Use secure connection (true for 465, false for 587)
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Step 2: Create email content
    const mailOptions = {
      from: `"InstaSupply" <${process.env.EMAIL_USER}>`, // Who the email is from
      to: email, // Who to send to
      subject: 'Your OTP for InstaSupply Supplier Portal', // Email subject
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

    // Step 3: Send the email
    await transporter.sendMail(mailOptions);
    console.log(`   📧 OTP email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('   ❌ Error sending email:', error.message);
    return false;
  }
};

module.exports = sendOTPEmail;

