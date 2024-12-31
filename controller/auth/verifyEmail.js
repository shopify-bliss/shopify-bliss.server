import express from "express";
import jwt from "jsonwebtoken";
import moment from "moment";

import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/auth/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validasi input
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    // Cek apakah pengguna dengan email tersebut ada di database
    const { data: user, error: userError } = await supabase.from("users").select("verification_code, is_verified").eq("email", email).single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return res.status(500).json({ message: "Error fetching user data." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Periksa apakah pengguna sudah diverifikasi
    if (user.is_verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Periksa apakah kode verifikasi cocok
    if (user.verification_code !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Perbarui status pengguna menjadi diverifikasi
    const { data, error } = await supabase
      .from("users")
      .update({ is_verified: true, verification_code: null }) // Hapus kode verifikasi
      .eq("email", email);

    if (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to verify user." });
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred while verifying email.", error });
  }
});

router.post("/api/otp-password", authenticateToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const userID = req.user.user_id;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // Cek kecocokan OTP
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("verification_code")
      .eq("user_id", userID)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Tandai bahwa OTP diverifikasi
    await supabase.from("users").update({ verification_code: null }).eq("user_id", userID);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now update your password.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
