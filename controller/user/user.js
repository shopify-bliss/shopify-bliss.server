import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";

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
    const { username, phoneNumber, avatar } = req.body;
    const userID = req.user.user_id;
    const updated_at = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    console.log("User ID:", userID);

    // Validasi input
    if (!username && !phoneNumber) {
      return res.status(400).json({ message: "At least one field must be provided for update." });
    }

    const { data: updateUser, error: updateError } = await supabase
      .from("users")
      .update({
        username: username,
        phone_number: phoneNumber,
        avatar: avatar,
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

router.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Dapatkan email berdasarkan user ID
    const { data: user, error: userError } = await supabase.from("users").select("email").eq("email", email).single();

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

router.put("/api/update-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userID = req.user.user_id;

    // Validasi input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required." });
    }

    // Ambil data pengguna dari database
    const { data: user, error: userError } = await supabase.from("users").select("password, verification_code").eq("user_id", userID).single();

    if (userError || !user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Pastikan OTP sudah diverifikasi
    if (user.verification_code !== null) {
      return res.status(400).json({
        message: "You must verify your OTP before updating your password.",
      });
    }

    // Verifikasi password lama
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: "Old password is incorrect.",
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

    if (!passwordCriteria.minLength.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    } else if (!passwordCriteria.lowercase.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter.",
      });
    } else if (!passwordCriteria.uppercase.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter.",
      });
    } else if (!passwordCriteria.number.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one number.",
      });
    } else if (!passwordCriteria.specialCharacter.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    // Update password di database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedNewPassword,
        updated_at: updated_at,
      })
      .eq("user_id", userID);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: "Failed to update password." });
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

router.put("/api/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const { error: emailError } = await supabase.from("users").select("email").eq("email", email).single();

    if (emailError) {
      return res.status(404).json({ message: "Email not found." });
    }

    // Validasi password
    const passwordCriteria = {
      minLength: /.{8,}/,
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      number: /\d/,
      specialCharacter: /[!@#$%^&*(),.?":{}|<>]/,
    };

    if (!passwordCriteria.minLength.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    } else if (!passwordCriteria.lowercase.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter.",
      });
    } else if (!passwordCriteria.uppercase.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter.",
      });
    } else if (!passwordCriteria.number.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one number.",
      });
    } else if (!passwordCriteria.specialCharacter.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    // Update password di database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedNewPassword,
        updated_at: updated_at,
      })
      .eq("email", email);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: "Failed to update password." });
    }

    res.status(200).json({
      success: true,
      message: "Password has been updated successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/api/all-user", authenticateToken, async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("users").select(`*, roles(*)`);

    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: error.message });
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { data: user, error: error } = await supabase.from("users").select(`*, roles(*)`).eq("user_id", userID).single();

    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: error.message });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/user", authenticateToken, async (req, res) => {
  try {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { data: user, error: error } = await supabase.from("users").delete().eq("user_id", userID).select("*");

    if (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "User has been deleted",
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
