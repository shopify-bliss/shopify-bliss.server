import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import moment from "moment";

import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";
import authenticateToken from "../../helper/token.js";
import { sendVerificationPassword } from "./../../helper/sendVerificationPassword.js";


dotenv.config();

const app = express();
configureMiddleware(app);
const router = express.Router();

router.put("/api/user", authenticateToken, async (req, res) => {
  try {
    const { username, email, phoneNumber } = req.body;
    const userID = req.user.user_id;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    console.log("User ID:", userID);

    // Validasi input
    if (!username && !email && !phoneNumber) {
      return res.status(400).json({ message: "At least one field must be provided for update." });
    }

    const { data: updateUser, error: updateError } = await supabase
      .from("users")
      .update({
        username: username,
        email: email,
        phone_number: phoneNumber,
        updated_at: updated_at,
      })
      .eq("user_id", userID)
      .single()
      .select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: "User has been updated",
      data: updateUser,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/api/send-otp", authenticateToken, async (req, res) => {
  try {
    const userID = req.user.user_id;

    // Dapatkan email berdasarkan user ID
    const { data: user, error: userError } = await supabase.from("users").select("email").eq("user_id", userID).single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kirim OTP ke email
    await sendVerificationPassword(user.email);

    res.status(200).json({
      success: true,
      message: "Verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/api/update-password", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userID = req.user.user_id;

    // Validasi input
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    // Periksa apakah OTP sudah diverifikasi
    const { data: user, error: userError } = await supabase.from("users").select("verification_code").eq("user_id", userID).single();

    if (userError || !user || user.verification_code !== null) {
      return res.status(400).json({
        message: "You must verify your OTP before updating your password.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    // Update password di database
    const { data: updateUser, error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        updated_at: updated_at,
      })
      .eq("user_id", userID)
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: updateError.message });
    }

    res.status(200).json({
      success: true,
      message: "Password has been updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
