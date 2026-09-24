import dotenv from "dotenv";
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
const SENDER_EMAIL = process.env.EMAIL_USER;

// resuable email sender function

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    if (!BREVO_API_KEY || !SENDER_EMAIL) {
      throw new Error(
        "Email Configuration missing (BREVO API KEY or EMAIL KEY)",
      );
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "JobPortal", email: SENDER_EMAIL },
        to,
        subject,
        htmlContent,
      }),
    });

    const result = await response.json();
  
    
    if (!response.ok) throw new Error(result.message || "Brevo Api Error");
    return result;
  } catch (error) {
    console.log(`Email Error [${subject}]`, error.message);
    throw error;
  }
};

const otpTemplate = (title, name, otp, message) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
        <h2 style="color: #4f46e5;">${title}</h2>
        <p>Hi ${name},</p>
        <p>${message}</p>
        <div style="margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888888;">&copy; 2026 JobPortal. All rights reserved.</p>
    </div>
`;

// to send verificationEmail

export const sendVerificationEmail = async (email, name, otp) => {
  return sendEmail({
    to: [{ email, name }],
    subject: "Your Verification Code ",
    htmlContent: otpTemplate(
      "Verify Your Email",
      name,
      otp,
      "Thank You for signing up. Please use the following 6-digits code to verify your email address",
    ),
  });
};

//to send forgotPasswordEmail

export const sendForgotPasswordEmail = async (email, name, otp) => {
  return sendEmail({
    to: [{ email, name }],
    subject: "Reset Your Password - JobPortal",
  });
};
