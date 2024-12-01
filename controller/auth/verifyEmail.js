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
    // Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    // Update status is_verified di Supabase
    const { data, error } = await supabase
      .from("users")
      .update({ is_verified: true }) // Pastikan ada kolom is_verified di tabel "users"
      .match({ email });

    // Jika terjadi error atau user tidak ditemukan
    if (error || data.length === 0) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: red;">Invalid or expired token</h1>
            <p>Please request a new verification email.</p>
          </body>
        </html>
      `);
    }

    // Jika verifikasi berhasil
    res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: green;">Email verified successfully!</h1>
          <p>Your email has been verified. Please <a href="/login">login</a> to continue.</p>
        </body>
      </html>
    `);
  } catch (error) {
    // Jika token tidak valid atau kedaluwarsa
    res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: red;">Invalid or expired token</h1>
          <p>Please request a new verification email.</p>
        </body>
      </html>
    `);
  }
});

export default router;
