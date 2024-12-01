import express from "express";
import jwt from "jsonwebtoken";
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    const { data, error } = await supabase
      .from("users")
      .update({ is_verified: true })
      .match({ email });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify email",
        error,
      });
    }

    // Kirimkan JSON dengan URL redirect
    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      redirectUrl: "https://shopify-bliss.github.io/login",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;
