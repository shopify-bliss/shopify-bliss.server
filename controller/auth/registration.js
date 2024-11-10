import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "./../../config/supabase.js";
import { sendVerificationEmail } from "./../../helper/sendVerificationEmail.js";
import { v4 as uuidv4 } from "uuid";
import configureMiddleware from "./../../config/middleware.js";


const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/auth/registration", async (req, res) => {
  const { username, email, password,role} = req.body;  
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          user_id: userId,
          username: username,
          email: email,
          password: hashedPassword,
          role: role,
          created_at: createdAt,
          updated_at: createdAt,
          is_verified: false,
        },
      ]);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Buat token verifikasi
    const verificationToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Kirim email verifikasi
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      data
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during registration", error });
  }
});

export default router;
