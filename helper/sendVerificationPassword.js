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

export const sendVerificationPassword = async (email) => {
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
      subject: "Update Your Password",
      html: `
      <html>
        <body>
          <h2>Welcome! Please input this OTP to update your password</h2>
          <!-- Logo Image -->
          <div style="text-align: center;">
            <img src="https://raw.githubusercontent.com/shopify-bliss/shopify-bliss.github.io/refs/heads/main/src/assets/logo/black-logo.png" alt="Logo" style="max-width: 150px;">
          </div>
          
          <p>To complete update password, please verify your account with the following OTP code:</p>
            
          <!-- OTP Code -->
          <div style="text-align: center; margin-top: 20px;">
            <strong style="font-size: 24px;">${verificationCode}</strong>
          </div>
          
          <p>The code will expired in 5 minutes</p>
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

export default sendVerificationPassword;
