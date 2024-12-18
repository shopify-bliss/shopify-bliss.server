import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import supabase from "./../config/supabase.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email) => {
  try {
    // Validasi input
    if (!email) {
      throw new Error("Email is required");
    }

    // Generate kode verifikasi
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Cek apakah pengguna dengan email ini ada
    const { data: user, error: userError } = await supabase.from("users").select("email").eq("email", email).single();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw new Error("User not found");
    }

    // Konfigurasi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
      <html>
        <body>
          <h2>Welcome! Please verify your email address</h2>
          <!-- Logo Image -->
          <div style="text-align: center;">
            <img src="https://github.com/shopify-bliss/Image/blob/main/shopify.png?raw=true" alt="Logo" style="max-width: 150px;">
          </div>
          
          <p>Thank you for registering. To complete your registration, please verify your email address with the following OTP code:</p>
            
          <!-- OTP Code -->
          <div style="text-align: center; margin-top: 20px;">
            <strong style="font-size: 24px;">${verificationCode}</strong>
          </div>
          
          <p>If you did not register, please ignore this email.</p>
        </body>
      </html>
    `,
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

    // Update kode verifikasi di database
    const { error: updateError } = await supabase.from("users").update({ verification_code: verificationCode }).eq("email", email);

    if (updateError) {
      console.error("Error updating verification code:", updateError);
      throw new Error("Failed to update verification code");
    }

    console.log(`Verification email sent to ${email}`);
    return verificationCode;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
};

export default sendVerificationEmail;
