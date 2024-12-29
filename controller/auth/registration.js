import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";

import supabase from "./../../config/supabase.js";
import { sendVerificationEmail } from "./../../helper/sendVerificationEmail.js";
import configureMiddleware from "./../../config/middleware.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/auth/registration", async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    // Validasi input
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid phone number format. Please provide a valid phone number.",
      });
    }

    // Validasi password
    const passwordCriteria = {
      minLength: /.{8,}/,
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      number: /\d/,
      specialCharacter: /[!@#$%^&*(),.?":{}|<>]/,
    };

    if (!passwordCriteria.minLength.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    } else if (!passwordCriteria.lowercase.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter.",
      });
    } else if (!passwordCriteria.uppercase.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter.",
      });
    } else if (!passwordCriteria.number.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one number.",
      });
    } else if (!passwordCriteria.specialCharacter.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    const created_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    const expires_at = moment().tz("Asia/Jakarta").add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");

    // Gabungan validasi email dan username
    const { data: existingUser, error: userCheckError } = await supabase.from("users").select("email, username").or(`email.eq.${email},username.eq.${username}`).single();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already exists.",
        });
      }
    }

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // Handle unexpected error
      throw new Error(userCheckError.message);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hardcoded role_id untuk "customer"
    const defaultRoleId = "cebccb98-7ef0-4184-95b9-7320329f21d3";

    // Simpan pengguna baru ke database
    const { data, error } = await supabase.from("users").insert([
      {
        username,
        email,
        password: hashedPassword,
        role_id: defaultRoleId,
        created_at,
        updated_at: created_at,
        is_verified: false,
        expires_at,
        phone_number: phoneNumber,
        avatar: "polar-bear.png",
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    // Kirim email verifikasi
    await sendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "An error occurred during registration", error });
  }
});

export default router;
